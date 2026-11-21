import { Head, Link } from '@inertiajs/react';

export default function Show({ pohon }) {
    return (
        <div className="bg-background text-on-background antialiased selection:bg-[#FB8500] selection:text-white pt-touch-target pb-touch-target md:pb-0 min-h-screen">
            <Head title="Detail Log - SIPETAK" />
            
            {/* TopAppBar */}
            <header className="fixed top-0 left-0 w-full z-50 flex items-center px-margin-mobile h-touch-target bg-surface border-b border-outline-variant shadow-sm transition-transform duration-100">
                <Link href={route('history')} aria-label="Kembali" className="flex items-center justify-center w-touch-target h-touch-target text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
                </Link>
                <h1 className="flex-1 font-headline-md text-headline-md text-primary ml-2 truncate">Detail Log</h1>
                <button aria-label="Sinkronisasi" className="flex items-center justify-center w-touch-target h-touch-target text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>sync</span>
                </button>
            </header>

            <main className="max-w-4xl mx-auto px-margin-mobile md:px-container-padding pb-6 space-y-6 mt-touch-target">
                {/* Header Section */}
                <section className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant flex flex-col gap-4 relative overflow-hidden">
                    {/* Decorative subtle pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1B4332 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex flex-col gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#FB8500]/10 text-[#FB8500] font-label-caps text-label-caps border border-[#FB8500]/20 w-fit">
                                NO. PETAK <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#1B4332]/10 text-[#1B4332] font-label-caps text-label-caps border border-[#FB8500]/20 w-fit ms-2">{pohon.petak?.no_petak || 'N/A'}</span> 
                            </span>
                            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container">{pohon.jenis_pohon?.nama_jenis || 'N/A'}</h2>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1 text-[#1B4332] font-data-mono text-data-mono bg-[#1B4332]/10 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Sukses
                            </span>
                            <span className="font-body-md text-body-md text-on-surface-variant text-sm">{new Date(pohon.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </section>

                {/* Details Card */}
                <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest" aria-labelledby="informasi-pohon-title">
                    <div className="border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-5">
                        <h3 id="informasi-pohon-title" className="text-base font-semibold text-primary-container">Informasi Pohon</h3>
                    </div>
                    <dl className="grid grid-cols-1 gap-px bg-outline-variant/60 md:grid-cols-2">
                        <div className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 bg-surface-container-lowest px-4 py-4 sm:px-5 md:flex md:flex-col md:gap-1.5">
                            <dt className="text-sm text-on-surface-variant">No. Pohon</dt>
                            <dd className="min-w-0 break-all font-data-mono text-base font-semibold leading-6 text-primary-container">{pohon.no_pohon ?? '-'}</dd>
                        </div>
                        <div className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 bg-surface-container-lowest px-4 py-4 sm:px-5 md:flex md:flex-col md:gap-1.5">
                            <dt className="text-sm text-on-surface-variant">Barcode</dt>
                            <dd className="min-w-0 break-all font-data-mono text-base font-medium leading-6 text-primary-container">{pohon.no_barcode || '-'}</dd>
                        </div>
                        <div className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 bg-surface-container-lowest px-4 py-4 sm:px-5 md:flex md:flex-col md:gap-1.5">
                            <dt className="text-sm text-on-surface-variant">Nama Kelompok</dt>
                            <dd className="min-w-0 break-words text-base font-medium leading-6 text-primary-container [overflow-wrap:anywhere]">{pohon.kelompok?.nama_kelompok || '-'}</dd>
                        </div>
                        <div className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 bg-surface-container-lowest px-4 py-4 sm:px-5 md:flex md:flex-col md:gap-1.5">
                            <dt className="text-sm text-on-surface-variant">Jenis Pohon</dt>
                            <dd className="min-w-0 break-words text-base font-medium leading-6 text-primary-container [overflow-wrap:anywhere]">{pohon.jenis_pohon?.nama_jenis || '-'}</dd>
                        </div>
                    </dl>
                </section>

                {/* Log List Section */}
                <section className="space-y-3" aria-labelledby="rincian-batang-title">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 id="rincian-batang-title" className="font-headline-md text-headline-md text-primary-container">Rincian Batang (Log)</h3>
                        <span className="text-sm text-on-surface-variant">{pohon.batangs?.length ?? 0} batang</span>
                    </div>
                    
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden hidden md:block">
                        <table className="w-full table-fixed text-left border-collapse">
                            <thead className="bg-surface-container-low text-sm text-on-surface-variant border-b border-outline-variant">
                                <tr>
                                    <th scope="col" className="px-3 py-3 text-center font-semibold">No. Batang</th>
                                    <th scope="col" className="px-3 py-3 text-right font-semibold">Panjang<span className="block text-xs font-normal">m</span></th>
                                    <th scope="col" className="px-3 py-3 text-right font-semibold">Diameter<span className="block text-xs font-normal">cm</span></th>
                                    <th scope="col" className="px-3 py-3 text-right font-semibold">Volume<span className="block text-xs font-normal">m³</span></th>
                                    <th scope="col" className="w-[12%] px-3 py-3 text-center font-semibold">Mutu</th>
                                </tr>
                            </thead>
                            <tbody className="font-data-mono text-data-mono text-primary-container">
                                {pohon.batangs?.map((batang) => (
                                    <tr key={batang.id} className="border-b border-outline-variant/50 last:border-b-0 even:bg-surface-container-low/50 hover:bg-surface-container-low">
                                        <td className="px-3 py-4 text-center font-semibold">{batang.no_batang.toString().padStart(2, '0')}</td>
                                        <td className="px-3 py-4 text-right tabular-nums break-all">{batang.panjang}</td>
                                        <td className="px-3 py-4 text-right tabular-nums break-all">{((parseFloat(batang.diameter_pangkal) + parseFloat(batang.diameter_ujung)) / 2).toFixed(1)}</td>
                                        <td className="px-3 py-4 text-right tabular-nums font-semibold break-all">{batang.volume}</td>
                                        <td className="px-3 py-4 text-center">
                                            <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-primary-container/10 px-2 py-1 font-semibold">{batang.mutu}</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!pohon.batangs || pohon.batangs.length === 0) && (
                                    <tr><td colSpan="5" className="px-4 py-8 text-center font-sans text-sm text-on-surface-variant">Belum ada rincian batang untuk pohon ini.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View for Logs (Cards) */}
                    <div className="md:hidden space-y-3">
                        {pohon.batangs?.map((batang) => (
                            <article key={batang.id} className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                                <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-outline-variant/60 px-4 py-3">
                                    <div className="min-w-0">
                                        <dt className="text-xs text-on-surface-variant">No. Batang</dt>
                                        <dd className="mt-1 font-data-mono text-lg font-bold text-primary-container">{batang.no_batang.toString().padStart(2, '0')}</dd>
                                    </div>
                                    <div className="text-center">
                                        <dt className="text-xs text-on-surface-variant">Mutu</dt>
                                        <dd className="mt-1 inline-flex min-w-8 items-center justify-center rounded-lg bg-primary-container/10 px-2 py-0.5 font-data-mono text-sm font-semibold text-primary-container">{batang.mutu}</dd>
                                    </div>
                                </dl>
                                <dl className="grid grid-cols-3 divide-x divide-outline-variant/60 bg-surface-container-low/50 py-4">
                                    <div className="min-w-0 px-3">
                                        <dt className="text-xs text-on-surface-variant">Panjang <span className="whitespace-nowrap">(m)</span></dt>
                                        <dd className="mt-1.5 font-data-mono text-sm tabular-nums text-primary-container break-all">{batang.panjang}</dd>
                                    </div>
                                    <div className="min-w-0 px-3">
                                        <dt className="text-xs text-on-surface-variant">Diameter <span className="whitespace-nowrap">(cm)</span></dt>
                                        <dd className="mt-1.5 font-data-mono text-sm tabular-nums text-primary-container break-all">{((parseFloat(batang.diameter_pangkal) + parseFloat(batang.diameter_ujung)) / 2).toFixed(1)}</dd>
                                    </div>
                                    <div className="min-w-0 px-3">
                                        <dt className="text-xs text-on-surface-variant">Volume <span className="whitespace-nowrap">(m³)</span></dt>
                                        <dd className="mt-1.5 font-data-mono text-sm font-semibold tabular-nums text-primary-container break-all">{batang.volume ?? '-'}</dd>
                                    </div>
                                </dl>
                            </article>
                        ))}
                        {(!pohon.batangs || pohon.batangs.length === 0) && (
                            <p className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-8 text-center text-sm text-on-surface-variant">Belum ada rincian batang untuk pohon ini.</p>
                        )}
                    </div>
                </section>

                {/* Footer / Action Area */}
                <div className="pt-6 pb-8 md:pb-12">
                    <Link href={route('history')} className="flex items-center justify-center w-full min-h-[48px] bg-[#FB8500] text-white font-headline-md text-base rounded-lg hover:bg-[#FB8500]/90 transition-colors active:scale-[0.98] shadow-sm">
                        Tutup
                    </Link>
                </div>
            </main>
        </div>
    );
}
