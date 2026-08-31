<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pohon;
use Illuminate\Support\Facades\DB;

class DailyOperationController extends Controller
{
    public function index(Request $request)
    {
        $authUser = auth()->user();
        $query = Pohon::with(['creator'])
            ->leftJoin('batangs', 'pohons.id', '=', 'batangs.pohon_id')
            ->select(
                DB::raw('DATE(pohons.created_at) as tanggal'),
                'pohons.created_by',
                DB::raw('COUNT(DISTINCT pohons.id) as jumlah_pohon'),
                DB::raw('COUNT(batangs.id) as jumlah_batang'),
                DB::raw('SUM(batangs.volume) as total_volume'),
                DB::raw('SUM(CASE WHEN pohons.status_upah != "lunas" THEN 1 ELSE 0 END) as count_pending')
            )
            ->groupByRaw('DATE(pohons.created_at), pohons.created_by');

        if (!$authUser->hasRole('admin_cdk')) {
            $query->where('pohons.kelompok_id', $authUser->kelompok_id);
        }

        if ($request->filled('search')) {
            $query->where('pohons.created_by', $request->search);
        }

        if ($request->filled('tanggal_mulai') && $request->filled('tanggal_akhir')) {
            $query->whereBetween(DB::raw('DATE(pohons.created_at)'), [$request->tanggal_mulai, $request->tanggal_akhir]);
        }
        
        $sortField = $request->input('sort_field', 'tanggal');
        $sortDirection = $request->input('sort_direction', 'desc');

        $allowedSorts = ['tanggal', 'jumlah_pohon', 'jumlah_batang', 'total_volume', 'count_pending'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderByRaw("$sortField $sortDirection");
        } else {
            $query->orderByRaw("DATE(pohons.created_at) DESC");
        }

        $operationsRaw = $query->paginate(10)->withQueryString();

        $operationsData = [];
        
        foreach ($operationsRaw as $op) {
            $operationsData[] = [
                'id' => $op->tanggal . '-' . $op->created_by,
                'tanggal' => $op->tanggal,
                'user_id' => $op->created_by,
                'regu_name' => $op->creator->name ?? 'Unknown',
                'jumlah_pohon' => $op->jumlah_pohon,
                'jumlah_batang' => $op->jumlah_batang,
                'total_volume' => round($op->total_volume ?? 0, 4),
                'status' => $op->count_pending == 0 ? 'paid' : 'pending'
            ];
        }

        $userQuery = \App\Models\User::role('user')->with('kelompok');
        if (!$authUser->hasRole('admin_cdk')) {
            $userQuery->where('kelompok_id', $authUser->kelompok_id);
        }
        $reguOptions = $userQuery->get()->map(function($u) {
            return [
                'value' => $u->id,
                'label' => $u->name . ($u->kelompok ? ' (' . $u->kelompok->nama_kelompok . ')' : '')
            ];
        });

        $summaryQuery = Pohon::query();
        if (!$authUser->hasRole('admin_cdk')) {
            $summaryQuery->where('kelompok_id', $authUser->kelompok_id);
        }
        if ($request->filled('search')) {
            $summaryQuery->where('created_by', $request->search);
        }
        if ($request->filled('tanggal_mulai') && $request->filled('tanggal_akhir')) {
            $summaryQuery->whereBetween(DB::raw('DATE(created_at)'), [$request->tanggal_mulai, $request->tanggal_akhir]);
        }

        $totalPohon = $summaryQuery->count();
        $pohonIds = $summaryQuery->pluck('id');
        $totalBatang = \App\Models\Batang::whereIn('pohon_id', $pohonIds)->count();
        $totalVolume = \App\Models\Batang::whereIn('pohon_id', $pohonIds)->sum('volume');

        return \Inertia\Inertia::render('Operations/Index', [
            'operations' => [
                'data' => $operationsData,
                'links' => $operationsRaw->toArray()['links'] ?? []
            ],
            'summary' => [
                'total_pohon' => $totalPohon,
                'total_batang' => $totalBatang,
                'total_volume' => (float) $totalVolume,
            ],
            'filters' => array_merge(
                $request->only(['search', 'tanggal_mulai', 'tanggal_akhir']),
                [
                    'sort_field' => $sortField,
                    'sort_direction' => $sortDirection
                ]
            ),
            'reguOptions' => $reguOptions
        ]);
    }

    public function markAsPaid($date, $user_id)
    {
        $authUser = auth()->user();
        $query = Pohon::whereDate('created_at', $date)
            ->where('created_by', $user_id);
            
        if (!$authUser->hasRole('admin_cdk')) {
            $query->where('kelompok_id', $authUser->kelompok_id);
        }
        
        $query->update(['status_upah' => 'lunas']);

        return redirect()->back()->with('success', 'Status kegiatan berhasil diubah menjadi Lunas.');
    }
}
