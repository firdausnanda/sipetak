import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Square, CheckSquare, Loader2, Search, ChevronDown, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { id as idLocale } from 'date-fns/locale/id';

registerLocale('id', idLocale);

export default function Form({ skshhk, selectedBatangs, selectedPohonsData }) {
    const isEdit = !!skshhk;

    const { data, setData, post, put, processing, errors } = useForm({
        no_skshhk: skshhk?.no_skshhk || '',
        tanggal: skshhk?.tanggal || '',
        batang_ids: selectedBatangs || [],
    });

    const [availableTrees, setAvailableTrees] = useState([]);
    const [loadingTrees, setLoadingTrees] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [expandedAvailableTrees, setExpandedAvailableTrees] = useState([]);
    const [expandedSelectedTrees, setExpandedSelectedTrees] = useState([]);

    const [selectedTreesData, setSelectedTreesData] = useState(selectedPohonsData || []);

    const calculateVolume = (batangs) => {
        if (!batangs || !Array.isArray(batangs)) return '0.00';
        return batangs.reduce((total, batang) => total + Number(batang.volume), 0).toFixed(2);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTrees(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchTrees = async (query = '') => {
        setLoadingTrees(true);
        try {
            const url = new URL(route('admin.lampiran_skshhk.available_trees'), window.location.origin);
            if (query) {
                url.searchParams.append('search', query);
            }
            const response = await fetch(url);
            const result = await response.json();
            setAvailableTrees(result);
        } catch (error) {
            console.error('Failed to fetch trees', error);
        } finally {
            setLoadingTrees(false);
        }
    };

    const toggleAvailableTreeExpanded = (treeId) => {
        if (expandedAvailableTrees.includes(treeId)) {
            setExpandedAvailableTrees(expandedAvailableTrees.filter(id => id !== treeId));
        } else {
            setExpandedAvailableTrees([...expandedAvailableTrees, treeId]);
        }
    };

    const toggleSelectedTreeExpanded = (treeId) => {
        if (expandedSelectedTrees.includes(treeId)) {
            setExpandedSelectedTrees(expandedSelectedTrees.filter(id => id !== treeId));
        } else {
            setExpandedSelectedTrees([...expandedSelectedTrees, treeId]);
        }
    };

    const toggleBatang = (batang, tree) => {
        let newIds = [...data.batang_ids];
        let newTreesData = [...selectedTreesData];
        
        let treeIndex = newTreesData.findIndex(t => t.id === tree.id);
        
        if (newIds.includes(batang.id)) {
            // Remove batang
            newIds = newIds.filter(id => id !== batang.id);
            if (treeIndex !== -1) {
                let currentTree = { ...newTreesData[treeIndex] };
                currentTree.batangs = currentTree.batangs.filter(b => b.id !== batang.id);
                if (currentTree.batangs.length === 0) {
                    newTreesData = newTreesData.filter(t => t.id !== tree.id);
                } else {
                    newTreesData[treeIndex] = currentTree;
                }
            }
        } else {
            // Add batang
            newIds.push(batang.id);
            if (treeIndex === -1) {
                // Clone tree and only add this batang
                let newTree = { ...tree, batangs: [batang] };
                newTreesData.push(newTree);
            } else {
                let currentTree = { ...newTreesData[treeIndex] };
                // Ensure batang isn't already there
                if (!currentTree.batangs.find(b => b.id === batang.id)) {
                    currentTree.batangs = [...currentTree.batangs, batang];
                }
                newTreesData[treeIndex] = currentTree;
            }
        }

        setData('batang_ids', newIds);
        setSelectedTreesData(newTreesData);
    };

    const toggleAllBatangsInTree = (tree, batangsInTree) => {
        const allSelected = batangsInTree.every(b => data.batang_ids.includes(b.id));
        
        let newIds = [...data.batang_ids];
        let newTreesData = [...selectedTreesData];
        let treeIndex = newTreesData.findIndex(t => t.id === tree.id);

        if (allSelected) {
            // Deselect all
            batangsInTree.forEach(batang => {
                newIds = newIds.filter(id => id !== batang.id);
            });
            // Remove tree entirely
            newTreesData = newTreesData.filter(t => t.id !== tree.id);
        } else {
            // Select all
            let currentTree = treeIndex !== -1 ? { ...newTreesData[treeIndex] } : { ...tree, batangs: [] };
            
            batangsInTree.forEach(batang => {
                if (!newIds.includes(batang.id)) {
                    newIds.push(batang.id);
                    if (!currentTree.batangs.find(b => b.id === batang.id)) {
                        currentTree.batangs.push(batang);
                    }
                }
            });

            if (treeIndex === -1) {
                newTreesData.push(currentTree);
            } else {
                newTreesData[treeIndex] = currentTree;
            }
        }

        setData('batang_ids', newIds);
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
                        Kelola data SKSHHK dan pilih batang kayu yang masuk ke dalamnya.
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
                    {/* Left Panel: Available Trees & Batangs */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col max-h-[600px]">
                        <h3 className="font-bold text-lg mb-4 text-primary shrink-0">Cari & Pilih Kayu</h3>
                        
                        <div className="mb-4 relative shrink-0">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan Barcode atau No. Pohon..."
                                className="w-full border-outline-variant rounded-lg pl-10 p-2 focus:ring-primary focus:border-primary text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {loadingTrees ? (
                            <div className="flex justify-center p-8 shrink-0"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                        ) : (
                            <div className="border border-outline-variant rounded-lg overflow-y-auto flex-1">
                                <div className="w-full text-left text-sm">
                                    <div className="bg-surface-container sticky top-0 flex p-3 font-bold border-b border-outline-variant">
                                        <div className="w-10"></div>
                                        <div className="flex-1">Barcode / No</div>
                                        <div className="flex-1">Jenis</div>
                                        <div className="w-24 text-right">Volume (m³)</div>
                                    </div>
                                    <div className="divide-y divide-outline-variant">
                                        {availableTrees.length === 0 ? (
                                            <div className="p-4 text-center text-on-surface-variant">Tidak ada kayu tersedia / ditemukan.</div>
                                        ) : (
                                            availableTrees.map(pohon => {
                                                const isExpanded = expandedAvailableTrees.includes(pohon.id);
                                                const allBatangsSelected = pohon.batangs && pohon.batangs.length > 0 && pohon.batangs.every(b => data.batang_ids.includes(b.id));
                                                const someBatangsSelected = pohon.batangs && pohon.batangs.some(b => data.batang_ids.includes(b.id));
                                                
                                                return (
                                                    <div key={pohon.id} className="flex flex-col">
                                                        <div className="flex p-3 hover:bg-surface-container-lowest transition-colors items-center">
                                                            <div className="w-10 flex items-center gap-2 cursor-pointer" onClick={() => toggleAvailableTreeExpanded(pohon.id)}>
                                                                {isExpanded ? <ChevronDown className="w-5 h-5 text-on-surface-variant" /> : <ChevronRight className="w-5 h-5 text-on-surface-variant" />}
                                                            </div>
                                                            <div className="w-8 flex justify-center cursor-pointer" onClick={() => toggleAllBatangsInTree(pohon, pohon.batangs)}>
                                                                {allBatangsSelected ? (
                                                                    <CheckSquare className="w-5 h-5 text-primary" />
                                                                ) : someBatangsSelected ? (
                                                                    <div className="w-5 h-5 flex items-center justify-center border-2 border-primary rounded-sm bg-primary/20"><div className="w-2.5 h-2.5 bg-primary rounded-sm"></div></div>
                                                                ) : (
                                                                    <Square className="w-5 h-5 text-outline" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 font-mono cursor-pointer" onClick={() => toggleAvailableTreeExpanded(pohon.id)}>
                                                                <div>{pohon.no_barcode || '-'}</div>
                                                                <div className="text-xs text-on-surface-variant">No. Pohon: <span className='text-red-700 font-bold'>{pohon.no_pohon || '-'}</span></div>
                                                            </div>
                                                            <div className="flex-1 cursor-pointer" onClick={() => toggleAvailableTreeExpanded(pohon.id)}>
                                                                {pohon.jenis_pohon?.nama_jenis || '-'}
                                                            </div>
                                                            <div className="w-24 text-right cursor-pointer" onClick={() => toggleAvailableTreeExpanded(pohon.id)}>
                                                                {calculateVolume(pohon.batangs)}
                                                            </div>
                                                        </div>
                                                        
                                                        {isExpanded && pohon.batangs && (
                                                            <div className="bg-surface-container-lowest border-y border-outline-variant py-2 pl-12 pr-3 space-y-1">
                                                                <div className="flex text-xs font-bold text-on-surface-variant px-2 py-1 border-b border-outline-variant mb-1">
                                                                    <div className="w-8"></div>
                                                                    <div className="w-16">No. Btg</div>
                                                                    <div className="w-16">Pnjng</div>
                                                                    <div className="flex-1 text-right">D.Pkl</div>
                                                                    <div className="flex-1 text-right">D.Ujg</div>
                                                                    <div className="flex-1 text-right text-primary">Vol</div>
                                                                </div>
                                                                {pohon.batangs.map(batang => (
                                                                    <div key={batang.id} className="flex text-xs px-2 py-1 hover:bg-surface-container-high rounded items-center cursor-pointer" onClick={() => toggleBatang(batang, pohon)}>
                                                                        <div className="w-8">
                                                                            {data.batang_ids.includes(batang.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-outline" />}
                                                                        </div>
                                                                        <div className="w-16 font-mono">{batang.no_batang}</div>
                                                                        <div className="w-16">{batang.panjang}</div>
                                                                        <div className="flex-1 text-right">{batang.diameter_pangkal}</div>
                                                                        <div className="flex-1 text-right">{batang.diameter_ujung}</div>
                                                                        <div className="flex-1 text-right text-primary font-bold">{batang.volume}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Selected Batangs */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col max-h-[600px]">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-bold text-lg text-primary">Batang Terpilih</h3>
                            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{data.batang_ids.length} Batang</span>
                        </div>
                        {errors.batang_ids && <p className="text-error text-xs mb-2 shrink-0">{errors.batang_ids}</p>}

                        <div className="border border-outline-variant rounded-lg overflow-y-auto flex-1">
                            <div className="w-full text-left text-sm">
                                <div className="bg-surface-container sticky top-0 flex p-3 font-bold border-b border-outline-variant">
                                    <div className="w-8"></div>
                                    <div className="flex-1">Barcode / No</div>
                                    <div className="flex-1">Jenis</div>
                                    <div className="w-24 text-right">Volume (m³)</div>
                                    <div className="w-10"></div>
                                </div>
                                <div className="divide-y divide-outline-variant">
                                    {selectedTreesData.length === 0 ? (
                                        <div className="p-4 text-center text-on-surface-variant">Belum ada batang yang dipilih.</div>
                                    ) : (
                                        selectedTreesData.map(pohon => {
                                            const isExpanded = expandedSelectedTrees.includes(pohon.id);
                                            // Only batangs that are selected
                                            const selectedBatangsInTree = (pohon.batangs || []).filter(b => data.batang_ids.includes(b.id));

                                            if (selectedBatangsInTree.length === 0) return null;

                                            return (
                                                <div key={pohon.id} className="flex flex-col">
                                                    <div className="flex p-3 hover:bg-surface-container-lowest transition-colors items-center">
                                                        <div className="w-8 flex items-center cursor-pointer" onClick={() => toggleSelectedTreeExpanded(pohon.id)}>
                                                            {isExpanded ? <ChevronDown className="w-5 h-5 text-on-surface-variant" /> : <ChevronRight className="w-5 h-5 text-on-surface-variant" />}
                                                        </div>
                                                        <div className="flex-1 font-mono cursor-pointer" onClick={() => toggleSelectedTreeExpanded(pohon.id)}>
                                                            <div>{pohon.no_barcode || '-'}</div>
                                                            <div className="text-xs text-on-surface-variant">{pohon.no_pohon || '-'}</div>
                                                        </div>
                                                        <div className="flex-1 cursor-pointer" onClick={() => toggleSelectedTreeExpanded(pohon.id)}>
                                                            {pohon.jenis_pohon?.nama_jenis || pohon.jenisPohon?.nama_jenis || '-'}
                                                        </div>
                                                        <div className="w-24 text-right font-bold cursor-pointer" onClick={() => toggleSelectedTreeExpanded(pohon.id)}>
                                                            {calculateVolume(selectedBatangsInTree)}
                                                        </div>
                                                        <div className="w-10 flex justify-end">
                                                            <button type="button" onClick={() => toggleAllBatangsInTree(pohon, pohon.batangs)} className="text-error hover:opacity-80" title="Hapus semua batang dari pohon ini">
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="bg-surface-container-lowest border-y border-outline-variant py-2 pl-10 pr-3 space-y-1">
                                                            <div className="flex text-xs font-bold text-on-surface-variant px-2 py-1 border-b border-outline-variant mb-1">
                                                                <div className="w-16">No. Btg</div>
                                                                <div className="w-16">Pnjng</div>
                                                                <div className="flex-1 text-right">D.Pkl</div>
                                                                <div className="flex-1 text-right">D.Ujg</div>
                                                                <div className="flex-1 text-right text-primary">Vol</div>
                                                                <div className="w-8"></div>
                                                            </div>
                                                            {selectedBatangsInTree.map(batang => (
                                                                <div key={batang.id} className="flex text-xs px-2 py-1 hover:bg-surface-container-high rounded items-center">
                                                                    <div className="w-16 font-mono">{batang.no_batang}</div>
                                                                    <div className="w-16">{batang.panjang}</div>
                                                                    <div className="flex-1 text-right">{batang.diameter_pangkal}</div>
                                                                    <div className="flex-1 text-right">{batang.diameter_ujung}</div>
                                                                    <div className="flex-1 text-right text-primary font-bold">{batang.volume}</div>
                                                                    <div className="w-8 flex justify-end">
                                                                        <button type="button" onClick={() => toggleBatang(batang, pohon)} className="text-error hover:opacity-80" title="Hapus batang">
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {selectedTreesData.length > 0 && (
                                    <div className="bg-surface-container font-bold sticky bottom-0 flex p-3 border-t border-outline-variant">
                                        <div className="flex-1 text-right pr-4">Total Volume:</div>
                                        <div className="w-32 text-right">
                                            {selectedTreesData.reduce((total, pohon) => {
                                                const selectedBatangsInTree = (pohon.batangs || []).filter(b => data.batang_ids.includes(b.id));
                                                const treeVol = selectedBatangsInTree.reduce((sum, batang) => sum + Number(batang.volume), 0);
                                                return total + treeVol;
                                            }, 0).toFixed(2)}
                                        </div>
                                    </div>
                                )}
                            </div>
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
