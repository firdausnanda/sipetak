import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
