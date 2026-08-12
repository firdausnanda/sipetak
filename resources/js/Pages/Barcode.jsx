import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Swal from 'sweetalert2';

export default function Barcode() {
    const { data, setData, post, processing } = useForm({
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
        
        if (!storedPetak || !storedJenis) {
            router.visit(route('dashboard'));
            return;
        }

        let initialData = { ...data };
        if (storedPetak) initialData.petak_id = storedPetak;
        if (storedJenis) initialData.jenis_pohon_id = storedJenis;
        
        setData({ ...data, petak_id: storedPetak, jenis_pohon_id: storedJenis });
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

    const handleScan = (result) => {
        if (result && result.length > 0) {
            const code = result[0].rawValue;
            setData('no_pohon', code);
            setIsScanning(false);
            playBeep();
        }
    };

    const handleAddBatang = () => {
        if (!data.no_pohon) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan scan barcode pohon terlebih dahulu!' });
            return;
        }
        if (!tempBatang.no_batang || !tempBatang.panjang || !tempBatang.diameter_pangkal || !tempBatang.diameter_ujung || !tempBatang.mutu) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Lengkapi semua data batang!' });
            return;
        }
        setData('batangs', [...data.batangs, tempBatang]);
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
        
        if (!data.no_pohon) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan scan barcode pohon terlebih dahulu!' });
            return;
        }
        if (data.batangs.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Tambahkan minimal 1 batang!' });
            return;
        }

        post(route('barcode.store'), {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil disimpan!', timer: 2000, showConfirmButton: false });
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
                                <span className="material-symbols-outlined text-3xl">check</span>
                            </div>
                            <p className="text-white font-headline-sm">Barcode Berhasil Dipindai!</p>
                            <p className="text-outline font-data-mono bg-surface/20 px-4 py-2 rounded break-all">{data.no_pohon}</p>
                            <button 
                                type="button"
                                onClick={() => { setIsScanning(true); setData('no_pohon', ''); }}
                                className="mt-4 px-6 py-2 bg-[#FB8500] text-white rounded-full font-label-caps hover:bg-[#e87a00] transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
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
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">No. Pohon</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-container px-3 text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                readOnly 
                                type="text" 
                                value={data.no_pohon || 'Menunggu scan...'} 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-label-caps text-label-caps text-[#6D4C41] mb-1">No. Batang</label>
                            <input 
                                className="h-touch-target border border-outline-variant rounded bg-surface-bright px-3 text-[#1B4332] font-data-mono text-data-mono focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] focus:outline-none" 
                                placeholder="1" 
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
                                className="w-full h-touch-target border-2 border-primary text-primary rounded font-label-caps text-label-caps flex items-center justify-center gap-2 active:bg-surface-container-high transition-colors hover:bg-surface-container-low"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
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
                                            <span className="font-label-caps text-label-caps text-[#6D4C41]">P: {b.panjang}cm | DP: {b.diameter_pangkal}cm | DU: {b.diameter_ujung}cm</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveBatang(idx)}
                                            className="w-10 h-10 flex items-center justify-center text-error hover:bg-error-container rounded-full active:scale-95 transition-transform"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
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
                            className="w-full h-[56px] bg-[#FB8500] text-on-primary rounded shadow-md font-headline-md text-headline-md flex items-center justify-center gap-2 active:bg-[#e87a00] active:shadow-sm transition-all hover:bg-[#e87a00] disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">save</span>
                            {processing ? 'Menyimpan...' : 'Simpan Semua Data'}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
