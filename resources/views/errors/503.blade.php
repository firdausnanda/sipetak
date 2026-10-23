<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#012d1d">
    <meta name="robots" content="noindex, nofollow">
    <title>Pemeliharaan Sistem | SIPETAK</title>
    <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon/favicon-32x32.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #191c1d; background: #f8f9fa; }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .page { min-height: 100vh; min-height: 100dvh; display: grid; grid-template-columns: minmax(320px, 44%) minmax(0, 1fr); }
        .brand-panel { position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 100%; padding: clamp(32px, 4.5vw, 64px); overflow: hidden; color: #fff; background: #012d1d; isolation: isolate; }
        .brand-panel::before, .brand-panel::after { content: ""; position: absolute; inset: 0; z-index: -1; }
        .brand-panel::before { background: url('/img/login.webp') center / cover no-repeat; }
        .brand-panel::after { background: linear-gradient(180deg, rgba(1,45,29,.86), rgba(1,45,29,.64) 48%, rgba(1,31,21,.92)); }
        .brand-logo { display: block; width: min(100%, 264px); height: auto; }
        .brand-copy { max-width: 380px; }
        .brand-copy p { margin: 0 0 14px; color: #c1ecd4; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        .brand-copy h2 { margin: 0; font-size: clamp(27px, 3vw, 40px); line-height: 1.18; letter-spacing: -.035em; }
        .brand-footer { margin: 0; color: rgba(255,255,255,.68); font-size: 12px; }
        .content-panel { display: flex; align-items: center; justify-content: center; padding: 40px clamp(24px, 6vw, 96px); }
        .content { width: 100%; max-width: 520px; }
        .eyebrow { display: flex; align-items: center; gap: 12px; margin: 0 0 26px; color: #3f6653; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .eyebrow::before { content: ""; width: 28px; height: 3px; background: #fb8500; }
        h1 { margin: 0; color: #012d1d; font-size: clamp(36px, 4.2vw, 64px); font-weight: 800; line-height: 1.08; letter-spacing: -.055em; }
        .description { max-width: 440px; margin: 24px 0 0; color: #414844; font-size: clamp(16px, 1.3vw, 18px); line-height: 1.7; }
        .status { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 16px; margin: 40px 0 32px; padding: 22px 0; border-top: 1px solid #c1c8c2; border-bottom: 1px solid #c1c8c2; }
        .status-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 10px; color: #012d1d; background: #c1ecd4; }
        .status-icon svg { width: 22px; height: 22px; }
        .status strong { display: block; margin-bottom: 4px; font-size: 14px; }
        .status span { display: block; color: #414844; font-size: 13px; line-height: 1.5; }
        .retry { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 12px 20px; border: 0; border-radius: 4px; color: #fff; background: #012d1d; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; transition: background-color .15s ease; }
        .retry:hover { background: #1b4332; }
        .retry:focus-visible { outline: 3px solid #fb8500; outline-offset: 3px; }
        .retry svg { width: 18px; height: 18px; }
        .note { margin: 20px 0 0; color: #717973; font-size: 12px; line-height: 1.5; }
        @media (max-width: 800px) {
            .page { grid-template-columns: 1fr; }
            .brand-panel { min-height: 220px; padding: 28px 32px; }
            .brand-logo { width: 200px; }
            .brand-copy h2 { font-size: 25px; }
            .brand-footer { display: none; }
            .content-panel { padding: 56px 32px 72px; }
        }
        @media (max-width: 520px) {
            .brand-panel { min-height: 146px; padding: 24px; }
            .brand-logo { width: 170px; }
            .brand-copy { display: none; }
            .content-panel { align-items: stretch; justify-content: flex-start; padding: 42px 24px 56px; }
            .eyebrow { margin-bottom: 22px; }
            .description { margin-top: 20px; }
            .status { margin: 32px 0 28px; }
            .retry { width: 100%; }
        }
    </style>
</head>
<body>
    <main class="page">
        <aside class="brand-panel" aria-label="Identitas SIPETAK">
            <img class="brand-logo" src="/img/logo-white.webp" alt="SIPETAK">
            <div class="brand-copy">
                <p>CDK Wilayah Trenggalek</p>
                <h2>Sistem Informasi Penebangan dan Taksasi Kayu</h2>
            </div>
            <p class="brand-footer">&copy; {{ date('Y') }} CDK Wilayah Trenggalek</p>
        </aside>
        <section class="content-panel" aria-labelledby="maintenance-title">
            <div class="content">
                <p class="eyebrow">Pemberitahuan layanan</p>
                <h1 id="maintenance-title">SIPETAK sedang dipelihara.</h1>
                <p class="description">Kami sedang melakukan pemeliharaan sistem agar layanan dapat digunakan dengan lebih baik. Silakan coba lagi beberapa saat lagi.</p>
                <div class="status" role="status">
                    <div class="status-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12M7.76 16.24l-2.12 2.12"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </div>
                    <div>
                        <strong>Pemeliharaan sedang berlangsung</strong>
                        <span>Akses akan kembali tersedia setelah proses selesai.</span>
                    </div>
                </div>
                <button class="retry" type="button" onclick="window.location.reload()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 11a8 8 0 1 0-2.4 6.2"/><path d="M20 4v7h-7"/>
                    </svg>
                    Coba muat ulang
                </button>
                <p class="note">Jika halaman ini masih muncul, tunggu beberapa saat lalu coba kembali.</p>
            </div>
        </section>
    </main>
</body>
</html>
