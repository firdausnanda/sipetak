import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ClipboardCheck, X, SlidersHorizontal, Loader2, User, Trees } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('id', id);

export default function Index({ lhps, filters = {}, kelompoks = [], summary = {} }) {
    const { auth } = usePage().props;
    const user = auth.user;
    
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [filterKelompok, setFilterKelompok] = useState(filters?.kelompok_id || '');
    const [filterTanggal, setFilterTanggal] = useState(filters?.tanggal || '');
    const [filterSortimen, setFilterSortimen] = useState(filters?.sortimen || '');
    const [filterMinVolume, setFilterMinVolume] = useState(filters?.min_volume || '');
    const [filterMaxVolume, setFilterMaxVolume] = useState(filters?.max_volume || '');

    const [showAdvanced, setShowAdvanced] = useState(
        !!(filters?.tanggal || filters?.sortimen || filters?.min_volume || filters?.max_volume)
    );

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [lhpToDelete, setLhpToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const applyFilter = (key, value) => {
        const queryParams = {
            search: key === 'search' ? value : searchQuery,
            kelompok_id: key === 'kelompok_id' ? value : filterKelompok,
            tanggal: key === 'tanggal' ? value : filterTanggal,
            sortimen: key === 'sortimen' ? value : filterSortimen,
            min_volume: key === 'min_volume' ? value : filterMinVolume,
            max_volume: key === 'max_volume' ? value : filterMaxVolume,
        };
        
        Object.keys(queryParams).forEach(k => {
            if (!queryParams[k]) {
                delete queryParams[k];
            }
        });

        router.get(route('admin.lhp.index'), queryParams, {
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

    const handleAdvancedSearch = () => {
        applyFilter('advanced', 'trigger'); // just triggers the applyFilter with current states
    };

    const resetAdvancedSearch = () => {
        setFilterTanggal('');
        setFilterSortimen('');
        setFilterMinVolume('');
        setFilterMaxVolume('');
        
        const queryParams = {
            search: searchQuery,
            kelompok_id: filterKelompok,
        };
        
        Object.keys(queryParams).forEach(k => {
            if (!queryParams[k]) delete queryParams[k];
        });

        router.get(route('admin.lhp.index'), queryParams, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const kelompokOptions = kelompoks.map(k => ({
        value: k.id,
        label: k.nama_kelompok
    }));

    const openDeleteModal = (lhp) => {
        setLhpToDelete(lhp);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteSubmit = () => {
        setIsDeleting(true);
        router.delete(route('admin.lhp.destroy', lhpToDelete.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setLhpToDelete(null);
            },
            onFinish: () => setIsDeleting(false)
        });
    };

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
            <Head title="SIPETAK Admin - Laporan Hasil Produksi (LHP)" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Laporan Hasil Produksi (LHP)</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola pencatatan LHP secara mandiri.</p>
                </div>
                <div className="flex gap-3">
                    <Link href={route('admin.lhp.create')} className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <Plus className="w-[18px] h-[18px]" />
                        Buat LHP Baru
                    </Link>
                </div>
            </div>

            {/* Stats/Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-[#8b5cf6]/40 group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#8b5cf6]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Volume Batang</span>
                            <span className="font-display text-[2rem] font-bold text-on-surface">
                                {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summary.total_volume_batang || 0)} <span className="text-sm font-medium text-on-surface-variant">m³</span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                            <Trees className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-[#f59e0b]/40 group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#f59e0b]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Volume & Jumlah LHP</span>
                            <span className="font-display text-[2rem] font-bold text-on-surface">
                                {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summary.total_volume || 0)} <span className="text-sm font-medium text-on-surface-variant">m³</span>
                            </span>
                            <span className="text-sm font-bold text-on-surface-variant mt-1">
                                {new Intl.NumberFormat('id-ID').format(summary.total_lhp || 0)} Data LHP
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-[#3b82f6]/40 group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#3b82f6]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total PSDH Dibayarkan</span>
                            <span className="font-display text-[1.5rem] md:text-[2rem] font-bold text-on-surface">
                                <span className="text-sm font-medium text-on-surface-variant mr-1">Rp</span>
                                {new Intl.NumberFormat('id-ID').format(Math.ceil(summary.total_psdh || 0))}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 z-20 relative">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative z-10">
                        <label className="block text-sm font-bold text-on-surface-variant mb-1">Cari No LHP / Jenis Kayu</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ketik lalu Enter..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyFilter('search', searchQuery);
                                }}
                                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        applyFilter('search', '');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
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
                    <div>
                        <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-sm transition-colors min-h-[38px] ${showAdvanced ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Pencarian Lanjutan
                        </button>
                    </div>
                </div>

                {/* Advanced Search Panel */}
                {showAdvanced && (
                    <div className="mt-4 pt-4 border-t border-outline-variant animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="relative z-10">
                                <label className="block text-sm font-bold text-on-surface-variant mb-1">Tanggal LHP</label>
                                <DatePicker
                                    isClearable
                                    selected={filterTanggal ? new Date(filterTanggal) : null}
                                    onChange={handleTanggalChange}
                                    dateFormat="dd MMMM yyyy"
                                    locale="id"
                                    placeholderText="Pilih Tanggal..."
                                    className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                                    wrapperClassName="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-1">Sortimen</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: KBK"
                                    value={filterSortimen}
                                    onChange={(e) => setFilterSortimen(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdvancedSearch();
                                    }}
                                    className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-1">Volume Minimum (m³)</label>
                                <input
                                    type="number"
                                    placeholder="Misal: 10"
                                    value={filterMinVolume}
                                    onChange={(e) => setFilterMinVolume(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdvancedSearch();
                                    }}
                                    className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-1">Volume Maksimum (m³)</label>
                                <input
                                    type="number"
                                    placeholder="Misal: 100"
                                    value={filterMaxVolume}
                                    onChange={(e) => setFilterMaxVolume(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdvancedSearch();
                                    }}
                                    className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <SecondaryButton onClick={resetAdvancedSearch} className="text-sm px-4 py-2">Reset</SecondaryButton>
                            <button onClick={handleAdvancedSearch} className="bg-primary hover:bg-opacity-90 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">No LHP</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelompok / Tanggal</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Jenis Kayu / Sortimen</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Volume</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Tarif / PSDH</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Input Oleh</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {lhps.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <ClipboardCheck className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data LHP ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                lhps.data.map((lhp) => (
                                    <tr key={lhp.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4 font-bold text-sm text-primary">{lhp.no_lhp}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">
                                            <div className="font-bold text-on-surface">{lhp.kelompok?.nama_kelompok || '-'}</div>
                                            <div className="text-xs mt-1">{formatDate(lhp.tanggal)}</div>
                                        </td>
                                        <td className="py-4 px-4 text-sm">
                                            <div className="font-bold">{lhp.jenis_pohon?.nama_jenis || '-'}</div>
                                            <div className="text-xs text-on-surface-variant uppercase">{lhp.sortimen}</div>
                                        </td>
                                        <td className="py-4 px-4 text-sm font-semibold">
                                            {Number(lhp.volume).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-on-surface-variant font-normal">m³</span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-right whitespace-nowrap">
                                            <div className="text-on-surface-variant text-xs mb-1">Rp {Number(lhp.tarif).toLocaleString('id-ID')}</div>
                                            <div className="font-bold text-[#FB8500]">Rp {Math.ceil(Number(lhp.psdh)).toLocaleString('id-ID')}</div>
                                        </td>
                                        <td className="py-4 px-4 text-sm whitespace-nowrap text-on-surface-variant">
                                            <div className="flex items-center gap-2">
                                                <User className="text-outline w-[14px] h-[14px]" />
                                                {lhp.creator?.name || 'Sistem'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('admin.lhp.edit', lhp.id)} className="p-2 text-[#FB8500] hover:bg-surface-container-low rounded-lg transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => openDeleteModal(lhp)} 
                                                    className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {lhps.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {lhps.from || 0}-{lhps.to || 0} dari {lhps.total} data
                        </span>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {lhps.links.map((link, k) => (
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

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Konfirmasi Hapus
                    </h2>
                    <p className="mb-6 text-on-surface-variant">
                        Apakah Anda yakin ingin menghapus data LHP <strong>{lhpToDelete?.no_lhp}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <DangerButton onClick={handleDeleteSubmit} disabled={isDeleting} className="flex items-center gap-2">
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
            
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
