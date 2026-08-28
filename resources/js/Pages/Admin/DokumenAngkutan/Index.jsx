import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, FileText, Calendar, Truck, Eye, TreePine, Database, Box } from 'lucide-react';

export default function Index({ dokumens, summary = {}, vorad = {}, auth }) {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };
    return (
        <AdminLayout>
            <Head title="SIPETAK Admin - Dokumen Angkutan" />
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Dokumen Angkutan</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola daftar dokumen angkutan kayu ke TPK.</p>
                </div>
                <div className="flex gap-3">
                    <Link href={route('admin.dokumen_angkutans.create')} className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <Plus className="w-[18px] h-[18px]" />
                        Buat Dokumen Baru
                    </Link>
                </div>
            </div>

            {/* Stats/Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* Card Pohon */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-[#10b981]/40 group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#10b981]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Pohon</span>
                            <span className="font-display text-[2rem] font-bold text-on-surface">
                                {new Intl.NumberFormat('id-ID').format(summary.total_pohon || 0)} <span className="text-sm font-medium text-on-surface-variant">Pohon</span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                            <TreePine className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Card Batang */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-[#f59e0b]/40 group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#f59e0b]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Batang</span>
                            <span className="font-display text-[2rem] font-bold text-on-surface">
                                {new Intl.NumberFormat('id-ID').format(summary.total_batang || 0)} <span className="text-sm font-medium text-on-surface-variant">Batang</span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                            <Database className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Card Volume */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-[#3b82f6]/40 group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#3b82f6]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Volume</span>
                            <span className="font-display text-[2rem] font-bold text-on-surface">
                                {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summary.total_volume || 0)} <span className="text-sm font-medium text-on-surface-variant">m³</span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
                            <Box className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Card Vorad */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-[#ef4444]/40 group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#ef4444]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10 mb-3">
                        <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-[#ef4444] mb-1 font-bold">Vorad (Sisa Pohon)</span>
                            <span className="font-display text-[2rem] font-bold text-on-surface">
                                {new Intl.NumberFormat('id-ID').format(vorad.pohon || 0)} <span className="text-sm font-medium text-on-surface-variant">Pohon</span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444]">
                            <TreePine className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant pt-2 border-t border-outline-variant/50">
                        <span>{new Intl.NumberFormat('id-ID').format(vorad.batang || 0)} Btg</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(vorad.volume || 0)} m³</span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">No Dokumen</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tanggal</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelompok</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Petak</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {dokumens.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <FileText className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data dokumen ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                dokumens.data.map((dokumen) => (
                                    <tr key={dokumen.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-[14px] text-primary mb-1.5">{dokumen.no_dokumen}</div>
                                            <div className="flex items-center flex-wrap gap-2 text-[11.5px] text-on-surface-variant">
                                                <span><span className="font-semibold text-on-surface">{dokumen.pohons_count || 0}</span> Pohon</span>
                                                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                                <span><span className="font-semibold text-on-surface">{dokumen.batangs_count || 0}</span> Batang</span>
                                                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                                <span><span className="font-bold text-[#FB8500]">{dokumen.batangs_sum_volume ? Number(dokumen.batangs_sum_volume).toFixed(2) : '0.00'}</span> m³</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{formatDate(dokumen.tanggal)}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{dokumen.kelompok?.nama_kelompok || '-'}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">
                                            {dokumen.petaks?.map(p => p.no_petak).join(', ') || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link 
                                                href={route('admin.dokumen_angkutans.show', dokumen.id)} 
                                                className="inline-flex items-center gap-1 bg-surface-container-high hover:bg-surface-container-highest text-primary px-3 py-1.5 rounded-lg transition-colors font-bold text-xs"
                                            >
                                                <Eye className="w-4 h-4" /> Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {dokumens.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {dokumens.from || 0}-{dokumens.to || 0} dari {dokumens.total} data
                        </span>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {dokumens.links.map((link, k) => (
                                <Link
                                    key={k}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 border border-outline-variant rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center whitespace-nowrap flex-shrink-0 text-sm ${link.active ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                    preserveState
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
