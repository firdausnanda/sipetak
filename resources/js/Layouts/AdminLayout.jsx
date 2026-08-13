import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminLayout({ children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="bg-background text-on-background font-body-md h-screen flex overflow-hidden w-full">
            {/* SideNavBar */}
            <aside className="w-64 flex-shrink-0 h-full flex flex-col p-base gap-base z-40 bg-surface-container border-r border-outline-variant hidden md:flex">
                <div className="px-base py-4 flex items-center gap-3 border-b border-outline-variant pb-6 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                        <span className="material-symbols-outlined">forest</span>
                    </div>
                    <div>
                        <h1 className="font-headline-md text-headline-md font-bold text-primary">SIPETAK</h1>
                        <p className="font-label-caps text-label-caps text-on-surface-variant">Admin Panel</p>
                    </div>
                </div>
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    <Link
                        href={route('admin.dashboard')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                        Laporan
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        Manajemen Pengguna
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
                        Pengaturan
                    </Link>
                </nav>
                <div className="mt-auto pt-4">
                    <button className="w-full flex items-center justify-center gap-2 bg-[#FB8500] text-white py-3 rounded-lg font-bold min-h-[48px] hover:bg-opacity-90 active:scale-95 transition-all mb-4">
                        <span className="material-symbols-outlined">download</span>
                        Ekspor Data
                    </button>
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
                <div className="px-base py-4 flex items-center gap-3 border-b border-outline-variant pb-6 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                        <span className="material-symbols-outlined">forest</span>
                    </div>
                    <div>
                        <h1 className="font-headline-md text-headline-md font-bold text-primary">SIPETAK</h1>
                        <p className="font-label-caps text-label-caps text-on-surface-variant">Management System</p>
                    </div>
                </div>
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    <Link
                        href={route('admin.dashboard')}
                        className={`flex items-center gap-3 px-4 py-3 ${route().current('admin.dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                        Laporan
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        Manajemen Pengguna
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 duration-150 ease-in-out font-label-caps text-label-caps"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
                        Pengaturan
                    </Link>
                </nav>
                <div className="mt-auto pt-4">
                    <button className="w-full flex items-center justify-center gap-2 bg-[#FB8500] text-white py-3 rounded-lg font-bold min-h-[48px] hover:bg-opacity-90 active:scale-95 transition-all mb-4">
                        <span className="material-symbols-outlined">download</span>
                        Ekspor Data
                    </button>
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
            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                {/* TopNavBar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 bg-surface border-b border-outline-variant min-h-[72px]">
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
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-primary text-on-primary font-bold ml-2">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-margin-desktop bg-background w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
