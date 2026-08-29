import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function Index({ backups }) {
    const [isBackingUp, setIsBackingUp] = useState(false);
    
    const { post } = useForm();

    const handleBackup = () => {
        setIsBackingUp(true);
        post(route('admin.backup.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsBackingUp(false);
            },
            onError: () => {
                setIsBackingUp(false);
            }
        });
    };

    const handleDownload = (filePath) => {
        window.location.href = route('admin.backup.download', { file_path: filePath });
    };

    const handleDelete = (filePath) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda tidak akan dapat mengembalikan file backup ini!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.backup.destroy', { file_path: filePath }), {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Backup Database" />

            <div className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
                <main className="p-4 md:p-base lg:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="font-title-lg text-on-background">Backup Database</h1>
                            <p className="text-on-surface-variant font-body-md">Kelola file backup database Anda (disimpan di Google Drive).</p>
                        </div>
                        
                        <button
                            onClick={handleBackup}
                            disabled={isBackingUp}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-large active:scale-95 duration-150 ease-in-out ${isBackingUp ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                        >
                            {isBackingUp ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                                    Backup Sekarang
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-highest border-b border-outline-variant">
                                        <th className="p-4 font-label-large text-on-surface-variant">Nama File</th>
                                        <th className="p-4 font-label-large text-on-surface-variant">Ukuran</th>
                                        <th className="p-4 font-label-large text-on-surface-variant">Tanggal Dibuat</th>
                                        <th className="p-4 font-label-large text-on-surface-variant text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backups && backups.length > 0 ? (
                                        backups.map((backup, index) => (
                                            <tr key={index} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-high transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>folder_zip</span>
                                                        <span className="font-body-large text-on-surface">{backup.file_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-body-md text-on-surface-variant">{backup.file_size}</td>
                                                <td className="p-4 font-body-md text-on-surface-variant">{backup.last_modified}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDownload(backup.file_path)}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors group"
                                                            title="Download"
                                                        >
                                                            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">download</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(backup.file_path)}
                                                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors group"
                                                            title="Hapus"
                                                        >
                                                            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-on-surface-variant font-body-large">
                                                Belum ada file backup.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </AdminLayout>
    );
}
