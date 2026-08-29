<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    /**
     * Display a listing of the backups.
     */
    public function index()
    {
        $disk = Storage::disk('google');
        $backupName = config('backup.backup.name');
        
        $files = [];
        if ($disk->exists($backupName)) {
            $files = $disk->files($backupName);
        }

        $backups = [];
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'zip') {
                $backups[] = [
                    'file_name' => basename($file),
                    'file_size' => $disk->size($file),
                    'last_modified' => $disk->lastModified($file),
                    'file_path' => $file,
                ];
            }
        }

        // Sort by last modified (newest first)
        usort($backups, function ($a, $b) {
            return $b['last_modified'] <=> $a['last_modified'];
        });

        // Format data for display
        $formattedBackups = array_map(function ($backup) {
            return [
                'file_name' => $backup['file_name'],
                'file_size' => $this->humanFilesize($backup['file_size']),
                'last_modified' => \Carbon\Carbon::createFromTimestamp($backup['last_modified'])->format('d M Y H:i:s'),
                'file_path' => $backup['file_path'],
            ];
        }, $backups);

        return Inertia::render('Admin/Backup/Index', [
            'backups' => $formattedBackups,
        ]);
    }

    /**
     * Create a new backup.
     */
    public function store()
    {
        try {
            $disk = Storage::disk('google');
            $backupName = config('backup.backup.name');
            
            // Ensure directory exists to prevent Flysystem from throwing UnableToListContents
            if (!$disk->exists($backupName)) {
                $disk->makeDirectory($backupName);
            }

            // Run backup command only for database
            Artisan::call('backup:run', ['--only-db' => true]);
            
            return redirect()->back()->with('success', 'Backup database berhasil dibuat dan diunggah ke Google Drive.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat backup: ' . $e->getMessage());
        }
    }

    /**
     * Download a specific backup file.
     */
    public function download(Request $request)
    {
        $filePath = $request->query('file_path');

        if (!$filePath || !Storage::disk('google')->exists($filePath)) {
            return redirect()->back()->with('error', 'File backup tidak ditemukan.');
        }

        $readStream = Storage::disk('google')->readStream($filePath);

        return response()->stream(function () use ($readStream) {
            fpassthru($readStream);
        }, 200, [
            'Content-Type' => 'application/zip',
            'Content-disposition' => 'attachment; filename="' . basename($filePath) . '"',
        ]);
    }

    /**
     * Remove the specified backup file.
     */
    public function destroy(Request $request)
    {
        $filePath = $request->query('file_path');

        if (!$filePath || !Storage::disk('google')->exists($filePath)) {
            return redirect()->back()->with('error', 'File backup tidak ditemukan.');
        }

        try {
            Storage::disk('google')->delete($filePath);
            return redirect()->back()->with('success', 'File backup berhasil dihapus dari Google Drive.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus file: ' . $e->getMessage());
        }
    }

    /**
     * Format bytes to human readable file size.
     */
    private function humanFilesize($bytes, $decimals = 2)
    {
        $size = array('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
        $factor = floor((strlen($bytes) - 1) / 3);
        return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . ' ' . @$size[$factor];
    }
}
