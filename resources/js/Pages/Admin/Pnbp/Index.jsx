import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ClipboardList, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('id', id);

const parseFilterDate = (value) => value ? new Date(`${value}T00:00:00`) : null;
const formatFilterDate = (date) => date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : '';
const emptyExportFilters = {
    search: '', kelompok_id: '', tanggal_mulai: '', tanggal_akhir: '',
    tanggal_billing: '', status: '', sortimen: '', min_volume: '', max_volume: '',
};

export default function Index({ pnbps, filters = {}, kelompoks = [], sortimens = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;
    
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [filterKelompok, setFilterKelompok] = useState(filters?.kelompok_id || '');
    const [filterTanggalBilling, setFilterTanggalBilling] = useState(filters?.tanggal_billing || '');
    const [filterStatus, setFilterStatus] = useState(filters?.status || '');
    
    const [showAdvanced, setShowAdvanced] = useState(
        !!(filters?.tanggal_billing || filters?.status || filters?.kelompok_id)
    );

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pnbpToDelete, setPnbpToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFilters, setExportFilters] = useState(emptyExportFilters);
    const [exportError, setExportError] = useState('');

    const applyFilter = (key, value) => {
        const queryParams = {
            search: key === 'search' ? value : searchQuery,
            kelompok_id: key === 'kelompok_id' ? value : filterKelompok,
            tanggal_billing: key === 'tanggal_billing' ? value : filterTanggalBilling,
            status: key === 'status' ? value : filterStatus,
        };
        
        Object.keys(queryParams).forEach(k => {
            if (!queryParams[k]) {
                delete queryParams[k];
            }
        });

        router.get(route('admin.pnbp.index'), queryParams, {
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
        setFilterTanggalBilling(val);
        applyFilter('tanggal_billing', val);
    };

    const handleAdvancedSearch = () => {
        applyFilter('advanced', 'trigger');
    };

    const resetAdvancedSearch = () => {
        setFilterTanggalBilling('');
        setFilterStatus('');
        
        const queryParams = {
            search: searchQuery,
            kelompok_id: filterKelompok,
        };
        
        Object.keys(queryParams).forEach(k => {
            if (!queryParams[k]) delete queryParams[k];
        });

        router.get(route('admin.pnbp.index'), queryParams, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const kelompokOptions = kelompoks.map(k => ({
        value: k.id,
        label: k.nama_kelompok
    }));

    const openExportModal = () => {
        setExportFilters({
            ...emptyExportFilters,
            search: searchQuery,
            kelompok_id: filterKelompok,
            tanggal_billing: filterTanggalBilling,
            status: filterStatus,
        });
        setExportError('');
        setIsExportModalOpen(true);
    };

    const updateExportFilter = (key, value) => {
        setExportFilters((current) => ({ ...current, [key]: value }));
        setExportError('');
    };

    const handleExportSubmit = (event) => {
        event.preventDefault();
        if (exportFilters.tanggal_mulai && exportFilters.tanggal_akhir && exportFilters.tanggal_akhir < exportFilters.tanggal_mulai) {
            setExportError('Tanggal akhir LHP tidak boleh sebelum tanggal mulai.');
            return;
        }
        if (exportFilters.min_volume !== '' && exportFilters.max_volume !== '' && Number(exportFilters.max_volume) < Number(exportFilters.min_volume)) {
            setExportError('Volume maksimum tidak boleh kurang dari volume minimum.');
            return;
        }

        setIsExporting(true);
        const params = new URLSearchParams();
        Object.entries(exportFilters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) params.set(key, value);
        });
        const query = params.toString();
        window.location.href = route('admin.pnbp.export_rekonsiliasi') + (query ? `?${query}` : '');
        setIsExportModalOpen(false);
        setTimeout(() => setIsExporting(false), 5000);
    };

    const openDeleteModal = (pnbp) => {
        setPnbpToDelete(pnbp);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteSubmit = () => {
        setIsDeleting(true);
        router.delete(route('admin.pnbp.destroy', pnbpToDelete.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setPnbpToDelete(null);
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
            <Head title="SIPETAK Admin - Penerimaan Negara Bukan Pajak (PNBP)" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Penerimaan Negara Bukan Pajak (PNBP)</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola pencatatan dan pembayaran tagihan PNBP (PSDH).</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        disabled={isExporting}
                        onClick={openExportModal}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors min-h-[48px] font-bold shadow-sm ${isExporting ? 'bg-[#0284c7]/60 text-white cursor-not-allowed' : 'bg-[#0284c7] text-white hover:bg-opacity-90'}`}
                    >
                        {isExporting
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                            : 'Export Excel'
                        }
                    </button>
                    <Link href={route('admin.pnbp.create')} className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <Plus className="w-[18px] h-[18px]" />
                        Buat Tagihan Baru
                    </Link>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 z-20 relative">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative z-10">
                        <label className="block text-sm font-bold text-on-surface-variant mb-1">Cari Kode Billing / NTPN / No LHP</label>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="relative z-10">
                                <label className="block text-sm font-bold text-on-surface-variant mb-1">Tanggal Terbit Billing</label>
                                <DatePicker
                                    isClearable
                                    selected={filterTanggalBilling ? new Date(filterTanggalBilling) : null}
                                    onChange={handleTanggalChange}
                                    dateFormat="dd MMMM yyyy"
                                    locale="id"
                                    placeholderText="Pilih Tanggal..."
                                    className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                                    wrapperClassName="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-1">Status Pembayaran</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        applyFilter('status', e.target.value);
                                    }}
                                    className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[38px]"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="lunas">Sudah Bayar</option>
                                    <option value="belum_lunas">Belum Bayar</option>
                                </select>
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
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">LHP / Kelompok</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kode Billing</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tgl Billing</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nominal</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status & Pembayaran</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {pnbps.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <ClipboardList className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data tagihan PNBP ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pnbps.data.map((pnbp) => (
                                    <tr key={pnbp.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4 text-sm">
                                            <div className="font-bold text-primary">{pnbp.lhp?.no_lhp || '-'}</div>
                                            <div className="text-xs text-on-surface-variant">{pnbp.lhp?.kelompok?.nama_kelompok || '-'}</div>
                                        </td>
                                        <td className="py-4 px-4 text-sm font-bold font-mono">{pnbp.kode_billing}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{formatDate(pnbp.tanggal_kode_billing)}</td>
                                        <td className="py-4 px-4 text-sm font-bold text-[#FB8500]">Rp {Math.ceil(Number(pnbp.jumlah)).toLocaleString('id-ID')}</td>
                                        <td className="py-4 px-4 text-sm">
                                            {pnbp.ntpn ? (
                                                <div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mb-1">
                                                        Sudah Bayar
                                                    </span>
                                                    <div className="text-xs text-on-surface-variant">Tgl: {formatDate(pnbp.tanggal_bayar)}</div>
                                                    <div className="text-xs text-on-surface-variant font-mono">NTPN: {pnbp.ntpn}</div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Belum Bayar
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('admin.pnbp.edit', pnbp.id)} className="p-2 text-[#FB8500] hover:bg-surface-container-low rounded-lg transition-colors" title="Edit Pembayaran">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => openDeleteModal(pnbp)} 
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
                {pnbps.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {pnbps.from || 0}-{pnbps.to || 0} dari {pnbps.total} data
                        </span>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {pnbps.links.map((link, k) => (
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

            <Modal show={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleExportSubmit} className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-on-surface">Filter Export Excel</h2>
                            <p className="mt-1 text-sm text-on-surface-variant">Pilih data untuk kertas kerja rekonsiliasi PSDH. Rentang tanggal berdasarkan tanggal LHP.</p>
                        </div>
                        <button type="button" onClick={() => setIsExportModalOpen(false)} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup filter ekspor"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="export-search" className="mb-1 block text-sm font-semibold text-on-surface">Cari No LHP / Kode Billing / NTPN</label>
                            <input id="export-search" type="text" value={exportFilters.search} onChange={(event) => updateExportFilter('search', event.target.value)} placeholder="Semua data" className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        </div>
                        {kelompoks.length > 0 && <div>
                            <label htmlFor="export-kelompok" className="mb-1 block text-sm font-semibold text-on-surface">Kelompok</label>
                            <select id="export-kelompok" value={exportFilters.kelompok_id} onChange={(event) => updateExportFilter('kelompok_id', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option value="">Semua kelompok</option>
                                {kelompoks.map((kelompok) => <option key={kelompok.id} value={kelompok.id}>{kelompok.nama_kelompok}</option>)}
                            </select>
                        </div>}
                        <div>
                            <label htmlFor="export-status" className="mb-1 block text-sm font-semibold text-on-surface">Status Pembayaran</label>
                            <select id="export-status" value={exportFilters.status} onChange={(event) => updateExportFilter('status', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option value="">Semua status</option>
                                <option value="lunas">Sudah bayar</option>
                                <option value="belum_lunas">Belum bayar</option>
                            </select>
                        </div>
                        <div className="relative z-20">
                            <label htmlFor="export-tanggal-mulai" className="mb-1 block text-sm font-semibold text-on-surface">Tanggal LHP Mulai</label>
                            <DatePicker id="export-tanggal-mulai" isClearable selected={parseFilterDate(exportFilters.tanggal_mulai)} onChange={(date) => updateExportFilter('tanggal_mulai', formatFilterDate(date))} maxDate={parseFilterDate(exportFilters.tanggal_akhir)} dateFormat="dd MMMM yyyy" locale="id" placeholderText="Dari tanggal..." className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" wrapperClassName="w-full" />
                        </div>
                        <div className="relative z-20">
                            <label htmlFor="export-tanggal-akhir" className="mb-1 block text-sm font-semibold text-on-surface">Tanggal LHP Akhir</label>
                            <DatePicker id="export-tanggal-akhir" isClearable selected={parseFilterDate(exportFilters.tanggal_akhir)} onChange={(date) => updateExportFilter('tanggal_akhir', formatFilterDate(date))} minDate={parseFilterDate(exportFilters.tanggal_mulai)} dateFormat="dd MMMM yyyy" locale="id" placeholderText="Sampai tanggal..." className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" wrapperClassName="w-full" />
                        </div>
                        <div>
                            <label htmlFor="export-tanggal-billing" className="mb-1 block text-sm font-semibold text-on-surface">Tanggal Terbit Billing</label>
                            <DatePicker id="export-tanggal-billing" isClearable selected={parseFilterDate(exportFilters.tanggal_billing)} onChange={(date) => updateExportFilter('tanggal_billing', formatFilterDate(date))} dateFormat="dd MMMM yyyy" locale="id" placeholderText="Semua tanggal" className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" wrapperClassName="w-full" />
                        </div>
                        <div>
                            <label htmlFor="export-sortimen" className="mb-1 block text-sm font-semibold text-on-surface">Sortimen</label>
                            <select id="export-sortimen" value={exportFilters.sortimen} onChange={(event) => updateExportFilter('sortimen', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option value="">Semua sortimen</option>
                                {sortimens.map((sortimen) => <option key={sortimen} value={sortimen}>{sortimen}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="export-min-volume" className="mb-1 block text-sm font-semibold text-on-surface">Volume Minimum (m³)</label>
                            <input id="export-min-volume" type="number" min="0" step="any" inputMode="decimal" value={exportFilters.min_volume} onChange={(event) => updateExportFilter('min_volume', event.target.value)} placeholder="Tanpa batas minimum" className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="export-max-volume" className="mb-1 block text-sm font-semibold text-on-surface">Volume Maksimum (m³)</label>
                            <input id="export-max-volume" type="number" min="0" step="any" inputMode="decimal" value={exportFilters.max_volume} onChange={(event) => updateExportFilter('max_volume', event.target.value)} placeholder="Tanpa batas maksimum" className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        </div>
                    </div>

                    {exportError && <p role="alert" className="mt-4 rounded-lg bg-error-container px-3 py-2 text-sm text-error">{exportError}</p>}
                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant pt-4">
                        <button type="button" onClick={() => { setExportFilters(emptyExportFilters); setExportError(''); }} className="mr-auto px-3 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary">Bersihkan filter</button>
                        <SecondaryButton type="button" onClick={() => setIsExportModalOpen(false)}>Batal</SecondaryButton>
                        <button type="submit" disabled={isExporting} className="inline-flex items-center gap-2 rounded-lg bg-[#0284c7] px-4 py-2 text-sm font-bold text-white hover:bg-[#0369a1] disabled:cursor-not-allowed disabled:opacity-60">
                            {isExporting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Unduh Excel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Konfirmasi Hapus
                    </h2>
                    <p className="mb-6 text-on-surface-variant">
                        Apakah Anda yakin ingin menghapus data tagihan PNBP <strong>{pnbpToDelete?.kode_billing}</strong>? Tindakan ini tidak dapat dibatalkan.
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
