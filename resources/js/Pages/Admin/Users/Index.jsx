import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Select from 'react-select';
import { Search, Plus, Edit, Trash2, Shield, Users as UsersIcon, X, Check, Eye, EyeOff, Loader2, FileSpreadsheet } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('id', id);

const parseFilterDate = (value) => value ? new Date(`${value}T00:00:00`) : null;
const formatFilterDate = (date) => date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : '';
const exportColumnOptions = [
    { value: 'name', label: 'Nama Pengguna' },
    { value: 'username', label: 'Username' },
    { value: 'email', label: 'Email' },
    { value: 'role', label: 'Peran' },
    { value: 'kelompok', label: 'Kelompok' },
    { value: 'status_verifikasi', label: 'Status Verifikasi' },
    { value: 'created_by', label: 'Dibuat Oleh' },
    { value: 'created_at', label: 'Tanggal Dibuat' },
    { value: 'updated_at', label: 'Terakhir Diperbarui' },
];
const defaultExportColumns = ['name', 'username', 'email', 'role', 'kelompok', 'status_verifikasi', 'created_at'];
const emptyExportFilters = {
    search: '', roles: [], kelompok_id: '', status_verifikasi: '',
    tanggal_mulai: '', tanggal_akhir: '', sort: 'name', direction: 'asc',
    columns: defaultExportColumns,
};
const formatRoleName = (name) => name.replace('_', ' ').toUpperCase();

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

export default function Index({ users, roles, kelompoks, filters = {}, auth }) {
    const safeFilters = Array.isArray(filters) ? {} : filters;
    const [search, setSearch] = useState(safeFilters.search || '');
    const [perPage, setPerPage] = useState(safeFilters.per_page || '10');
    const [roleFilter, setRoleFilter] = useState(safeFilters.role || '');
    const [kelompokFilter, setKelompokFilter] = useState(safeFilters.kelompok_id || '');
    const [sortField, setSortField] = useState(safeFilters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(safeFilters.direction || 'desc');
    
    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFilters, setExportFilters] = useState(emptyExportFilters);
    const [exportError, setExportError] = useState('');
    const isAdminCdk = (auth.user.roles || []).includes('admin_cdk');

    // Form
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
        kelompok_id: ''
    });

    const roleOptions = [
        { value: '', label: 'SEMUA PERAN' },
        ...roles.map(r => ({ value: r.name, label: r.name.replace('_', ' ').toUpperCase() }))
    ];

    const kelompokOptions = [
        { value: '', label: 'Semua Kelompok' },
        ...kelompoks.map(k => ({ value: k.id, label: k.nama_kelompok }))
    ];

    const applyFilters = (overrides = {}) => {
        const payload = { 
            search, 
            per_page: perPage, 
            role: roleFilter, 
            kelompok_id: kelompokFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides 
        };
        router.get(route('admin.users.index'), payload, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleFilterChange = (field, value) => {
        if (field === 'role') setRoleFilter(value);
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

    const openExportModal = () => {
        setExportFilters({
            ...emptyExportFilters,
            search,
            roles: roleFilter ? [roleFilter] : [],
            kelompok_id: isAdminCdk ? kelompokFilter : '',
            sort: sortField,
            direction: sortDirection,
        });
        setExportError('');
        setIsExportModalOpen(true);
    };

    const updateExportFilter = (key, value) => {
        setExportFilters((current) => ({ ...current, [key]: value }));
        setExportError('');
    };

    const toggleExportListValue = (key, value) => {
        setExportFilters((current) => ({
            ...current,
            [key]: current[key].includes(value)
                ? current[key].filter((item) => item !== value)
                : [...current[key], value],
        }));
        setExportError('');
    };

    const handleExportSubmit = (event) => {
        event.preventDefault();
        if (exportFilters.tanggal_mulai && exportFilters.tanggal_akhir && exportFilters.tanggal_akhir < exportFilters.tanggal_mulai) {
            setExportError('Tanggal akhir tidak boleh sebelum tanggal mulai.');
            return;
        }
        if (exportFilters.columns.length === 0) {
            setExportError('Pilih minimal satu kolom untuk diekspor.');
            return;
        }

        setIsExporting(true);
        const params = new URLSearchParams();
        Object.entries(exportFilters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => params.append(`${key}[]`, item));
            } else if (value !== '' && value !== null && value !== undefined) {
                params.set(key, value);
            }
        });
        const query = params.toString();
        window.location.href = route('admin.users.export') + (query ? `?${query}` : '');
        setIsExportModalOpen(false);
        setTimeout(() => setIsExporting(false), 5000);
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user) => {
        reset();
        clearErrors();
        setUserToEdit(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0]?.name || '',
            kelompok_id: user.kelompok_id || ''
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', userToEdit.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        destroy(route('admin.users.destroy', userToDelete.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="SIPETAK Admin - Manajemen Pengguna" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Manajemen Pengguna</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola akun, peran, dan akses pengguna sistem.</p>
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
                            : <><FileSpreadsheet className="w-[18px] h-[18px]" /> Export Excel</>
                        }
                    </button>
                    <button onClick={openCreateModal} className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <Plus className="w-[18px] h-[18px]" />
                        Tambah Pengguna
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-end relative z-20">
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Peran (Role)</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <Select
                            value={roleOptions.find(o => o.value === roleFilter) || roleOptions[0]}
                            onChange={(option) => handleFilterChange('role', option ? option.value : '')}
                            options={roleOptions}
                            styles={customSelectStyles}
                            placeholder="Semua Peran"
                            isSearchable
                        />
                    </div>
                </div>
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
                <div className="flex items-center gap-2">
                    <span className="text-sm font-body-md text-on-surface-variant">Tampilkan</span>
                    <select 
                        value={perPage}
                        onChange={(e) => handleFilterChange('per_page', e.target.value)}
                        className="border border-outline-variant rounded-lg py-1.5 focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
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
                        placeholder="Cari nama atau email..."
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
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer hover:bg-surface-container select-none" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">Nama Pengguna <SortIcon field="name" /></div>
                                </th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer hover:bg-surface-container select-none" onClick={() => handleSort('email')}>
                                    <div className="flex items-center">Email <SortIcon field="email" /></div>
                                </th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Peran</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelompok</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <UsersIcon className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4 font-bold text-sm text-primary uppercase">{user.name}</td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">{user.email}</td>
                                        <td className="py-4 px-4 text-sm whitespace-nowrap">
                                            {user.roles.map(role => (
                                                <span key={role.id} className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container text-primary rounded text-xs font-bold uppercase">
                                                    <Shield className="w-3 h-3" />
                                                    {role.name.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant">
                                            {user.kelompok ? user.kelompok.nama_kelompok : '-'}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(user)} className="p-2 text-[#FB8500] hover:bg-surface-container-low rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.id !== auth.user.id && (
                                                    <button 
                                                        onClick={() => openDeleteModal(user)} 
                                                        className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {users.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {users.from || 0}-{users.to || 0} dari {users.total} data
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {users.links.map((link, k) => (
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
                        <UsersIcon className="w-5 h-5" />
                        Tambah Pengguna Baru
                    </h2>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Lengkap" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full pr-10"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none mt-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="Peran (Role)" />
                                <select
                                    id="role"
                                    name="role"
                                    value={data.role}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    <option value="">Pilih Peran</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name.replace('_', ' ')}</option>
                                    ))}
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kelompok_id" value="Kelompok (Opsional)" />
                                <select
                                    id="kelompok_id"
                                    name="kelompok_id"
                                    value={data.kelompok_id}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    onChange={(e) => setData('kelompok_id', e.target.value)}
                                >
                                    <option value="">Pilih Kelompok (Bisa dikosongkan)</option>
                                    {kelompoks.map(k => (
                                        <option key={k.id} value={k.id}>{k.nama_kelompok}</option>
                                    ))}
                                </select>
                                <InputError message={errors.kelompok_id} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Batal</SecondaryButton>
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
                        Edit Pengguna
                    </h2>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="edit_name" value="Nama Lengkap" />
                                <TextInput
                                    id="edit_name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_email" value="Email" />
                                <TextInput
                                    id="edit_email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_password" value="Password Baru (Kosongkan jika tidak diubah)" />
                                <div className="relative">
                                    <TextInput
                                        id="edit_password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full pr-10"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none mt-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_role" value="Peran (Role)" />
                                <select
                                    id="edit_role"
                                    name="role"
                                    value={data.role}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    <option value="">Pilih Peran</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name.replace('_', ' ')}</option>
                                    ))}
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_kelompok_id" value="Kelompok (Opsional)" />
                                <select
                                    id="edit_kelompok_id"
                                    name="kelompok_id"
                                    value={data.kelompok_id}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    onChange={(e) => setData('kelompok_id', e.target.value)}
                                >
                                    <option value="">Pilih Kelompok (Bisa dikosongkan)</option>
                                    {kelompoks.map(k => (
                                        <option key={k.id} value={k.id}>{k.nama_kelompok}</option>
                                    ))}
                                </select>
                                <InputError message={errors.kelompok_id} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Batal</SecondaryButton>
                            <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Export Modal */}
            <Modal show={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleExportSubmit} className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-on-surface">Filter Export Excel</h2>
                            <p className="mt-1 text-sm text-on-surface-variant">Pilih data pengguna yang akan diekspor. Rentang tanggal berdasarkan tanggal akun dibuat.</p>
                        </div>
                        <button type="button" onClick={() => setIsExportModalOpen(false)} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup filter ekspor"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="export-search" className="mb-1 block text-sm font-semibold text-on-surface">Cari Nama / Email / Username</label>
                            <input id="export-search" type="text" value={exportFilters.search} onChange={(event) => updateExportFilter('search', event.target.value)} placeholder="Semua pengguna" className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                            <span className="mb-1 block text-sm font-semibold text-on-surface">Peran (Role)</span>
                            <p className="mb-2 text-xs text-on-surface-variant">Kosongkan untuk semua peran.</p>
                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => {
                                    const checked = exportFilters.roles.includes(role.name);
                                    return (
                                        <label key={role.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase transition-colors ${checked ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary'}`}>
                                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleExportListValue('roles', role.name)} />
                                            {checked ? <Check className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                            {formatRoleName(role.name)}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        {isAdminCdk && <div>
                            <label htmlFor="export-kelompok" className="mb-1 block text-sm font-semibold text-on-surface">Kelompok</label>
                            <select id="export-kelompok" value={exportFilters.kelompok_id} onChange={(event) => updateExportFilter('kelompok_id', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option value="">Semua kelompok</option>
                                <option value="none">Tanpa kelompok</option>
                                {kelompoks.map((kelompok) => <option key={kelompok.id} value={kelompok.id}>{kelompok.nama_kelompok}</option>)}
                            </select>
                        </div>}
                        <div>
                            <label htmlFor="export-status-verifikasi" className="mb-1 block text-sm font-semibold text-on-surface">Status Verifikasi Email</label>
                            <select id="export-status-verifikasi" value={exportFilters.status_verifikasi} onChange={(event) => updateExportFilter('status_verifikasi', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option value="">Semua status</option>
                                <option value="verified">Terverifikasi</option>
                                <option value="unverified">Belum terverifikasi</option>
                            </select>
                        </div>
                        <div className="relative z-20">
                            <label htmlFor="export-tanggal-mulai" className="mb-1 block text-sm font-semibold text-on-surface">Tanggal Dibuat Mulai</label>
                            <DatePicker id="export-tanggal-mulai" isClearable selected={parseFilterDate(exportFilters.tanggal_mulai)} onChange={(date) => updateExportFilter('tanggal_mulai', formatFilterDate(date))} maxDate={parseFilterDate(exportFilters.tanggal_akhir)} dateFormat="dd MMMM yyyy" locale="id" placeholderText="Dari tanggal..." className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" wrapperClassName="w-full" />
                        </div>
                        <div className="relative z-20">
                            <label htmlFor="export-tanggal-akhir" className="mb-1 block text-sm font-semibold text-on-surface">Tanggal Dibuat Akhir</label>
                            <DatePicker id="export-tanggal-akhir" isClearable selected={parseFilterDate(exportFilters.tanggal_akhir)} onChange={(date) => updateExportFilter('tanggal_akhir', formatFilterDate(date))} minDate={parseFilterDate(exportFilters.tanggal_mulai)} dateFormat="dd MMMM yyyy" locale="id" placeholderText="Sampai tanggal..." className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" wrapperClassName="w-full" />
                        </div>
                        <div>
                            <label htmlFor="export-sort" className="mb-1 block text-sm font-semibold text-on-surface">Urutkan Berdasarkan</label>
                            <select id="export-sort" value={exportFilters.sort} onChange={(event) => updateExportFilter('sort', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option value="name">Nama Pengguna</option>
                                <option value="email">Email</option>
                                <option value="created_at">Tanggal Dibuat</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="export-direction" className="mb-1 block text-sm font-semibold text-on-surface">Arah Urutan</label>
                            <select id="export-direction" value={exportFilters.direction} onChange={(event) => updateExportFilter('direction', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option value="asc">Naik (A-Z / terlama)</option>
                                <option value="desc">Turun (Z-A / terbaru)</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <span className="block text-sm font-semibold text-on-surface">Kolom yang Diekspor</span>
                                <button type="button" onClick={() => updateExportFilter('columns', exportFilters.columns.length === exportColumnOptions.length ? [] : exportColumnOptions.map((column) => column.value))} className="text-xs font-semibold text-primary hover:underline">
                                    {exportFilters.columns.length === exportColumnOptions.length ? 'Hapus semua' : 'Pilih semua'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {exportColumnOptions.map((column) => (
                                    <label key={column.value} className="inline-flex cursor-pointer items-center gap-2 text-sm text-on-surface">
                                        <input type="checkbox" checked={exportFilters.columns.includes(column.value)} onChange={() => toggleExportListValue('columns', column.value)} className="rounded border-outline-variant text-primary focus:ring-primary" />
                                        {column.label}
                                    </label>
                                ))}
                            </div>
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

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Konfirmasi Hapus
                    </h2>
                    <p className="mb-6 text-on-surface-variant">
                        Apakah Anda yakin ingin menghapus pengguna <strong>{userToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <DangerButton onClick={handleDeleteSubmit} disabled={processing}>Ya, Hapus</DangerButton>
                    </div>
                </div>
            </Modal>
            
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
