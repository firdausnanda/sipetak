<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardMonitoringController extends Controller
{
    public function index()
    {
        // Simple logic for fetching percentage
        // In a real scenario, this would query the DB. For now, let's pass mock or simple aggregates.
        $totalPohon = \App\Models\Pohon::count();
        // Assume is_tebang doesn't exist yet, just mock 0 if empty
        $pohonDitebang = 0; // \App\Models\Pohon::where('status', 'ditebang')->count();
        $persentaseTebang = $totalPohon > 0 ? ($pohonDitebang / $totalPohon) * 100 : 0;

        $totalBatang = \App\Models\Batang::count();
        $batangDiangkut = 0; 
        $persentaseAngkut = $totalBatang > 0 ? ($batangDiangkut / $totalBatang) * 100 : 0;

        return \Inertia\Inertia::render('Monitoring/Dashboard', [
            'persentaseTebang' => $persentaseTebang,
            'persentaseAngkut' => $persentaseAngkut
        ]);
    }
}
