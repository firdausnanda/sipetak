import { Link } from '@inertiajs/react';

export default function MonitoringLayout({ children, user }) {
    return (
        <div className="min-h-screen bg-background text-on-background">
            <header className="border-b border-outline-variant bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
                    <div className="flex items-center gap-3"><img src="/img/favicon/android-chrome-512x512.png" alt="SIPETAK" className="h-10 w-10 object-contain" /><div><p className="font-display text-lg font-bold leading-tight text-primary">SIPETAK</p><p className="text-xs text-on-surface-variant">Monitoring operasional</p></div></div>
                    <div className="flex items-center gap-3"><span className="hidden text-sm text-on-surface-variant sm:inline">{user?.name}</span><Link href={route('logout')} method="post" as="button" className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container-low">
                        Keluar
                    </Link></div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
        </div>
    );
}
