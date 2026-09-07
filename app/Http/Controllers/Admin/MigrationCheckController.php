<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MigrationCheckController extends Controller
{
    /**
     * Tampilkan status migrasi vs tabel yang ada di database.
     * Membandingkan migrasi "Pending" dengan tabel yang sudah ada di DB.
     */
    public function index()
    {
        $pendingMigrations = $this->getPendingMigrations();
        $existingTables    = $this->getExistingTables();
        $maxBatch          = DB::table('migrations')->max('batch') ?? 0;

        $results = [];
        foreach ($pendingMigrations as $migration) {
            $guessedTable = $this->guessTableFromMigration($migration);

            $tableExists = false;
            if ($guessedTable) {
                $tableExists = in_array($guessedTable, $existingTables);
            }

            $results[] = [
                'migration'     => $migration,
                'guessed_table' => $guessedTable,
                'table_exists'  => $tableExists,
                'can_mark'      => $tableExists || $this->isAlterMigration($migration),
            ];
        }

        return response()->json([
            'max_batch'          => $maxBatch,
            'existing_tables'    => $existingTables,
            'pending_migrations' => $results,
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

        $maxBatch = (DB::table('migrations')->max('batch') ?? 0) + 1;
        $pending  = $this->getPendingMigrations();
        $marked   = [];
        $skipped  = [];

        foreach ($request->input('migrations') as $migration) {
            if (!in_array($migration, $pending)) {
                $skipped[] = $migration . ' (tidak ditemukan di daftar pending)';
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

    /**
     * Mark SEMUA migrasi pending yang tabel-nya sudah ada di database
     * (atau merupakan ALTER / DROP / ADD COLUMN migration).
     *
     * POST /admin/migration-check/mark-all-existing
     */
    public function markAllExisting()
    {
        $pendingMigrations = $this->getPendingMigrations();
        $existingTables    = $this->getExistingTables();
        $maxBatch          = (DB::table('migrations')->max('batch') ?? 0) + 1;

        $marked  = [];
        $skipped = [];

        foreach ($pendingMigrations as $migration) {
            $guessedTable = $this->guessTableFromMigration($migration);
            $canMark      = false;

            if ($guessedTable && in_array($guessedTable, $existingTables)) {
                // Tabel sudah ada di DB
                $canMark = true;
            } elseif ($this->isAlterMigration($migration)) {
                // Migrasi ADD/ALTER/REMOVE column – tabel target pasti sudah ada
                $canMark = true;
            }

            if (!$canMark) {
                $skipped[] = $migration . ' (tabel tidak ditemukan: ' . ($guessedTable ?? '?') . ')';
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
     * Ambil nama tabel yang benar-benar ada di database aktif saat ini.
     * Menggunakan INFORMATION_SCHEMA agar tidak terpengaruh prefix schema
     * yang dikembalikan oleh Schema::getTableListing() di MySQL multi-DB.
     */
    private function getExistingTables(): array
    {
        $database = config('database.connections.' . config('database.default') . '.database');

        $tables = DB::select(
            'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
            [$database]
        );

        return array_map(fn($row) => $row->TABLE_NAME, $tables);
    }

    /**
     * Ambil daftar nama migrasi yang statusnya "Pending".
     */
    private function getPendingMigrations(): array
    {
        $migrationFiles = glob(database_path('migrations/*.php'));
        $allMigrations  = array_map(
            fn($file) => pathinfo($file, PATHINFO_FILENAME),
            $migrationFiles
        );

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

        // add_xxx_to_yyy_table  /  remove_xxx_from_yyy_table
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
        // Cari keyword setelah prefix tanggal: "2026_08_21_092754_"
        if (preg_match('/\d{4}_\d{2}_\d{2}_\d{6}_(.+)/', $migration, $m)) {
            $name = $m[1];
            $alterKeywords = ['add_', 'remove_', 'drop_', 'alter_', 'change_', 'move_', 'update_', 'rename_'];
            foreach ($alterKeywords as $keyword) {
                if (str_starts_with($name, $keyword)) {
                    return true;
                }
            }
        }

        return false;
    }
}
