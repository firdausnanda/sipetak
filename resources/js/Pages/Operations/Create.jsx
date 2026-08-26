import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '48px',
        borderRadius: '0.5rem',
        borderColor: state.isFocused ? '#FB8500' : '#c3c7c9',
        boxShadow: state.isFocused ? '0 0 0 1px #FB8500' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#FB8500' : '#c3c7c9'
        },
        backgroundColor: '#f8fafc',
    }),
    menu: (base) => ({
        ...base,
        zIndex: 50
    }),
    indicatorSeparator: () => ({ display: 'none' })
};

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Create({ auth, regus, wageRates }) {
    const { flash } = usePage().props;
    const [isFetching, setIsFetching] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        regu_id: '',
        jumlah_pohon: '',
        jumlah_batang: '',
        total_volume: '',
        wage_rate_id: ''
    });

    useEffect(() => {
        if (data.tanggal && data.regu_id) {
            setIsFetching(true);
            axios.get(route('operations.fetch_results'), {
                params: {
                    tanggal: data.tanggal,
                    regu_id: data.regu_id
                }
            })
            .then(res => {
                setData(prev => ({
                    ...prev,
                    jumlah_pohon: res.data.jumlah_pohon,
                    jumlah_batang: res.data.jumlah_batang,
                    total_volume: res.data.total_volume
                }));
            })
            .catch(err => {
                console.error("Gagal mengambil data laporan tebangan", err);
            })
            .finally(() => {
                setIsFetching(false);
            });
        }
    }, [data.tanggal, data.regu_id]);

    const submit = (e) => {
        e.preventDefault();
        post(route('operations.store'));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="SIPETAK Admin - Input Hasil Kerja" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Input Hasil Kerja</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Catat jumlah pohon yang ditebang dan batang yang dihasilkan secara harian.</p>
                </div>
            </div>

            {flash?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{flash.success}</span>
                </div>
            )}

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="tanggal" value="Tanggal Kegiatan" />
                        <DatePicker
                            id="tanggal"
                            selected={data.tanggal ? new Date(data.tanggal) : null}
                            onChange={(date) => {
                                // Adjust timezone offset before slicing
                                const d = date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';
                                setData('tanggal', d);
                            }}
                            dateFormat="yyyy-MM-dd"
                            className="mt-1 block w-full border-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm h-[48px] bg-[#f8fafc]"
                            wrapperClassName="w-full"
                            required
                        />
                        <InputError message={errors.tanggal} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="regu_id" value="Regu Pekerja" />
                        <div className="mt-1">
                            <Select
                                id="regu_id"
                                value={regus.map(r => ({ value: r.id, label: r.nama_regu })).find(o => o.value == data.regu_id) || null}
                                onChange={(option) => setData('regu_id', option ? option.value : '')}
                                options={regus.map(regu => ({ value: regu.id, label: regu.nama_regu }))}
                                styles={customSelectStyles}
                                placeholder="-- Pilih Regu --"
                                isSearchable
                            />
                        </div>
                        <InputError message={errors.regu_id} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <InputLabel htmlFor="jumlah_pohon" value="Pohon Ditebang (Pcs)" />
                            <TextInput
                                id="jumlah_pohon"
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="mt-1 block w-full text-lg font-bold text-center h-[48px]"
                                value={data.jumlah_pohon}
                                onChange={(e) => setData('jumlah_pohon', e.target.value)}
                                required
                            />
                            <InputError message={errors.jumlah_pohon} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="jumlah_batang" value="Batang Dihasilkan (Pcs)" />
                            <TextInput
                                id="jumlah_batang"
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="mt-1 block w-full text-lg font-bold text-center h-[48px]"
                                value={data.jumlah_batang}
                                onChange={(e) => setData('jumlah_batang', e.target.value)}
                                required
                            />
                            <InputError message={errors.jumlah_batang} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="total_volume" value="Total Volume (m³)" />
                            <TextInput
                                id="total_volume"
                                type="number"
                                step="0.0001"
                                inputMode="decimal"
                                className="mt-1 block w-full text-lg font-bold text-center h-[48px]"
                                value={data.total_volume}
                                onChange={(e) => setData('total_volume', e.target.value)}
                                required
                            />
                            <InputError message={errors.total_volume} className="mt-2" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="wage_rate_id" value="Tarif Upah" />
                        <div className="mt-1">
                            <Select
                                id="wage_rate_id"
                                value={wageRates.map(r => ({ value: r.id, label: `${r.jenis_pekerjaan} (Rp ${new Intl.NumberFormat('id-ID').format(r.tarif)} / ${r.satuan_perhitungan})` })).find(o => o.value == data.wage_rate_id) || null}
                                onChange={(option) => setData('wage_rate_id', option ? option.value : '')}
                                options={wageRates.map(rate => ({ value: rate.id, label: `${rate.jenis_pekerjaan} (Rp ${new Intl.NumberFormat('id-ID').format(rate.tarif)} / ${rate.satuan_perhitungan})` }))}
                                styles={customSelectStyles}
                                placeholder="-- Pilih Tarif --"
                                isSearchable
                            />
                        </div>
                        <InputError message={errors.wage_rate_id} className="mt-2" />
                    </div>

                    <div className="pt-4 border-t border-outline-variant">
                        <PrimaryButton className="w-full justify-center min-h-[48px] text-lg font-bold" disabled={processing || isFetching}>
                            {isFetching ? 'Menghitung Data Laporan Tebangan...' : 'Simpan Hasil Kerja'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
