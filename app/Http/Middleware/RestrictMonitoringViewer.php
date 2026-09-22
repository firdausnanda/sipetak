<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictMonitoringViewer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->hasRole('monitoring_viewer') && ! $user->hasAnyRole(['admin_cdk', 'admin_kelompok', 'ganis', 'user'])) {
            if (! $request->routeIs('mobile.dashboard', 'logout') && ! $request->is('/')) {
                abort(403);
            }
        }

        return $next($request);
    }
}
