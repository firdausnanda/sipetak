<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        $event = $request->input('event');
        $subjectType = $request->input('subject_type');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Activity::with('causer');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%")
                  ->orWhereHas('causer', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($event) {
            $query->where('event', $event);
        }

        if ($subjectType) {
            $query->where('subject_type', $subjectType);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $logs = $query->latest()->paginate($perPage)->withQueryString();

        // Get unique options for filters
        $events = Activity::select('event')->whereNotNull('event')->distinct()->pluck('event');
        $subjectTypes = Activity::select('subject_type')->whereNotNull('subject_type')->distinct()->pluck('subject_type');

        return Inertia::render('Admin/ActivityLog/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'event' => $event,
                'subject_type' => $subjectType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'options' => [
                'events' => $events,
                'subjectTypes' => $subjectTypes,
            ]
        ]);
    }
}
