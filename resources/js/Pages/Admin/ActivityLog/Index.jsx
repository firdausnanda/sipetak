import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Search, History, ArrowRight, Filter, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Index({ logs, filters = {}, options = {} }) {
    const safeFilters = Array.isArray(filters) ? {} : filters;
    const [search, setSearch] = useState(safeFilters.search || '');
    const [perPage, setPerPage] = useState(safeFilters.per_page || '10');

    // Advanced filters state
    const [showFilters, setShowFilters] = useState(false);
    const [event, setEvent] = useState(safeFilters.event || '');
    const [subjectType, setSubjectType] = useState(safeFilters.subject_type || '');
    const [dateFrom, setDateFrom] = useState(safeFilters.date_from || '');
    const [dateTo, setDateTo] = useState(safeFilters.date_to || '');

    const applyFilters = (overrides = {}) => {
        const payload = { 
            search, 
            per_page: perPage, 
            event,
            subject_type: subjectType,
            date_from: dateFrom,
            date_to: dateTo,
            ...overrides 
        };
        // Clean up empty payload fields
        Object.keys(payload).forEach(key => {
            if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
                delete payload[key];
            }
        });
        router.get(route('admin.activity-log.index'), payload, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const resetFilters = () => {
        setSearch('');
        setEvent('');
        setSubjectType('');
        setDateFrom('');
        setDateTo('');
        applyFilters({
            search: '',
            event: '',
            subject_type: '',
            date_from: '',
            date_to: ''
        });
    };

    const handleFilterChange = (field, value) => {
        if (field === 'per_page') setPerPage(value);
        applyFilters({ [field]: value });
    };

    // Helper function to format properties nicely
    const formatProperties = (properties) => {
        if (!properties || Object.keys(properties).length === 0) return '-';

        const renderValue = (val) => {
            if (val === null || val === undefined) return 'null';
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val);
        };

        const hasOld = properties.hasOwnProperty('old');
        const hasAttributes = properties.hasOwnProperty('attributes');

        return (
            <div className="text-xs space-y-1">
                {hasOld && hasAttributes && (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-on-surface-variant">Perubahan:</span>
                        {Object.keys(properties.attributes).map(key => {
                            if (JSON.stringify(properties.old[key]) !== JSON.stringify(properties.attributes[key])) {
                                return (
                                    <div key={key} className="flex items-start gap-1 flex-wrap">
                                        <span className="font-semibold text-primary break-all">{key}:</span>
                                        <span className="line-through text-error/70 break-all">{renderValue(properties.old[key])}</span>
                                        <ArrowRight className="w-3 h-3 text-on-surface-variant shrink-0 mt-0.5" />
                                        <span className="text-primary break-all">{renderValue(properties.attributes[key])}</span>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}
                {!hasOld && hasAttributes && (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-on-surface-variant">Atribut:</span>
                        {Object.keys(properties.attributes).map(key => (
                            <div key={key} className="flex gap-1 items-start flex-wrap">
                                <span className="font-semibold text-primary break-all">{key}:</span>
                                <span className="break-all">{renderValue(properties.attributes[key])}</span>
                            </div>
                        ))}
                    </div>
                )}
                {hasOld && !hasAttributes && (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-on-surface-variant">Data Lama:</span>
                        {Object.keys(properties.old).map(key => (
                            <div key={key} className="flex gap-1 items-start flex-wrap">
                                <span className="font-semibold text-primary break-all">{key}:</span>
                                <span className="break-all">{renderValue(properties.old[key])}</span>
                            </div>
                        ))}
                    </div>
                )}
                {!hasOld && !hasAttributes && (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-on-surface-variant">Detail:</span>
                        {Object.keys(properties).map(key => (
                            <div key={key} className="flex gap-1 items-start flex-wrap">
                                <span className="font-semibold text-primary break-all">{key}:</span>
                                <span className="break-all">{renderValue(properties[key])}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <AdminLayout>
            <Head title="SIPETAK Admin - Log Aktivitas" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Log Aktivitas</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Pantau riwayat perubahan dan aktivitas pengguna dalam sistem.</p>
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
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72 flex items-center">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[18px] h-[18px]" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Cari deskripsi, pengguna..."
                            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm bg-surface-container-lowest min-h-[40px]"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg min-h-[40px] text-sm font-medium transition-colors ${showFilters ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'}`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="mb-6 p-4 bg-surface-container-low border border-outline-variant rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-sm text-on-surface">Pencarian Lanjut</h3>
                        <button onClick={resetFilters} className="text-xs text-error hover:underline flex items-center gap-1">
                            <X className="w-3 h-3" /> Reset Filter
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-on-surface-variant mb-1">Tipe Aktivitas</label>
                            <select
                                value={event}
                                onChange={(e) => setEvent(e.target.value)}
                                className="w-full border border-outline-variant rounded-lg py-2 px-3 focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            >
                                <option value="">Semua Aktivitas</option>
                                {options?.events?.map((evt, idx) => (
                                    <option key={idx} value={evt}>{evt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-on-surface-variant mb-1">Model Data</label>
                            <select
                                value={subjectType}
                                onChange={(e) => setSubjectType(e.target.value)}
                                className="w-full border border-outline-variant rounded-lg py-2 px-3 focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            >
                                <option value="">Semua Model</option>
                                {options?.subjectTypes?.map((type, idx) => (
                                    <option key={idx} value={type}>{type.split('\\').pop()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-on-surface-variant mb-1">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full border border-outline-variant rounded-lg py-2 px-3 focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-on-surface-variant mb-1">Tanggal Akhir</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full border border-outline-variant rounded-lg py-2 px-3 focus:outline-none focus:border-primary text-sm bg-surface-container-lowest"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => applyFilters()}
                            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant w-1/4">Waktu</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Pengguna</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Aktivitas</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tipe Data (Model)</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant w-1/3">Detail (Properties)</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-on-surface-variant">
                                            <History className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="font-bold text-lg mb-1">Belum ada aktivitas tercatat</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors items-start">
                                        <td className="py-4 px-4 text-sm text-on-surface-variant align-top">
                                            <div className="font-semibold text-primary">{format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}</div>
                                            <div className="text-xs mt-1">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: id })}</div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant align-top">
                                            {log.causer ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-primary">{log.causer.name}</span>
                                                    <span className="text-xs">{log.causer.email}</span>
                                                </div>
                                            ) : (
                                                <span className="italic">Sistem</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-sm align-top">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${
                                                log.event === 'created' ? 'bg-secondary-container text-on-secondary-container' : 
                                                log.event === 'updated' ? 'bg-surface-container-high text-primary' : 
                                                log.event === 'deleted' ? 'bg-error-container text-error' : 
                                                'bg-surface-container text-on-surface-variant'
                                            }`}>
                                                {log.description}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant align-top">
                                            {log.subject_type ? log.subject_type.split('\\').pop() : '-'} 
                                            {log.subject_id ? ` (#${log.subject_id})` : ''}
                                        </td>
                                        <td className="py-4 px-4 align-top">
                                            {formatProperties(log.properties)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {logs.last_page > 1 && (
                    <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                        <span className="text-sm text-on-surface-variant font-body-md">
                            Menampilkan {logs.from || 0}-{logs.to || 0} dari {logs.total} data
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {logs.links.map((link, k) => (
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
            
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
