import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function History({ auth, pohons = { data: [] }, filters = {} }) {
    const [items, setItems] = useState(pohons.data);
    const [nextUrl, setNextUrl] = useState(pohons.next_page_url);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        setItems(pohons.data);
        setNextUrl(pohons.next_page_url);
    }, [pohons]);

    const handleFilter = (filterValue) => {
        router.get(route('history'), { filter: filterValue, search: search }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.get(route('history'), { filter: filters.filter, search: search }, { preserveState: true, replace: true });
        }
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('history'), { filter: filters.filter }, { preserveState: true, replace: true });
    };

    const loadMore = async () => {
        if (!nextUrl || loading) return;
        setLoading(true);
        try {
            const res = await axios.get(nextUrl, { headers: { Accept: 'application/json' } });
            setItems((prev) => [...prev, ...res.data.data]);
            setNextUrl(res.data.next_page_url);
        } catch (error) {
            console.error("Failed to load more data", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Input" />

            <div className="flex-grow pt-[calc(var(--spacing-touch-target)+var(--spacing-margin-mobile))] md:pt-0 px-margin-mobile md:px-0 flex flex-col max-w-[1200px] w-full mx-auto pb-8">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between mb-8">
                    <h1 className="font-display text-display text-primary">Riwayat Input {auth.user.name}</h1>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps bg-surface-container-high px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        <span>Online</span>
                    </div>
                </div>

                {/* Search & Filter Controls */}
                <section className="flex flex-col gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative w-full">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full h-touch-target pl-12 pr-12 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder-on-surface-variant font-body-md text-body-md transition-shadow focus:border-[#FB8500] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(251,133,0,0.2)]" 
                            placeholder="Cari No. Petak atau Jenis Pohon... (Tekan Enter)" 
                            type="text" 
                        />
                        {search && (
                            <button onClick={clearSearch} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-outline hover:text-on-surface rounded-full transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        )}
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
                        <button 
                            onClick={() => handleFilter('today')} 
                            className={`whitespace-nowrap h-10 px-4 rounded-full border transition-colors font-label-caps text-label-caps ${filters.filter === 'today' ? 'border-[#FB8500] bg-[#FB8500]/10 text-[#FB8500]' : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high'}`}>
                            HARI INI
                        </button>
                        <button 
                            onClick={() => handleFilter('yesterday')} 
                            className={`whitespace-nowrap h-10 px-4 rounded-full border transition-colors font-label-caps text-label-caps ${filters.filter === 'yesterday' ? 'border-[#FB8500] bg-[#FB8500]/10 text-[#FB8500]' : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high'}`}>
                            KEMARIN
                        </button>
                        <button 
                            onClick={() => handleFilter('this_week')} 
                            className={`whitespace-nowrap h-10 px-4 rounded-full border transition-colors font-label-caps text-label-caps ${filters.filter === 'this_week' ? 'border-[#FB8500] bg-[#FB8500]/10 text-[#FB8500]' : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high'}`}>
                            MINGGU INI
                        </button>
                    </div>
                </section>

                {/* Data List Container */}
                <section className="flex flex-col gap-4">
                    {items.map((pohon) => (
                        <article key={pohon.id} className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                <div className="flex gap-4 items-center">
                                    <div className="h-12 w-12 rounded-lg bg-surface-container-high flex items-center justify-center text-[#6D4C41] border border-outline-variant">
                                        <span className="material-symbols-outlined">forest</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-label-caps text-label-caps text-[#6D4C41]">NO. PETAK</span>
                                            <span className="font-data-mono text-data-mono text-[#1B4332] font-bold bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant">{pohon.petak?.no_petak || 'N/A'}</span>
                                        </div>
                                        <h3 className="font-headline-md text-headline-lg-mobile text-primary">{pohon.jenis_pohon?.nama_jenis || 'N/A'}</h3>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:flex gap-4 md:ml-8 md:items-center w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant">
                                    <div className="flex flex-col">
                                        <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">WAKTU INPUT</span>
                                        <span className="font-body-md text-body-md text-on-surface flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                                            {new Date(pohon.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">STATUS</span>
                                        <span className="font-body-md text-body-md text-green-700 flex items-center gap-1 font-semibold">
                                            <span className="material-symbols-outlined text-[18px]">cloud_done</span>
                                            Sukses
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link href={route('history.show', pohon.id)} className="flex items-center justify-center w-full md:w-auto h-touch-target px-6 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-high text-primary font-body-md text-body-md font-semibold transition-colors mt-2 md:mt-0">
                                Lihat Detail
                            </Link>
                        </article>
                    ))}
                    
                    {items.length === 0 && (
                        <div className="text-center py-8 text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant">
                            Belum ada riwayat input.
                        </div>
                    )}
                </section>

                {/* Load More */}
                {nextUrl && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={loadMore} 
                            disabled={loading}
                            className="h-touch-target px-8 rounded-full border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high transition-colors font-label-caps text-label-caps flex items-center gap-2 disabled:opacity-50">
                            {loading ? 'MEMUAT...' : 'MUAT LEBIH BANYAK'}
                            {!loading && <span className="material-symbols-outlined text-[18px]">expand_more</span>}
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
