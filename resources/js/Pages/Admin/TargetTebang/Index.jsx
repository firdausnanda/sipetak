import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Box, CalendarDays, Pencil, Save, Target, Trash2, TreePine, Users, X } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '48px',
        borderRadius: '0.5rem',
        borderColor: state.isFocused ? '#FB8500' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 1px #FB8500' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#FB8500' : '#d1d5db'
        },
        backgroundColor: '#ffffff',
    }),
    menu: (base) => ({
        ...base,
        zIndex: 50
    })
};
const formatTrees = (value) => Number(value || 0).toLocaleString('id-ID');
const formatVolume = (value) => Number(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const fieldClass = 'mt-2 w-full min-h-[48px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary';

function SummaryCard({ label, value, unit, icon: Icon, hoverBorder, backgroundClass, iconColorClass, iconBgClass }) {
    return (
        <div className={`bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden transition-all hover:shadow-md ${hoverBorder} group`}>
            <div className={`absolute right-0 top-0 w-24 h-24 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110 ${backgroundClass}`}></div>
            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface-variant mb-1">{label}</span>
                    <span className="font-display text-[2rem] font-bold text-on-surface">
                        {value} <span className="text-sm font-medium text-on-surface-variant">{unit}</span>
                    </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass} ${iconColorClass}`}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
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
    
    const kelompokOptions = kelompoks.map((k) => ({
        value: String(k.id),
        label: k.nama_kelompok
    }));

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
                    <SummaryCard label={`Kelompok dengan target ${currentYear}`} value={formatTrees(currentTargets.length)} unit="kelompok" icon={Users} iconColorClass="text-[#10b981]" hoverBorder="hover:border-[#10b981]/40" backgroundClass="bg-[#10b981]/5" iconBgClass="bg-[#10b981]/10" />
                    <SummaryCard label={`Target pohon ${currentYear}`} value={formatTrees(currentTrees)} unit="pohon" icon={TreePine} iconColorClass="text-[#f59e0b]" hoverBorder="hover:border-[#f59e0b]/40" backgroundClass="bg-[#f59e0b]/5" iconBgClass="bg-[#f59e0b]/10" />
                    <SummaryCard label={`Volume taksasi ${currentYear}`} value={formatVolume(currentVolume)} unit="m³" icon={Box} iconColorClass="text-[#3b82f6]" hoverBorder="hover:border-[#3b82f6]/40" backgroundClass="bg-[#3b82f6]/5" iconBgClass="bg-[#3b82f6]/10" />
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
                            <Select
                                inputId="kelompok_id"
                                options={kelompokOptions}
                                value={kelompokOptions.find(opt => opt.value === data.kelompok_id) || null}
                                onChange={(option) => setData('kelompok_id', option ? option.value : '')}
                                placeholder="Pilih kelompok"
                                styles={customSelectStyles}
                                isSearchable
                                isClearable
                                className="mt-2 text-sm"
                            />
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
                                <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                                    <tr>
                                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tahun</th>
                                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kelompok</th>
                                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Jumlah Pohon</th>
                                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Volume Taksasi (m³)</th>
                                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                                    {targets.map((target) => (
                                        <tr key={target.id} className="even:bg-surface/30 odd:bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                            <td className="py-4 px-4 font-bold text-sm text-on-surface">{target.tahun}</td>
                                            <td className="py-4 px-4 font-bold text-sm text-primary">{target.kelompok?.nama_kelompok}</td>
                                            <td className="py-4 px-4 text-right text-sm font-semibold text-on-surface tabular-nums">{formatTrees(target.jumlah_pohon)}</td>
                                            <td className="py-4 px-4 text-right text-sm font-semibold text-on-surface tabular-nums">{formatVolume(target.volume_taksasi)}</td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button type="button" onClick={() => startEdit(target)} className="p-2 text-[#FB8500] hover:bg-surface-container-low rounded-lg transition-colors" title="Edit">
                                                        <Pencil className="w-4 h-4" aria-hidden="true" />
                                                    </button>
                                                    <button type="button" onClick={() => remove(target)} className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Hapus">
                                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
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
