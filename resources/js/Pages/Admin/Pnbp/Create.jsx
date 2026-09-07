import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ClipboardList, Loader2 } from 'lucide-react';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('id', id);

export default function Create({ lhps }) {
    const { data, setData, post, processing, errors } = useForm({
        lhp_id: '',
        kode_billing: '',
        tanggal_kode_billing: new Date().toISOString().split('T')[0],
        jumlah: '',
        tanggal_bayar: '',
        ntpn: '',
        keterangan: '',
    });

    const lhpOptions = lhps.map(l => ({
        value: l.id,
        label: `${l.no_lhp} - ${l.kelompok?.nama_kelompok || 'Tidak ada kelompok'} (Rp ${Math.ceil(Number(l.psdh)).toLocaleString('id-ID')})`,
        psdh: l.psdh
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.pnbp.store'));
    };

    const handleLhpChange = (selected) => {
        setData(prevData => ({
            ...prevData,
            lhp_id: selected ? selected.value : '',
            jumlah: selected ? Math.ceil(Number(selected.psdh)).toString() : ''
        }));
    };

    const formatRupiah = (val) => {
        if (!val && val !== 0) return '';
        const parts = val.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(',');
    };

    const handleJumlahChange = (e) => {
        let rawValue = e.target.value.replace(/\./g, ''); // hapus titik ribuan
        rawValue = rawValue.replace(/[^0-9,]/g, ''); // hanya izinkan angka dan koma
        rawValue = rawValue.replace(',', '.'); // ubah koma jadi titik untuk float
        
        const parts = rawValue.split('.');
        if (parts.length > 2) {
            rawValue = parts[0] + '.' + parts.slice(1).join('');
        }
        setData('jumlah', rawValue);
    };

    return (
        <AdminLayout>
            <Head title="Buat Tagihan PNBP Baru - SIPETAK" />

            <div className="flex items-center gap-4 mb-8">
                <Link href={route('admin.pnbp.index')} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="font-display text-display text-primary mb-2 flex items-center gap-2">
                        <ClipboardList className="w-8 h-8" />
                        Buat Tagihan PNBP Baru
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Pilih LHP yang belum memiliki tagihan dan masukkan detail billing.</p>
                </div>
            </div>

            <div className="max-w-4xl bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">
                                Nomor LHP <span className="text-error">*</span>
                            </label>
                            <Select
                                options={lhpOptions}
                                value={lhpOptions.find(opt => opt.value === data.lhp_id) || null}
                                onChange={handleLhpChange}
                                placeholder="Pilih LHP..."
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Tidak ada LHP yang belum memiliki tagihan"}
                            />
                            {errors.lhp_id && <p className="mt-1 text-sm text-error">{errors.lhp_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">
                                Kode Billing <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.kode_billing}
                                onChange={e => setData('kode_billing', e.target.value)}
                                className={`w-full rounded-lg border ${errors.kode_billing ? 'border-error' : 'border-outline-variant'} bg-surface px-3 py-2 focus:outline-none focus:border-primary font-mono`}
                                placeholder="Contoh: 8202XXXXXXXXXX"
                            />
                            {errors.kode_billing && <p className="mt-1 text-sm text-error">{errors.kode_billing}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">
                                Tanggal Terbit Billing <span className="text-error">*</span>
                            </label>
                            <DatePicker
                                selected={data.tanggal_kode_billing ? new Date(data.tanggal_kode_billing) : null}
                                onChange={(date) => {
                                    if (date) {
                                        const offset = date.getTimezoneOffset();
                                        const localDate = new Date(date.getTime() - (offset*60*1000));
                                        setData('tanggal_kode_billing', localDate.toISOString().split('T')[0]);
                                    } else {
                                        setData('tanggal_kode_billing', '');
                                    }
                                }}
                                dateFormat="dd MMMM yyyy"
                                locale="id"
                                className={`w-full rounded-lg border ${errors.tanggal_kode_billing ? 'border-error' : 'border-outline-variant'} bg-surface px-3 py-2 focus:outline-none focus:border-primary`}
                                wrapperClassName="w-full"
                            />
                            {errors.tanggal_kode_billing && <p className="mt-1 text-sm text-error">{errors.tanggal_kode_billing}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">
                                Jumlah (Rp) <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                value={formatRupiah(data.jumlah)}
                                onChange={handleJumlahChange}
                                className={`w-full rounded-lg border ${errors.jumlah ? 'border-error' : 'border-outline-variant'} bg-surface px-3 py-2 focus:outline-none focus:border-primary font-mono`}
                                placeholder="Contoh: 15.000.000,00"
                            />
                            {errors.jumlah && <p className="mt-1 text-sm text-error">{errors.jumlah}</p>}
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-[#FB8500] mb-4 border-b border-outline-variant pb-2">
                                Informasi Pembayaran (Opsional jika belum bayar)
                            </h3>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">
                                NTPN (Nomor Transaksi Penerimaan Negara)
                            </label>
                            <input
                                type="text"
                                value={data.ntpn}
                                onChange={e => setData('ntpn', e.target.value.toUpperCase())}
                                className={`w-full rounded-lg border ${errors.ntpn ? 'border-error' : 'border-outline-variant'} bg-surface px-3 py-2 focus:outline-none focus:border-primary font-mono font-bold`}
                                placeholder="Contoh: 1234ABCD5678EFGH"
                            />
                            {errors.ntpn && <p className="mt-1 text-sm text-error">{errors.ntpn}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">
                                Tanggal Bayar
                            </label>
                            <DatePicker
                                selected={data.tanggal_bayar ? new Date(data.tanggal_bayar) : null}
                                onChange={(date) => {
                                    if (date) {
                                        const offset = date.getTimezoneOffset();
                                        const localDate = new Date(date.getTime() - (offset*60*1000));
                                        setData('tanggal_bayar', localDate.toISOString().split('T')[0]);
                                    } else {
                                        setData('tanggal_bayar', '');
                                    }
                                }}
                                dateFormat="dd MMMM yyyy"
                                locale="id"
                                isClearable
                                placeholderText="Pilih tanggal bayar..."
                                className={`w-full rounded-lg border ${errors.tanggal_bayar ? 'border-error' : 'border-outline-variant'} bg-surface px-3 py-2 focus:outline-none focus:border-primary`}
                                wrapperClassName="w-full"
                            />
                            {errors.tanggal_bayar && <p className="mt-1 text-sm text-error">{errors.tanggal_bayar}</p>}
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">Keterangan Tambahan</label>
                            <textarea
                                value={data.keterangan || ''}
                                onChange={e => setData('keterangan', e.target.value)}
                                className={`w-full rounded-lg border ${errors.keterangan ? 'border-error' : 'border-outline-variant'} bg-surface px-3 py-2 focus:outline-none focus:border-primary min-h-[100px] resize-y`}
                                placeholder="Opsional..."
                            ></textarea>
                            {errors.keterangan && <p className="mt-1 text-sm text-error">{errors.keterangan}</p>}
                        </div>
                        
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-outline-variant">
                        <Link
                            href={route('admin.pnbp.index')}
                            className="px-6 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg font-bold hover:bg-surface-container-low transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {processing ? 'Menyimpan...' : 'Simpan Tagihan'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="h-24 md:h-8"></div>
        </AdminLayout>
    );
}
