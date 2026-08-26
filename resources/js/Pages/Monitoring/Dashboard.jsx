import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, persentaseTebang, persentaseAngkut }) {
    return (
        <AdminLayout user={auth.user}>
            <Head title="SIPETAK Admin - Monitoring Operasional" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Monitoring Operasional</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Pantau progres hari ini untuk kegiatan penebangan dan pengangkutan kayu.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center">
                    <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase">Progres Penebangan</span>
                    <span className="text-5xl font-display text-primary mb-4">{Number(persentaseTebang).toFixed(1)}%</span>
                    <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${persentaseTebang}%` }}></div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center">
                    <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase">Progres Pengangkutan</span>
                    <span className="text-5xl font-display text-primary mb-4">{Number(persentaseAngkut).toFixed(1)}%</span>
                    <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                        <div className="bg-[#FB8500] h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${persentaseAngkut}%` }}></div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
