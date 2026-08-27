import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Swal from 'sweetalert2';

export default function Barcode() {
    const { data, setData, post, processing } = useForm({
        no_barcode: '',
        no_pohon: '',
        petak_id: '',
        jenis_pohon_id: '',
        batangs: []
    });
    
    const [tempBatang, setTempBatang] = useState({
        no_batang: '',
        panjang: '',
        diameter_pangkal: '',
        diameter_ujung: '',
        mutu: 'P'
    });
    
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        // Read session parameters from local storage
        const storedPetak = localStorage.getItem('sesi_petak');
        const storedJenis = localStorage.getItem('sesi_jenis_pohon');
        
        const p = parseInt(storedPetak);
        const j = parseInt(storedJenis);

        if (!p || !j || isNaN(p) || isNaN(j)) {
            Swal.fire({
                icon: 'warning',
                title: 'Sesi Tidak Valid',
                text: 'Silakan pilih Nomor Petak dan Jenis Pohon terlebih dahulu di Dashboard.',
                timer: 2500,
                showConfirmButton: false
            }).then(() => {
                router.visit(route('dashboard'));
            });
            return;
        }

        let initialData = { ...data };
        if (p) initialData.petak_id = p;
        if (j) initialData.jenis_pohon_id = j;
        
        setData({ ...data, petak_id: p, jenis_pohon_id: j });
    }, []);

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gainNode.gain.setValueAtTime(1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
            console.error('AudioContext not supported', e);
        }
    };

    const handleScan = async (result) => {
        if (result && result.length > 0) {
            const code = result[0].rawValue;
            setData('no_barcode', code);
            setIsScanning(false);
            playBeep();

            try {
                const response = await window.axios.get(route('api.rencana_tebang.check_barcode', { barcode: code }));
                if (response.data.found) {
                    const foundData = response.data.data;
                    setData(data => ({
                        ...data,
                        no_barcode: code,
                        no_pohon: foundData.no_pohon,
                    }));

                    // Check if already exist
                    const p = parseInt(localStorage.getItem('sesi_petak'));
                    const checkResp = await window.axios.get(route('api.pohon.check', { no_pohon: foundData.no_pohon, petak_id: p }));
                    if (checkResp.data.exists) {
                        Swal.fire({ 
                            icon: 'error', 
                            title: 'Perhatian', 
                            text: checkResp.data.diangkut ? 'Pohon sudah diangkut!' : 'Pohon sudah ditebang!',
                        });
                        return;
                    }

                    Swal.fire({ 
                        icon: 'info', 
                        title: 'Data Ditemukan', 
                        text: `No Pohon ${foundData.no_pohon} otomatis diisi dari Rencana Tebang.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            } catch (error) {
                console.error("Gagal memeriksa barcode:", error);
            }
        }
    };

    const handleAddBatang = async () => {
        if (!data.no_barcode) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan scan barcode terlebih dahulu!' });
            return;
        }
        if (!data.no_pohon) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan isi No. Pohon terlebih dahulu!' });
            return;
        }
        if (!tempBatang.no_batang || !tempBatang.panjang || !tempBatang.diameter_pangkal || !tempBatang.diameter_ujung || !tempBatang.mutu) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Lengkapi semua data batang!' });
            return;
        }

        try {
            const p = parseInt(localStorage.getItem('sesi_petak'));
            const checkResp = await window.axios.get(route('api.pohon.check', { no_pohon: data.no_pohon, petak_id: p }));
            if (checkResp.data.exists) {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Perhatian', 
                    text: checkResp.data.diangkut ? 'Pohon sudah diangkut!' : 'Pohon sudah ditebang!',
                });
                return;
            }
        } catch (error) {
            console.error("Gagal memeriksa status pohon:", error);
        }

        let calculatedVolume = 0;
        try {
            const j = parseInt(localStorage.getItem('sesi_jenis_pohon'));
            const volResp = await window.axios.get(route('api.volume.calculate', {
                jenis_pohon_id: j,
                panjang: tempBatang.panjang,
                diameter_pangkal: tempBatang.diameter_pangkal,
                diameter_ujung: tempBatang.diameter_ujung
            }));
            calculatedVolume = volResp.data.volume;
        } catch (error) {
            console.error("Gagal menghitung volume:", error);
        }

        setData('batangs', [...data.batangs, { ...tempBatang, volume: calculatedVolume }]);
        setTempBatang({
            no_batang: '',
            panjang: '',
            diameter_pangkal: '',
            diameter_ujung: '',
            mutu: 'P'
        });
    };

    const handleRemoveBatang = (index) => {
        const newBatangs = [...data.batangs];
        newBatangs.splice(index, 1);
        setData('batangs', newBatangs);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.petak_id || !data.jenis_pohon_id || isNaN(data.petak_id) || isNaN(data.jenis_pohon_id)) {
            Swal.fire({ icon: 'error', title: 'Sesi Tidak Valid', text: 'Parameter sesi tidak valid. Silakan kembali ke Dashboard untuk mengatur ulang.' });
            return;
        }

        if (!data.no_barcode) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan scan barcode terlebih dahulu!' });
            return;
        }
        if (!data.no_pohon) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan isi No. Pohon terlebih dahulu!' });
            return;
        }
        if (data.batangs.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Tambahkan minimal 1 batang!' });
            return;
        }

        post(route('barcode.store'), {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil disimpan!', timer: 2000, showConfirmButton: false });
                setData('no_barcode', '');
                setData('no_pohon', '');
                setData('batangs', []);
                setIsScanning(true);
            },
            onError: (err) => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: err.error || 'Terjadi kesalahan saat menyimpan data.' });
            }
        });
    };
    return (
        <AuthenticatedLayout>
            <Head title="SIPETAK - Form Pohon Berbarcode" />

            <div className="w-full bg-surface-container-lowest pb-12">
                {/* Scanner Viewfinder */}
                <div className="relative w-full bg-inverse-surface overflow-hidden flex flex-col items-center justify-center rounded-b-xl md:rounded-xl min-h-[250px] md:min-h-[350px]">
                    {isScanning ? (
                        <Scanner 
                            onScan={handleScan}
                            formats={['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']}
                            components={{
                                audio: false // We use our own beep
                            }}
                            styles={{
                                container: { width: '100%', height: '100%', minHeight: '250px' }
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 h-full text-center space-y-4">
                            <div className="w-16 h-16 bg-[#1B4332] rounded-full flex items-center justify-center text-white mb-2 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                            <p className="text-white font-headline-sm">Barcode Berhasil Dipindai!</p>
                            <p className="text-outline font-data-mono bg-surface/20 px-4 py-2 rounded break-all">{data.no_barcode}</p>
                            <button 
                                type="button"
                                onClick={() => { setIsScanning(true); setData('no_barcode', ''); }}
                                disabled={processing}
                                className={`mt-4 px-6 py-2 bg-[#FB8500] text-white rounded-full font-label-caps transition-colors flex items-center gap-2 ${processing ? 'opacity-50 pointer-events-none' : 'hover:bg-[#e87a00]'}`}
                            >
                                {processing ? (
                                    <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                                    </svg>
                                )}
                                Scan Ulang
                            </button>
                        </div>
                    )}
                </div>

                {/* Form Section */}
                <div className="p-margin-mobile md:p-6 space-y-4 max-w-4xl mx-auto">
                    {/* Global Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">No. Barcode</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-container px-3 text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                readOnly 
                                type="text" 
                                value={data.no_barcode || 'Menunggu scan...'} 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">No. Pohon</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-bright px-3 text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                placeholder="e.g. 12" 
                                type="number" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={data.no_pohon}
                                onChange={e => setData('no_pohon', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">No. Batang</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-bright px-3 text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                placeholder="e.g. 239" 
                                type="number" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={tempBatang.no_batang}
                                onChange={e => setTempBatang({...tempBatang, no_batang: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    {/* Dimensions */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">Panjang (cm)</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-bright px-2 text-center text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                placeholder="0" 
                                type="number" 
                                inputMode="decimal"
                                value={tempBatang.panjang}
                                onChange={e => setTempBatang({...tempBatang, panjang: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">D. Pangkal</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-bright px-2 text-center text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                placeholder="0" 
                                type="number" 
                                inputMode="decimal"
                                value={tempBatang.diameter_pangkal}
                                onChange={e => setTempBatang({...tempBatang, diameter_pangkal: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">D. Ujung</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-bright px-2 text-center text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                placeholder="0" 
                                type="number" 
                                inputMode="decimal"
                                value={tempBatang.diameter_ujung}
                                onChange={e => setTempBatang({...tempBatang, diameter_ujung: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    {/* Quality & Action */}
                    <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4 flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">Mutu</label>
                            <select 
                                className="h-touch-target border border-outline-variant rounded bg-surface-bright px-2 text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none"
                                value={tempBatang.mutu}
                                onChange={e => setTempBatang({...tempBatang, mutu: e.target.value})}
                            >
                                <option value="P">P</option>
                                <option value="D">D</option>
                                <option value="T">T</option>
                                <option value="M">M</option>
                            </select>
                        </div>
                        <div className="col-span-8">
                            <button 
                                type="button" 
                                onClick={handleAddBatang}
                                disabled={processing}
                                className={`w-full h-touch-target border-2 border-primary text-primary rounded font-label-caps text-label-caps flex items-center justify-center gap-2 transition-colors ${processing ? 'opacity-50 pointer-events-none' : 'active:bg-surface-container-high hover:bg-surface-container-low'}`}
                            >
                                {processing ? (
                                    <svg className="animate-spin w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                )}
                                Tambah Batang
                            </button>
                        </div>
                    </div>
                    
                    {/* Batang List */}
                    <div className="mt-6 border-t border-outline-variant pt-4">
                        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Daftar Batang ({data.batangs.length})</h3>
                        <div className="space-y-2">
                            {data.batangs.length === 0 ? (
                                <p className="text-center text-on-surface-variant py-4 font-data-mono">Belum ada batang ditambahkan.</p>
                            ) : (
                                data.batangs.map((b, idx) => (
                                    <div key={idx} className="border border-outline-variant rounded bg-surface p-3 flex justify-between items-center shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="font-data-mono text-data-mono text-[#1B4332] font-bold">Batang {b.no_batang} <span className="text-surface-tint">| Mutu {b.mutu}</span></span>
                                            <span className="font-label-caps text-label-caps text-[#6D4C41]">P: {b.panjang}cm | DP: {b.diameter_pangkal}cm | DU: {b.diameter_ujung}cm | Vol: {b.volume} m³</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveBatang(idx)}
                                            disabled={processing}
                                            className={`w-10 h-10 flex items-center justify-center text-error rounded-full transition-transform ${processing ? 'opacity-50 pointer-events-none' : 'hover:bg-error-container active:scale-95'}`}
                                        >
                                            {processing ? (
                                                <svg className="animate-spin w-6 h-6 text-error" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    {/* Save Action */}
                    <div className="mt-8 pb-4">
                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            disabled={processing}
                            className={`w-full h-[56px] bg-[#FB8500] text-on-primary rounded shadow-md font-headline-md text-headline-md flex items-center justify-center gap-2 transition-all ${processing ? 'opacity-50 pointer-events-none' : 'active:bg-[#e87a00] active:shadow-sm hover:bg-[#e87a00]'}`}
                        >
                            {processing ? (
                                <svg className="animate-spin w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            )}
                            {processing ? 'Menyimpan...' : 'Simpan Semua Data'}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
