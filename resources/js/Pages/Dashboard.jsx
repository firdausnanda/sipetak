import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import Select from 'react-select';
import { useEffect, useState } from 'react';

export default function Dashboard({ petaks = [], jenisPohons = [], namaKelompok = 'User Dashboard' }) {
    const user = usePage().props.auth.user;
    const [signalStrength, setSignalStrength] = useState('good'); // 'good', 'fair', 'poor', 'offline'
    
    const storedPetak = localStorage.getItem('sesi_petak');
    const defaultPetak = storedPetak ? parseInt(storedPetak) : (petaks.length > 0 ? petaks[0].id : '');

    const storedJenis = localStorage.getItem('sesi_jenis_pohon');
    const defaultJenis = storedJenis ? parseInt(storedJenis) : (jenisPohons.length > 0 ? jenisPohons[0].id : '');

    const { data, setData } = useForm({
        nomor_petak: defaultPetak,
        jenis_pohon: defaultJenis
    });

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
                    <span className="material-symbols-outlined text-[#1B4332]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
                    <span className="font-data-mono text-data-mono text-[#1B4332]">Sistem Online</span>
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
                <Link href={route('barcode')} className="h-32 flex flex-col items-center justify-center bg-[#FB8500] hover:bg-[#E07700] text-white rounded-xl shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FB8500] focus:ring-offset-2">
                    <span className="material-symbols-outlined text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>barcode_scanner</span>
                    <span className="font-headline-md text-headline-lg-mobile md:text-headline-md">Pohon Berbarcode</span>
                </Link>
                {/* Manual Logging Action */}
                <Link href={route('manual')} className="h-32 flex flex-col items-center justify-center bg-surface border-2 border-[#FB8500] text-[#FB8500] hover:bg-surface-container-low rounded-xl shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FB8500] focus:ring-offset-2">
                    <span className="material-symbols-outlined text-4xl mb-2">edit_document</span>
                    <span className="font-headline-md text-headline-lg-mobile md:text-headline-md">Pohon Non Barcode</span>
                </Link>
            </div>

            {/* Recent Scans / Info Card (Decorative/Contextual) */}
            <div className="mt-8 bg-surface-container-low rounded-xl p-4 border border-outline-variant hidden md:block">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Status User</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <span className={`material-symbols-outlined mr-2 ${signalStrength === 'good' ? 'text-green-600' : signalStrength === 'fair' ? 'text-yellow-500' : signalStrength === 'poor' ? 'text-red-500' : 'text-gray-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {signalStrength === 'offline' ? 'signal_cellular_off' : 'signal_cellular_alt'}
                        </span>
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
