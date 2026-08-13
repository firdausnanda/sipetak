import { Link, usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="bg-surface text-on-surface antialiased pt-[env(safe-area-inset-top)] pb-24 md:pb-0 h-screen flex flex-col md:flex-row overflow-hidden">
            {/* TopAppBar (Mobile & Web Header) */}
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-touch-target bg-surface dark:bg-inverse-surface border-b border-outline-variant md:hidden">
                <Link href={route('profile.edit')} className="w-12 h-12 flex items-center justify-center text-primary dark:text-inverse-primary hover:bg-surface-container-high rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </Link>
                <div className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-primary-fixed truncate px-2">
                    SIPETAK
                </div>
                <button onClick={() => router.reload()} className="w-12 h-12 flex items-center justify-center text-primary dark:text-inverse-primary hover:bg-surface-container-high rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                        </svg>
                        <span className="font-body-md text-body-md">Dashboard</span>
                    </Link>
                    <Link href={route('barcode')} className={`flex items-center space-x-3 ${route().current('barcode') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high'} mx-2 px-4 py-3 rounded-full transition-colors duration-200`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                        </svg>
                        <span className="font-body-md text-body-md">Barcode</span>
                    </Link>
                    <Link href={route('manual')} className={`flex items-center space-x-3 ${route().current('manual') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high'} mx-2 px-4 py-3 rounded-full transition-colors duration-200`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <span className="font-body-md text-body-md">Manual</span>
                    </Link>
                    <Link href={route('history')} className={`flex items-center space-x-3 ${route().current('history') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high'} mx-2 px-4 py-3 rounded-full transition-colors duration-200`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="font-body-md text-body-md">Riwayat</span>
                    </Link>
                </nav>
                
                <div className="p-4 border-t border-outline-variant flex">
                    <Link href={route('logout')} method="post" as="button" className="w-full flex items-center space-x-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high px-4 py-3 rounded-full transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                    <span className="font-label-caps text-label-caps mt-1">Dashboard</span>
                </Link>
                <Link href={route('barcode')} className={`flex flex-col items-center justify-center ${route().current('barcode') ? 'bg-primary-container text-on-primary-container rounded-full scale-100' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low rounded-lg'} px-4 py-1 transition-all`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                    </svg>
                    <span className="font-label-caps text-label-caps mt-1">Barcode</span>
                </Link>
                <Link href={route('manual')} className={`flex flex-col items-center justify-center ${route().current('manual') ? 'bg-primary-container text-on-primary-container rounded-full scale-100' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low rounded-lg'} px-4 py-1 transition-all`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span className="font-label-caps text-label-caps mt-1">Manual</span>
                </Link>
                <Link href={route('history')} className={`flex flex-col items-center justify-center ${route().current('history') ? 'bg-primary-container text-on-primary-container rounded-full scale-100' : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low rounded-lg'} px-4 py-1 transition-all`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="font-label-caps text-label-caps mt-1">Riwayat</span>
                </Link>
            </nav>
        </div>
    );
}
