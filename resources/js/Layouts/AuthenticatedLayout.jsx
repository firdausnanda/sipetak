import { Link, usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="bg-surface text-on-surface antialiased pt-[env(safe-area-inset-top)] pb-24 md:pb-0 h-screen flex flex-col md:flex-row overflow-hidden">
            {/* TopAppBar (Mobile & Web Header) */}
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-touch-target bg-surface dark:bg-inverse-surface border-b border-outline-variant md:hidden">
                <Link href={route('profile.edit')} className="w-12 h-12 flex items-center justify-center text-primary dark:text-inverse-primary hover:bg-surface-container-high rounded-full transition-colors">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                </Link>
                <div className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-primary-fixed truncate px-2">
                    SIPETAK
                </div>
                <button onClick={() => router.reload()} className="w-12 h-12 flex items-center justify-center text-primary dark:text-inverse-primary hover:bg-surface-container-high rounded-full transition-colors">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                </button>
            </header>

            {/* Navigation Drawer (Desktop) */}
            <aside className="hidden md:flex flex-col h-full w-80 rounded-r-xl border-r border-outline-variant shadow-lg bg-surface-container-low dark:bg-inverse-surface fixed inset-y-0 left-0 z-[60]">
                <div className="p-6 border-b border-outline-variant flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-md text-headline-md">
                        {user.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">{user.name}</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">ID: #{user.id}</p>
                        <div className="flex items-center mt-1">
                            <span className="w-2 h-2 rounded-full bg-[#1B4332] mr-2"></span>
                            <span className="font-label-caps text-label-caps text-[#1B4332]">Online</span>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 py-4 overflow-y-auto">
                    <Link href={route('dashboard')} className={`flex items-center space-x-3 ${route().current('dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high'} rounded-full mx-2 px-4 py-3 transition-colors duration-200`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span className="font-body-md text-body-md">Dashboard</span>
                    </Link>
                    <Link href={route('barcode')} className={`flex items-center space-x-3 ${route().current('barcode') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high'} mx-2 px-4 py-3 rounded-full transition-colors duration-200`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>barcode_scanner</span>
                        <span className="font-body-md text-body-md">Barcode</span>
                    </Link>
                    <Link href={route('manual')} className={`flex items-center space-x-3 ${route().current('manual') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high'} mx-2 px-4 py-3 rounded-full transition-colors duration-200`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
                        <span className="font-body-md text-body-md">Manual</span>
                    </Link>
                    <Link href={route('history')} className={`flex items-center space-x-3 ${route().current('history') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high'} mx-2 px-4 py-3 rounded-full transition-colors duration-200`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                        <span className="font-body-md text-body-md">Riwayat</span>
                    </Link>
                </nav>
                
                <div className="p-4 border-t border-outline-variant flex">
                    <Link href={route('logout')} method="post" as="button" className="w-full flex items-center space-x-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high px-4 py-3 rounded-full transition-colors duration-200">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
                        <span className="font-body-md text-body-md">Keluar</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="flex-1 mt-touch-target md:mt-0 md:ml-80 overflow-y-auto p-margin-mobile md:p-container-padding bg-background h-full">
                {children}
            </main>

            {/* BottomNavBar (Mobile Only) */}
            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface dark:bg-inverse-surface pb-[env(safe-area-inset-bottom)] h-16 border-t border-outline-variant md:hidden">
                <Link href={route('dashboard')} className={`flex flex-col items-center justify-center ${route().current('dashboard') ? 'bg-primary-container text-on-primary-container rounded-full scale-100' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low rounded-lg'} px-4 py-1 duration-100 transition-all`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="font-label-caps text-label-caps mt-1">Dashboard</span>
                </Link>
                <Link href={route('barcode')} className={`flex flex-col items-center justify-center ${route().current('barcode') ? 'bg-primary-container text-on-primary-container rounded-full scale-100' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low rounded-lg'} px-4 py-1 transition-all`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>barcode_scanner</span>
                    <span className="font-label-caps text-label-caps mt-1">Barcode</span>
                </Link>
                <Link href={route('manual')} className={`flex flex-col items-center justify-center ${route().current('manual') ? 'bg-primary-container text-on-primary-container rounded-full scale-100' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low rounded-lg'} px-4 py-1 transition-all`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
                    <span className="font-label-caps text-label-caps mt-1">Manual</span>
                </Link>
                <Link href={route('history')} className={`flex flex-col items-center justify-center ${route().current('history') ? 'bg-primary-container text-on-primary-container rounded-full scale-100' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low rounded-lg'} px-4 py-1 transition-all`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                    <span className="font-label-caps text-label-caps mt-1">Riwayat</span>
                </Link>
            </nav>
        </div>
    );
}
