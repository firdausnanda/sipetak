import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout>
            <Head title="SIPETAK Admin - Laporan Hasil Tebangan" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-display text-display text-primary mb-2">Laporan Hasil Tebangan</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Kelola dan tinjau data operasional penebangan harian.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 border border-outline-variant bg-surface-container-lowest px-4 py-2 rounded-lg text-primary hover:bg-surface-container-low transition-colors min-h-[48px] font-bold">
                        <span className="material-symbols-outlined">description</span>
                        CSV
                    </button>
                    <button className="flex items-center gap-2 bg-[#FB8500] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px] font-bold shadow-sm">
                        <span className="material-symbols-outlined">table_view</span>
                        Excel
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-end">
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Nama Kelompok</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">group</span>
                        <input className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-[#FB8500] focus:ring-1 focus:ring-[#FB8500] min-h-[48px] bg-surface-container-lowest" placeholder="Cari regu..." type="text" />
                    </div>
                </div>
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">Rentang Tanggal</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">calendar_month</span>
                        <input className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-[#FB8500] focus:ring-1 focus:ring-[#FB8500] min-h-[48px] bg-surface-container-lowest" placeholder="Pilih tanggal" type="text" defaultValue="01 Okt 2023 - 31 Okt 2023" />
                    </div>
                </div>
                <div className="w-full lg:flex-1">
                    <label className="block font-label-caps text-label-caps text-[#6D4C41] mb-2">No. Petak</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">map</span>
                        <select className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-[#FB8500] focus:ring-1 focus:ring-[#FB8500] min-h-[48px] bg-surface-container-lowest appearance-none">
                            <option>Semua Petak</option>
                            <option>Petak 14A</option>
                            <option>Petak 14B</option>
                            <option>Petak 15A</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                </div>
                <button className="bg-primary text-on-primary px-6 py-2 rounded-lg min-h-[48px] font-bold hover:bg-opacity-90 transition-colors w-full lg:w-auto mt-2 lg:mt-0">
                    Terapkan
                </button>
            </div>

            {/* Data Table Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41]">Nama Kelompok</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41]">Tanggal</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41]">No. Petak</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41]">Jenis Pohon</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41]">ID Barcode</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41] text-right">No. Batang</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41] text-right">Panjang (cm)</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41] text-right">D. Ujung</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41] text-right">D. Pangkal</th>
                                <th className="py-4 px-4 font-label-caps text-label-caps text-[#6D4C41] text-center">Mutu</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-[#1B4332] divide-y divide-outline-variant">
                            {/* Row 1 */}
                            <tr className="hover:bg-surface-container-lowest bg-surface transition-colors">
                                <td className="py-3 px-4 font-bold">Kelompok Alpha</td>
                                <td className="py-3 px-4">12 Okt 2023</td>
                                <td className="py-3 px-4">14A</td>
                                <td className="py-3 px-4">Meranti</td>
                                <td className="py-3 px-4 font-data-mono text-data-mono">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-outline text-sm">qr_code_2</span>
                                        BC-99201
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">1</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">1200</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">45</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">52</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded text-xs font-bold">Baik</span>
                                </td>
                            </tr>
                            {/* Row 2 */}
                            <tr className="hover:bg-surface-container-lowest transition-colors">
                                <td className="py-3 px-4 font-bold">Kelompok Alpha</td>
                                <td className="py-3 px-4">12 Okt 2023</td>
                                <td className="py-3 px-4">14A</td>
                                <td className="py-3 px-4">Meranti</td>
                                <td className="py-3 px-4 font-data-mono text-data-mono">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-outline text-sm">qr_code_2</span>
                                        BC-99202
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">2</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">800</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">38</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">45</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded text-xs font-bold">Sedang</span>
                                </td>
                            </tr>
                            {/* Row 3: Non-barcode */}
                            <tr className="hover:bg-surface-container-lowest bg-surface transition-colors">
                                <td className="py-3 px-4 font-bold">Kelompok Bravo</td>
                                <td className="py-3 px-4">12 Okt 2023</td>
                                <td className="py-3 px-4">14B</td>
                                <td className="py-3 px-4">Kapur</td>
                                <td className="py-3 px-4 text-on-surface-variant italic text-sm">- Manual -</td>
                                <td className="py-3 px-4 text-right">1</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">1500</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">60</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">75</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded text-xs font-bold">Baik</span>
                                </td>
                            </tr>
                            {/* Row 4 */}
                            <tr className="hover:bg-surface-container-lowest transition-colors">
                                <td className="py-3 px-4 font-bold">Kelompok Charlie</td>
                                <td className="py-3 px-4">11 Okt 2023</td>
                                <td className="py-3 px-4">15A</td>
                                <td className="py-3 px-4">Keruing</td>
                                <td className="py-3 px-4 font-data-mono text-data-mono">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-outline text-sm">qr_code_2</span>
                                        BC-99188
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">1</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">950</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">42</td>
                                <td className="py-3 px-4 text-right font-data-mono text-data-mono">48</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-error-container text-on-error-container rounded text-xs font-bold">Rendah</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* Pagination Footer */}
                <div className="border-t border-outline-variant p-4 flex flex-col md:flex-row items-center justify-between bg-surface-container-lowest gap-4">
                    <span className="text-sm text-on-surface-variant font-body-md">Menampilkan 1-4 dari 250 data</span>
                    <div className="flex gap-2">
                        <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low disabled:opacity-50 min-h-[40px] min-w-[40px] flex items-center justify-center" disabled>
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low bg-surface-container-low min-h-[40px] min-w-[40px] flex items-center justify-center font-bold">1</button>
                        <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low min-h-[40px] min-w-[40px] flex items-center justify-center font-bold">2</button>
                        <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low min-h-[40px] min-w-[40px] flex items-center justify-center font-bold">3</button>
                        <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low min-h-[40px] min-w-[40px] flex items-center justify-center">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="h-24 md:h-8"></div> {/* Bottom padding for scrolling */}
        </AdminLayout>
    );
}
