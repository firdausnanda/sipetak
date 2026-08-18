import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const isAdmin = auth.user.roles && auth.user.roles.some(role => ['admin_cdk', 'admin_kelompok', 'ganis'].includes(role));
    
    const Layout = isAdmin ? AdminLayout : AuthenticatedLayout;

    return (
        <Layout>
            <Head title="SIPETAK - Profil" />

            <div className="py-1 bg-surface-container-lowest">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8 pb-16 md:pb-0">
                    <div className="bg-surface border border-outline-variant p-4 shadow-sm sm:rounded-xl sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-surface border border-outline-variant p-4 shadow-sm sm:rounded-xl sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-surface border border-outline-variant p-4 shadow-sm sm:rounded-xl sm:p-8">
                        <section className="space-y-6 max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-on-surface">Logout</h2>
                                <p className="mt-1 text-sm text-on-surface-variant">
                                    Keluar dari sesi akun Anda saat ini.
                                </p>
                            </header>
                            
                            <Link 
                                href={route('logout')} 
                                method="post" 
                                as="button" 
                                className="inline-flex items-center px-4 py-2 bg-error border border-transparent rounded-md font-semibold text-xs text-on-error uppercase tracking-widest hover:bg-error/90 focus:bg-error/90 active:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
                                Log Out
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
