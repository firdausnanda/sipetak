import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Select from 'react-select';
import { Table as TableIcon, Users, Map, Search, ChevronsUpDown, ArrowUp, ArrowDown, PackageOpen, QrCode, TreePine, User, Calendar, SlidersHorizontal, X, Loader2, Edit2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Dashboard({ batangs, kelompoks, petaks, filters }) {
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBatang, setEditingBatang] = useState(null);

    const { data: editData, setData: setEditData, put: updateBatang, processing: isUpdating, errors: editErrors, reset: resetEdit, clearErrors: clearEditErrors } = useForm({
        no_batang: '',
        panjang: '',
        diameter_ujung: '',
        diameter_pangkal: '',
        volume: '',
        mutu: '',
    });

    const openEditModal = (batang) => {
        setEditingBatang(batang);
        setEditData({
            no_batang: batang.no_batang,
            panjang: batang.panjang,
            diameter_ujung: batang.diameter_ujung,
            diameter_pangkal: batang.diameter_pangkal,
            volume: batang.volume,
            mutu: batang.mutu,
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setTimeout(() => {
            resetEdit();
            clearEditErrors();
        }, 300);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateBatang(route('admin.dashboard.batang.update', editingBatang.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const [filterData, setFilterData] = useState({
        kelompok_id: filters.kelompok_id || '',
        petak_id: filters.petak_id || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        sort: filters.sort || 'tanggal',
        direction: filters.direction || 'desc',
        search: filters.search || '',
        per_page: filters.per_page || '10',
        no_barcode: filters.no_barcode || '',
        no_pohon: filters.no_pohon || '',
        no_batang: filters.no_batang || '',
        mutu: filters.mutu || ''
    });

    const handleExport = async (e) => {
        e.preventDefault();
        setIsExporting(true);
        
        try {
            const response = await axios.get(route('admin.dashboard.export', filterData), {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'laporan_hasil_tebangan.xlsx';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1];
                }
            }
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert('Gagal mengunduh file ekspor.');
        } finally {
            setIsExporting(false);
        }
    };

    const kelompokOptions = [
        { value: '', label: 'Semua Kelompok' },
        ...kelompoks.map(k => ({ value: k.id, label: k.nama_kelompok }))
    ];

    const petakOptions = [
        { value: '', label: 'Semua Petak' },
        ...petaks
            .filter(p => !filterData.kelompok_id || p.kelompok_id == filterData.kelompok_id)
            .map(p => ({ value: p.id, label: p.no_petak }))
    ];

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

    const handleFilterChange = (e) => {
        const newFilters = { ...filterData, [e.target.name]: e.target.value };
        
        // Reset petak if kelompok is changed
        if (e.target.name === 'kelompok_id') {
            newFilters.petak_id = '';
        }

        setFilterData(newFilters);
        
        // Auto-apply for everything except search typing (search has its own enter key)
        if (e.target.name !== 'search') {
            router.get(route('admin.dashboard'), newFilters, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const applyFilters = () => {
        router.get(route('admin.dashboard'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDateChange = (date, name) => {
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
        handleFilterChange({ target: { name, value: formattedDate } });
    };

    const handleSort = (column) => {
        let newDirection = 'asc';
        if (filterData.sort === column && filterData.direction === 'asc') {
            newDirection = 'desc';
        }
        
        const newFilters = { ...filterData, sort: column, direction: newDirection };
        setFilterData(newFilters);
        
        router.get(route('admin.dashboard'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const SortIcon = ({ column }) => {
        if (filterData.sort !== column) {
            return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30 ml-1 inline-block" />;
        }
        return filterData.direction === 'asc' 
            ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary inline-block" /> 
            : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary inline-block" />;
    };

    const renderMutuBadge = (mutu) => {
        switch (mutu) {
            case 'P':
                return <span className="inline-block px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded text-xs font-bold">P</span>;
            case 'D':
                return <span className="inline-block px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded text-xs font-bold">D</span>;
            case 'T':
                return <span className="inline-block px-2 py-1 bg-error-container text-on-error-container rounded text-xs font-bold">T</span>;
            case 'M':
                return <span className="inline-block px-2 py-1 bg-surface-container-high text-on-surface rounded text-xs font-bold">M</span>;
            default:
                return <span className="inline-block px-2 py-1 bg-surface-container-low text-on-surface rounded text-xs font-bold">{mutu}</span>;
        }
    };

    return (
        <AdminLayout>
            <Head title="SIPETAK Admin - Laporan Hasil Tebangan" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Laporan Hasil Tebangan</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola dan tinjau data operasional penebangan harian.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        ) : (
                            <TableIcon className="w-[18px] h-[18px]" />
                        )}
                        {isExporting ? 'Mengekspor...' : 'Excel'}
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-end relative z-20">
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Nama Kelompok</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <Select
                            name="kelompok_id"
                            value={kelompokOptions.find(o => o.value == filterData.kelompok_id) || kelompokOptions[0]}
                            onChange={(option) => handleFilterChange({ target: { name: 'kelompok_id', value: option ? option.value : '' } })}
                            options={kelompokOptions}
                            styles={customSelectStyles}
                            placeholder="Semua Kelompok"
                            isSearchable
                        />
                    </div>
                </div>
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Dari Tanggal</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <DatePicker 
                            selected={filterData.start_date ? parseISO(filterData.start_date) : null}
                            onChange={(date) => handleDateChange(date, 'start_date')}
                            dateFormat="yyyy-MM-dd"
                            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-[#FB8500] focus:ring-1 focus:ring-[#FB8500] min-h-[48px] bg-surface-container-lowest" 
                            placeholderText="Pilih tanggal mulai"
                            isClearable
                            selectsStart
                            startDate={filterData.start_date ? parseISO(filterData.start_date) : null}
                            endDate={filterData.end_date ? parseISO(filterData.end_date) : null}
                        />
                    </div>
                </div>
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Sampai Tanggal</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <DatePicker 
                            selected={filterData.end_date ? parseISO(filterData.end_date) : null}
                            onChange={(date) => handleDateChange(date, 'end_date')}
                            dateFormat="yyyy-MM-dd"
                            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-[#FB8500] focus:ring-1 focus:ring-[#FB8500] min-h-[48px] bg-surface-container-lowest" 
                            placeholderText="Pilih tanggal akhir"
                            isClearable
                            selectsEnd
                            startDate={filterData.start_date ? parseISO(filterData.start_date) : null}
                            endDate={filterData.end_date ? parseISO(filterData.end_date) : null}
                            minDate={filterData.start_date ? parseISO(filterData.start_date) : null}
                        />
                    </div>
                </div>
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">No. Petak</label>
                    <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none w-[18px] h-[18px]" />
                        <Select
                            name="petak_id"
                            value={petakOptions.find(o => o.value == filterData.petak_id) || petakOptions[0]}
                            onChange={(option) => handleFilterChange({ target: { name: 'petak_id', value: option ? option.value : '' } })}
                            options={petakOptions}
                            styles={customSelectStyles}
                            placeholder="Semua Petak"
                            isSearchable
                        />
                    </div>
                </div>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-body-md text-on-surface-variant">Tampilkan</span>
                    <select 
                        name="per_page"
                        value={filterData.per_page}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilterData(prev => ({ ...prev, per_page: val }));
                            router.get(route('admin.dashboard'), { ...filterData, per_page: val }, { preserveState: true, preserveScroll: true });
                        }}
                        className="border border-outline-variant rounded-lg py-1.5 focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-sm font-body-md text-on-surface-variant">entri</span>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-72 flex items-center">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[18px] h-[18px]" />
                        <input 
                            type="text" 
                            name="search"
                            value={filterData.search}
                            onChange={handleFilterChange}
                            onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                            placeholder="Cari jenis pohon, no petak, kelompok..."
                            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm bg-surface-container-lowest min-h-[40px]"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                        className={`p-2 rounded-lg border transition-colors min-h-[40px] flex items-center justify-center ${showAdvancedSearch ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                        title="Filter Lanjutan"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Advanced Search Panel */}
            {showAdvancedSearch && (
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-4 relative z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm text-on-surface">Filter Lanjutan</h3>
                        <button onClick={() => setShowAdvancedSearch(false)} className="text-on-surface-variant hover:text-on-surface">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant mb-1">No. Barcode</label>
                            <input 
                                type="text" 
                                name="no_barcode"
                                value={filterData.no_barcode}
                                onChange={handleFilterChange}
                                onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                                placeholder="Cari barcode..."
                                className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant mb-1">No. Pohon</label>
                            <input 
                                type="text" 
                                name="no_pohon"
                                value={filterData.no_pohon}
                                onChange={handleFilterChange}
                                onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                                placeholder="Cari no. pohon..."
                                className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant mb-1">No. Batang</label>
                            <input 
                                type="text" 
                                name="no_batang"
                                value={filterData.no_batang}
                                onChange={handleFilterChange}
                                onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                                placeholder="Cari no. batang..."
                                className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant mb-1">Mutu</label>
                            <select
                                name="mutu"
                                value={filterData.mutu}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            >
                                <option value="">Semua Mutu</option>
                                <option value="P">P</option>
                                <option value="D">D</option>
                                <option value="T">T</option>
                                <option value="M">M</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button 
                            onClick={() => {
                                const resetFilters = { ...filterData, no_barcode: '', no_pohon: '', no_batang: '', mutu: '' };
                                setFilterData(resetFilters);
                                router.get(route('admin.dashboard'), resetFilters, { preserveState: true, preserveScroll: true });
                            }}
                            className="px-4 py-2 text-sm font-bold text-on-surface-variant bg-surface hover:bg-surface-container-high rounded-lg transition-colors border border-outline-variant"
                        >
                            Reset
                        </button>
                        <button 
                            onClick={applyFilters}
                            className="px-4 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-opacity-90 rounded-lg transition-colors"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            )}

            {/* Data Table Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelompok, Pohon & Barcode</th>
                                <th 
                                    className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors select-none"
                                    onClick={() => handleSort('tanggal')}
                                >
                                    <div className="flex items-center">Tanggal <SortIcon column="tanggal" /></div>
                                </th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Petak & Jenis Pohon</th>
                                <th 
                                    className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right cursor-pointer hover:bg-surface-container transition-colors select-none"
                                    onClick={() => handleSort('no_batang')}
                                >
                                    <div className="flex items-center justify-end">No. Batang <SortIcon column="no_batang" /></div>
                                </th>
                                <th 
                                    className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right cursor-pointer hover:bg-surface-container transition-colors select-none"
                                    onClick={() => handleSort('panjang')}
                                >
                                    <div className="flex items-center justify-end">Panjang (m) <SortIcon column="panjang" /></div>
                                </th>
                                <th 
                                    className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right"
                                >
                                    <div className="flex items-center justify-end">D. Ujung / Pangkal</div>
                                </th>
                                <th 
                                    className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right cursor-pointer hover:bg-surface-container transition-colors select-none"
                                    onClick={() => handleSort('volume')}
                                >
                                    <div className="flex items-center justify-end">Volume (m³) <SortIcon column="volume" /></div>
                                </th>
                                <th 
                                    className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center cursor-pointer hover:bg-surface-container transition-colors select-none"
                                    onClick={() => handleSort('mutu')}
                                >
                                    <div className="flex items-center justify-center">Mutu <SortIcon column="mutu" /></div>
                                </th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Input Oleh</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {batangs.data.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <PackageOpen className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Tidak ada data ditemukan</p>
                                            <p className="text-sm opacity-80">Silakan sesuaikan filter Anda untuk menemukan data yang dicari.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                batangs.data.map((batang, idx) => (
                                    <tr key={batang.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="font-bold text-sm text-primary">{batang.pohon?.kelompok?.nama_kelompok || '-'}</div>
                                            <div className="text-xs text-on-surface-variant mt-1 mb-1">
                                                No. Pohon: <span className="font-bold text-on-surface">{batang.pohon?.no_pohon || '-'}</span>
                                            </div>
                                            <div className="text-xs text-on-surface-variant font-data-mono flex items-center gap-1">
                                                {batang.pohon?.tipe === 'barcode' ? (
                                                    <>
                                                        <QrCode className="w-[14px] h-[14px]" />
                                                        <span>{batang.pohon?.no_barcode}</span>
                                                    </>
                                                ) : (
                                                    <span className="italic">- Manual -</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm whitespace-nowrap text-on-surface-variant">
                                            {batang.pohon?.tanggal ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(batang.pohon.tanggal)) : '-'}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="font-bold text-sm text-on-surface">{batang.pohon?.petak?.no_petak || '-'}</div>
                                            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                                                <TreePine className="w-[14px] h-[14px]" />
                                                {batang.pohon?.jenis_pohon?.nama_jenis || '-'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="text-sm">{batang.no_batang}</div>
                                            {batang.pohon?.skshhk ? (
                                                <div className="mt-1">
                                                    <span className="inline-block px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded text-[10px] font-bold" title={`SKSHHK: ${batang.pohon.skshhk.no_skshhk}`}>SKSHHK</span>
                                                </div>
                                            ) : batang.pohon?.dokumen_angkutan ? (
                                                <div className="mt-1">
                                                    <span className="inline-block px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded text-[10px] font-bold" title={`Dokumen: ${batang.pohon.dokumen_angkutan.no_dokumen}`}>DOKUMEN</span>
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="py-4 px-4 text-right font-data-mono text-data-mono text-sm whitespace-nowrap">{batang.panjang}</td>
                                        <td className="py-4 px-4 text-right font-data-mono text-data-mono text-sm whitespace-nowrap">{batang.diameter_ujung} / {batang.diameter_pangkal}</td>
                                        <td className="py-4 px-4 text-right font-data-mono text-data-mono text-sm whitespace-nowrap">{batang.volume || '-'}</td>
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            {renderMutuBadge(batang.mutu)}
                                        </td>
                                        <td className="py-4 px-4 text-sm whitespace-nowrap text-on-surface-variant">
                                            <div className="flex items-center gap-2">
                                                <User className="text-outline w-[14px] h-[14px]" />
                                                {batang.creator?.name || 'Sistem'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <button 
                                                onClick={() => openEditModal(batang)}
                                                className="text-primary hover:text-primary/80 transition-colors p-1"
                                                title="Edit Batang"
                                            >
                                                <Edit2 className="w-[16px] h-[16px]" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Footer */}
                {batangs.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {batangs.from || 0}-{batangs.to || 0} dari {batangs.total} data
                        </span>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {batangs.links.map((link, k) => (
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
            
            <div className="h-24 md:h-8"></div> {/* Bottom padding for scrolling */}
            
            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="2xl">
                <form onSubmit={handleEditSubmit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Edit Data Batang {editingBatang ? `#${editingBatang.no_batang}` : ''}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="no_batang" value="No. Batang" />
                            <TextInput
                                id="no_batang"
                                type="text"
                                className="mt-1 block w-full"
                                value={editData.no_batang}
                                onChange={(e) => setEditData('no_batang', e.target.value)}
                                required
                            />
                            <InputError message={editErrors.no_batang} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="panjang" value="Panjang (m)" />
                            <TextInput
                                id="panjang"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={editData.panjang}
                                onChange={(e) => setEditData('panjang', e.target.value)}
                                required
                            />
                            <InputError message={editErrors.panjang} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="diameter_ujung" value="Diameter Ujung (cm)" />
                            <TextInput
                                id="diameter_ujung"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={editData.diameter_ujung}
                                onChange={(e) => setEditData('diameter_ujung', e.target.value)}
                                required
                            />
                            <InputError message={editErrors.diameter_ujung} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="diameter_pangkal" value="Diameter Pangkal (cm)" />
                            <TextInput
                                id="diameter_pangkal"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={editData.diameter_pangkal}
                                onChange={(e) => setEditData('diameter_pangkal', e.target.value)}
                                required
                            />
                            <InputError message={editErrors.diameter_pangkal} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="volume" value="Volume (m³)" />
                            <TextInput
                                id="volume"
                                type="number"
                                step="0.0001"
                                className="mt-1 block w-full"
                                value={editData.volume}
                                onChange={(e) => setEditData('volume', e.target.value)}
                                required
                            />
                            <InputError message={editErrors.volume} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="mutu" value="Mutu" />
                            <select
                                id="mutu"
                                value={editData.mutu}
                                onChange={(e) => setEditData('mutu', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="">Pilih Mutu</option>
                                <option value="P">P</option>
                                <option value="D">D</option>
                                <option value="T">T</option>
                                <option value="M">M</option>
                            </select>
                            <InputError message={editErrors.mutu} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={closeEditModal} disabled={isUpdating}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={isUpdating}>
                            {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
