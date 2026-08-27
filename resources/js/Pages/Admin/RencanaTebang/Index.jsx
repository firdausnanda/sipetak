import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Search, Upload, Trash2, Download, FileText, ClipboardList, Map as MapIcon, TreePine, Users } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Select from 'react-select';

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '48px',
        borderRadius: '0.5rem',
        borderColor: state.isFocused ? '#FB8500' : '#c3c7c9',
        boxShadow: state.isFocused ? '0 0 0 1px #FB8500' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#FB8500' : '#c3c7c9'
        },
        paddingLeft: '2.5rem',
        backgroundColor: '#f8fafc',
    }),
    valueContainer: (base) => ({
        ...base,
        paddingLeft: '0'
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999
    }),
    indicatorSeparator: () => ({ display: 'none' })
};

export default function Index({ auth, rencanaTebangs, petaks = [], jenisPohons = [], kelompoks = [], filters = {} }) {
    const safeFilters = Array.isArray(filters) ? {} : filters;
    const [search, setSearch] = useState(safeFilters.search || '');
    const [perPage, setPerPage] = useState(safeFilters.per_page || '10');
    const [petakFilter, setPetakFilter] = useState(safeFilters.petak_id || '');
    const [jenisPohonFilter, setJenisPohonFilter] = useState(safeFilters.jenis_pohon_id || '');
    const [kelompokFilter, setKelompokFilter] = useState(safeFilters.kelompok_id || '');
    
    const petakOptions = [
        { value: '', label: 'Semua Petak' },
        ...petaks.map(p => ({ value: p.id, label: p.no_petak }))
    ];

    const jenisPohonOptions = [
        { value: '', label: 'Semua Jenis' },
        ...jenisPohons.map(j => ({ value: j.id, label: j.nama_jenis }))
    ];

    const kelompokOptions = kelompoks.map(k => ({ value: k.id, label: k.nama_kelompok }));
    const kelompokFilterOptions = [
        { value: '', label: 'Semua Kelompok' },
        ...kelompoks.map(k => ({ value: k.id, label: k.nama_kelompok }))
    ];

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        kelompok_id: '',
    });

    const applyFilters = (overrides = {}) => {
        const payload = { 
            search, 
            per_page: perPage,
            petak_id: petakFilter,
            jenis_pohon_id: jenisPohonFilter,
            kelompok_id: kelompokFilter,
            ...overrides 
        };
        router.get(route('admin.rencana_tebangs.index'), payload, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleFilterChange = (field, value) => {
        if (field === 'per_page') setPerPage(value);
        if (field === 'petak_id') setPetakFilter(value);
        if (field === 'jenis_pohon_id') setJenisPohonFilter(value);
        if (field === 'kelompok_id') setKelompokFilter(value);
        
        applyFilters({ [field]: value });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        post(route('admin.rencana_tebangs.import'), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteSubmit = () => {
        if (itemToDelete) {
            router.delete(route('admin.rencana_tebangs.destroy', itemToDelete.id), {
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = route('admin.rencana_tebangs.template');
    };

    return (
        <AdminLayout>
            <Head title="SIPETAK Admin - Rencana Tebang" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Data Rencana Tebang</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola daftar pohon yang direncanakan untuk ditebang (injeksi data).</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors min-h-[48px] font-bold shadow-sm border border-outline-variant">
                        <Download className="w-[18px] h-[18px]" />
                        Unduh Template
                    </button>
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <Upload className="w-[18px] h-[18px]" />
                        Import Excel/CSV
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-end relative z-20">
                {auth.user.roles?.includes('admin_cdk') && (
                    <div className="w-full lg:flex-1">
                        <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Kelompok</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                            <Select
                                value={kelompokFilterOptions.find(o => o.value == kelompokFilter) || kelompokFilterOptions[0]}
                                onChange={(option) => handleFilterChange('kelompok_id', option ? option.value : '')}
                                options={kelompokFilterOptions}
                                styles={customSelectStyles}
                                placeholder="Semua Kelompok"
                                isSearchable
                            />
                        </div>
                    </div>
                )}
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Petak</label>
                    <div className="relative">
                        <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <Select
                            value={petakOptions.find(o => o.value == petakFilter) || petakOptions[0]}
                            onChange={(option) => handleFilterChange('petak_id', option ? option.value : '')}
                            options={petakOptions}
                            styles={customSelectStyles}
                            placeholder="Semua Petak"
                            isSearchable
                        />
                    </div>
                </div>
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Jenis Pohon</label>
                    <div className="relative">
                        <TreePine className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <Select
                            value={jenisPohonOptions.find(o => o.value == jenisPohonFilter) || jenisPohonOptions[0]}
                            onChange={(option) => handleFilterChange('jenis_pohon_id', option ? option.value : '')}
                            options={jenisPohonOptions}
                            styles={customSelectStyles}
                            placeholder="Semua Jenis"
                            isSearchable
                        />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-body-md text-on-surface-variant">Tampilkan</span>
                    <select 
                        value={perPage}
                        onChange={(e) => handleFilterChange('per_page', e.target.value)}
                        className="border border-outline-variant rounded-lg py-1.5 focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-sm font-body-md text-on-surface-variant">entri</span>
                </div>
                <div className="relative w-full sm:w-72 flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[18px] h-[18px]" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Cari No Pohon / Barcode..."
                        className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm bg-surface-container-lowest min-h-[40px]"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">No</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelompok</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Petak</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Jenis Pohon</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">No Pohon</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Barcode</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {rencanaTebangs.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <FileText className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rencanaTebangs.data.map((item, index) => (
                                    <tr key={item.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{rencanaTebangs.from + index}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant font-bold">{item.kelompok?.nama_kelompok || '-'}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{item.petak?.no_petak || '-'}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{item.jenis_pohon?.nama_jenis || '-'}</td>
                                        <td className="py-4 px-4 font-bold text-sm text-primary">{item.no_pohon}</td>
                                        <td className="py-4 px-4 text-sm font-mono text-on-surface-variant">{item.no_barcode || '-'}</td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openDeleteModal(item)} 
                                                    className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
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
                {rencanaTebangs.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {rencanaTebangs.from || 0}-{rencanaTebangs.to || 0} dari {rencanaTebangs.total} data
                        </span>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {rencanaTebangs.links.map((link, k) => (
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

            {/* Import Modal */}
            <Modal show={isImportModalOpen} onClose={() => setIsImportModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Import Rencana Tebang
                    </h2>
                    <form onSubmit={handleImportSubmit}>
                        <div className="space-y-4">
                            <p className="text-sm text-on-surface-variant bg-surface-container p-3 rounded-lg border border-outline-variant/50">
                                Format kolom Excel/CSV yang dibutuhkan (baris pertama sebagai header):
                                <br />
                                <strong>petak, jenis_pohon, no_pohon, no_barcode</strong>
                            </p>
                            
                            {auth.user.roles?.includes('admin_cdk') && (
                                <div>
                                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Pilih Kelompok</label>
                                    <Select
                                        value={kelompokOptions.find(o => o.value == data.kelompok_id) || null}
                                        onChange={(option) => setData('kelompok_id', option ? option.value : '')}
                                        options={kelompokOptions}
                                        styles={customSelectStyles}
                                        placeholder="Pilih Kelompok"
                                        isSearchable
                                        menuPosition="fixed"
                                        menuPortalTarget={document.body}
                                    />
                                    <InputError message={errors.kelompok_id} className="mt-2" />
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="file" value="Pilih File (Excel/CSV)" />
                                <input
                                    id="file"
                                    type="file"
                                    name="file"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    className="mt-1 block w-full p-2 border border-outline-variant focus:border-primary focus:ring-primary rounded-lg shadow-sm"
                                    onChange={(e) => setData('file', e.target.files[0])}
                                    required
                                />
                                <InputError message={errors.file} className="mt-2" />
                            </div>
                        </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton type="button" onClick={() => setIsImportModalOpen(false)}>Batal</SecondaryButton>
                                <PrimaryButton disabled={processing}>
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Mengimpor...
                                        </span>
                                    ) : 'Import Data'}
                                </PrimaryButton>
                            </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Konfirmasi Hapus
                    </h2>
                    <p className="mb-6 text-on-surface-variant">
                        Apakah Anda yakin ingin menghapus data rencana tebang <strong>{itemToDelete?.no_pohon}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <DangerButton onClick={handleDeleteSubmit} disabled={processing}>Ya, Hapus</DangerButton>
                    </div>
                </div>
            </Modal>
            
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
