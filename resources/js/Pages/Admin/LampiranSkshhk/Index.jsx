import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Download, Edit, Trash2, TreePine, Database, Box, FileSpreadsheet, Filter, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Index({ skshhks, summary = {}, vorad = {}, filters = {}, kelompoks = [] }) {
    const [filterKelompok, setFilterKelompok] = useState(filters?.kelompok_id || '');
    const [filterTanggal, setFilterTanggal] = useState(filters?.tanggal || '');

    const applyFilter = (key, value) => {
        const queryParams = {
            kelompok_id: filterKelompok,
            tanggal: filterTanggal,
            [key]: value
        };
        
        Object.keys(queryParams).forEach(k => {
            if (!queryParams[k]) {
                delete queryParams[k];
            }
        });

        router.get(route('admin.lampiran_skshhk.index'), queryParams, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleKelompokChange = (selectedOption) => {
        const val = selectedOption ? selectedOption.value : '';
        setFilterKelompok(val);
        applyFilter('kelompok_id', val);
    };

    const handleTanggalChange = (date) => {
        let val = '';
        if (date) {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset*60*1000));
            val = localDate.toISOString().split('T')[0];
        }
        setFilterTanggal(val);
        applyFilter('tanggal', val);
    };

    const kelompokOptions = kelompoks.map(k => ({
        value: k.id,
        label: k.nama_kelompok
    }));

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

            {/* Filter Section */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-end z-20 relative">
                {kelompoks.length > 0 && (
                    <div className="flex-1 w-full relative z-20">
                        <label className="block text-sm font-bold text-on-surface-variant mb-1">Kelompok</label>
                        <Select
                            isClearable
                            options={kelompokOptions}
                            value={kelompokOptions.find(opt => opt.value == filterKelompok) || null}
                            onChange={handleKelompokChange}
                            placeholder="Semua Kelompok"
                            className="react-select-container text-sm"
                            classNamePrefix="react-select"
                        />
                    </div>
                )}
                <div className="flex-1 w-full relative z-10">
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Tanggal</label>
                    <DatePicker
                        isClearable
                        selected={filterTanggal ? new Date(filterTanggal) : null}
                        onChange={handleTanggalChange}
                        dateFormat="dd MMMM yyyy"
                        placeholderText="Semua Tanggal"
                        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                        wrapperClassName="w-full"
                    />
                </div>
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
                                                    href={route('admin.lampiran_skshhk.export_excel', skshhk.id)} 
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 bg-[#10b981] text-white hover:bg-opacity-90 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs"
                                                >
                                                    <FileSpreadsheet className="w-4 h-4" /> Export Excel
                                                </a>
                                                <a 
                                                    href={route('admin.lampiran_skshhk.export_pdf', skshhk.id)} 
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 bg-primary text-on-primary hover:bg-opacity-90 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs"
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
