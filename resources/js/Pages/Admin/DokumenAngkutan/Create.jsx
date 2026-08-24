import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';
import { FileText, Map, Save, Calendar, CheckSquare, Truck, BookOpen } from 'lucide-react';

registerLocale('id', id);

export default function Create({ petaks, pohons, selectedPetakIds, penerbits, tujuan_bongkars, auth, kelompoks }) {
    const { data, setData, post, processing, errors } = useForm({
        kelompok_id: '',
        no_dokumen: '',
        tanggal: '',
        penerbit_id: '',
        tujuan_bongkar_id: '',
        jenis_angkutan: 'Truk',
        nopol_angkutan: '',
        masa_berlaku_hari: 1,
        petak_ids: selectedPetakIds || [],
        pohon_ids: []
    });

    const [selectedPetakOptions, setSelectedPetakOptions] = useState(
        petaks.filter(p => (selectedPetakIds || []).includes(p.id)).map(p => ({ value: p.id, label: p.no_petak }))
    );

    const petakOptions = petaks.map(p => ({ value: p.id, label: p.no_petak }));

    // When petaks change, fetch trees
    const handlePetakChange = (selectedOptions) => {
        setSelectedPetakOptions(selectedOptions);
        const newPetakIds = selectedOptions ? selectedOptions.map(o => o.value) : [];
        setData('petak_ids', newPetakIds);
        
        router.get(route('admin.dokumen_angkutans.create'), {
            petak_ids: newPetakIds
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['pohons', 'selectedPetakIds']
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setData('pohon_ids', pohons.map(p => p.id));
        } else {
            setData('pohon_ids', []);
        }
    };

    const handleCheckboxChange = (id) => {
        const currentIds = [...data.pohon_ids];
        if (currentIds.includes(id)) {
            setData('pohon_ids', currentIds.filter(i => i !== id));
        } else {
            setData('pohon_ids', [...currentIds, id]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.dokumen_angkutans.store'));
    };

    return (
        <AdminLayout>
            <Head title="Buat Dokumen Angkutan" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Buat Dokumen Angkutan</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Buat dokumen baru dan ikatkan dengan pohon dari petak terpilih.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Data Dokumen
                    </h3>
                    
                    {!auth.user.kelompok_id && (
                        <div className="mb-6">
                            <InputLabel value="Kelompok" />
                            <Select
                                options={kelompoks?.map(k => ({ value: k.id, label: k.nama_kelompok })) || []}
                                onChange={(val) => setData('kelompok_id', val ? val.value : '')}
                                placeholder="Pilih Kelompok..."
                                className="mt-1"
                                isClearable
                            />
                            <InputError message={errors.kelompok_id} className="mt-2" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="no_dokumen" value="Nomor Dokumen" />
                            <TextInput
                                id="no_dokumen"
                                type="text"
                                name="no_dokumen"
                                value={data.no_dokumen}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('no_dokumen', e.target.value)}
                                placeholder="Masukkan no dokumen angkutan"
                                required
                            />
                            <InputError message={errors.no_dokumen} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal" />
                            <DatePicker
                                id="tanggal"
                                selected={data.tanggal ? new Date(data.tanggal) : null}
                                onChange={(date) => {
                                    if (date) {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        setData('tanggal', `${year}-${month}-${day}`);
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
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Informasi Tambahan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <InputLabel value="Penerbit Dokumen" />
                            <Select
                                options={penerbits.map(p => ({ value: p.id, label: `${p.nama} (${p.no_register || '-'})` }))}
                                onChange={(val) => setData('penerbit_id', val ? val.value : '')}
                                placeholder="Pilih Penerbit..."
                                className="mt-1"
                                isClearable
                            />
                            <InputError message={errors.penerbit_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel value="Tujuan Bongkar (TPK)" />
                            <Select
                                options={tujuan_bongkars.map(t => ({ value: t.id, label: t.nama_tpk }))}
                                onChange={(val) => setData('tujuan_bongkar_id', val ? val.value : '')}
                                placeholder="Pilih Tujuan Bongkar..."
                                className="mt-1"
                                isClearable
                            />
                            <InputError message={errors.tujuan_bongkar_id} className="mt-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <InputLabel htmlFor="jenis_angkutan" value="Jenis Angkutan" />
                            <TextInput
                                id="jenis_angkutan"
                                type="text"
                                value={data.jenis_angkutan}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('jenis_angkutan', e.target.value)}
                                placeholder="Contoh: Truk"
                            />
                            <InputError message={errors.jenis_angkutan} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="nopol_angkutan" value="Nomor Polisi" />
                            <TextInput
                                id="nopol_angkutan"
                                type="text"
                                value={data.nopol_angkutan}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('nopol_angkutan', e.target.value)}
                                placeholder="Contoh: B 1234 CD"
                            />
                            <InputError message={errors.nopol_angkutan} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="masa_berlaku_hari" value="Masa Berlaku (Hari)" />
                            <TextInput
                                id="masa_berlaku_hari"
                                type="number"
                                min="1"
                                value={data.masa_berlaku_hari}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('masa_berlaku_hari', e.target.value)}
                            />
                            <InputError message={errors.masa_berlaku_hari} className="mt-2" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Map className="w-5 h-5" /> Pilih Petak
                    </h3>
                    <div>
                        <InputLabel value="Petak" />
                        <Select
                            isMulti
                            value={selectedPetakOptions}
                            onChange={handlePetakChange}
                            options={petakOptions}
                            placeholder="Pilih Petak..."
                            className="mt-1"
                        />
                        <InputError message={errors.petak_ids} className="mt-2" />
                        <p className="text-sm text-on-surface-variant mt-2">Pilih petak untuk memunculkan daftar pohon yang siap diangkut.</p>
                    </div>
                </div>

                {data.petak_ids.length > 0 && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5" /> Pilih Pohon
                        </h3>
                        {pohons && pohons.length > 0 ? (
                            <div>
                                <div className="mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                                    <input 
                                        type="checkbox" 
                                        id="selectAll"
                                        className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5"
                                        checked={data.pohon_ids.length === pohons.length && pohons.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                    <label htmlFor="selectAll" className="font-bold cursor-pointer">Pilih Semua ({pohons.length} Pohon)</label>
                                </div>
                                <InputError message={errors.pohon_ids} className="mt-2 mb-4" />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                    {pohons.map((pohon) => (
                                        <div 
                                            key={pohon.id}
                                            className={`border rounded-lg p-3 flex items-start gap-3 cursor-pointer transition-colors ${data.pohon_ids.includes(pohon.id) ? 'bg-primary-container/20 border-primary' : 'border-outline-variant hover:bg-surface-container-lowest'}`}
                                            onClick={() => handleCheckboxChange(pohon.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded border-outline-variant text-primary focus:ring-primary mt-1 w-5 h-5"
                                                checked={data.pohon_ids.includes(pohon.id)}
                                                onChange={() => {}} // handled by parent div click
                                            />
                                            <div>
                                                <div className="font-bold text-sm">Pohon: {pohon.no_barcode || 'Tanpa Barcode'}</div>
                                                <div className="text-xs text-on-surface-variant mt-1">Jenis: {pohon.jenis_pohon?.nama_jenis || '-'}</div>
                                                <div className="text-xs text-on-surface-variant">Petak: {pohon.petak?.no_petak || '-'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-on-surface-variant">
                                <p>Tidak ada pohon yang belum diangkut pada petak terpilih.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 pb-8">
                    <SecondaryButton type="button" onClick={() => router.visit(route('admin.dokumen_angkutans.index'))}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton disabled={processing || data.pohon_ids.length === 0} className="flex items-center gap-2">
                        <Save className="w-4 h-4" /> Simpan Dokumen
                    </PrimaryButton>
                </div>
            </form>
        </AdminLayout>
    );
}
