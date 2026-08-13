import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Select from 'react-select';
import { Search, Plus, Edit, Trash2, Users as UsersIcon, X, Check, FileText } from 'lucide-react';

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
        zIndex: 50
    }),
    indicatorSeparator: () => ({ display: 'none' })
};

import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ jenisPohons, kelompoks, filters = {}, auth }) {
    const safeFilters = Array.isArray(filters) ? {} : filters;
    const [search, setSearch] = useState(safeFilters.search || '');
    const [perPage, setPerPage] = useState(safeFilters.per_page || '10');
    const [kelompokFilter, setKelompokFilter] = useState(safeFilters.kelompok_id || '');
    const [sortField, setSortField] = useState(safeFilters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(safeFilters.direction || 'desc');
    
    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [jenisPohonToEdit, setJenisPohonToEdit] = useState(null);
    const [jenisPohonToDelete, setJenisPohonToDelete] = useState(null);

    // Form
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kelompok_id: '',
        nama_jenis: ''
    });

    const kelompokOptions = [
        { value: '', label: 'Semua Kelompok' },
        ...kelompoks.map(k => ({ value: k.id, label: k.nama_kelompok }))
    ];

    const applyFilters = (overrides = {}) => {
        const payload = { 
            search, 
            per_page: perPage, 
            kelompok_id: kelompokFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides 
        };
        router.get(route('admin.pohons.index'), payload, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleFilterChange = (field, value) => {
        if (field === 'kelompok_id') setKelompokFilter(value);
        if (field === 'per_page') setPerPage(value);
        
        applyFilters({ [field]: value });
    };

    const handleSort = (field) => {
        let newDir = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            newDir = 'desc';
        }
        setSortField(field);
        setSortDirection(newDir);
        applyFilters({ sort: field, direction: newDir });
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return <span className="opacity-30 ml-1">⇅</span>;
        }
        return sortDirection === 'asc' 
            ? <span className="ml-1 text-primary">↑</span> 
            : <span className="ml-1 text-primary">↓</span>;
    };

    // Modal Handlers
    const openCreateModal = () => {
        reset();
        clearErrors();
        if (auth.user.roles.some(r => r.name === 'admin_kelompok')) {
            setData('kelompok_id', auth.user.kelompok_id);
        }
        setIsCreateModalOpen(true);
    };

    const openEditModal = (jenisPohon) => {
        reset();
        clearErrors();
        setJenisPohonToEdit(jenisPohon);
        setData({
            kelompok_id: jenisPohon.kelompok_id,
            nama_jenis: jenisPohon.nama_jenis
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (jenisPohon) => {
        setJenisPohonToDelete(jenisPohon);
        setIsDeleteModalOpen(true);
    };

    // Submit Handlers
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('admin.pohons.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('admin.pohons.update', jenisPohonToEdit.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        destroy(route('admin.pohons.destroy', jenisPohonToDelete.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setJenisPohonToDelete(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="SIPETAK Admin - Master Jenis Pohon" />
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Master Jenis Pohon</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola daftar jenis spesies pohon yang tersedia.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={openCreateModal} className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <Plus className="w-[18px] h-[18px]" />
                        Tambah Jenis Pohon
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-end relative z-20">
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Kelompok</label>
                    <div className="relative">
                        <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
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
                        placeholder="Cari Nama Jenis..."
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
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer hover:bg-surface-container select-none" onClick={() => handleSort('nama_jenis')}>
                                    <div className="flex items-center">Nama Jenis Pohon <SortIcon field="nama_jenis" /></div>
                                </th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelompok</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {jenisPohons.data.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <FileText className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jenisPohons.data.map((jenisPohon) => (
                                    <tr key={jenisPohon.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4 font-bold text-sm text-primary">{jenisPohon.nama_jenis}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">
                                            {jenisPohon.kelompok?.nama_kelompok || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(jenisPohon)} className="p-2 text-[#FB8500] hover:bg-surface-container-low rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(jenisPohon)} 
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
                {jenisPohons.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {jenisPohons.from || 0}-{jenisPohons.to || 0} dari {jenisPohons.total} data
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {jenisPohons.links.map((link, k) => (
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

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Tambah Jenis Pohon
                    </h2>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4">
                            {!auth.user.roles.some(r => r.name === 'admin_kelompok') && (
                                <div>
                                    <InputLabel htmlFor="kelompok_id" value="Kelompok" />
                                    <select
                                        id="kelompok_id"
                                        name="kelompok_id"
                                        value={data.kelompok_id}
                                        className="mt-1 block w-full border border-outline-variant focus:border-primary focus:ring-primary rounded-lg shadow-sm min-h-[48px]"
                                        onChange={(e) => setData('kelompok_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Kelompok</option>
                                        {kelompoks.map(k => (
                                            <option key={k.id} value={k.id}>{k.nama_kelompok}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.kelompok_id} className="mt-2" />
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="nama_jenis" value="Nama Jenis Pohon" />
                                <TextInput
                                    id="nama_jenis"
                                    type="text"
                                    name="nama_jenis"
                                    value={data.nama_jenis}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('nama_jenis', e.target.value)}
                                    placeholder="Contoh: Jati, Sengon, Mahoni"
                                    required
                                />
                                <InputError message={errors.nama_jenis} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={() => setIsCreateModalOpen(false)}>Batal</SecondaryButton>
                            <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        Edit Jenis Pohon
                    </h2>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4">
                            {!auth.user.roles.some(r => r.name === 'admin_kelompok') && (
                                <div>
                                    <InputLabel htmlFor="edit_kelompok_id" value="Kelompok" />
                                    <select
                                        id="edit_kelompok_id"
                                        name="kelompok_id"
                                        value={data.kelompok_id}
                                        className="mt-1 block w-full border border-outline-variant focus:border-primary focus:ring-primary rounded-lg shadow-sm min-h-[48px]"
                                        onChange={(e) => setData('kelompok_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Kelompok</option>
                                        {kelompoks.map(k => (
                                            <option key={k.id} value={k.id}>{k.nama_kelompok}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.kelompok_id} className="mt-2" />
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="edit_nama_jenis" value="Nama Jenis Pohon" />
                                <TextInput
                                    id="edit_nama_jenis"
                                    type="text"
                                    name="nama_jenis"
                                    value={data.nama_jenis}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('nama_jenis', e.target.value)}
                                    placeholder="Contoh: Jati, Sengon, Mahoni"
                                    required
                                />
                                <InputError message={errors.nama_jenis} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={() => setIsEditModalOpen(false)}>Batal</SecondaryButton>
                            <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
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
                        Apakah Anda yakin ingin menghapus jenis pohon <strong>{jenisPohonToDelete?.nama_jenis}</strong>? Tindakan ini tidak dapat dibatalkan.
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
