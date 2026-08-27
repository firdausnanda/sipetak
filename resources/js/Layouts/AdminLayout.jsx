import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Dropdown from '@/Components/Dropdown';
import Swal from 'sweetalert2';

export default function AdminLayout({ children }) {
    const { auth, flash, errors } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({ icon: 'success', title: 'Berhasil', text: flash.success, timer: 3000, showConfirmButton: false });
        }
        if (flash?.error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: flash.error });
        }
        if (errors?.error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: errors.error });
        }
    }, [flash, errors]);

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isMasterOpen, setIsMasterOpen] = useState(
        route().current('admin.pohons.*') || route().current('admin.petaks.*') || route().current('admin.penerbits.*') || route().current('admin.tujuan_bongkars.*') || route().current('admin.rencana_tebangs.*') || route().current('admin.tabel_volumes.*')
    );
    const [isPengaturanOpen, setIsPengaturanOpen] = useState(
        route().current('admin.activity-log.*')
    );

    return (
        <div className="bg-background text-on-background font-body-md h-screen flex overflow-hidden w-full print:h-auto print:overflow-visible">
            {/* SideNavBar */}
            <aside className="w-64 flex-shrink-0 h-full flex flex-col p-base gap-base z-40 bg-surface-container border-r border-outline-variant hidden md:flex print:hidden">
                <div className="px-base py-4 flex flex-col items-center justify-center border-b border-outline-variant pb-6 mb-2">
                    <img src="/img/logo.webp" alt="SIPETAK" className="h-10 w-auto object-contain" />
                    <p className="text-[10px] leading-tight text-on-surface-variant font-semibold text-center mt-2 uppercase tracking-wider">Sistem Informasi Penebangan<br/>dan Taksasi Kayu</p>
                </div>
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    <Link
                        href={route('admin.dashboard')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                        Laporan
                    </Link>
                    {user.permissions?.includes('view_felling_progress') && (
                        <Link
                            href={route('mobile.dashboard')}
                            className={`flex items-center gap-3 px-4 py-3 ${route().current('mobile.dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                            Monitoring Operasional
                        </Link>
                    )}
                    <Link
                        href={route('operations.index')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('operations.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>request_quote</span>
                        Prestasi Kerja
                    </Link>
                    {(user.roles?.includes('admin_cdk') || user.roles?.includes('ganis')) && (
                        <Link
                            href={route('admin.dokumen_angkutans.index')}
                            className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.dokumen_angkutans.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                            Dokumen Angkutan
                        </Link>
                    )}
                    {(user.roles?.includes('admin_cdk') || user.roles?.includes('ganis') || user.roles?.includes('admin_kelompok')) && (
                        <Link
                            href={route('admin.lampiran_skshhk.index')}
                            className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.lampiran_skshhk.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>attachment</span>
                            Lampiran SKSHHK
                        </Link>
                    )}
                    
                    <div className="px-4 py-2 w-full">
                        <div className="h-[1px] w-full bg-outline-variant rounded-full"></div>
                    </div>

                    <Link
                        href={route('admin.users.index')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.users.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        Manajemen Pengguna
                    </Link>
                    {user.roles?.includes('admin_cdk') && (
                        <div className="flex flex-col">
                            <button
                                onClick={() => setIsMasterOpen(!isMasterOpen)}
                                className="flex items-center justify-between px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
                                    Master
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-200 ${isMasterOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            
                            <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${isMasterOpen ? 'max-h-[32rem] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                <Link
                                    href={route('admin.pohons.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.pohons.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">park</span>
                                    Pohon
                                </Link>
                                <Link
                                    href={route('admin.petaks.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.petaks.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">map</span>
                                    Petak
                                </Link>
                                <Link
                                    href={route('admin.penerbits.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.penerbits.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">business</span>
                                    Tenaga Teknis
                                </Link>
                                <Link
                                    href={route('admin.tujuan_bongkars.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.tujuan_bongkars.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    Tujuan Bongkar
                                </Link>
                                <Link
                                    href={route('admin.rencana_tebangs.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.rencana_tebangs.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">list_alt</span>
                                    Rencana Tebang
                                </Link>
                                <Link
                                    href={route('admin.tabel_volumes.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.tabel_volumes.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">grid_on</span>
                                    Tabel Volume
                                </Link>
                            </div>
                        </div>
                    )}
                    {user.roles?.includes('admin_cdk') && (
                        <div className="flex flex-col">
                            <button
                                onClick={() => setIsPengaturanOpen(!isPengaturanOpen)}
                                className="flex items-center justify-between px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
                                    Pengaturan
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-200 ${isPengaturanOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            
                            <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${isPengaturanOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                <Link
                                    href={route('admin.activity-log.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.activity-log.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">history</span>
                                    Log Aktivitas
                                </Link>
                                <a
                                    href="/admin/error-log"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-2 ml-4 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                                >
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    Error Log
                                </a>
                            </div>
                        </div>
                    )}
                </nav>
                <div className="mt-auto pt-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay (if showingNavigationDropdown) */}
            {showingNavigationDropdown && (
                <div className="md:hidden fixed inset-0 z-40 bg-on-background/50" onClick={() => setShowingNavigationDropdown(false)}></div>
            )}
            
            {/* Mobile Sidebar Content */}
            <aside className={`md:hidden fixed left-0 top-0 h-full flex flex-col p-base gap-base z-50 bg-surface-container border-r border-outline-variant w-64 transform transition-transform duration-300 ease-in-out ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-base py-4 flex flex-col items-center justify-center border-b border-outline-variant pb-6 mb-2">
                    <img src="/img/logo.webp" alt="SIPETAK" className="h-8 w-auto object-contain" />
                    <p className="text-[10px] leading-tight text-on-surface-variant font-semibold text-center mt-2 uppercase tracking-wider">Sistem Informasi Penebangan<br/>dan Taksasi Kayu</p>
                </div>
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    <Link
                        href={route('admin.dashboard')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                        Laporan
                    </Link>
                    {user.permissions?.includes('view_felling_progress') && (
                        <Link
                            href={route('mobile.dashboard')}
                            className={`flex items-center gap-3 px-4 py-3 ${route().current('mobile.dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                            Monitoring Operasional
                        </Link>
                    )}
                    <Link
                        href={route('operations.index')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('operations.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>request_quote</span>
                        Prestasi Kerja
                    </Link>
                    {(user.roles?.includes('admin_cdk') || user.roles?.includes('ganis')) && (
                        <Link
                            href={route('admin.dokumen_angkutans.index')}
                            className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.dokumen_angkutans.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                            Dokumen Angkutan
                        </Link>
                    )}
                    {(user.roles?.includes('admin_cdk') || user.roles?.includes('ganis') || user.roles?.includes('admin_kelompok')) && (
                        <Link
                            href={route('admin.lampiran_skshhk.index')}
                            className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.lampiran_skshhk.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>attachment</span>
                            Lampiran SKSHHK
                        </Link>
                    )}
                    
                    <div className="px-4 py-2 w-full">
                        <div className="h-[1px] w-full bg-outline-variant rounded-full"></div>
                    </div>

                    <Link
                        href={route('admin.users.index')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.users.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        Manajemen Pengguna
                    </Link>
                    {user.roles?.includes('admin_cdk') && (
                        <div className="flex flex-col">
                            <button
                                onClick={() => setIsMasterOpen(!isMasterOpen)}
                                className="flex items-center justify-between px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
                                    Master
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-200 ${isMasterOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            
                            <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${isMasterOpen ? 'max-h-[32rem] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                <Link
                                    href={route('admin.pohons.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.pohons.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">park</span>
                                    Pohon
                                </Link>
                                <Link
                                    href={route('admin.petaks.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.petaks.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">map</span>
                                    Petak
                                </Link>
                                <Link
                                    href={route('admin.penerbits.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.penerbits.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">business</span>
                                    Tenaga Teknis
                                </Link>
                                <Link
                                    href={route('admin.tujuan_bongkars.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.tujuan_bongkars.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    Tujuan Bongkar
                                </Link>
                                <Link
                                    href={route('admin.rencana_tebangs.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.rencana_tebangs.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">list_alt</span>
                                    Rencana Tebang
                                </Link>
                                <Link
                                    href={route('admin.tabel_volumes.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.tabel_volumes.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">grid_on</span>
                                    Tabel Volume
                                </Link>
                            </div>
                        </div>
                    )}
                    {user.roles?.includes('admin_cdk') && (
                        <div className="flex flex-col">
                            <button
                                onClick={() => setIsPengaturanOpen(!isPengaturanOpen)}
                                className="flex items-center justify-between px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
                                    Pengaturan
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-200 ${isPengaturanOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            
                            <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${isPengaturanOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                <Link
                                    href={route('admin.activity-log.index')}
                                    className={`flex items-center gap-3 px-4 py-2 ml-4 ${route().current('admin.activity-log.*') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                                >
                                    <span className="material-symbols-outlined text-sm">history</span>
                                    Log Aktivitas
                                </Link>
                                <a
                                    href="/admin/error-log"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-2 ml-4 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                                >
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    Error Log
                                </a>
                            </div>
                        </div>
                    )}
                </nav>
                <div className="mt-auto pt-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 print:h-auto print:overflow-visible">
                {/* TopNavBar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 bg-surface border-b border-outline-variant min-h-[72px] print:hidden">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="md:hidden w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="font-headline-md text-headline-md font-bold text-primary md:hidden">SIPETAK Admin</div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <button className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-80 rounded-full hidden lg:flex">
                            <span className="material-symbols-outlined">sync</span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-80 rounded-full relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                        </button>
                        <div className="ml-2 relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-primary text-on-primary font-bold transition duration-150 ease-in-out hover:opacity-80 focus:outline-none">
                                        {user.name.charAt(0)}
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Logout
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-margin-desktop bg-background w-full print:w-full print:p-0 print:overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
}
