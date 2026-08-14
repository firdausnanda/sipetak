import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Calendar, Users, Map, Info, TreePine, Printer, Box } from 'lucide-react';

export default function Show({ dokumen }) {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const totalPohon = dokumen.pohons?.length || 0;
    const totalBatang = dokumen.pohons?.reduce((acc, curr) => acc + (curr.batangs?.length || 0), 0) || 0;

    return (
        <AdminLayout>
            <Head title={`Detail Dokumen: ${dokumen.no_dokumen}`} />
            
            {/* Header / Title Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link 
                        href={route('admin.dokumen_angkutans.index')} 
                        className="w-10 h-10 flex items-center justify-center bg-surface-container hover:bg-surface-container-high rounded-full transition-colors text-on-surface shadow-sm print:hidden"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="font-display text-2xl text-primary font-bold print:text-black">Detail Dokumen Angkutan</h2>
                        <p className="font-body-sm text-on-surface-variant mt-1 print:text-black">
                            Informasi lengkap mengenai dokumen pengangkutan dan daftar pohon terkait.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 print:hidden">
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-surface-container-high text-primary px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors font-bold shadow-sm">
                        <Printer className="w-4 h-4" />
                        Cetak Dokumen
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:flex print:flex-col print:gap-4">
                
                {/* Informasi Dokumen - Left Sidebar (4 columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6 print:w-full">
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                        <div className="bg-primary/5 p-5 border-b border-outline-variant flex items-center gap-3">
                            <div className="p-2 bg-primary text-white rounded-lg">
                                <Info className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-primary">Informasi Umum</h3>
                        </div>
                        
                        <div className="p-5 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant mt-1">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nomor Dokumen</div>
                                    <div className="font-bold text-lg text-on-surface">{dokumen.no_dokumen}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant mt-1">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tanggal Angkutan</div>
                                    <div className="font-medium text-on-surface">{formatDate(dokumen.tanggal)}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant mt-1">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Kelompok</div>
                                    <div className="font-medium text-on-surface">{dokumen.kelompok?.nama_kelompok || '-'}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant mt-1">
                                    <Map className="w-4 h-4" />
                                </div>
                                <div className="w-full">
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Area Petak</div>
                                    <div className="flex flex-wrap gap-2">
                                        {dokumen.petaks?.length > 0 ? (
                                            dokumen.petaks.map(petak => (
                                                <span key={petak.id} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                    {petak.no_petak}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-on-surface-variant">-</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 divide-x divide-outline-variant border-t border-outline-variant bg-surface-container-lowest">
                            <div className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-black text-primary">{totalPohon}</span>
                                <span className="text-xs font-bold text-on-surface-variant uppercase mt-1">Total Pohon</span>
                            </div>
                            <div className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-black text-[#FB8500]">{totalBatang}</span>
                                <span className="text-xs font-bold text-on-surface-variant uppercase mt-1">Total Batang</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daftar Pohon & Batang - Right Main Area (8 columns) */}
                <div className="lg:col-span-8">
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary text-white rounded-lg">
                                    <TreePine className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-primary">Daftar Pohon Terangkut</h3>
                            </div>
                        </div>
                        
                        <div className="p-5">
                            {!dokumen.pohons || dokumen.pohons.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
                                    <TreePine className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="font-bold">Tidak ada data pohon pada dokumen ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {dokumen.pohons.map((pohon, index) => (
                                        <div key={pohon.id} className="border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 bg-surface print:break-inside-avoid print:border-gray-300">
                                            {/* Header Pohon */}
                                            <div className="p-4 bg-surface-container-lowest border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-on-surface flex items-center gap-2">
                                                            {pohon.no_barcode || pohon.no_pohon || 'Tanpa Barcode'}
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-on-surface-variant">
                                                            <span className="flex items-center gap-1">
                                                                <TreePine className="w-3 h-3" /> {pohon.jenis_pohon?.nama_jenis || '-'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Map className="w-3 h-3" /> {pohon.petak?.no_petak || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 bg-secondary-container/50 text-on-secondary-container px-3 py-1.5 rounded-lg border border-secondary-container">
                                                    <Box className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-bold">{pohon.batangs?.length || 0} Batang</span>
                                                </div>
                                            </div>
                                            
                                            {/* Tabel Batang */}
                                            <div className="p-4">
                                                {pohon.batangs && pohon.batangs.length > 0 ? (
                                                    <div className="overflow-x-auto rounded-lg border border-outline-variant">
                                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                                            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                                                                <tr>
                                                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">No.</th>
                                                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Panjang (m)</th>
                                                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">D. Pangkal (cm)</th>
                                                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">D. Ujung (cm)</th>
                                                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Mutu</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-outline-variant">
                                                                {pohon.batangs.map(batang => (
                                                                    <tr key={batang.id} className="hover:bg-surface-container-lowest transition-colors">
                                                                        <td className="px-4 py-3 font-medium text-on-surface">{batang.no_batang}</td>
                                                                        <td className="px-4 py-3 text-right text-on-surface-variant">{batang.panjang}</td>
                                                                        <td className="px-4 py-3 text-right text-on-surface-variant">{batang.diameter_pangkal}</td>
                                                                        <td className="px-4 py-3 text-right text-on-surface-variant">{batang.diameter_ujung}</td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-bold min-w-[24px]">
                                                                                {batang.mutu}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-center text-on-surface-variant bg-surface-container p-4 rounded-lg border border-outline-variant border-dashed">
                                                        Belum ada data ukuran batang untuk pohon ini.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
