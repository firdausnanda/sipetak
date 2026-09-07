<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrationCheckController extends Controller
{
    /**
     * Tampilkan status migrasi vs tabel yang ada di database.
     * Membandingkan migrasi "Pending" dengan tabel yang sudah ada di DB.
     */
    public function index()
    {
        $pendingMigrations = $this->getPendingMigrations();
        $existingTables    = Schema::getTableListing();
        $maxBatch          = DB::table('migrations')->max('batch') ?? 0;

        $results = [];
        foreach ($pendingMigrations as $migration) {
            $guessedTable = $this->guessTableFromMigration($migration);

            $tableExists = false;
            if ($guessedTable) {
                $tableExists = in_array($guessedTable, $existingTables);
            }

            $results[] = [
                'migration'    => $migration,
                'guessed_table'=> $guessedTable,
                'table_exists' => $tableExists,
                'can_mark'     => $tableExists || $this->isAlterMigration($migration),
            ];
        }

        return response()->json([
            'max_batch'           => $maxBatch,
            'existing_tables'     => $existingTables,
            'pending_migrations'  => $results,
        ]);
    }

    /**
     * Mark migrasi tertentu sebagai "sudah dijalankan" tanpa benar-benar
     * menjalankan migrasi (mirip artisan migrate:pretend / fake).
     *
     * POST /admin/migration-check/mark-as-migrated
     * Body: { "migrations": ["2026_08_21_092754_create_regus_table", ...] }
     */
    public function markAsMigrated(Request $request)
    {
        $request->validate([
            'migrations'   => 'required|array|min:1',
            'migrations.*' => 'required|string',
        ]);

        $maxBatch  = (DB::table('migrations')->max('batch') ?? 0) + 1;
        $pending   = $this->getPendingMigrations();
        $marked    = [];
        $skipped   = [];

        foreach ($request->input('migrations') as $migration) {
            if (!in_array($migration, $pending)) {
                $skipped[] = $migration . ' (tidak ditemukan di daftar pending)';
                continue;
            }

            // Pastikan belum ada di tabel migrations
            $exists = DB::table('migrations')
                ->where('migration', $migration)
                ->exists();

            if ($exists) {
                $skipped[] = $migration . ' (sudah ada di tabel migrations)';
                continue;
            }

            DB::table('migrations')->insert([
                'migration' => $migration,
                'batch'     => $maxBatch,
            ]);

            $marked[] = $migration;
        }

        return response()->json([
            'success'  => true,
            'batch'    => $maxBatch,
            'marked'   => $marked,
            'skipped'  => $skipped,
            'message'  => count($marked) . ' migrasi berhasil di-mark sebagai migrated.',
        ]);
    }

    /**
     * Mark SEMUA migrasi pending yang tabel-nya sudah ada di database
     * (atau merupakan ALTER / DROP / ADD COLUMN migration).
     *
     * POST /admin/migration-check/mark-all-existing
     */
    public function markAllExisting()
    {
        $pendingMigrations = $this->getPendingMigrations();
        $existingTables    = Schema::getTableListing();
        $maxBatch          = (DB::table('migrations')->max('batch') ?? 0) + 1;

        $marked  = [];
        $skipped = [];

        foreach ($pendingMigrations as $migration) {
            $guessedTable = $this->guessTableFromMigration($migration);
            $canMark      = false;

            if ($guessedTable && in_array($guessedTable, $existingTables)) {
                $canMark = true;
            } elseif ($this->isAlterMigration($migration)) {
                // Migrasi ADD/ALTER/REMOVE column – asumsikan tabel sudah ada
                $canMark = true;
            }

            if (!$canMark) {
                $skipped[] = $migration . ' (tabel tidak ditemukan di database)';
                continue;
            }

            $exists = DB::table('migrations')
                ->where('migration', $migration)
                ->exists();

            if ($exists) {
                $skipped[] = $migration . ' (sudah ada di tabel migrations)';
                continue;
            }

            DB::table('migrations')->insert([
                'migration' => $migration,
                'batch'     => $maxBatch,
            ]);

            $marked[] = $migration;
        }

        return response()->json([
            'success' => true,
            'batch'   => $maxBatch,
            'marked'  => $marked,
            'skipped' => $skipped,
            'message' => count($marked) . ' migrasi berhasil di-mark sebagai migrated.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------------------------

    /**
     * Ambil daftar nama migrasi yang statusnya "Pending".
     */
    private function getPendingMigrations(): array
    {
        // Semua file migrasi yang ada
        $migrationFiles = glob(database_path('migrations/*.php'));
        $allMigrations  = array_map(function ($file) {
            return pathinfo($file, PATHINFO_FILENAME);
        }, $migrationFiles);

        // Yang sudah ada di tabel migrations (sudah ran)
        $ranMigrations = DB::table('migrations')->pluck('migration')->toArray();

        return array_values(array_diff($allMigrations, $ranMigrations));
    }

    /**
     * Coba tebak nama tabel dari nama file migrasi.
     * Contoh: "2026_08_21_092754_create_regus_table" → "regus"
     */
    private function guessTableFromMigration(string $migration): ?string
    {
        // create_xxx_table
        if (preg_match('/create_(.+)_table/', $migration, $m)) {
            return $m[1];
        }

        // add_xxx_to_yyy_table
        if (preg_match('/(?:add|remove|drop)_.+_(?:to|from|in)_(.+?)(?:_table)?$/', $migration, $m)) {
            return $m[1];
        }

        // alter_xxx_in_yyy_table  /  change_xxx_in_yyy_table
        if (preg_match('/(?:alter|change)_.+_in_(.+?)(?:_table)?$/', $migration, $m)) {
            return $m[1];
        }

        // move_xxx_to_yyy
        if (preg_match('/move_.+_to_(.+?)$/', $migration, $m)) {
            return $m[1];
        }

        return null;
    }

    /**
     * Cek apakah migrasi ini adalah ALTER (bukan CREATE) berdasarkan nama.
     */
    private function isAlterMigration(string $migration): bool
    {
        $alterKeywords = ['add_', 'remove_', 'drop_', 'alter_', 'change_', 'move_', 'update_', 'rename_'];
        foreach ($alterKeywords as $keyword) {
            // Cari setelah prefix tanggal: "2026_08_21_092754_"
            if (preg_match('/\d{4}_\d{2}_\d{2}_\d{6}_(' . preg_quote($keyword, '/') . ')/', $migration)) {
                return true;
            }
        }
        return false;
    }
}
