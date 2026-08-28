import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { TrendingUp, TreePine, Activity } from 'lucide-react';

export default function Dashboard({ petaks = [], jenisPohons = [], namaKelompok = 'User Dashboard', prestasiHariIni, prestasiBulanIni }) {
    const user = usePage().props.auth.user;
    const [signalStrength, setSignalStrength] = useState('good'); // 'good', 'fair', 'poor', 'offline'
    const [clickedAction, setClickedAction] = useState(null);
    
    const storedPetak = localStorage.getItem('sesi_petak');
    const defaultPetak = storedPetak ? parseInt(storedPetak) : (petaks.length > 0 ? petaks[0].id : '');

    const storedJenis = localStorage.getItem('sesi_jenis_pohon');
    const defaultJenis = storedJenis ? parseInt(storedJenis) : (jenisPohons.length > 0 ? jenisPohons[0].id : '');

    const { data, setData } = useForm({
        nomor_petak: defaultPetak,
        jenis_pohon: defaultJenis
    });

    const handleActionClick = (e, action) => {
        if (!data.nomor_petak || !data.jenis_pohon) {
            e.preventDefault();
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Silakan pilih Nomor Petak dan Jenis Pohon terlebih dahulu!'
            });
            return;
        }
        setClickedAction(action);
    };

    useEffect(() => {
        const updateNetworkStatus = () => {
            if (!navigator.onLine) {
                setSignalStrength('offline');
                return;
            }
            
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                const type = connection.effectiveType;
                if (type === '4g') {
                    setSignalStrength('good');
                } else if (type === '3g') {
                    setSignalStrength('fair');
                } else if (type === '2g' || type === 'slow-2g') {
                    setSignalStrength('poor');
                } else {
                    setSignalStrength('good');
                }
            } else {
                setSignalStrength('good');
            }
        };

        updateNetworkStatus();

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', updateNetworkStatus);
        }

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
            if (connection) {
                connection.removeEventListener('change', updateNetworkStatus);
            }
        };
    }, []);

    useEffect(() => {
        if (data.nomor_petak) {
            localStorage.setItem('sesi_petak', data.nomor_petak);
        } else {
            localStorage.removeItem('sesi_petak');
        }
    }, [data.nomor_petak]);

    useEffect(() => {
        if (data.jenis_pohon) {
            localStorage.setItem('sesi_jenis_pohon', data.jenis_pohon);
        } else {
            localStorage.removeItem('sesi_jenis_pohon');
        }
    }, [data.jenis_pohon]);

    const petakOptions = petaks.map(p => ({ value: p.id, label: p.no_petak }));
    const jenisPohonOptions = jenisPohons.map(j => ({ value: j.id, label: j.nama_jenis }));

    return (
        <AuthenticatedLayout>
            <Head title="SIPETAK - Dashboard Lapangan" />
            
            {/* Dashboard Header */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-display text-display text-primary">{namaKelompok}</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">{user.name}</p>
                </div>
                <div className="hidden md:flex items-center space-x-3 bg-surface-container rounded-lg px-4 py-2 border border-outline-variant">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#1B4332]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 16.5l-3-3 1.5-1.5 1.5 1.5 4.5-4.5 1.5 1.5-6 6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <span className="font-data-mono text-data-mono text-[#1B4332]">Sistem Online</span>
                </div>
            </div>

            {/* Performance Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                {/* Kinerja Hari Ini */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-4 md:p-6 text-white flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-headline-md text-lg font-bold flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Kinerja Hari Ini
                        </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/20 rounded-lg p-2">
                            <div className="text-2xl font-bold">{prestasiHariIni?.jumlah_pohon || 0}</div>
                            <div className="text-xs font-medium uppercase tracking-wider opacity-90 mt-1">Pohon</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                            <div className="text-2xl font-bold">{prestasiHariIni?.jumlah_batang || 0}</div>
                            <div className="text-xs font-medium uppercase tracking-wider opacity-90 mt-1">Batang</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                            <div className="text-2xl font-bold">{Number(prestasiHariIni?.total_volume || 0).toFixed(2)}</div>
                            <div className="text-xs font-medium uppercase tracking-wider opacity-90 mt-1">Vol (m³)</div>
                        </div>
                    </div>
                </div>

                {/* Kinerja Bulan Ini */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-4 md:p-6 text-white flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-headline-md text-lg font-bold flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Kinerja Bulan Ini
                        </h3>
                        <Link 
                            href={route('prestasi_kerja')} 
                            className="text-xs font-medium bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
                        >
                            Lihat Detail &rarr;
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/20 rounded-lg p-2">
                            <div className="text-2xl font-bold">{prestasiBulanIni?.jumlah_pohon || 0}</div>
                            <div className="text-xs font-medium uppercase tracking-wider opacity-90 mt-1">Pohon</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                            <div className="text-2xl font-bold">{prestasiBulanIni?.jumlah_batang || 0}</div>
                            <div className="text-xs font-medium uppercase tracking-wider opacity-90 mt-1">Batang</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                            <div className="text-2xl font-bold">{Number(prestasiBulanIni?.total_volume || 0).toFixed(2)}</div>
                            <div className="text-xs font-medium uppercase tracking-wider opacity-90 mt-1">Vol (m³)</div>
                        </div>
                    </div>
                    {/* Status Upah */}
                    <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-sm">
                        <span>Upah Lunas: <strong>{prestasiBulanIni?.pohon_lunas || 0} Phn</strong></span>
                        <span>Pending: <strong>{prestasiBulanIni?.pohon_pending || 0} Phn</strong></span>
                    </div>
                </div>
            </div>

            {/* Input Section Card */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-4 md:p-6 mb-6">
                <h2 className="font-headline-md text-headline-md text-secondary mb-4 border-b border-outline-variant pb-2">Parameter Sesi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Nomor Petak Input */}
                    <div className="flex flex-col space-y-2">
                        <label className="font-label-caps text-label-caps text-[#6D4C41]" htmlFor="nomor-petak">Nomor Petak</label>
                        <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                            <Select
                                id="nomor-petak"
                                options={petakOptions}
                                value={petakOptions.find(opt => opt.value === data.nomor_petak)}
                                onChange={opt => setData('nomor_petak', opt ? opt.value : '')}
                                placeholder="Pilih nomor petak..."
                                isClearable
                                className="w-full text-[#1B4332] font-body-lg text-body-lg"
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        minHeight: '48px', // match h-touch-target
                                        borderColor: state.isFocused ? 'transparent' : 'var(--outline-variant)',
                                        boxShadow: state.isFocused ? 'none' : 'none',
                                        backgroundColor: 'var(--surface)',
                                        borderRadius: '0.25rem', // rounded-DEFAULT
                                    })
                                }}
                            />
                        </div>
                    </div>
                    {/* Jenis Pohon Dropdown */}
                    <div className="flex flex-col space-y-2">
                        <label className="font-label-caps text-label-caps text-[#6D4C41]" htmlFor="jenis-pohon">Jenis Pohon</label>
                        <div className="relative focus-within:ring-2 focus-within:ring-[#FB8500] focus-within:ring-offset-2 rounded-DEFAULT">
                            <Select
                                id="jenis-pohon"
                                options={jenisPohonOptions}
                                value={jenisPohonOptions.find(opt => opt.value === data.jenis_pohon)}
                                onChange={opt => setData('jenis_pohon', opt ? opt.value : '')}
                                placeholder="Pilih jenis pohon..."
                                isClearable
                                className="w-full text-[#1B4332] font-body-lg text-body-lg"
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        minHeight: '48px',
                                        borderColor: state.isFocused ? 'transparent' : 'var(--outline-variant)',
                                        boxShadow: state.isFocused ? 'none' : 'none',
                                        backgroundColor: 'var(--surface)',
                                        borderRadius: '0.25rem',
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8">
                {/* Barcode Logging Action */}
                <Link 
                    href={route('barcode')} 
                    onClick={(e) => handleActionClick(e, 'barcode')}
                    className={`h-32 flex flex-col items-center justify-center text-white rounded-xl shadow-md transition-transform focus:outline-none focus:ring-2 focus:ring-[#FB8500] focus:ring-offset-2 ${clickedAction === 'barcode' ? 'bg-[#E07700] opacity-75 pointer-events-none' : 'bg-[#FB8500] hover:bg-[#E07700] active:scale-95'}`}
                >
                    {clickedAction === 'barcode' ? (
                        <svg className="animate-spin w-10 h-10 mb-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                        </svg>
                    )}
                    <span className="font-headline-md text-headline-lg-mobile md:text-headline-md">
                        {clickedAction === 'barcode' ? 'Memproses...' : 'Pohon Berbarcode'}
                    </span>
                </Link>
                {/* Manual Logging Action */}
                <Link 
                    href={route('manual')} 
                    onClick={(e) => handleActionClick(e, 'manual')}
                    className={`h-32 flex flex-col items-center justify-center bg-surface border-2 text-[#FB8500] rounded-xl shadow-sm transition-transform focus:outline-none focus:ring-2 focus:ring-[#FB8500] focus:ring-offset-2 ${clickedAction === 'manual' ? 'border-[#E07700] text-[#E07700] opacity-75 pointer-events-none' : 'border-[#FB8500] hover:bg-surface-container-low active:scale-95'}`}
                >
                    {clickedAction === 'manual' ? (
                        <svg className="animate-spin w-10 h-10 mb-2 text-[#E07700]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    )}
                    <span className="font-headline-md text-headline-lg-mobile md:text-headline-md">
                        {clickedAction === 'manual' ? 'Memproses...' : 'Pohon Non Barcode'}
                    </span>
                </Link>
            </div>

            {/* Recent Scans / Info Card (Decorative/Contextual) */}
            <div className="mt-8 bg-surface-container-low rounded-xl p-4 border border-outline-variant hidden md:block">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Status User</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        {signalStrength === 'offline' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 mr-2 ${signalStrength === 'good' ? 'text-green-600' : signalStrength === 'fair' ? 'text-yellow-500' : signalStrength === 'poor' ? 'text-red-500' : 'text-gray-400'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.522 9.522C8.618 10.426 8 11.642 8 13M14.478 14.478c.904-.904 1.522-2.12 1.522-3.478m4.949-4.95A11.956 11.956 0 0012 3.5a11.956 11.956 0 00-7.949 3.05M21 12c0 2.485-1.006 4.735-2.636 6.364" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 mr-2 ${signalStrength === 'good' ? 'text-green-600' : signalStrength === 'fair' ? 'text-yellow-500' : signalStrength === 'poor' ? 'text-red-500' : 'text-gray-400'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
                            </svg>
                        )}
                        <span className="font-data-mono text-data-mono cursor-pointer select-none">
                            Sinyal: {signalStrength === 'good' ? 'Bagus' : signalStrength === 'fair' ? 'Cukup' : signalStrength === 'poor' ? 'Jelek' : 'Offline'}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${signalStrength === 'offline' ? 'bg-gray-400' : 'bg-[#1B4332]'}`}></span>
                        <span className="font-data-mono text-data-mono">Status: {signalStrength === 'offline' ? 'Offline' : 'Online'}</span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
