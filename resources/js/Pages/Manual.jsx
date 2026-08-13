import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Manual() {
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
        mutu: ''
    });

    useEffect(() => {
        const storedPetak = localStorage.getItem('sesi_petak');
        const storedJenis = localStorage.getItem('sesi_jenis_pohon');
        
        if (!storedPetak || !storedJenis) {
            router.visit(route('dashboard'));
            return;
        }

        setData({ ...data, petak_id: storedPetak, jenis_pohon_id: storedJenis });
    }, []);

    const handleAddBatang = () => {
        if (!data.no_pohon) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan isi Nomor Pohon terlebih dahulu!' });
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
            mutu: ''
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
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan isi Nomor Pohon!' });
            return;
        }
        if (data.batangs.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Tambahkan minimal 1 batang!' });
            return;
        }

        post(route('manual.store'), {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil disimpan!', timer: 2000, showConfirmButton: false });
                setData('no_pohon', '');
                setData('batangs', []);
            },
            onError: (err) => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: err.error || 'Terjadi kesalahan saat menyimpan data.' });
            }
        });
    };
    return (
        <AuthenticatedLayout>
            <Head title="SIPETAK - Input Log Manual" />

            <div className="w-full bg-surface-container-lowest">
                {/* Main Content Canvas */}
                <div className="flex-grow flex flex-col p-margin-mobile md:p-6 max-w-3xl mx-auto w-full gap-6 pb-12">
                    <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col gap-6">
                        {/* Context Header */}
                        <div className="border-b border-outline-variant pb-4 mb-2">
                            <h2 className="font-headline-md text-headline-md-mobile text-primary">Detail Log Baru</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Masukkan pengukuran secara manual. Pastikan akurasi sebelum menyimpan.</p>
                        </div>
                        
                        {/* Form Form */}
                        <form className="flex flex-col gap-6">
                            {/* Nomor Pohon */}
                            <div>
                                <label className="block mb-2 text-[#6D4C41] font-label-caps text-[12px] font-bold tracking-[0.05em] uppercase" htmlFor="nomorPohon">NOMOR POHON</label>
                                <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                                    <input 
                                        className="w-full h-touch-target border border-outline-variant rounded-DEFAULT bg-surface-container-lowest px-4 text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-transparent transition-all" 
                                        id="nomorPohon" 
                                        name="nomorPohon" 
                                        placeholder="e.g. 2023" 
                                        value={data.no_pohon}
                                        onChange={e => setData('no_pohon', e.target.value)}
                                        required 
                                        type="text" 
                                    />
                                </div>
                            </div>

                            {/* Nomor Batang */}
                            <div>
                                <label className="block mb-2 text-[#6D4C41] font-label-caps text-[12px] font-bold tracking-[0.05em] uppercase" htmlFor="nomorBatang">NOMOR BATANG</label>
                                <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                                    <input 
                                        className="w-full h-touch-target border border-outline-variant rounded-DEFAULT bg-surface-container-lowest px-4 text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-transparent transition-all" 
                                        id="nomorBatang" 
                                        name="nomorBatang" 
                                        placeholder="e.g. 99" 
                                        value={tempBatang.no_batang}
                                        onChange={e => setTempBatang({...tempBatang, no_batang: e.target.value})}
                                        required 
                                        type="number" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                            </div>
                            
                            {/* Dimensions Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Panjang */}
                                <div>
                                    <label className="block mb-2 text-[#6D4C41] font-label-caps text-[12px] font-bold tracking-[0.05em] uppercase" htmlFor="panjang">PANJANG (CM)</label>
                                    <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                                        <input 
                                            className="w-full h-touch-target border border-outline-variant rounded-DEFAULT bg-surface-container-lowest px-4 text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-transparent transition-all" 
                                            id="panjang" 
                                            name="panjang" 
                                            placeholder="0.0" 
                                            value={tempBatang.panjang}
                                            onChange={e => setTempBatang({...tempBatang, panjang: e.target.value})}
                                            required 
                                            step="0.1" 
                                            type="number" 
                                            inputMode="decimal"
                                        />
                                    </div>
                                </div>
                                {/* Diameter Ujung */}
                                <div>
                                    <label className="block mb-2 text-[#6D4C41] font-label-caps text-[12px] font-bold tracking-[0.05em] uppercase" htmlFor="diameterUjung">DIAMETER UJUNG (CM)</label>
                                    <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                                        <input 
                                            className="w-full h-touch-target border border-outline-variant rounded-DEFAULT bg-surface-container-lowest px-4 text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-transparent transition-all" 
                                            id="diameterUjung" 
                                            name="diameterUjung" 
                                            placeholder="0.0" 
                                            value={tempBatang.diameter_ujung}
                                            onChange={e => setTempBatang({...tempBatang, diameter_ujung: e.target.value})}
                                            required 
                                            step="0.1" 
                                            type="number" 
                                            inputMode="decimal"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Diameter Pangkal & Mutu Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Diameter Pangkal */}
                                <div>
                                    <label className="block mb-2 text-[#6D4C41] font-label-caps text-[12px] font-bold tracking-[0.05em] uppercase" htmlFor="diameterPangkal">DIAMETER PANGKAL (CM)</label>
                                    <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                                        <input 
                                            className="w-full h-touch-target border border-outline-variant rounded-DEFAULT bg-surface-container-lowest px-4 text-on-surface font-data-mono text-data-mono focus:outline-none focus:border-transparent transition-all" 
                                            id="diameterPangkal" 
                                            name="diameterPangkal" 
                                            placeholder="0.0" 
                                            value={tempBatang.diameter_pangkal}
                                            onChange={e => setTempBatang({...tempBatang, diameter_pangkal: e.target.value})}
                                            required 
                                            step="0.1" 
                                            type="number" 
                                            inputMode="decimal"
                                        />
                                    </div>
                                </div>
                                {/* Mutu Dropdown */}
                                <div>
                                    <label className="block mb-2 text-[#6D4C41] font-label-caps text-[12px] font-bold tracking-[0.05em] uppercase" htmlFor="mutu">MUTU</label>
                                    <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                                        <select 
                                            className="w-full h-touch-target border border-outline-variant rounded-DEFAULT bg-surface-container-lowest px-4 text-on-surface font-body-md text-body-md appearance-none focus:outline-none focus:border-transparent transition-all" 
                                            value={tempBatang.mutu}
                                            onChange={e => setTempBatang({...tempBatang, mutu: e.target.value})}
                                            required
                                        >
                                            <option disabled value="">Pilih Mutu</option>
                                            <option value="P">Grade P (Premium)</option>
                                            <option value="D">Grade D (Defective)</option>
                                            <option value="T">Grade T</option>
                                            <option value="M">Grade M</option>
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Area */}
                            <div className="pt-6 mt-4 border-t border-outline-variant flex justify-end">
                                <button type="button" onClick={handleAddBatang} className="h-touch-target px-8 bg-[#FB8500] text-white font-headline-md text-headline-md-mobile rounded-DEFAULT hover:bg-[#e67a00] active:scale-95 transition-all w-full md:w-auto shadow-sm flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Tambah Batang
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                        <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                                <h3 className="font-headline-md text-headline-md-mobile text-primary">Daftar Batang ({data.batangs.length})</h3>
                            </div>
                            {data.batangs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-outline gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                    <p className="font-body-md">Belum ada data batang yang ditambahkan.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.batangs.map((b, idx) => (
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
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="pb-8">
                            <button 
                                type="button" 
                                onClick={handleSubmit}
                                disabled={processing}
                                className="h-touch-target w-full bg-primary text-white font-headline-md text-headline-md-mobile rounded-DEFAULT hover:bg-[#013d28] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                </svg>
                                {processing ? 'Menyimpan...' : 'Simpan Semua Data'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
