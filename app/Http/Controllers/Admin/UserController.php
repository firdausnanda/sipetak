<?php

namespace App\Http\Controllers\Admin;

use App\Exports\UsersExport;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'kelompok']);
        $currentUser = auth()->user();

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        if ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }

        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $allowedSorts = ['name', 'email', 'created_at'];

        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }
        
        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage)->withQueryString();
        
        $rolesQuery = Role::whereIn('name', ['user', 'admin_cdk', 'admin_kelompok', 'ganis', 'monitoring_viewer']);
        $kelompoksQuery = Kelompok::orderBy('nama_kelompok');

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $rolesQuery->whereIn('name', ['user', 'admin_kelompok', 'ganis']);
            $kelompoksQuery->where('id', $currentUser->kelompok_id);
        }

        $roles = $rolesQuery->get();
        $kelompoks = $kelompoksQuery->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'kelompoks' => $kelompoks,
            'filters' => $request->only(['search', 'per_page', 'role', 'kelompok_id', 'sort', 'direction'])
        ]);
    }

    public function export(Request $request)
    {
        $currentUser = auth()->user();
        $isKelompokScoped = $currentUser->hasAnyRole(['admin_kelompok', 'ganis']);
        $allowedRoles = $isKelompokScoped
            ? ['user', 'admin_kelompok', 'ganis']
            : ['user', 'admin_cdk', 'admin_kelompok', 'ganis', 'monitoring_viewer'];

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', Rule::in($allowedRoles)],
            'kelompok_id' => ['nullable', Rule::when($request->input('kelompok_id') !== 'none', ['integer', 'exists:kelompoks,id'])],
            'status_verifikasi' => ['nullable', Rule::in(['verified', 'unverified'])],
            'tanggal_mulai' => ['nullable', 'date_format:Y-m-d'],
            'tanggal_akhir' => ['nullable', 'date_format:Y-m-d'],
            'columns' => ['nullable', 'array'],
            'columns.*' => ['string', Rule::in(array_keys(UsersExport::COLUMNS))],
            'sort' => ['nullable', Rule::in(['name', 'email', 'created_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
        ]);

        if (!empty($filters['tanggal_mulai']) && !empty($filters['tanggal_akhir'])
            && $filters['tanggal_akhir'] < $filters['tanggal_mulai']) {
            throw ValidationException::withMessages(['tanggal_akhir' => 'Tanggal akhir tidak boleh sebelum tanggal mulai.']);
        }

        $query = User::with(['roles', 'kelompok', 'creator']);

        if ($isKelompokScoped) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        } elseif (($filters['kelompok_id'] ?? null) === 'none') {
            $query->whereNull('kelompok_id');
        } elseif (!empty($filters['kelompok_id'])) {
            $query->where('kelompok_id', $filters['kelompok_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['roles'])) {
            $query->whereHas('roles', fn ($q) => $q->whereIn('name', $filters['roles']));
        }

        if (($filters['status_verifikasi'] ?? null) === 'verified') {
            $query->whereNotNull('email_verified_at');
        } elseif (($filters['status_verifikasi'] ?? null) === 'unverified') {
            $query->whereNull('email_verified_at');
        }

        if (!empty($filters['tanggal_mulai'])) {
            $query->whereDate('created_at', '>=', $filters['tanggal_mulai']);
        }
        if (!empty($filters['tanggal_akhir'])) {
            $query->whereDate('created_at', '<=', $filters['tanggal_akhir']);
        }

        $users = $query->orderBy($filters['sort'] ?? 'name', $filters['direction'] ?? 'asc')
            ->orderBy('id')
            ->get();

        return Excel::download(new UsersExport($users, $filters['columns'] ?? []), 'Data_Pengguna.xlsx');
    }

    public function store(Request $request)
    {
        $currentUser = auth()->user();
        
        if (! $currentUser->hasRole('admin_cdk') && in_array($request->role, ['admin_cdk', 'monitoring_viewer'])) {
            abort(403, 'Unauthorized role assignment.');
        }

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', 'string', Rule::in($currentUser->hasRole('admin_cdk')
                ? ['user', 'admin_cdk', 'admin_kelompok', 'ganis', 'monitoring_viewer']
                : ['user', 'admin_kelompok', 'ganis'])],
            'kelompok_id' => 'nullable|exists:kelompoks,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'kelompok_id' => $request->kelompok_id,
        ]);

        $user->assignRole($request->role);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $currentUser = auth()->user();
        
        if (! $currentUser->hasRole('admin_cdk') && in_array($request->role, ['admin_cdk', 'monitoring_viewer'])) {
            abort(403, 'Unauthorized role assignment.');
        }

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            if ($user->kelompok_id !== $currentUser->kelompok_id) {
                abort(403, 'Unauthorized access to user.');
            }
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', 'string', Rule::in($currentUser->hasRole('admin_cdk')
                ? ['user', 'admin_cdk', 'admin_kelompok', 'ganis', 'monitoring_viewer']
                : ['user', 'admin_kelompok', 'ganis'])],
            'kelompok_id' => 'nullable|exists:kelompoks,id',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->kelompok_id = $request->kelompok_id;
        
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        
        $user->save();
        $user->syncRoles([$request->role]);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $currentUser = auth()->user();
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id !== $currentUser->kelompok_id) {
            abort(403, 'Unauthorized access to user.');
        }

        if ($currentUser->id === $user->id) {
            return redirect()->route('admin.users.index')->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
