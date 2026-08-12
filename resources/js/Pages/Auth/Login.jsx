import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="h-full min-h-screen bg-background text-on-background flex flex-col md:flex-row font-body-md text-body-md overflow-hidden">
            <Head title="SIPETAK - Halaman Login" />

            {/* Left/Top Section: Brand & Imagery (Forestry Theme) */}
            <div className="relative flex-1 bg-primary-container md:min-h-screen overflow-hidden hidden md:block">
                {/* Background Image Placeholder with Forestry Theme prompt */}
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA0AvkcHTnJ5-CEax7kpvxuqBFgIMPdYtjZqD4xpXB7bBbWfVjrf42JAMUjQjtqS0p7BJPNWlBgHJTIxSZVhJaVzH1ooxt4w-0Tl6tl0JaLwsQChtBHNAfQ-rZs594cARbCaXeKzy6wiACzoxc5llQ7DakENWinlypZgA-YNf_0l0dAWaXY1VWHmrCD5uQj2y69ccABFMsizP-dYRx3kO42RBbUlSYVW7Wc-VeGzUHzciZazMyVrDpN0g')" }}
                ></div>
                <div className="absolute inset-0 bg-primary-container bg-opacity-80"></div>
                <div className="relative z-10 p-margin-desktop h-full flex flex-col justify-between text-on-primary">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>forest</span>
                            <h1 className="font-display text-display tracking-tight font-bold">SIPETAK</h1>
                        </div>
                        <p className="font-headline-md text-headline-md max-w-md text-primary-fixed-dim">Sistem Informasi Penebangan dan Taksasi Kayu</p>
                    </div>
                    
                    <div className="bg-surface-tint bg-opacity-30 p-6 rounded-xl border border-outline-variant backdrop-blur-sm inline-block self-start">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="font-body-md text-body-md font-medium text-on-primary">CDK Wilayah Trenggalek</p>
                                <p className="font-data-mono text-data-mono text-primary-fixed-dim text-sm">Sistem Pencatatan Perkiraan Hasil Kayu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right/Bottom Section: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-12 md:py-0 bg-surface md:min-h-screen">
                {/* Mobile Header (Visible only on small screens) */}
                <div className="w-full max-w-md mb-8 flex flex-col items-center md:hidden text-center">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>forest</span>
                    <h1 className="font-display text-display text-primary font-bold">SIPETAK</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2">Sistem Informasi Penebangan dan Taksasi Kayu</p>
                </div>
                
                <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6">Login Operator</h2>
                    
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={submit}>
                        {/* User Name Input */}
                        <div className="space-y-1">
                            <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider" htmlFor="email">ID Operator / Nama Pengguna (Email)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-on-surface-variant">person</span>
                                </span>
                                <input 
                                    className={`block w-full h-touch-target pl-10 pr-10 border-outline-variant rounded-DEFAULT bg-surface text-on-surface focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] sm:text-sm font-data-mono ${errors.email ? 'border-error' : ''}`}
                                    id="email" 
                                    name="email" 
                                    placeholder="Masukkan Email Operator" 
                                    required 
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {data.email && (
                                    <button 
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface" 
                                        onClick={() => setData('email', '')} 
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
                            {errors.email && <div className="text-sm text-error mt-1">{errors.email}</div>}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider" htmlFor="password">PIN Akses / Kata Sandi</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                                </span>
                                <input 
                                    className={`block w-full h-touch-target pl-10 pr-10 border-outline-variant rounded-DEFAULT bg-surface text-on-surface focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] sm:text-sm font-data-mono ${errors.password ? 'border-error' : ''}`}
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            {errors.password && <div className="text-sm text-error mt-1">{errors.password}</div>}
                        </div>

                        <div className="block mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    className="rounded border-outline-variant text-[#FB8500] shadow-sm focus:ring-[#FB8500] focus:ring-opacity-50"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ms-2 text-sm text-on-surface-variant">Ingat Saya</span>
                            </label>
                        </div>

                        {/* Login Button */}
                        <button 
                            className="w-full flex justify-center items-center h-touch-target px-4 py-2 border border-transparent rounded-DEFAULT shadow-sm text-sm font-bold text-white bg-[#FB8500] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB8500] transition-colors active:shadow-inner active:bg-[#e07700] disabled:opacity-50" 
                            type="submit"
                            disabled={processing}
                        >
                            MASUK KE SISTEM
                        </button>
                        
                        <button type="button" className="w-full flex justify-center items-center gap-2 h-touch-target px-4 py-2 border border-outline-variant rounded-DEFAULT shadow-sm text-sm font-bold text-on-surface bg-surface hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-outline transition-colors mt-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            Login dengan Google
                        </button>
                    </form>
                </div>
                
                <div className="mt-8 text-center text-sm font-data-mono text-outline w-full max-w-md">
                    v1.0.0 - Build 2026
                </div>
            </div>
        </div>
    );
}
