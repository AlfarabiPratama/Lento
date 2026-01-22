/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['selector', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                // Primary - uses CSS variable for dark mode
                primary: {
                    DEFAULT: 'var(--lento-primary)',
                    light: '#7AB5A8',
                    dark: 'var(--lento-primary-dark)',
                    50: '#EDF5F3',
                    100: '#D4E8E3',
                    500: 'var(--lento-primary)',
                    600: '#4A8275',
                    700: '#3D6B61',
                },
                // Secondary - Warm Amber
                secondary: {
                    DEFAULT: '#E8B86D',
                    light: '#F0CB8E',
                    dark: '#D4A055',
                },
                // Background - uses CSS variable
                paper: {
                    DEFAULT: 'var(--lento-bg)',
                    warm: 'color-mix(in srgb, var(--lento-surface) 95%, var(--lento-primary) 5%)',
                    cream: 'color-mix(in srgb, var(--lento-bg) 90%, var(--lento-primary) 10%)',
                },
                // Surface - uses CSS variable
                surface: {
                    DEFAULT: 'var(--lento-surface)',
                    elevated: 'var(--lento-surface)',
                },
                // Text colors - uses CSS variables
                ink: {
                    DEFAULT: 'var(--lento-text)',
                    muted: 'var(--lento-muted)',
                    soft: 'var(--lento-light)',
                    light: 'var(--lento-light)',
                },
                // Border colors - uses CSS variable
                line: {
                    DEFAULT: 'var(--lento-border)',
                    soft: 'var(--lento-border)',
                    dark: 'var(--lento-border-strong)',
                },
                // Status colors - uses CSS variables
                success: 'var(--lento-success)',
                warning: 'var(--lento-warning)',
                danger: 'var(--lento-danger)',
                info: '#3B82F6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                // Sesuai mockup typography
                'h1': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '-0.02em' }],
                'h2': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
                'h3': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
                'body': ['0.9375rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 15px
                'small': ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 13px
                'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }], // 12px
                'tiny': ['0.6875rem', { lineHeight: '0.875rem', fontWeight: '500' }], // 11px
            },
            spacing: {
                '0.5': '2px',
                '1': '4px',
                '1.5': '6px',
                '2': '8px',
                '2.5': '10px',
                '3': '12px',
                '3.5': '14px',
                '4': '16px',
                '5': '20px',
                '6': '24px',
                '7': '28px',
                '8': '32px',
                '9': '36px',
                '10': '40px',
                '12': '48px',
                '14': '56px',
                '16': '64px',
            },
            borderRadius: {
                'none': '0',
                'sm': '6px',
                'DEFAULT': '8px',
                'md': '10px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
                'full': '9999px',
            },
            boxShadow: {
                'xs': '0 1px 2px rgba(0,0,0,0.04)',
                'sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                'DEFAULT': '0 2px 4px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.02)',
                'md': '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.03)',
                'lg': '0 10px 15px rgba(0,0,0,0.04), 0 20px 25px rgba(0,0,0,0.02)',
                'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
            },
            transitionDuration: {
                'fast': '100ms',
                'normal': '150ms',
                'slow': '200ms',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            maxWidth: {
                'content': '1100px',
                'narrow': '720px',
            },
            minHeight: {
                'screen-nav': 'calc(100vh - 64px)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.2s ease-out',
                'pulse-soft': 'pulseSoft 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
        },
    },
    plugins: [],
}
