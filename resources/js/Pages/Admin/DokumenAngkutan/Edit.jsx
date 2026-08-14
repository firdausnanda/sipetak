import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';
import { FileText, Save, BookOpen } from 'lucide-react';

registerLocale('id', id);

export default function Edit({ dokumen, penerbits, tujuanBongkars, auth }) {
    const { data, setData, put, processing, errors } = useForm({
        no_dokumen: dokumen.no_dokumen || '',
        tanggal: dokumen.tanggal || '',
        penerbit_id: dokumen.penerbit_id || '',
        tujuan_bongkar_id: dokumen.tujuan_bongkar_id || '',
        jenis_angkutan: dokumen.jenis_angkutan || 'Truk',
        nopol_angkutan: dokumen.nopol_angkutan || '',
        masa_berlaku_hari: dokumen.masa_berlaku_hari || 1,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.dokumen_angkutans.update', dokumen.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit Dokumen: ${dokumen.no_dokumen}`} />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Edit Dokumen Angkutan</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Perbarui informasi pengangkutan untuk dokumen ini.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Data Dokumen
                    </h3>
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
                                value={penerbits.filter(p => p.id === data.penerbit_id).map(p => ({ value: p.id, label: `${p.nama} (${p.no_register || '-'})` }))[0]}
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
                                options={tujuanBongkars.map(t => ({ value: t.id, label: t.nama_tpk }))}
                                value={tujuanBongkars.filter(t => t.id === data.tujuan_bongkar_id).map(t => ({ value: t.id, label: t.nama_tpk }))[0]}
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

                <div className="flex justify-end gap-3 mt-8">
                    <PrimaryButton type="submit" disabled={processing} className="shadow-sm">
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                    </PrimaryButton>
                </div>
            </form>
        </AdminLayout>
    );
}
