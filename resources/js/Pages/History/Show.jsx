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
                <section className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
                    <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                        <h3 className="font-headline-md text-base text-primary-container">Informasi Pohon</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-label-caps text-label-caps text-[#6D4C41]">NAMA KELOMPOK</span>
                            <span className="font-body-lg text-body-lg text-[#1B4332]">{pohon.kelompok?.nama_kelompok || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-label-caps text-label-caps text-[#6D4C41]">JENIS POHON</span>
                            <span className="font-body-lg text-body-lg text-[#1B4332]">{pohon.jenis_pohon?.nama_jenis || 'N/A'}</span>
                        </div>
                    </div>
                </section>

                {/* Log List Section */}
                <section className="space-y-4">
                    <h3 className="font-headline-md text-headline-md text-primary-container px-2 border-l-4 border-[#FB8500]">Rincian Batang (Log)</h3>
                    
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-container-low font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">
                                <tr>
                                    <th className="p-4 font-bold">No. Batang</th>
                                    <th className="p-4 font-bold">Panjang (m)</th>
                                    <th className="p-4 font-bold">Diameter (cm)</th>
                                    <th className="p-4 font-bold">Volume (m³)</th>
                                    <th className="p-4 font-bold">Mutu</th>
                                </tr>
                            </thead>
                            <tbody className="font-data-mono text-data-mono text-primary-container">
                                {pohon.batangs?.map((batang, idx) => (
                                    <tr key={batang.id} className={`${idx % 2 === 0 ? 'border-b border-outline-variant/50' : 'bg-surface-container-low/30'} hover:bg-surface-container-highest transition-colors`}>
                                        <td className="p-4">{batang.no_batang.toString().padStart(2, '0')}</td>
                                        <td className="p-4">{batang.panjang}</td>
                                        <td className="p-4">{((parseFloat(batang.diameter_pangkal) + parseFloat(batang.diameter_ujung)) / 2).toFixed(1)}</td>
                                        <td className="p-4">{batang.volume}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high border border-outline font-bold">{batang.mutu}</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!pohon.batangs || pohon.batangs.length === 0) && (
                                    <tr><td colSpan="5" className="p-4 text-center text-on-surface-variant">Tidak ada data batang.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View for Logs (Cards) */}
                    <div className="md:hidden space-y-3">
                        {pohon.batangs?.map((batang) => (
                            <div key={batang.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center border border-outline-variant">
                                        <span className="font-data-mono font-bold text-lg text-primary-container">{batang.no_batang.toString().padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-data-mono text-data-mono text-on-surface">P: {batang.panjang}m | D: {((parseFloat(batang.diameter_pangkal) + parseFloat(batang.diameter_ujung)) / 2).toFixed(1)}cm | V: {batang.volume}m³</span>
                                        <span className="font-label-caps text-[10px] text-on-surface-variant">PANJANG | DIAMETER | VOLUME</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high border border-outline font-bold text-primary-container">{batang.mutu}</span>
                                    <span className="font-label-caps text-[10px] text-on-surface-variant mt-1">MUTU</span>
                                </div>
                            </div>
                        ))}
                        {(!pohon.batangs || pohon.batangs.length === 0) && (
                            <div className="text-center p-4 text-on-surface-variant">Tidak ada data batang.</div>
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
