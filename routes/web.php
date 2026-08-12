<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PohonController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

use App\Models\Petak;
use App\Models\JenisPohon;
use App\Models\Kelompok;
use Illuminate\Http\Request;

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();
    
    $petaks = Petak::where('kelompok_id', $user->kelompok_id)->get();
    $jenisPohons = JenisPohon::where('kelompok_id', $user->kelompok_id)->get();
    $kelompok = Kelompok::find($user->kelompok_id);

    return Inertia::render('Dashboard', [
        'petaks' => $petaks,
        'jenisPohons' => $jenisPohons,
        'namaKelompok' => $kelompok ? $kelompok->nama_kelompok : 'Belum Ada Kelompok',
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');
Route::get('/barcode', function () {
    return Inertia::render('Barcode');
})->middleware(['auth', 'verified'])->name('barcode');

Route::post('/barcode', [PohonController::class, 'storeBarcode'])
    ->middleware(['auth', 'verified'])
    ->name('barcode.store');

Route::get('/manual', function () {
    return Inertia::render('Manual');
})->middleware(['auth', 'verified'])->name('manual');

Route::post('/manual', [PohonController::class, 'storeManual'])
    ->middleware(['auth', 'verified'])
    ->name('manual.store');

Route::get('/history', function (Request $request) {
    $user = $request->user();
    $filter = $request->has('filter') ? $request->query('filter') : 'today';
    $search = $request->query('search');

    $query = App\Models\Pohon::with(['petak', 'jenisPohon'])
        ->where('kelompok_id', $user->kelompok_id);

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->whereHas('petak', function ($q2) use ($search) {
                $q2->where('nama_petak', 'like', "%{$search}%");
            })->orWhereHas('jenisPohon', function ($q3) use ($search) {
                $q3->where('nama_jenis', 'like', "%{$search}%");
            });
        });
    }

    if ($filter === 'today') {
        $query->whereDate('created_at', \Carbon\Carbon::today());
    } elseif ($filter === 'yesterday') {
        $query->whereDate('created_at', \Carbon\Carbon::yesterday());
    } elseif ($filter === 'this_week') {
        $query->whereBetween('created_at', [\Carbon\Carbon::now()->startOfWeek(), \Carbon\Carbon::now()->endOfWeek()]);
    }

    $pohons = $query->latest()->paginate(10);

    if ($request->wantsJson()) {
        return response()->json($pohons);
    }

    return Inertia::render('History', [
        'pohons' => $pohons,
        'filters' => ['filter' => $filter, 'search' => $search]
    ]);
})->middleware(['auth', 'verified'])->name('history');

Route::get('/history/{id}', function (Illuminate\Http\Request $request, $id) {
    $pohon = App\Models\Pohon::with(['petak', 'jenisPohon', 'kelompok', 'batangs'])->findOrFail($id);
    if ($pohon->kelompok_id !== $request->user()->kelompok_id) {
        abort(403);
    }
    return Inertia::render('History/Show', ['pohon' => $pohon]);
})->middleware(['auth', 'verified'])->name('history.show');

Route::get('/admin/dashboard', function () {
    return Inertia::render('Admin/Dashboard');
})->middleware(['auth', 'verified'])->name('admin.dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
