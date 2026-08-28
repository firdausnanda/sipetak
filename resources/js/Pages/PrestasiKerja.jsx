import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { id as localeId } from 'date-fns/locale/id';
import { format } from 'date-fns';

registerLocale('id', localeId);

export default function PrestasiKerja({ operations, filters }) {
    // parse initial YYYY-MM to Date object
    const [bulan, setBulan] = useState(filters?.bulan ? new Date(filters.bulan + '-01T00:00:00') : new Date());

    const handleFilterChange = (date) => {
        setBulan(date);
        if (date) {
            const val = format(date, 'yyyy-MM');
            router.get(route('prestasi_kerja'), { bulan: val }, { preserveState: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Detail Prestasi Kerja" />

            <div className="flex-grow pt-[calc(var(--spacing-touch-target)+var(--spacing-margin-mobile))] md:pt-0 px-margin-mobile md:px-0 flex flex-col max-w-[1200px] w-full mx-auto pb-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="font-display text-display text-primary">Detail Prestasi Kerja</h1>
                        <p className="font-body-md text-on-surface-variant">Rincian kinerja harian Anda</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-1/3">
                        <label className="font-label-md text-on-surface-variant whitespace-nowrap">Bulan:</label>
                        <DatePicker
                            selected={bulan}
                            onChange={handleFilterChange}
                            dateFormat="MMMM yyyy"
                            showMonthYearPicker
                            locale="id"
                            wrapperClassName="w-full"
                            className="w-full rounded-lg border border-outline-variant bg-surface text-on-surface p-2.5 text-base focus:border-primary focus:ring-primary"
                            calendarClassName="text-lg md:scale-110 origin-top-left md:origin-top-right shadow-lg border-outline-variant"
                        />
                    </div>
                </div>

                {/* Desktop View */}
                <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-high border-b border-outline-variant">
                                    <th className="p-4 font-label-lg text-on-surface">Tanggal</th>
                                    <th className="p-4 font-label-lg text-on-surface text-center">Pohon</th>
                                    <th className="p-4 font-label-lg text-on-surface text-center">Batang</th>
                                    <th className="p-4 font-label-lg text-on-surface text-center">Vol (m³)</th>
                                    <th className="p-4 font-label-lg text-on-surface text-center">Status Upah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {operations.data.length > 0 ? (
                                    operations.data.map((op, i) => (
                                        <tr key={i} className="hover:bg-surface-container/30 transition-colors">
                                            <td className="p-4 font-body-md text-on-surface font-semibold">
                                                {new Date(op.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 font-body-md text-on-surface text-center">{op.jumlah_pohon}</td>
                                            <td className="p-4 font-body-md text-on-surface text-center">{op.jumlah_batang}</td>
                                            <td className="p-4 font-body-md text-on-surface text-center">{Number(op.total_volume).toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col gap-2 items-center justify-center">
                                                    {op.pohon_lunas > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold w-fit">
                                                            <CheckCircle className="w-4 h-4" /> Lunas
                                                        </span>
                                                    )}
                                                    {op.pohon_pending > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold w-fit">
                                                            <Clock className="w-4 h-4" /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-on-surface-variant font-body-md">
                                            Belum ada data prestasi kerja untuk bulan ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {operations.data.length > 0 ? (
                        operations.data.map((op, i) => (
                            <div key={i} className="bg-surface rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                                    <span className="font-body-md text-on-surface font-bold text-primary">
                                        {new Date(op.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center bg-surface-container-low p-2 rounded-lg">
                                        <span className="text-xl font-bold text-on-surface">{op.jumlah_pohon}</span>
                                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Pohon</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-surface-container-low p-2 rounded-lg">
                                        <span className="text-xl font-bold text-on-surface">{op.jumlah_batang}</span>
                                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Batang</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-surface-container-low p-2 rounded-lg">
                                        <span className="text-xl font-bold text-on-surface">{Number(op.total_volume).toFixed(2)}</span>
                                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Vol (m³)</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 pt-2 border-t-0 md:border-t border-outline-variant/30 mt-2">
                                    <span className="text-xs text-on-surface-variant font-label-caps tracking-wider">STATUS UPAH</span>
                                    <div className="flex gap-3 flex-wrap">
                                        {op.pohon_lunas > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold shadow-sm">
                                                <CheckCircle className="w-4 h-4" /> Lunas
                                            </span>
                                        )}
                                        {op.pohon_pending > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold shadow-sm">
                                                <Clock className="w-4 h-4" /> Pending
                                            </span>
                                        )}
                                        {op.pohon_lunas == 0 && op.pohon_pending == 0 && (
                                            <span className="text-sm text-on-surface-variant italic">Belum ada data</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-on-surface-variant font-body-md bg-surface rounded-xl border border-outline-variant shadow-sm">
                            Belum ada data prestasi kerja untuk bulan ini.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {operations.links && operations.links.length > 3 && (
                    <div className="mt-6 flex justify-center gap-2 flex-wrap">
                        {operations.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-4 py-2 rounded-lg font-label-md ${
                                    link.active 
                                        ? 'bg-primary text-on-primary' 
                                        : 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-high'
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
