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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 animate-spin" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
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
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4 4h-2v2h2v-2zm-2 2h-2v2h2v-2zm2 2h-2v2h2v-2zm-2 2h-2v2h2v-2h-2v-2h2v-2h-2v-2h2V8h2v2h-2v2h2v2z"/></svg>
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
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(backup.file_path)}
                                                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors group"
                                                            title="Hapus"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
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
