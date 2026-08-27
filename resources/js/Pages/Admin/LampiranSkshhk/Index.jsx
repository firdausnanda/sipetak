import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Download, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ skshhks }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus SKSHHK?',
            text: "Data kayu akan dilepas dari SKSHHK ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.lampiran_skshhk.destroy', id), {
                    onSuccess: () => Swal.fire('Terhapus!', 'SKSHHK berhasil dihapus.', 'success')
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Kelola SKSHHK" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Kelola SKSHHK</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Manajemen data Surat Keterangan Sah Hasil Hutan Kayu</p>
                </div>
                <Link 
                    href={route('admin.lampiran_skshhk.create')} 
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-bold"
                >
                    <Plus className="w-5 h-5" /> Tambah SKSHHK
                </Link>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-container border-b border-outline-variant">
                            <tr>
                                <th className="py-3 px-4 font-bold text-sm text-on-surface">No. SKSHHK</th>
                                <th className="py-3 px-4 font-bold text-sm text-on-surface">Tanggal</th>
                                <th className="py-3 px-4 font-bold text-sm text-on-surface text-center">Jml Pohon</th>
                                <th className="py-3 px-4 font-bold text-sm text-on-surface text-right">Volume Total</th>
                                <th className="py-3 px-4 font-bold text-sm text-on-surface text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {skshhks.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                                        Belum ada data SKSHHK.
                                    </td>
                                </tr>
                            ) : (
                                skshhks.data.map((skshhk) => (
                                    <tr key={skshhk.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-4 px-4 font-bold text-primary">{skshhk.no_skshhk}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{formatDate(skshhk.tanggal)}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant text-center">{skshhk.pohons_count || 0}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant text-right">{skshhk.total_volume ? Number(skshhk.total_volume).toFixed(2) : '0.00'}</td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a 
                                                    href={route('admin.lampiran_skshhk.export_pdf', skshhk.id)} 
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 bg-[#10b981] text-white hover:bg-opacity-90 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs"
                                                >
                                                    <Download className="w-4 h-4" /> Export PDF
                                                </a>
                                                <Link 
                                                    href={route('admin.lampiran_skshhk.edit', skshhk.id)} 
                                                    className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface hover:bg-outline-variant px-3 py-1.5 rounded-lg transition-colors font-bold text-xs"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </Link>
                                                {/* <button 
                                                    onClick={() => handleDelete(skshhk.id)}
                                                    className="inline-flex items-center gap-1 bg-error text-white hover:bg-opacity-90 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs hidden"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Hapus
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {skshhks.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {skshhks.from || 0}-{skshhks.to || 0} dari {skshhks.total} data
                        </span>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {skshhks.links.map((link, k) => (
                                <Link
                                    key={k}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 border border-outline-variant rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center whitespace-nowrap flex-shrink-0 text-sm ${link.active ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
