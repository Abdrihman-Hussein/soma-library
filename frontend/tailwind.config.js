/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — teal, kept from v0.1
        primary: {
          DEFAULT: '#0F766E',
          dark: '#0A4F4A',
          light: '#E2F0EC',
        },
        // Warm secondary — brass, used for editorial rules, eyebrows, keys
        accent: {
          DEFAULT: '#A87C3C',
          dark: '#7E5A26',
          light: '#F4EADA',
        },
        // Paper stack
        surface: '#FFFDF8',
        canvas: '#F5F0E6',
        inset: '#EDE5D6',
        divider: '#E3D9C7',
        // Warm ink rather than cold slate.
        // `soft` and `faint` are dark enough to clear WCAG AA (4.5:1) on every
        // surface in the stack — canvas, surface and inset. The earlier
        // `faint` (#9E9082) only reached 2.73:1, which failed on small print,
        // table headers, breadcrumbs and footer labels across the whole site.
        ink: {
          DEFAULT: '#1B1814',
          soft: '#5C5145', // ~6.8:1 on canvas
          faint: '#6B6052', // ~5.4:1 on canvas, ~4.9:1 on inset
        },
        status: {
          success: '#2E7D52',
          warning: '#B57A1F',
          danger: '#AB3B2C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'Times New Roman', 'serif'],
      },
      // `4.5` was used across the codebase but missing from the default scale,
      // which left those icons without a size. Added so the existing
      // `h-4.5 w-4.5` classes resolve properly.
      spacing: {
        4.5: '1.125rem',
      },
      fontSize: {
        // Editorial display steps
        display: ['clamp(2.5rem, 5.4vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.022em' }],
        title: ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.018em' }],
        'title-sm': ['1.3125rem', { lineHeight: '1.25', letterSpacing: '-0.012em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.16em' }],
      },
      boxShadow: {
        // Warm, low-contrast — reads as printed shadow, not UI glow
        soft: '0 1px 2px rgba(58,44,26,0.05), 0 4px 12px -6px rgba(58,44,26,0.10)',
        card: '0 2px 4px rgba(58,44,26,0.05), 0 18px 36px -22px rgba(58,44,26,0.30)',
        lift: '0 2px 6px rgba(58,44,26,0.07), 0 28px 52px -26px rgba(58,44,26,0.38)',
        book: '0 1px 2px rgba(58,44,26,0.20), 0 12px 22px -12px rgba(58,44,26,0.45)',
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
      },
      backgroundImage: {
        // Faint tooth of paper, tiled
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
