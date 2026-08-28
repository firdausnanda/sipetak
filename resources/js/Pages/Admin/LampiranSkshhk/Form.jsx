import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Square, CheckSquare, Loader2, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { id as idLocale } from 'date-fns/locale/id';
import Select from 'react-select';

registerLocale('id', idLocale);

export default function Form({ skshhk, dokumenAngkutans, selectedPohons }) {
    const isEdit = !!skshhk;

    const { data, setData, post, put, processing, errors } = useForm({
        no_skshhk: skshhk?.no_skshhk || '',
        tanggal: skshhk?.tanggal || '',
        pohon_ids: selectedPohons ? selectedPohons.map(p => p.id) : [],
    });

    const [selectedDokumenId, setSelectedDokumenId] = useState('');
    const [availableTrees, setAvailableTrees] = useState([]);
    const [loadingTrees, setLoadingTrees] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedTreesData, setSelectedTreesData] = useState(selectedPohons || []);

    const filteredAvailableTrees = availableTrees.filter(tree => {
        const query = searchQuery.toLowerCase();
        const barcodeMatch = tree.no_barcode && tree.no_barcode.toLowerCase().includes(query);
        const noPohonMatch = tree.no_pohon && String(tree.no_pohon).toLowerCase().includes(query);
        return barcodeMatch || noPohonMatch;
    });

    const calculateVolume = (batangs) => {
        if (!batangs || !Array.isArray(batangs)) return '0.00';
        return batangs.reduce((total, batang) => total + Number(batang.volume), 0).toFixed(2);
    };

    useEffect(() => {
        if (selectedDokumenId) {
            fetchTrees(selectedDokumenId);
        } else {
            setAvailableTrees([]);
        }
    }, [selectedDokumenId]);

    const fetchTrees = async (dokumenId) => {
        setLoadingTrees(true);
        try {
            const response = await fetch(route('admin.lampiran_skshhk.available_trees', { dokumen_id: dokumenId }));
            const result = await response.json();
            setAvailableTrees(result);
        } catch (error) {
            console.error('Failed to fetch trees', error);
        } finally {
            setLoadingTrees(false);
        }
    };

    const toggleTree = (tree) => {
        let newIds = [...data.pohon_ids];
        let newTreesData = [...selectedTreesData];

        if (newIds.includes(tree.id)) {
            newIds = newIds.filter(id => id !== tree.id);
            newTreesData = newTreesData.filter(t => t.id !== tree.id);
        } else {
            newIds.push(tree.id);
            newTreesData.push(tree);
        }

        setData('pohon_ids', newIds);
        setSelectedTreesData(newTreesData);
    };

    const toggleAllTrees = () => {
        const isAllSelected = filteredAvailableTrees.length > 0 && filteredAvailableTrees.every(tree => data.pohon_ids.includes(tree.id));
        
        let newIds = [...data.pohon_ids];
        let newTreesData = [...selectedTreesData];

        if (isAllSelected) {
            filteredAvailableTrees.forEach(tree => {
                newIds = newIds.filter(id => id !== tree.id);
                newTreesData = newTreesData.filter(t => t.id !== tree.id);
            });
        } else {
            filteredAvailableTrees.forEach(tree => {
                if (!newIds.includes(tree.id)) {
                    newIds.push(tree.id);
                    newTreesData.push(tree);
                }
            });
        }
        setData('pohon_ids', newIds);
        setSelectedTreesData(newTreesData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEdit) {
            put(route('admin.lampiran_skshhk.update', skshhk.id), {
                onSuccess: () => Swal.fire('Berhasil!', 'SKSHHK berhasil diperbarui.', 'success')
            });
        } else {
            post(route('admin.lampiran_skshhk.store'), {
                onSuccess: () => Swal.fire('Berhasil!', 'SKSHHK berhasil ditambahkan.', 'success')
            });
        }
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? `Edit SKSHHK ${skshhk.no_skshhk}` : 'Tambah SKSHHK'} />
            
            <div className="flex items-center gap-4 mb-8">
                <Link href={route('admin.lampiran_skshhk.index')} className="text-on-surface-variant hover:text-primary transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="font-display text-display text-primary mb-2">
                        {isEdit ? 'Edit SKSHHK' : 'Tambah SKSHHK'}
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        Kelola data SKSHHK dan pilih kayu yang masuk ke dalamnya.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 text-primary">Informasi SKSHHK</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">No. SKSHHK</label>
                            <input 
                                type="text" 
                                className="w-full border-outline-variant rounded-lg p-2 focus:ring-primary focus:border-primary"
                                value={data.no_skshhk}
                                onChange={e => setData('no_skshhk', e.target.value)}
                                required
                            />
                            {errors.no_skshhk && <p className="text-error text-xs mt-1">{errors.no_skshhk}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">Tanggal SKSHHK</label>
                            <DatePicker
                                selected={data.tanggal ? new Date(data.tanggal) : null}
                                onChange={date => {
                                    if (date) {
                                        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                                        const localISOTime = (new Date(date - tzoffset)).toISOString().slice(0, 10);
                                        setData('tanggal', localISOTime);
                                    } else {
                                        setData('tanggal', '');
                                    }
                                }}
                                dateFormat="dd MMMM yyyy"
                                locale="id"
                                wrapperClassName="w-full"
                                className="w-full border-outline-variant rounded-lg p-2 focus:ring-primary focus:border-primary"
                                placeholderText="Pilih Tanggal"
                                required
                            />
                            {errors.tanggal && <p className="text-error text-xs mt-1">{errors.tanggal}</p>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel: Available Trees */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 text-primary">Cari & Pilih Kayu</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">Filter Dokumen Angkutan</label>
                            <Select
                                options={dokumenAngkutans.map(dok => {
                                    const formattedDate = dok.tanggal ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dok.tanggal)) : '-';
                                    return {
                                        value: dok.id,
                                        label: `${dok.no_dokumen} (${formattedDate})`
                                    };
                                })}
                                value={
                                    dokumenAngkutans
                                        .filter(dok => dok.id === selectedDokumenId)
                                        .map(dok => {
                                            const formattedDate = dok.tanggal ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dok.tanggal)) : '-';
                                            return { value: dok.id, label: `${dok.no_dokumen} (${formattedDate})` };
                                        })[0] || null
                                }
                                onChange={option => setSelectedDokumenId(option ? option.value : '')}
                                placeholder="-- Pilih Dokumen Angkutan --"
                                isClearable
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {selectedDokumenId && (
                            <div className="mb-4 relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan Barcode atau No. Pohon..."
                                    className="w-full border-outline-variant rounded-lg pl-10 p-2 focus:ring-primary focus:border-primary text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}

                        {loadingTrees ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                        ) : selectedDokumenId ? (
                            <div className="border border-outline-variant rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surface-container sticky top-0">
                                        <tr>
                                            <th className="p-3 w-10">
                                                <button type="button" onClick={toggleAllTrees} className="focus:outline-none">
                                                    {filteredAvailableTrees.length > 0 && filteredAvailableTrees.every(tree => data.pohon_ids.includes(tree.id)) ? (
                                                        <CheckSquare className="w-5 h-5 text-primary" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-outline" />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="p-3">Barcode / No</th>
                                            <th className="p-3">Jenis</th>
                                            <th className="p-3 text-right">Volume (m³)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant">
                                        {filteredAvailableTrees.length === 0 ? (
                                            <tr><td colSpan="4" className="p-4 text-center text-on-surface-variant">Tidak ada kayu tersedia / ditemukan.</td></tr>
                                        ) : (
                                            filteredAvailableTrees.map(pohon => (
                                                <tr key={pohon.id} className="hover:bg-surface-container-lowest cursor-pointer" onClick={() => toggleTree(pohon)}>
                                                    <td className="p-3">
                                                        {data.pohon_ids.includes(pohon.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-outline" />}
                                                    </td>
                                                    <td className="p-3 font-mono">
                                                        <div>{pohon.no_barcode || '-'}</div>
                                                        <div className="text-xs text-on-surface-variant">No. Pohon : <span className='text-red-700 font-bold'>{pohon.no_pohon || '-'}</span></div>
                                                    </td>
                                                    <td className="p-3">{pohon.jenis_pohon?.nama_jenis || '-'}</td>
                                                    <td className="p-3 text-right">{calculateVolume(pohon.batangs)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-lg">
                                Silakan pilih Dokumen Angkutan terlebih dahulu untuk melihat daftar kayu.
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Selected Trees */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-primary">Kayu Terpilih</h3>
                            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{data.pohon_ids.length} Kayu</span>
                        </div>
                        {errors.pohon_ids && <p className="text-error text-xs mb-2">{errors.pohon_ids}</p>}

                        <div className="border border-outline-variant rounded-lg overflow-x-auto max-h-[460px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container sticky top-0">
                                    <tr>
                                        <th className="p-3">Barcode / No</th>
                                        <th className="p-3">Jenis</th>
                                        <th className="p-3 text-right">Volume (m³)</th>
                                        <th className="p-3 text-center">Batal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {selectedTreesData.length === 0 ? (
                                        <tr><td colSpan="4" className="p-4 text-center text-on-surface-variant">Belum ada kayu yang dipilih.</td></tr>
                                    ) : (
                                        selectedTreesData.map(pohon => (
                                            <tr key={pohon.id} className="hover:bg-surface-container-lowest">
                                                <td className="p-3 font-mono">
                                                    <div>{pohon.no_barcode || '-'}</div>
                                                    <div className="text-xs text-on-surface-variant">{pohon.no_pohon || '-'}</div>
                                                </td>
                                                <td className="p-3">{pohon.jenis_pohon?.nama_jenis || pohon.jenisPohon?.nama_jenis || '-'}</td>
                                                <td className="p-3 text-right">{calculateVolume(pohon.batangs)}</td>
                                                <td className="p-3 text-center">
                                                    <button type="button" onClick={() => toggleTree(pohon)} className="text-error hover:opacity-80" title="Batalkan pilihan">
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
                                            <td colSpan="2" className="p-3 text-right">Total Volume:</td>
                                            <td className="p-3 text-right">
                                                {selectedTreesData.reduce((total, pohon) => {
                                                    const treeVol = pohon.batangs && Array.isArray(pohon.batangs) 
                                                        ? pohon.batangs.reduce((sum, batang) => sum + Number(batang.volume), 0) 
                                                        : 0;
                                                    return total + treeVol;
                                                }, 0).toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href={route('admin.lampiran_skshhk.index')} className="px-6 py-2 rounded-lg font-bold bg-surface-container hover:bg-surface-container-high transition-colors">
                        Batal
                    </Link>
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" /> Simpan
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
