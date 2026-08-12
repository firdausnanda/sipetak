import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "tertiary": "#3f1d00",
                "surface-dim": "#d9dadb",
                "error-container": "#ffdad6",
                "surface-bright": "#f8f9fa",
                "surface-container-highest": "#e1e3e4",
                "secondary": "#79564b",
                "inverse-surface": "#2e3132",
                "on-tertiary-fixed-variant": "#703800",
                "on-primary": "#ffffff",
                "secondary-fixed": "#ffdbcf",
                "on-surface": "#191c1d",
                "on-secondary": "#ffffff",
                "on-primary-fixed-variant": "#274e3d",
                "primary-container": "#1b4332",
                "on-secondary-container": "#79574c",
                "on-surface-variant": "#414844",
                "background": "#f8f9fa",
                "tertiary-fixed-dim": "#ffb781",
                "tertiary-fixed": "#ffdcc4",
                "surface-variant": "#e1e3e4",
                "outline-variant": "#c1c8c2",
                "on-tertiary-fixed": "#301400",
                "on-background": "#191c1d",
                "on-error": "#ffffff",
                "surface-container-high": "#e7e8e9",
                "tertiary-container": "#5f2f00",
                "secondary-container": "#fed0c1",
                "inverse-on-surface": "#f0f1f2",
                "surface-container-low": "#f3f4f5",
                "secondary-fixed-dim": "#e9bdae",
                "error": "#ba1a1a",
                "surface": "#f8f9fa",
                "on-error-container": "#93000a",
                "on-secondary-fixed": "#2d150d",
                "primary-fixed-dim": "#a5d0b9",
                "on-primary-container": "#86af99",
                "surface-container": "#edeeef",
                "surface-tint": "#3f6653",
                "on-secondary-fixed-variant": "#5e3f35",
                "on-primary-fixed": "#002114",
                "surface-container-lowest": "#ffffff",
                "outline": "#717973",
                "on-tertiary": "#ffffff",
                "on-tertiary-container": "#fd8704",
                "inverse-primary": "#a5d0b9",
                "primary-fixed": "#c1ecd4",
                "primary": "#012d1d",
                "safety-orange": "#FB8500",
            },
            borderRadius: {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "0.75rem"
            },
            spacing: {
                "base": "8px",
                "container-padding": "24px",
                "margin-desktop": "64px",
                "touch-target": "48px",
                "gutter": "16px",
                "margin-mobile": "16px"
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                "headline-lg-mobile": ["Inter"],
                "data-mono": ["JetBrains Mono"],
                "headline-lg": ["Inter"],
                "headline-md": ["Inter"],
                "body-lg": ["Inter"],
                "label-caps": ["Inter"],
                "body-md": ["Inter"],
                "display": ["Inter"]
            },
            fontSize: {
                "headline-lg-mobile": ["22px", { "lineHeight": "28px", "fontWeight": "600" }],
                "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
                "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700" }],
                "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                "display": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
            }
        },
    },

    plugins: [forms],
};
