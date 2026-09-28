import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Box, CalendarDays, Pencil, Save, Target, Trash2, TreePine, Users, X } from 'lucide-react';
import { useState } from 'react';

const formatTrees = (value) => Number(value || 0).toLocaleString('id-ID');
const formatVolume = (value) => Number(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const fieldClass = 'mt-2 w-full min-h-[48px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary';

function SummaryCard({ label, value, unit, icon: Icon, accent, background, iconBackground }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
            <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[100px] opacity-10 transition-transform group-hover:scale-110 ${background}`} />
            <div className="relative flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-label-lg text-label-lg text-on-surface-variant">{label}</p>
                    <p className="mt-1 font-display text-[2rem] font-bold leading-tight text-on-surface tabular-nums">
                        {value} <span className="whitespace-nowrap text-sm font-medium text-on-surface-variant">{unit}</span>
                    </p>
                </div>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${accent}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
            </div>
        </div>
    );
}

export default function Index({ targets = [], kelompoks = [], currentYear }) {
    const [editingId, setEditingId] = useState(null);
    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
        kelompok_id: '', tahun: String(currentYear), jumlah_pohon: '', volume_taksasi: '',
    });

    const currentTargets = targets.filter((target) => Number(target.tahun) === Number(currentYear));
    const currentTrees = currentTargets.reduce((total, target) => total + Number(target.jumlah_pohon || 0), 0);
    const currentVolume = currentTargets.reduce((total, target) => total + Number(target.volume_taksasi || 0), 0);

    const startEdit = (target) => {
        setEditingId(target.id);
        clearErrors();
        setData({
            kelompok_id: String(target.kelompok_id),
            tahun: String(target.tahun),
            jumlah_pohon: String(target.jumlah_pohon),
            volume_taksasi: formatVolume(target.volume_taksasi),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        clearErrors();
        reset();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { onSuccess: cancelEdit, preserveScroll: true };
        if (editingId) put(route('admin.target_tebangs.update', editingId), options);
        else post(route('admin.target_tebangs.store'), options);
    };

    const remove = (target) => {
        if (window.confirm(`Hapus target ${target.kelompok?.nama_kelompok} tahun ${target.tahun}?`)) {
            router.delete(route('admin.target_tebangs.destroy', target.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Target Tebangan Tahunan | SIPETAK" />
            <div className="pb-8">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="mb-2 font-display text-display text-primary">Target Tebangan Tahunan</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Tetapkan target pohon dan volume taksasi per kelompok untuk dipantau di Monitoring operasional.
                        </p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface-variant shadow-sm">
                        <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" /> Tahun berjalan: {currentYear}
                    </span>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard label={`Kelompok dengan target ${currentYear}`} value={formatTrees(currentTargets.length)} unit="kelompok" icon={Users} accent="text-emerald-600" background="bg-emerald-600" iconBackground="bg-emerald-600/10" />
                    <SummaryCard label={`Target pohon ${currentYear}`} value={formatTrees(currentTrees)} unit="pohon" icon={TreePine} accent="text-amber-600" background="bg-amber-500" iconBackground="bg-amber-500/10" />
                    <SummaryCard label={`Volume taksasi ${currentYear}`} value={formatVolume(currentVolume)} unit="m³" icon={Box} accent="text-blue-600" background="bg-blue-500" iconBackground="bg-blue-500/10" />
                </div>

                <section className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm md:p-6" aria-labelledby="target-form-title">
                    <div className="mb-6 flex items-center gap-3 border-b border-outline-variant pb-5">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                            <Target className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="target-form-title" className="font-display text-xl font-bold text-on-surface">{editingId ? 'Ubah Target' : 'Tambah Target'}</h2>
                            <p className="text-sm text-on-surface-variant">Satu target untuk setiap kelompok pada setiap tahun.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <label htmlFor="kelompok_id" className="font-label-caps text-label-caps text-on-surface-variant">Kelompok</label>
                            <select id="kelompok_id" required value={data.kelompok_id} onChange={(event) => setData('kelompok_id', event.target.value)} className={fieldClass} aria-invalid={Boolean(errors.kelompok_id)}>
                                <option value="">Pilih kelompok</option>
                                {kelompoks.map((group) => <option key={group.id} value={group.id}>{group.nama_kelompok}</option>)}
                            </select>
                            {errors.kelompok_id && <p className="mt-1 text-xs text-error">{errors.kelompok_id}</p>}
                        </div>
                        <div>
                            <label htmlFor="tahun" className="font-label-caps text-label-caps text-on-surface-variant">Tahun</label>
                            <input id="tahun" required type="number" min="1900" max="2100" value={data.tahun} onChange={(event) => setData('tahun', event.target.value)} className={fieldClass} aria-invalid={Boolean(errors.tahun)} />
                            {errors.tahun && <p className="mt-1 text-xs text-error">{errors.tahun}</p>}
                        </div>
                        <div>
                            <label htmlFor="jumlah_pohon" className="font-label-caps text-label-caps text-on-surface-variant">Target Jumlah Pohon</label>
                            <input id="jumlah_pohon" required type="number" min="1" step="1" value={data.jumlah_pohon} onChange={(event) => setData('jumlah_pohon', event.target.value)} placeholder="Contoh: 8487" className={fieldClass} aria-invalid={Boolean(errors.jumlah_pohon)} />
                            {errors.jumlah_pohon && <p className="mt-1 text-xs text-error">{errors.jumlah_pohon}</p>}
                        </div>
                        <div>
                            <label htmlFor="volume_taksasi" className="font-label-caps text-label-caps text-on-surface-variant">Volume Taksasi (m³)</label>
                            <input id="volume_taksasi" required type="text" inputMode="decimal" value={data.volume_taksasi} onChange={(event) => setData('volume_taksasi', event.target.value)} placeholder="Contoh: 3.048,655" className={fieldClass} aria-invalid={Boolean(errors.volume_taksasi)} aria-describedby="volume-help" />
                            <p id="volume-help" className="mt-1 text-xs text-on-surface-variant">Gunakan koma untuk desimal, maksimal tiga angka.</p>
                            {errors.volume_taksasi && <p className="mt-1 text-xs text-error">{errors.volume_taksasi}</p>}
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1 md:col-span-2 xl:col-span-4">
                            <button disabled={processing} type="submit" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60">
                                <Save className="h-4 w-4" aria-hidden="true" /> {editingId ? 'Simpan Perubahan' : 'Tambah Target'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                                    <X className="h-4 w-4" aria-hidden="true" /> Batal
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm" aria-labelledby="target-list-title">
                    <div className="flex flex-col gap-1 border-b border-outline-variant p-5 md:p-6">
                        <h2 id="target-list-title" className="font-display text-xl font-bold text-on-surface">Daftar Target</h2>
                        <p className="text-sm text-on-surface-variant">Semua target tahunan yang telah ditetapkan.</p>
                    </div>
                    {targets.length === 0 ? (
                        <div className="flex flex-col items-center px-6 py-12 text-center">
                            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary"><Target className="h-7 w-7" aria-hidden="true" /></span>
                            <p className="font-semibold text-on-surface">Belum ada target tahunan</p>
                            <p className="mt-1 max-w-sm text-sm text-on-surface-variant">Isi formulir di atas untuk menetapkan target kelompok pertama.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-outline-variant bg-surface-container-high">
                                        <th className="p-4 font-label-lg text-label-lg text-on-surface">Tahun</th>
                                        <th className="p-4 font-label-lg text-label-lg text-on-surface">Kelompok</th>
                                        <th className="p-4 text-right font-label-lg text-label-lg text-on-surface">Jumlah Pohon</th>
                                        <th className="p-4 text-right font-label-lg text-label-lg text-on-surface">Volume Taksasi (m³)</th>
                                        <th className="p-4 text-right font-label-lg text-label-lg text-on-surface">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {targets.map((target) => (
                                        <tr key={target.id} className="transition-colors hover:bg-surface-container/50">
                                            <td className="p-4 font-body-md font-semibold text-on-surface">{target.tahun}</td>
                                            <td className="p-4 font-body-md font-bold text-primary">{target.kelompok?.nama_kelompok}</td>
                                            <td className="p-4 text-right font-body-md text-on-surface tabular-nums">{formatTrees(target.jumlah_pohon)}</td>
                                            <td className="p-4 text-right font-body-md text-on-surface tabular-nums">{formatVolume(target.volume_taksasi)}</td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <button type="button" onClick={() => startEdit(target)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                                                        <Pencil className="h-4 w-4" aria-hidden="true" /> Ubah
                                                    </button>
                                                    <button type="button" onClick={() => remove(target)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-error/30 px-3 text-sm font-semibold text-error transition-colors hover:bg-error-container/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-error">
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
