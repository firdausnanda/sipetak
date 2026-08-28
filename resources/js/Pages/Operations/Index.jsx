import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Plus, Search, CheckCircle, Clock, ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { id as localeId } from 'date-fns/locale/id';
import { format } from 'date-fns';

registerLocale('id', localeId);

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '42px',
        borderRadius: '0.375rem',
        borderColor: state.isFocused ? '#FB8500' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 1px #FB8500' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#FB8500' : '#d1d5db'
        },
        backgroundColor: '#ffffff',
    }),
    menu: (base) => ({
        ...base,
        zIndex: 50
    })
};

export default function Index({ auth, operations, filters, reguOptions }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [tanggalMulai, setTanggalMulai] = useState(filters?.tanggal_mulai ? new Date(filters.tanggal_mulai) : null);
    const [tanggalAkhir, setTanggalAkhir] = useState(filters?.tanggal_akhir ? new Date(filters.tanggal_akhir) : null);

    const sortField = filters?.sort_field || 'tanggal';
    const sortDirection = filters?.sort_direction || 'desc';

    const handleSort = (field) => {
        let newDirection = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            newDirection = 'desc';
        }
        
        const formatDateForBackend = (dateObj) => {
            if (!dateObj) return '';
            return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        };

        router.get(route('operations.index'), {
            search: search,
            tanggal_mulai: formatDateForBackend(tanggalMulai),
            tanggal_akhir: formatDateForBackend(tanggalAkhir),
            sort_field: field,
            sort_direction: newDirection
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const applyFilter = (newSearch, newMulai, newAkhir) => {
        // Format dates to YYYY-MM-DD for backend
        const formatDateForBackend = (dateObj) => {
            if (!dateObj) return '';
            return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        };

        router.get(route('operations.index'), {
            search: newSearch,
            tanggal_mulai: formatDateForBackend(newMulai),
            tanggal_akhir: formatDateForBackend(newAkhir),
            sort_field: sortField,
            sort_direction: sortDirection
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const markAsPaid = (date, userId) => {
        Swal.fire({
            title: 'Konfirmasi Pembayaran',
            text: "Tandai tagihan regu ini sebagai sudah dibayar/lunas?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Tandai Lunas',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('operations.mark_paid', { date: date, user_id: userId }), {}, {
                    preserveScroll: true
                });
            }
        });
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronsUpDown className="w-4 h-4 text-on-surface-variant/40" />;
        return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />;
    };

    const SortableHeader = ({ field, label, align = 'left' }) => (
        <th 
            className={`p-4 font-label-lg text-label-lg text-on-surface cursor-pointer hover:bg-surface-container-high transition-colors text-${align}`}
            onClick={() => handleSort(field)}
        >
            <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : ''}`}>
                {label}
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <AdminLayout user={auth.user}>
            <Head title="SIPETAK Admin - Dashboard Prestasi & Upah" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Dashboard Prestasi Kerja Regu Tebang</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Pantau prestasi kerja regumu.</p>
                </div>
            </div>

            {/* Stats/Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Pohon</span>
                    <span className="font-display text-[2rem] font-bold text-primary">
                        {new Intl.NumberFormat('id-ID').format(operations.data.reduce((acc, curr) => acc + curr.jumlah_pohon, 0))} Pohon
                    </span>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Batang</span>
                    <span className="font-display text-[2rem] font-bold text-[#219EBC]">
                        {new Intl.NumberFormat('id-ID').format(operations.data.reduce((acc, curr) => acc + curr.jumlah_batang, 0))} Batang
                    </span>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Volume</span>
                    <span className="font-display text-[2rem] font-bold text-[#8ECAE6]">
                        {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(operations.data.reduce((acc, curr) => acc + parseFloat(curr.total_volume), 0))} m³
                    </span>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full md:w-auto">
                        <label className="block text-sm text-on-surface-variant mb-1">Cari Regu</label>
                        <Select
                            value={reguOptions?.find(o => o.value == search) || null}
                            onChange={(option) => {
                                const val = option ? option.value : '';
                                setSearch(val);
                                applyFilter(val, tanggalMulai, tanggalAkhir);
                            }}
                            options={reguOptions}
                            styles={customSelectStyles}
                            placeholder="Pilih pengguna..."
                            isSearchable
                            isClearable
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                        <label className="block text-sm text-on-surface-variant mb-1">Tgl Mulai</label>
                        <DatePicker
                            selected={tanggalMulai}
                            onChange={(date) => {
                                setTanggalMulai(date);
                                applyFilter(search, date, tanggalAkhir);
                            }}
                            dateFormat="dd MMMM yyyy"
                            locale="id"
                            placeholderText="Pilih tanggal mulai"
                            className="w-full h-[42px] border-gray-300 rounded-md focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            wrapperClassName="w-full"
                            isClearable
                        />
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                        <label className="block text-sm text-on-surface-variant mb-1">Tgl Akhir</label>
                        <DatePicker
                            selected={tanggalAkhir}
                            onChange={(date) => {
                                setTanggalAkhir(date);
                                applyFilter(search, tanggalMulai, date);
                            }}
                            dateFormat="dd MMMM yyyy"
                            locale="id"
                            placeholderText="Pilih tanggal akhir"
                            className="w-full h-[42px] border-gray-300 rounded-md focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            wrapperClassName="w-full"
                            isClearable
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant select-none">
                                <SortableHeader field="tanggal" label="Tanggal" align="left" />
                                <th className="p-4 font-label-lg text-label-lg text-on-surface">Regu Pekerja</th>
                                <SortableHeader field="jumlah_pohon" label="Pohon" align="center" />
                                <SortableHeader field="jumlah_batang" label="Batang" align="center" />
                                <SortableHeader field="total_volume" label="Volume (m³)" align="center" />
                                <SortableHeader field="count_pending" label="Status" align="center" />
                                <th className="p-4 font-label-lg text-label-lg text-on-surface text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {operations.data.length > 0 ? (
                                operations.data.map((op) => (
                                    <tr key={op.id} className="hover:bg-surface-container/30 transition-colors">
                                        <td className="p-4 font-body-md text-on-surface">
                                            {op.tanggal ? format(new Date(op.tanggal), 'd MMMM yyyy', { locale: localeId }) : ''}
                                        </td>
                                        <td className="p-4 font-body-md text-on-surface font-bold text-primary">{op.regu_name}</td>
                                        <td className="p-4 font-body-md text-on-surface text-center">{op.jumlah_pohon}</td>
                                        <td className="p-4 font-body-md text-on-surface text-center">{op.jumlah_batang}</td>
                                        <td className="p-4 font-body-md text-on-surface text-center">{op.total_volume}</td>
                                        <td className="p-4 text-center">
                                            {op.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                    <CheckCircle className="w-3 h-3" /> Lunas
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                    <style>{`
                                                        @keyframes fastBlink {
                                                            0%, 100% { opacity: 1; }
                                                            50% { opacity: 0; }
                                                        }
                                                        .blinking-icon {
                                                            animation: fastBlink 1s linear infinite;
                                                        }
                                                    `}</style>
                                                    <AlertTriangle className="w-3 h-3 text-red-600 blinking-icon" /> Belum Lunas
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {op.status !== 'paid' && (
                                                <button
                                                    onClick={() => markAsPaid(op.tanggal, op.user_id)}
                                                    className="text-sm font-bold text-primary hover:text-[#e07600] underline"
                                                >
                                                    Tandai Lunas
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-on-surface-variant font-body-md">
                                        Tidak ada data prestasi/upah ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Placeholder */}
            {operations.links && operations.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-2">
                    {operations.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-4 py-2 rounded-lg font-label-lg text-label-lg ${
                                link.active 
                                    ? 'bg-primary text-on-primary' 
                                    : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
