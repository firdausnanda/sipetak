import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Search, Upload, Trash2, Download, FileText, ClipboardList, TreePine, Users } from 'lucide-react';
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

export default function Index({ auth, tabelVolumes, jenisPohons = [], kelompoks = [], filters = {} }) {
    const safeFilters = Array.isArray(filters) ? {} : filters;
    const [perPage, setPerPage] = useState(safeFilters.per_page || '15');
    const [jenisPohonFilter, setJenisPohonFilter] = useState(safeFilters.jenis_pohon_id || '');
    const [kelompokFilter, setKelompokFilter] = useState(safeFilters.kelompok_id || '');
    
    const jenisPohonOptions = [
        { value: '', label: 'Semua Jenis' },
        ...jenisPohons.map(j => ({ value: j.id, label: j.kelompok ? `${j.nama_jenis} (${j.kelompok.nama_kelompok})` : j.nama_jenis }))
    ];

    const kelompokOptions = [
        { value: '', label: 'Semua Kelompok' },
        ...kelompoks.map(k => ({ value: k.id, label: k.nama_kelompok }))
    ];

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        jenis_pohon_id: '',
    });

    const applyFilters = (overrides = {}) => {
        const payload = { 
            per_page: perPage,
            jenis_pohon_id: jenisPohonFilter,
            kelompok_id: kelompokFilter,
            ...overrides 
        };
        router.get(route('admin.tabel_volumes.index'), payload, { preserveState: true, preserveScroll: true });
    };

    const handleFilterChange = (field, value) => {
        if (field === 'per_page') setPerPage(value);
        if (field === 'jenis_pohon_id') setJenisPohonFilter(value);
        if (field === 'kelompok_id') setKelompokFilter(value);
        
        applyFilters({ [field]: value });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        post(route('admin.tabel_volumes.import'), {
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
            router.delete(route('admin.tabel_volumes.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Master Tabel Volume" />
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Master Tabel Volume</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola data tabel volume / matriks per jenis pohon.</p>
                </div>
                <div className="flex gap-3">
                    <a href={route('admin.tabel_volumes.template')} className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors min-h-[48px] font-bold shadow-sm border border-outline-variant">
                        <Download className="w-[18px] h-[18px]" />
                        Unduh Template
                    </a>
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <Upload className="w-[18px] h-[18px]" />
                        Import Excel/CSV
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-end relative z-20">
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Kelompok</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <Select
                            value={kelompokOptions.find(o => o.value == kelompokFilter) || kelompokOptions[0]}
                            onChange={(option) => handleFilterChange('kelompok_id', option ? option.value : '')}
                            options={kelompokOptions}
                            styles={customSelectStyles}
                            placeholder="Semua Kelompok"
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
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-sm font-body-md text-on-surface-variant">entri</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant w-16">No</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Jenis Pohon</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Diameter Rata - Rata (cm)</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Panjang (m)</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Volume (m³)</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {tabelVolumes.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <FileText className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tabelVolumes.data.map((item, index) => (
                                    <tr key={item.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{tabelVolumes.from + index}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">
                                            {item.jenis_pohon?.nama_jenis ? `${item.jenis_pohon.nama_jenis} ${item.jenis_pohon.kelompok?.nama_kelompok ? `(${item.jenis_pohon.kelompok.nama_kelompok})` : ''}` : '-'}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-sm text-primary">{item.diameter}</td>
                                        <td className="py-4 px-4 font-bold text-sm text-primary">{item.panjang}</td>
                                        <td className="py-4 px-4 text-sm font-mono text-on-surface-variant">{item.volume}</td>
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
                {tabelVolumes.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {tabelVolumes.from || 0}-{tabelVolumes.to || 0} dari {tabelVolumes.total} data
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {tabelVolumes.links.map((link, k) => (
                                <Link
                                    key={k}
                                    href={link.url || '#'}
                                    className={`p-2 border border-outline-variant rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center ${link.active ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container-low text-on-surface'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        Import Tabel Volume
                    </h2>
                    <form onSubmit={handleImportSubmit}>
                        <div className="space-y-4">
                            <p className="text-sm text-on-surface-variant bg-surface-container p-3 rounded-lg border border-outline-variant/50">
                                Format tabel berupa matriks. Baris pertama untuk kolom <strong>Panjang</strong>, kolom pertama untuk <strong>Diameter</strong>, dan sel di antaranya adalah <strong>Volume</strong>.
                            </p>
                            
                            <div>
                                <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Pilih Jenis Pohon</label>
                                <Select
                                    value={jenisPohonOptions.find(o => o.value == data.jenis_pohon_id) || null}
                                    onChange={(option) => setData('jenis_pohon_id', option ? option.value : '')}
                                    options={jenisPohonOptions.filter(o => o.value !== '')}
                                    styles={customSelectStyles}
                                    placeholder="Pilih Jenis Pohon"
                                    isSearchable
                                    menuPosition="fixed"
                                    menuPortalTarget={document.body}
                                />
                                <InputError message={errors.jenis_pohon_id} className="mt-2" />
                            </div>

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
                            <PrimaryButton disabled={processing || !data.jenis_pohon_id}>
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
                        Apakah Anda yakin ingin menghapus data Tabel Volume (D: {itemToDelete?.diameter}, P: {itemToDelete?.panjang})? Tindakan ini tidak dapat dibatalkan.
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
