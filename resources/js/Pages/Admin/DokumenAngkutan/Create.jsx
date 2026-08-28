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
import { FileText, Map, Save, Calendar, CheckSquare, Truck, BookOpen, Loader2, X } from 'lucide-react';

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

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const filteredPohons = (pohons || []).filter(p => {
        const query = searchQuery.toLowerCase();
        return (p.no_pohon && p.no_pohon.toString().toLowerCase().includes(query)) || 
               (p.no_barcode && p.no_barcode.toLowerCase().includes(query)) ||
               (p.jenis_pohon?.nama_jenis && p.jenis_pohon.nama_jenis.toLowerCase().includes(query));
    });

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Only select the currently filtered trees (merge with already selected)
            const newIds = new Set([...data.pohon_ids, ...filteredPohons.map(p => p.id)]);
            setData('pohon_ids', Array.from(newIds));
        } else {
            // Unselect only the currently filtered trees
            const filteredIds = filteredPohons.map(p => p.id);
            setData('pohon_ids', data.pohon_ids.filter(id => !filteredIds.includes(id)));
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

    const calculateVolume = (batangs) => {
        if (!batangs || !Array.isArray(batangs)) return '0.00';
        return batangs.reduce((total, batang) => total + Number(batang.volume), 0).toFixed(2);
    };

    const selectedTreesData = (pohons || []).filter(p => data.pohon_ids.includes(p.id));
    const totalVolume = selectedTreesData.reduce((total, pohon) => {
        const treeVol = pohon.batangs && Array.isArray(pohon.batangs) 
            ? pohon.batangs.reduce((sum, batang) => sum + Number(batang.volume), 0) 
            : 0;
        return total + treeVol;
    }, 0).toFixed(2);

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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Left Panel: Available Trees */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <CheckSquare className="w-5 h-5" /> Pilih Pohon
                            </h3>
                            {pohons && pohons.length > 0 ? (
                                <div>
                                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                id="selectAll"
                                                className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5"
                                                checked={filteredPohons.length > 0 && filteredPohons.every(p => data.pohon_ids.includes(p.id))}
                                                onChange={handleSelectAll}
                                            />
                                            <label htmlFor="selectAll" className="font-bold cursor-pointer text-sm">Pilih Semua ({filteredPohons.length})</label>
                                        </div>
                                        <div className="w-full sm:w-48 relative">
                                            <TextInput
                                                type="text"
                                                placeholder="Cari pohon..."
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                                className="w-full pr-10 text-sm"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <InputError message={errors.pohon_ids} className="mt-2 mb-4" />
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                        {filteredPohons.map((pohon) => (
                                            <div 
                                                key={pohon.id}
                                                className={`border rounded-lg p-3 flex items-start gap-3 cursor-pointer transition-colors ${data.pohon_ids.includes(pohon.id) ? 'bg-primary-container/20 border-primary' : 'border-outline-variant hover:bg-surface-container-lowest'}`}
                                                onClick={() => handleCheckboxChange(pohon.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-outline-variant text-primary focus:ring-primary mt-1 w-5 h-5 flex-shrink-0"
                                                    checked={data.pohon_ids.includes(pohon.id)}
                                                    onChange={() => {}} // handled by parent div click
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-bold text-sm break-all">
                                                        {pohon.no_barcode || '-'}
                                                    </div>
                                                    <div className="text-xs text-on-surface-variant font-bold text-red-700 mt-0.5">No. Pohon: {pohon.no_pohon || '-'}</div>
                                                    <div className="text-xs text-on-surface-variant mt-1 truncate">Jenis: {pohon.jenis_pohon?.nama_jenis || '-'}</div>
                                                    <div className="text-xs text-on-surface-variant truncate">Petak: {pohon.petak?.no_petak || '-'}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredPohons.length === 0 && (
                                            <div className="col-span-full text-center py-4 text-on-surface-variant text-sm">
                                                Tidak ada pohon yang cocok dengan pencarian Anda.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-on-surface-variant text-sm border border-dashed border-outline-variant rounded-lg">
                                    Tidak ada pohon yang belum diangkut pada petak terpilih.
                                </div>
                            )}
                        </div>

                        {/* Right Panel: Selected Trees */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-primary">Pohon Terpilih</h3>
                                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{data.pohon_ids.length} Pohon</span>
                            </div>

                            <div className="border border-outline-variant rounded-lg overflow-x-auto max-h-[460px] overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surface-container sticky top-0">
                                        <tr>
                                            <th className="p-3">Barcode / No</th>
                                            <th className="p-3">Jenis</th>
                                            <th className="p-3">Petak</th>
                                            <th className="p-3 text-right">Volume (m³)</th>
                                            <th className="p-3 text-center">Batal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant">
                                        {selectedTreesData.length === 0 ? (
                                            <tr><td colSpan="5" className="p-4 text-center text-on-surface-variant">Belum ada pohon yang dipilih.</td></tr>
                                        ) : (
                                            selectedTreesData.map(pohon => (
                                                <tr key={pohon.id} className="hover:bg-surface-container-lowest">
                                                    <td className="p-3 font-mono">
                                                        <div>{pohon.no_barcode || '-'}</div>
                                                        <div className="text-xs text-on-surface-variant font-bold text-red-700">{pohon.no_pohon || '-'}</div>
                                                    </td>
                                                    <td className="p-3">{pohon.jenis_pohon?.nama_jenis || '-'}</td>
                                                    <td className="p-3">{pohon.petak?.no_petak || '-'}</td>
                                                    <td className="p-3 text-right">{calculateVolume(pohon.batangs)}</td>
                                                    <td className="p-3 text-center">
                                                        <button type="button" onClick={() => handleCheckboxChange(pohon.id)} className="text-error hover:opacity-80" title="Batalkan pilihan">
                                                            <X className="w-5 h-5 mx-auto" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {selectedTreesData.length > 0 && (
                                        <tfoot className="bg-surface-container font-bold sticky bottom-0">
                                            <tr>
                                                <td colSpan="3" className="p-3 text-right">Total Volume:</td>
                                                <td className="p-3 text-right">{totalVolume}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
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
