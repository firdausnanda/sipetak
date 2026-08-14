import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
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
                    style={{ backgroundImage: "url('/img/login.webp')" }}
                ></div>
                <div className="absolute inset-0 bg-primary-container bg-opacity-80"></div>
                <div className="relative z-10 p-margin-desktop h-full flex flex-col justify-between text-on-primary">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
                                <path d="M16 12L22 21H18V24H14V21H10L16 12Z" />
                                <path d="M8 12L14 21H11V24H7V21H3L8 12Z" />
                                <path d="M12 2L19 13H15V24H9V13H5L12 2Z" />
                            </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-primary mb-2">
                        <path d="M16 12L22 21H18V24H14V21H10L16 12Z" />
                        <path d="M8 12L14 21H11V24H7V21H3L8 12Z" />
                        <path d="M12 2L19 13H15V24H9V13H5L12 2Z" />
                    </svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-on-surface-variant">
                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                    </svg>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-on-surface-variant">
                                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input 
                                    className={`block w-full h-touch-target pl-10 pr-10 border-outline-variant rounded-DEFAULT bg-surface text-on-surface focus:ring-2 focus:ring-[#FB8500] focus:border-[#FB8500] sm:text-sm font-data-mono ${errors.password ? 'border-error' : ''}`}
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
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
                            className="w-full flex justify-center items-center gap-2 h-touch-target px-4 py-2 border border-transparent rounded-DEFAULT shadow-sm text-sm font-bold text-white bg-[#FB8500] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB8500] transition-colors active:shadow-inner active:bg-[#e07700] disabled:opacity-50" 
                            type="submit"
                            disabled={processing}
                        >
                            {processing && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {processing ? 'MEMPROSES...' : 'MASUK KE SISTEM'}
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
