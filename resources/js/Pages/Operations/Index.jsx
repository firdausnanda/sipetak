import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Plus, Search, CheckCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, operations, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [tanggalMulai, setTanggalMulai] = useState(filters?.tanggal_mulai || '');
    const [tanggalAkhir, setTanggalAkhir] = useState(filters?.tanggal_akhir || '');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(route('operations.index'), {
            search,
            tanggal_mulai: tanggalMulai,
            tanggal_akhir: tanggalAkhir
        }, { preserveState: true, preserveScroll: true });
    };

    const markAsPaid = (id) => {
        Swal.fire({
            title: 'Konfirmasi Pembayaran',
            text: "Tandai tagihan regu ini sebagai sudah dibayar/lunas?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Tandai Lunas',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('operations.mark_paid', id), {}, {
                    preserveScroll: true
                });
            }
        });
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="SIPETAK Admin - Dashboard Prestasi & Upah" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Dashboard Prestasi & Upah</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Pantau prestasi kerja regu harian dan tagihan upah yang harus dibayar.</p>
                </div>
                <Link href={route('operations.create')}>
                    <PrimaryButton className="gap-2">
                        <Plus className="w-5 h-5" />
                        Input Hasil Kerja
                    </PrimaryButton>
                </Link>
            </div>

            {/* Stats/Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Pohon</span>
                    <span className="font-display text-[2rem] font-bold text-primary">
                        {new Intl.NumberFormat('id-ID').format(operations.data.reduce((acc, curr) => acc + curr.jumlah_pohon, 0))} Pcs
                    </span>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Batang</span>
                    <span className="font-display text-[2rem] font-bold text-[#219EBC]">
                        {new Intl.NumberFormat('id-ID').format(operations.data.reduce((acc, curr) => acc + curr.jumlah_batang, 0))} Pcs
                    </span>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Total Volume</span>
                    <span className="font-display text-[2rem] font-bold text-[#8ECAE6]">
                        {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(operations.data.reduce((acc, curr) => acc + parseFloat(curr.total_volume), 0))} m³
                    </span>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">Tagihan Ditampilkan</span>
                    <span className="font-display text-[2rem] font-bold text-error">
                        Rp {new Intl.NumberFormat('id-ID').format(operations.data.reduce((acc, curr) => acc + parseFloat(curr.total_upah_regu), 0))}
                    </span>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant mb-6 shadow-sm">
                <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-on-surface-variant mb-1">Cari Regu</label>
                        <TextInput 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            placeholder="Ketik nama regu..." 
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-on-surface-variant mb-1">Tgl Mulai</label>
                        <TextInput 
                            type="date"
                            value={tanggalMulai} 
                            onChange={(e) => setTanggalMulai(e.target.value)} 
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-on-surface-variant mb-1">Tgl Akhir</label>
                        <TextInput 
                            type="date"
                            value={tanggalAkhir} 
                            onChange={(e) => setTanggalAkhir(e.target.value)} 
                            className="w-full"
                        />
                    </div>
                    <div>
                        <SecondaryButton type="submit" className="h-[42px] gap-2">
                            <Search className="w-4 h-4" /> Filter
                        </SecondaryButton>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant">
                                <th className="p-4 font-label-lg text-label-lg text-on-surface">Tanggal</th>
                                <th className="p-4 font-label-lg text-label-lg text-on-surface">Regu Pekerja</th>
                                <th className="p-4 font-label-lg text-label-lg text-on-surface text-center">Pohon</th>
                                <th className="p-4 font-label-lg text-label-lg text-on-surface text-center">Batang</th>
                                <th className="p-4 font-label-lg text-label-lg text-on-surface text-center">Volume (m³)</th>
                                <th className="p-4 font-label-lg text-label-lg text-on-surface text-right">Tagihan Upah</th>
                                <th className="p-4 font-label-lg text-label-lg text-on-surface text-center">Status</th>
                                <th className="p-4 font-label-lg text-label-lg text-on-surface text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {operations.data.length > 0 ? (
                                operations.data.map((op) => (
                                    <tr key={op.id} className="hover:bg-surface-container/30 transition-colors">
                                        <td className="p-4 font-body-md text-on-surface">{op.tanggal}</td>
                                        <td className="p-4 font-body-md text-on-surface font-bold text-primary">{op.regu?.nama_regu}</td>
                                        <td className="p-4 font-body-md text-on-surface text-center">{op.jumlah_pohon}</td>
                                        <td className="p-4 font-body-md text-on-surface text-center">{op.jumlah_batang}</td>
                                        <td className="p-4 font-body-md text-on-surface text-center">{op.total_volume}</td>
                                        <td className="p-4 font-body-md text-on-surface text-right font-bold text-error">Rp {new Intl.NumberFormat('id-ID').format(op.total_upah_regu)}</td>
                                        <td className="p-4 text-center">
                                            {op.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                    <CheckCircle className="w-3 h-3" /> Lunas
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {op.status !== 'paid' && (
                                                <button
                                                    onClick={() => markAsPaid(op.id)}
                                                    className="text-sm font-bold text-primary hover:text-[#e07600] underline"
                                                >
                                                    Tandai Lunas
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-on-surface-variant font-body-md">
                                        Tidak ada data prestasi/upah ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Placeholder */}
            {operations.links && operations.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-2">
                    {operations.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-4 py-2 rounded-lg font-label-lg text-label-lg ${
                                link.active 
                                    ? 'bg-primary text-on-primary' 
                                    : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
