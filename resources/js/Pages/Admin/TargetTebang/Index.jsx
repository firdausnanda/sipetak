import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Save, Target, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const formatTrees = (value) => Number(value || 0).toLocaleString('id-ID');
const formatVolume = (value) => Number(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default function Index({ targets = [], kelompoks = [], currentYear }) {
    const [editingId, setEditingId] = useState(null);
    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
        kelompok_id: '', tahun: String(currentYear), jumlah_pohon: '', volume_taksasi: '',
    });
    const startEdit = (target) => {
        setEditingId(target.id);
        clearErrors();
        setData({ kelompok_id: String(target.kelompok_id), tahun: String(target.tahun), jumlah_pohon: String(target.jumlah_pohon), volume_taksasi: formatVolume(target.volume_taksasi) });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const cancelEdit = () => { setEditingId(null); clearErrors(); reset(); };
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

    return <AdminLayout>
        <Head title="Target Tebangan Tahunan | SIPETAK" />
        <div className="space-y-6 pb-8">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">SIPETAK / TARGET</p><h1 className="mt-2 text-3xl font-bold text-on-surface">Target tebangan tahunan</h1><p className="mt-2 text-sm text-on-surface-variant">Tetapkan jumlah pohon dan volume taksasi untuk setiap kelompok dan tahun. Capaian muncul di Monitoring operasional.</p></div>
            <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-3 text-primary"><Target size={20} /></span><h2 className="text-xl font-bold">{editingId ? 'Ubah target' : 'Tambah target'}</h2></div>
                <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="block text-sm font-semibold">Kelompok<select required value={data.kelompok_id} onChange={(event) => setData('kelompok_id', event.target.value)} className="mt-2 w-full rounded-xl border-outline-variant text-sm"><option value="">Pilih kelompok</option>{kelompoks.map((group) => <option key={group.id} value={group.id}>{group.nama_kelompok}</option>)}</select>{errors.kelompok_id && <span className="mt-1 block text-xs text-red-700">{errors.kelompok_id}</span>}</label>
                    <label className="block text-sm font-semibold">Tahun<input required type="number" min="1900" max="2100" value={data.tahun} onChange={(event) => setData('tahun', event.target.value)} className="mt-2 w-full rounded-xl border-outline-variant text-sm" />{errors.tahun && <span className="mt-1 block text-xs text-red-700">{errors.tahun}</span>}</label>
                    <label className="block text-sm font-semibold">Target jumlah pohon<input required type="number" min="1" step="1" value={data.jumlah_pohon} onChange={(event) => setData('jumlah_pohon', event.target.value)} placeholder="8487" className="mt-2 w-full rounded-xl border-outline-variant text-sm" />{errors.jumlah_pohon && <span className="mt-1 block text-xs text-red-700">{errors.jumlah_pohon}</span>}</label>
                    <label className="block text-sm font-semibold">Volume taksasi (m³)<input required type="text" inputMode="decimal" value={data.volume_taksasi} onChange={(event) => setData('volume_taksasi', event.target.value)} placeholder="3.048,655" className="mt-2 w-full rounded-xl border-outline-variant text-sm" /><span className="mt-1 block text-xs font-normal text-on-surface-variant">Gunakan koma untuk desimal; paling banyak tiga angka desimal.</span>{errors.volume_taksasi && <span className="mt-1 block text-xs text-red-700">{errors.volume_taksasi}</span>}</label>
                    <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-4"><button disabled={processing} type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white disabled:opacity-60"><Save size={16} />{editingId ? 'Simpan perubahan' : 'Tambah target'}</button>{editingId && <button type="button" onClick={cancelEdit} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-outline-variant px-5 py-2 text-sm font-semibold"><X size={16} /> Batal</button>}</div>
                </form>
            </section>
            <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
                <div className="border-b border-outline-variant p-5 md:p-6"><h2 className="text-xl font-bold">Daftar target</h2><p className="mt-1 text-sm text-on-surface-variant">Satu target untuk setiap kelompok pada setiap tahun.</p></div>
                {targets.length === 0 ? <p className="p-6 text-sm text-on-surface-variant">Belum ada target tahunan. Tambahkan target pertama melalui formulir di atas.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant"><tr><th className="px-5 py-3">Tahun</th><th className="px-5 py-3">Kelompok</th><th className="px-5 py-3 text-right">Jumlah pohon</th><th className="px-5 py-3 text-right">Volume taksasi (m³)</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-outline-variant">{targets.map((target) => <tr key={target.id}><td className="px-5 py-4 font-semibold">{target.tahun}</td><td className="px-5 py-4">{target.kelompok?.nama_kelompok}</td><td className="px-5 py-4 text-right tabular-nums">{formatTrees(target.jumlah_pohon)}</td><td className="px-5 py-4 text-right tabular-nums">{formatVolume(target.volume_taksasi)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => startEdit(target)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-outline-variant px-3 text-xs font-semibold"><Pencil size={14} /> Ubah</button><button type="button" onClick={() => remove(target)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700"><Trash2 size={14} /> Hapus</button></div></td></tr>)}</tbody></table></div>}
            </section>
        </div>
    </AdminLayout>;
}
