import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Save, ClipboardCheck } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useEffect, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

registerLocale('id', id);

export default function Edit({ lhp, kelompoks, jenis_pohons, sortimens }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const { data, setData, put, processing, errors } = useForm({
        kelompok_id: lhp.kelompok_id || '',
        no_lhp: lhp.no_lhp || '',
        tanggal: lhp.tanggal || '',
        jenis_pohon_id: lhp.jenis_pohon_id || '',
        sortimen: lhp.sortimen || '',
        volume: lhp.volume || '',
        tarif: lhp.tarif || '',
        psdh: lhp.psdh || ''
    });

    const filteredJenisPohon = useMemo(() => {
        const targetKelompokId = user.kelompok_id || data.kelompok_id;
        if (!targetKelompokId) return [];
        return jenis_pohons?.filter(jp => jp.kelompok_id == targetKelompokId) || [];
    }, [user.kelompok_id, data.kelompok_id, jenis_pohons]);

    useEffect(() => {
        const volume = parseFloat(data.volume) || 0;
        const tarif = parseFloat(data.tarif) || 0;
        if (volume > 0 && tarif > 0) {
            setData('psdh', (volume * tarif).toFixed(2));
        }
    }, [data.volume, data.tarif]);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.lhp.update', lhp.id));
    };

    return (
        <AdminLayout>
            <Head title={`SIPETAK Admin - Edit LHP ${lhp.no_lhp}`} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Edit Laporan Hasil Produksi</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Ubah data Laporan Hasil Produksi: {lhp.no_lhp}.</p>
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5" /> Data LHP
                    </h3>

                    {!user.kelompok_id && (
                        <div className="mb-6">
                            <InputLabel value="Kelompok" />
                            <Select
                                options={kelompoks?.map(k => ({ value: k.id, label: k.nama_kelompok })) || []}
                                value={kelompoks?.filter(k => k.id == data.kelompok_id).map(k => ({ value: k.id, label: k.nama_kelompok }))}
                                onChange={(val) => {
                                    setData('kelompok_id', val ? val.value : '');
                                    setData('jenis_pohon_id', '');
                                }}
                                placeholder="Pilih Kelompok..."
                                className="mt-1"
                                isClearable
                            />
                            <InputError message={errors.kelompok_id} className="mt-2" />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="no_lhp" value="Nomor LHP" />
                            <TextInput
                                id="no_lhp"
                                type="text"
                                name="no_lhp"
                                value={data.no_lhp}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('no_lhp', e.target.value)}
                                required
                            />
                            <InputError message={errors.no_lhp} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal LHP" />
                            <DatePicker
                                id="tanggal"
                                selected={data.tanggal ? new Date(data.tanggal) : null}
                                onChange={(date) => {
                                    if (date) {
                                        const offset = date.getTimezoneOffset();
                                        const localDate = new Date(date.getTime() - (offset*60*1000));
                                        setData('tanggal', localDate.toISOString().split('T')[0]);
                                    } else {
                                        setData('tanggal', '');
                                    }
                                }}
                                className="mt-1 block w-full border-outline-variant focus:border-primary focus:ring-primary rounded-lg shadow-sm"
                                wrapperClassName="w-full"
                                placeholderText="Pilih tanggal"
                                dateFormat="dd MMMM yyyy"
                                locale="id"
                                required
                            />
                            <InputError message={errors.tanggal} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Jenis Kayu" />
                            <Select
                                options={filteredJenisPohon.map(jp => ({ value: jp.id, label: jp.nama_jenis }))}
                                value={filteredJenisPohon.filter(jp => jp.id == data.jenis_pohon_id).map(jp => ({ value: jp.id, label: jp.nama_jenis }))}
                                onChange={(val) => setData('jenis_pohon_id', val ? val.value : '')}
                                placeholder={!user.kelompok_id && !data.kelompok_id ? "Pilih Kelompok terlebih dahulu..." : "Pilih Jenis Kayu..."}
                                isDisabled={!user.kelompok_id && !data.kelompok_id}
                                className="mt-1"
                                isClearable
                                required
                            />
                            <InputError message={errors.jenis_pohon_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Sortimen" />
                            <Select
                                options={sortimens?.map(s => ({ value: s, label: s }))}
                                value={sortimens?.filter(s => s === data.sortimen).map(s => ({ value: s, label: s }))}
                                onChange={(val) => setData('sortimen', val ? val.value : '')}
                                placeholder="Pilih Sortimen..."
                                className="mt-1"
                                isClearable
                                required
                            />
                            <InputError message={errors.sortimen} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="volume" value="Volume (m³)" />
                            <TextInput
                                id="volume"
                                type="number"
                                step="0.0001"
                                name="volume"
                                value={data.volume}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('volume', e.target.value)}
                                required
                            />
                            <InputError message={errors.volume} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tarif" value="Tarif (Rp)" />
                            <TextInput
                                id="tarif"
                                type="number"
                                step="0.01"
                                name="tarif"
                                value={data.tarif}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('tarif', e.target.value)}
                                required
                            />
                            <InputError message={errors.tarif} className="mt-2" />
                        </div>
                        
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="psdh" value="PSDH (Otomatis Dihitung: Volume x Tarif)" />
                            <TextInput
                                id="psdh"
                                type="number"
                                step="0.01"
                                name="psdh"
                                value={data.psdh}
                                className="mt-1 block w-full bg-surface-container-high"
                                onChange={(e) => setData('psdh', e.target.value)}
                                required
                            />
                            <InputError message={errors.psdh} className="mt-2" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pb-8">
                    <SecondaryButton type="button" onClick={() => router.visit(route('admin.lhp.index'))}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton className="flex items-center gap-2" disabled={processing}>
                        <Save className="w-4 h-4" />
                        Simpan Perubahan
                    </PrimaryButton>
                </div>
            </form>
            
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
