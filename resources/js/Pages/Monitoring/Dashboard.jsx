import AdminLayout from '@/Layouts/AdminLayout';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDown, ArrowUp, Banknote, CalendarDays, FileCheck2, RefreshCw, TreePine, Truck, Waypoints } from 'lucide-react';

const fmt = (value) => Number(value || 0).toLocaleString('id-ID');
const fmtVolume = (value) => Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: 3 });
const fmtRupiah = (value) => Number(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtFullDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtTrendDate = (value, granularity) => new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', granularity === 'month' ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' });

function SectionHeading({ eyebrow, title, description, right }) {
    return <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{eyebrow}</p><h2 className="font-monitoring text-xl font-bold tracking-tight text-on-surface md:text-2xl">{title}</h2>{description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}</div>
        {right}
    </div>;
}

function StatCard({ icon: Icon, label, value, unit, detail, accent = false }) {
    return <article className="relative overflow-hidden rounded-2xl border border-outline-variant bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className={`absolute inset-x-0 top-0 h-1 ${accent ? 'bg-orange-500' : 'bg-emerald-800'}`} />
        <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-on-surface-variant">{label}</p><span className={`rounded-xl p-2.5 ${accent ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-900'}`}><Icon size={19} aria-hidden="true" /></span></div>
        <div className="mt-5 flex flex-wrap items-baseline gap-1.5"><strong className="font-monitoring text-3xl font-bold tracking-tight text-on-surface md:text-4xl">{value}</strong><span className="text-sm text-on-surface-variant">{unit}</span></div>
        <p className="mt-3 min-h-10 border-t border-outline-variant pt-3 text-xs leading-5 text-on-surface-variant">{detail}</p>
    </article>;
}

function FlowRow({ label, part, total, caption, accent = false }) {
    const ratio = total > 0 ? Math.round(part / total * 100) : null;
    return <div className="py-5 first:pt-0 last:pb-0">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between"><div className="min-w-0"><h3 className="text-sm font-semibold leading-5 text-on-surface">{label}</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">{caption}</p></div><span className={`shrink-0 rounded-lg px-2.5 py-1 font-monitoring tabular-nums text-sm font-semibold ${accent ? 'bg-orange-50 text-orange-800' : 'bg-emerald-50 text-emerald-900'}`}>{ratio === null ? '—' : `${fmt(ratio)}%`}</span></div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-container" role="progressbar" aria-label={label} aria-valuenow={Math.min(ratio || 0, 100)} aria-valuemin="0" aria-valuemax="100"><div className={`h-full rounded-full ${accent ? 'bg-orange-500' : 'bg-emerald-800'}`} style={{ width: `${Math.min(ratio || 0, 100)}%` }} /></div>
        <p className="mt-2 text-xs font-medium text-on-surface-variant">{fmt(part)} dari {fmt(total)} batang{ratio === null ? ' · Belum ada data pembanding' : ''}</p>
    </div>;
}

function TrendPanel({ trend, periode, total, totalBatang, totalVolume }) {
    const monthly = periode.granularity === 'month';
    const [mode, setMode] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(null);
    const [hovered, setHovered] = useState(null);
    const series = useMemo(() => {
        let running = 0;
        let runningBatang = 0;
        let runningVolume = 0;
        return trend.map((item) => {
            running += item.pohon;
            runningBatang += item.batang;
            runningVolume += item.volume;
            return { ...item, cumulative: running, cumulativeBatang: runningBatang, cumulativeVolume: runningVolume, value: mode === 'daily' ? item.pohon : running };
        });
    }, [trend, mode]);
    const selected = series.find((item) => item.tanggal === selectedDate) || series.at(-1);
    const max = Math.max(1, ...series.map((item) => item.value));
    const showTooltip = (item, x, y) => setHovered({ item, x: Math.max(12, Math.min(x + 14, window.innerWidth - 232)), y: Math.max(12, y - 155) });

    return <section className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h2 className="font-monitoring text-xl font-bold">Tren tebangan</h2><p className="mt-1 text-sm text-on-surface-variant">Berdasarkan {monthly ? 'bulan' : 'tanggal'} pada catatan pohon</p></div><div className="grid w-full grid-cols-2 rounded-xl bg-surface-container-low p-1 sm:w-auto" aria-label="Mode grafik">{[['daily', monthly ? 'Bulanan' : 'Harian'], ['cumulative', 'Kumulatif']].map(([key, label]) => <button key={key} type="button" onClick={() => setMode(key)} aria-pressed={mode === key} className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${mode === key ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>{label}</button>)}</div></div>
        <div className="mt-5 rounded-xl bg-surface-container-low p-3 sm:bg-transparent sm:p-0"><div className="flex min-w-0 items-baseline gap-2"><strong className="font-monitoring text-3xl font-bold text-primary">{fmt(selected?.value)}</strong><span className="min-w-0 text-sm leading-5 text-on-surface-variant">pohon {mode === 'daily' ? 'pada' : 'hingga'} {selected ? fmtTrendDate(selected.tanggal, periode.granularity) : 'periode ini'}</span></div><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-primary">{fmt(mode === 'daily' ? selected?.batang : selected?.cumulativeBatang)} batang</span><span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800">{fmtVolume(mode === 'daily' ? selected?.volume : selected?.cumulativeVolume)} m³</span></div></div>
        <div className="mt-5 max-w-full overflow-x-auto overscroll-x-contain pb-2"><div className="flex h-44 items-end gap-1 border-b border-outline-variant sm:h-48" style={{ minWidth: `${Math.max(280, series.length * 14)}px` }} role="group" aria-label="Pilih tanggal pada grafik">
            {series.map((item) => <button key={item.tanggal} type="button" onClick={() => setSelectedDate(item.tanggal)} onMouseEnter={(event) => showTooltip(item, event.clientX, event.clientY)} onMouseMove={(event) => showTooltip(item, event.clientX, event.clientY)} onMouseLeave={() => setHovered(null)} onFocus={(event) => { const rect = event.currentTarget.getBoundingClientRect(); showTooltip(item, rect.left + rect.width / 2, rect.top); }} onBlur={() => setHovered(null)} aria-label={`${fmtTrendDate(item.tanggal, periode.granularity)}, ${fmt(item.pohon)} pohon, ${fmt(item.batang)} batang, ${fmtVolume(item.volume)} meter kubik`} aria-pressed={selected?.tanggal === item.tanggal} className="group flex h-full min-w-0 flex-1 items-end rounded-t-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"><span className={`block w-full rounded-t-sm transition-colors ${selected?.tanggal === item.tanggal ? 'bg-orange-500' : 'bg-emerald-700 group-hover:bg-emerald-500'}`} style={{ height: `${item.value ? Math.max(5, item.value / max * 100) : 2}%` }} /></button>)}
        </div></div>
        {hovered && <div role="tooltip" className="pointer-events-none fixed z-50 w-56 rounded-xl border border-outline-variant bg-white p-3 text-xs text-on-surface shadow-xl" style={{ left: hovered.x, top: hovered.y }}><p className="mb-2 border-b border-outline-variant pb-2 font-semibold">{fmtTrendDate(hovered.item.tanggal, periode.granularity)}</p><p className="font-semibold text-primary">{monthly ? 'Bulan ini' : 'Tanggal ini'}</p><p>{fmt(hovered.item.pohon)} pohon · {fmt(hovered.item.batang)} batang · {fmtVolume(hovered.item.volume)} m³</p><p className="mt-2 font-semibold text-primary">Kumulatif periode</p><p>{fmt(hovered.item.cumulative)} pohon · {fmt(hovered.item.cumulativeBatang)} batang · {fmtVolume(hovered.item.cumulativeVolume)} m³</p></div>}
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-on-surface-variant sm:text-xs"><span>{fmtTrendDate(periode.from, periode.granularity)}</span><span className="text-right">{fmtTrendDate(periode.to, periode.granularity)}</span></div>
        <div className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-xs leading-5 text-on-surface-variant">{total === 0 ? 'Belum ada tebangan pada periode ini.' : `${fmt(total)} pohon, ${fmt(totalBatang)} batang, dan ${fmtVolume(totalVolume)} m³ tercatat ${monthly ? 'pada seluruh data' : `selama ${periode.days} hari`}. Tinggi grafik menunjukkan jumlah pohon; arahkan kursor atau pilih ${monthly ? 'bulan' : 'tanggal'} untuk melihat rincian.`}{periode.latestDate && <span className="mt-1 block">Periode berakhir pada data terbaru: {fmtTrendDate(periode.latestDate, periode.granularity)}.</span>}</div>
    </section>;
}

function GroupTable({ rows }) {
    const [sort, setSort] = useState('batang');
    const [direction, setDirection] = useState('desc');
    const sorted = useMemo(() => [...rows].sort((a, b) => {
        const result = sort === 'nama' ? a.nama.localeCompare(b.nama, 'id') : Number(a[sort]) - Number(b[sort]);
        return direction === 'asc' ? result : -result;
    }), [rows, sort, direction]);
    const changeSort = (key) => { if (sort === key) setDirection(direction === 'asc' ? 'desc' : 'asc'); else { setSort(key); setDirection(key === 'nama' ? 'asc' : 'desc'); } };
    const heading = (key, label) => <button type="button" onClick={() => changeSort(key)} className="inline-flex items-center gap-1.5 font-semibold hover:text-primary" aria-label={`Urutkan ${label}`} aria-sort={sort === key ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}>{label}{sort === key && (direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}</button>;

    const mobileStage = (label, pohon, batang, volume, accent = false) => <div className={`rounded-xl border p-3 ${accent ? 'border-orange-100 bg-orange-50/60' : 'border-outline-variant bg-surface-container-low'}`}>
        <p className={`text-xs font-bold ${accent ? 'text-orange-800' : 'text-primary'}`}>{label}</p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center"><div><dt className="text-[10px] text-on-surface-variant">Pohon</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{fmt(pohon)}</dd></div><div><dt className="text-[10px] text-on-surface-variant">Batang</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{fmt(batang)}</dd></div><div><dt className="text-[10px] text-on-surface-variant">Volume</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{fmtVolume(volume)} <span className="text-[10px] font-normal">m³</span></dd></div></dl>
    </div>;

    return <section className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-outline-variant p-4 sm:p-5 md:p-6"><span className="shrink-0 rounded-xl bg-emerald-50 p-2.5 text-primary"><Waypoints size={19} /></span><div className="min-w-0"><h2 className="font-monitoring text-xl font-bold">Ringkasan</h2><p className="mt-1 text-sm leading-5 text-on-surface-variant">Total sesuai periode dan kelompok terpilih. Tekan judul kolom untuk mengurutkan.</p></div></div>
        {rows.length ? <>
            <div className="p-4 lg:hidden">
                <div className="mb-4 grid grid-cols-[minmax(0,1fr)_44px] gap-2">
                    <label className="min-w-0"><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Urutkan berdasarkan</span><select value={sort} onChange={(event) => changeSort(event.target.value)} className="min-h-11 w-full rounded-lg border-outline-variant text-sm"><option value="nama">Nama kelompok</option><option value="pohon">Jumlah pohon</option><option value="batang">Jumlah batang</option><option value="volume">Volume tebangan</option><option value="totalPsdh">Total PSDH</option><option value="totalPnbpDibayar">PNBP dibayar</option></select></label>
                    <button type="button" onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')} className="mt-[22px] flex min-h-11 items-center justify-center rounded-lg border border-outline-variant bg-white text-primary" aria-label={direction === 'asc' ? 'Urutan naik' : 'Urutan turun'}>{direction === 'asc' ? <ArrowUp size={17} /> : <ArrowDown size={17} />}</button>
                </div>
                <div className="space-y-4">{sorted.map((item) => <article key={item.id} className="rounded-2xl border border-outline-variant p-4 shadow-sm"><h3 className="break-words text-base font-bold text-on-surface">{item.nama}</h3><div className="mt-4 space-y-3">{mobileStage('Hasil tebangan', item.pohon, item.batang, item.volume)}{mobileStage('Dokumen angkutan', item.pohonTerdokumen, item.batangTerdokumen, item.volumeTerdokumen)}{mobileStage('SKSHHK', item.pohonSkshhkTerdokumen, item.batangSkshhkTerdokumen, item.volumeSkshhkTerdokumen, true)}</div><dl className="mt-4 grid gap-3 border-t border-outline-variant pt-4 sm:grid-cols-2"><div><dt className="text-xs text-on-surface-variant">Total PSDH</dt><dd className="mt-1 break-all text-sm font-bold tabular-nums text-on-surface">Rp {fmtRupiah(item.totalPsdh)}</dd></div><div><dt className="text-xs text-on-surface-variant">PNBP dibayar</dt><dd className="mt-1 break-all text-sm font-bold tabular-nums text-on-surface">Rp {fmtRupiah(item.totalPnbpDibayar)}</dd></div></dl></article>)}</div>
            </div>
            <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1500px] text-left text-sm"><thead className="bg-surface-container-low text-on-surface-variant"><tr className="border-b border-outline-variant text-xs uppercase tracking-wide"><th rowSpan="2" className="sticky left-0 z-10 bg-surface-container-low px-5 py-3">{heading('nama', 'Kelompok')}</th><th colSpan="3" className="px-5 py-3 text-center">Hasil tebangan</th><th colSpan="3" className="border-l border-outline-variant px-5 py-3 text-center">Dokumen angkutan</th><th colSpan="3" className="border-l border-outline-variant px-5 py-3 text-center">SKSHHK</th><th rowSpan="2" className="border-l border-outline-variant px-5 py-3 text-right">{heading('totalPsdh', 'Total PSDH (Rp)')}</th><th rowSpan="2" className="border-l border-outline-variant px-5 py-3 text-right">{heading('totalPnbpDibayar', 'PNBP dibayar (Rp)')}</th></tr><tr className="text-xs"><th className="px-4 py-3 text-right">{heading('pohon', 'Pohon')}</th><th className="px-4 py-3 text-right">{heading('batang', 'Batang')}</th><th className="px-4 py-3 text-right">{heading('volume', 'Volume m³')}</th><th className="border-l border-outline-variant px-4 py-3 text-right">{heading('pohonTerdokumen', 'Pohon')}</th><th className="px-4 py-3 text-right">{heading('batangTerdokumen', 'Batang')}</th><th className="px-4 py-3 text-right">{heading('volumeTerdokumen', 'Volume m³')}</th><th className="border-l border-outline-variant px-4 py-3 text-right">{heading('pohonSkshhkTerdokumen', 'Pohon')}</th><th className="px-4 py-3 text-right">{heading('batangSkshhkTerdokumen', 'Batang')}</th><th className="px-4 py-3 text-right">{heading('volumeSkshhkTerdokumen', 'Volume m³')}</th></tr></thead><tbody className="divide-y divide-outline-variant">{sorted.map((item) => <tr key={item.id} className="hover:bg-surface-container-low"><td className="sticky left-0 z-10 bg-white px-5 py-4 font-semibold text-on-surface">{item.nama}</td><td className="px-4 py-4 text-right tabular-nums">{fmt(item.pohon)}</td><td className="px-4 py-4 text-right tabular-nums">{fmt(item.batang)}</td><td className="px-4 py-4 text-right tabular-nums">{fmtVolume(item.volume)}</td><td className="border-l border-outline-variant px-4 py-4 text-right tabular-nums">{fmt(item.pohonTerdokumen)}</td><td className="px-4 py-4 text-right tabular-nums">{fmt(item.batangTerdokumen)}</td><td className="px-4 py-4 text-right tabular-nums">{fmtVolume(item.volumeTerdokumen)}</td><td className="border-l border-outline-variant px-4 py-4 text-right tabular-nums">{fmt(item.pohonSkshhkTerdokumen)}</td><td className="px-4 py-4 text-right tabular-nums">{fmt(item.batangSkshhkTerdokumen)}</td><td className="px-4 py-4 text-right tabular-nums">{fmtVolume(item.volumeSkshhkTerdokumen)}</td><td className="border-l border-outline-variant px-4 py-4 text-right tabular-nums">{fmtRupiah(item.totalPsdh)}</td><td className="border-l border-outline-variant px-4 py-4 text-right tabular-nums">{fmtRupiah(item.totalPnbpDibayar)}</td></tr>)}</tbody></table></div>
        </> : <p className="p-6 text-sm text-on-surface-variant">Belum ada kelompok pada cakupan ini.</p>}
    </section>;
}

export default function Dashboard({ auth, summary, trend, kelompok, periode, filters, updatedAt, namaKelompok, canFilterKelompok, kelompokOptions }) {
    const Layout = auth.user.roles?.includes('monitoring_viewer') ? MonitoringLayout : AdminLayout;
    const [isFiltering, setIsFiltering] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [loadingTarget, setLoadingTarget] = useState('ringkasan operasional');
    useEffect(() => {
        if (!isFiltering) {
            setShowLoading(false);
            return;
        }
        const timer = window.setTimeout(() => setShowLoading(true), 150);
        return () => window.clearTimeout(timer);
    }, [isFiltering]);
    const changeFilter = (changes) => {
        if (changes.days) {
            setLoadingTarget(changes.days === 'all' ? 'seluruh periode data' : `periode ${changes.days} hari`);
        } else if (Object.prototype.hasOwnProperty.call(changes, 'kelompok_id')) {
            const selected = kelompokOptions.find((item) => String(item.id) === String(changes.kelompok_id));
            setLoadingTarget(selected ? `kelompok ${selected.nama_kelompok}` : 'seluruh kelompok');
        }
        setIsFiltering(true);
        router.get(route('mobile.dashboard'), {
            days: filters.days,
            ...(canFilterKelompok && filters.kelompok_id ? { kelompok_id: filters.kelompok_id } : {}),
            ...changes,
        }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsFiltering(false),
        });
    };
    const refreshData = () => {
        if (isFiltering) return;
        setLoadingTarget('data monitoring terbaru');
        setIsFiltering(true);
        router.reload({
            onFinish: () => setIsFiltering(false),
        });
    };

    return <Layout user={auth.user}>
        <Head title="Monitoring Operasional | SIPETAK" />
        <div className="font-monitoring space-y-8 pb-8" aria-busy={isFiltering}>
            <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-primary/10 px-4 backdrop-blur-[2px] motion-safe:transition-opacity motion-safe:duration-300 ${showLoading ? 'opacity-100' : 'pointer-events-none opacity-0'}`} role={showLoading ? 'status' : undefined} aria-live="polite" aria-hidden={!showLoading} aria-label="Memperbarui data monitoring"><div className={`flex w-full max-w-xs items-center gap-3 rounded-2xl border border-outline-variant bg-white px-5 py-4 shadow-2xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out ${showLoading ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.98]'}`}><span className="block h-7 w-7 aspect-square shrink-0 rounded-full border-2 border-emerald-100 border-t-emerald-700 motion-safe:animate-spin" aria-hidden="true" /><div className="min-w-0"><p className="font-monitoring text-lg font-bold text-on-surface">Menyiapkan data</p><p className="mt-1 text-sm text-on-surface-variant">Memuat {loadingTarget}.</p></div></div></div>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">SIPETAK / MONITORING</p><h1 className="font-monitoring text-3xl font-bold tracking-tight text-on-surface md:text-4xl">Monitoring operasional</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">Ringkasan hasil tebangan dan pencatatan angkutan kayu yang mudah dipantau.</p></div><button type="button" onClick={refreshData} disabled={isFiltering} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-low disabled:cursor-wait disabled:opacity-60"><RefreshCw size={16} className={isFiltering ? 'animate-spin' : undefined} /> Perbarui data</button></div>

            <div className={`grid gap-4 rounded-2xl border border-outline-variant bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5 ${canFilterKelompok ? 'xl:grid-cols-[minmax(0,1fr)_minmax(160px,220px)_minmax(180px,260px)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(160px,220px)]'}`}>
                <div className="flex min-w-0 items-center gap-3 border-b border-outline-variant pb-4 sm:col-span-2 xl:col-span-1 xl:border-b-0 xl:pb-0">
                    <span className="shrink-0 rounded-xl bg-emerald-50 p-3 text-primary"><Activity size={19} aria-hidden="true" /></span>
                    <div className="min-w-0"><p className="text-xs font-medium text-on-surface-variant">Cakupan data</p><p className="break-words text-sm font-semibold leading-5 text-on-surface">{namaKelompok || 'Seluruh kelompok'}</p></div>
                </div>
                <div className="min-w-0">
                    <label htmlFor="monitoring-days" className="mb-2 block text-xs font-semibold text-on-surface-variant">Periode data</label>
                    <select id="monitoring-days" disabled={isFiltering} value={filters.days} onChange={(event) => changeFilter({ days: event.target.value })} className="min-h-11 w-full rounded-lg border-outline-variant text-sm disabled:opacity-60"><option value="7">7 hari</option><option value="30">30 hari</option><option value="90">90 hari</option><option value="all">Seluruh data</option></select>
                </div>
                {canFilterKelompok && <div className="min-w-0">
                    <label htmlFor="monitoring-kelompok" className="mb-2 block text-xs font-semibold text-on-surface-variant">Kelompok</label>
                    <select id="monitoring-kelompok" disabled={isFiltering} value={filters.kelompok_id || ''} onChange={(event) => changeFilter({ kelompok_id: event.target.value || null })} className="min-h-11 w-full rounded-lg border-outline-variant text-sm disabled:opacity-60"><option value="">Semua kelompok</option>{kelompokOptions.map((item) => <option key={item.id} value={item.id}>{item.nama_kelompok}</option>)}</select>
                </div>}
            </div>

            <section><SectionHeading eyebrow="Gambaran umum" title="Ringkasan periode" description={filters.days === 'all' ? 'Seluruh data pada cakupan kelompok terpilih.' : `Data ${fmtFullDate(periode.from)} sampai ${fmtFullDate(periode.to)} pada cakupan kelompok terpilih.`} right={<p className="flex items-center gap-1.5 text-xs text-on-surface-variant"><CalendarDays size={14} /> Dibuat {new Date(updatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={TreePine} label="Hasil tebangan" value={fmt(summary.batang)} unit="batang" detail={`${fmt(summary.pohon)} pohon · ${fmtVolume(summary.volume)} m³`} /><StatCard icon={Truck} label="Masuk dokumen angkutan" value={fmt(summary.batangTerdokumen)} unit="batang" detail={`${fmt(summary.dokumenAngkutan)} dokumen · ${fmtVolume(summary.volumeTerdokumen)} m³`} /><StatCard icon={FileCheck2} label="Masuk SKSHHK" value={fmt(summary.batangSkshhkTerdokumen)} unit="batang" detail={`${fmt(summary.skshhk)} SKSHHK · ${fmtVolume(summary.volumeSkshhkTerdokumen)} m³`} accent /><StatCard icon={Activity} label="Volume hasil" value={fmtVolume(summary.volume)} unit="m³" detail="Total volume batang hasil tebangan dalam periode" /></div></section>

            <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm md:p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-orange-50 p-3 text-orange-800"><Banknote size={22} aria-hidden="true" /></span><div><h2 className="text-sm font-bold text-on-surface">Total PSDH pada LHP</h2><p className="mt-1 text-xs text-on-surface-variant">Berdasarkan tanggal LHP pada periode terpilih</p></div></div><p className="mt-5 font-monitoring text-2xl font-bold tabular-nums text-primary md:text-3xl">Rp {fmtRupiah(summary.totalPsdh)}</p>{summary.psdhTanpaKelompok > 0 && <p className="mt-1 text-xs text-on-surface-variant">Termasuk Rp {fmtRupiah(summary.psdhTanpaKelompok)} tanpa kelompok</p>}</div><div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm md:p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-3 text-primary"><Banknote size={22} aria-hidden="true" /></span><div><h2 className="text-sm font-bold text-on-surface">Total PNBP dibayarkan</h2><p className="mt-1 text-xs text-on-surface-variant">Berdasarkan tanggal bayar dan NTPN</p></div></div><p className="mt-5 font-monitoring text-2xl font-bold tabular-nums text-primary md:text-3xl">Rp {fmtRupiah(summary.totalPnbpDibayar)}</p><p className="mt-1 text-xs text-on-surface-variant">{fmt(summary.pnbpDibayarCount)} pembayaran tercatat{summary.pnbpTanpaKelompok > 0 ? ` · Rp ${fmtRupiah(summary.pnbpTanpaKelompok)} tanpa kelompok` : ''}</p></div></section>

            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]"><section className="min-w-0 rounded-2xl border border-outline-variant bg-white p-4 shadow-sm sm:p-5 md:p-6"><h2 className="font-monitoring text-xl font-bold">Alur pencatatan</h2><p className="mt-1 text-sm leading-5 text-on-surface-variant">Perbandingan jumlah batang dalam periode terpilih</p><div className="mt-6 divide-y divide-outline-variant"><FlowRow label="Tebangan → dokumen angkutan" part={summary.batangTerdokumen} total={summary.batang} caption="Batang dari pohon yang memiliki dokumen angkutan." /><FlowRow label="Dokumen angkutan → SKSHHK" part={summary.batangSkshhkTerdokumen} total={summary.batangTerdokumen} caption="Batang dalam angkutan yang juga tercantum di SKSHHK." accent /></div><p className="mt-6 rounded-xl bg-orange-50 px-3 py-3 text-xs leading-5 text-orange-900 sm:px-4">Persentase menunjukkan pencatatan dokumen, bukan status tiba di tujuan.</p></section><TrendPanel trend={trend} periode={periode} total={summary.pohonPeriode} totalBatang={summary.batangPeriode} totalVolume={summary.volumePeriode} /></div>

            <GroupTable rows={kelompok} />
        </div>
    </Layout>;
}
