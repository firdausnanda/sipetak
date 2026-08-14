<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'kelompok']);
        $currentUser = auth()->user();

        if ($currentUser->hasRole('admin_kelompok')) {
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
        
        $rolesQuery = Role::whereIn('name', ['user', 'admin_cdk', 'admin_kelompok', 'ganis']);
        $kelompoksQuery = Kelompok::orderBy('nama_kelompok');

        if ($currentUser->hasRole('admin_kelompok')) {
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

    public function store(Request $request)
    {
        $currentUser = auth()->user();
        
        if (! $currentUser->hasRole('admin_cdk') && $request->role === 'admin_cdk') {
            abort(403, 'Unauthorized role assignment.');
        }

        if ($currentUser->hasRole('admin_kelompok')) {
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
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
        
        if (! $currentUser->hasRole('admin_cdk') && $request->role === 'admin_cdk') {
            abort(403, 'Unauthorized role assignment.');
        }

        if ($currentUser->hasRole('admin_kelompok')) {
            if ($user->kelompok_id !== $currentUser->kelompok_id) {
                abort(403, 'Unauthorized access to user.');
            }
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|exists:roles,name',
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
        if ($currentUser->hasRole('admin_kelompok') && $user->kelompok_id !== $currentUser->kelompok_id) {
            abort(403, 'Unauthorized access to user.');
        }

        if ($currentUser->id === $user->id) {
            return redirect()->route('admin.users.index')->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
