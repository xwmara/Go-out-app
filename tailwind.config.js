export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a0610',
          900: '#0f0a14',
          850: '#15101b',
          800: '#1b1422',
          750: '#22192b',
          700: '#2c2135',
          600: '#3a2c45',
        },
        wine: {
          50: '#fdf2f5',
          100: '#fbe2ea',
          200: '#f6c2d2',
          300: '#ed94b0',
          400: '#e15c83',
          500: '#cf2f63',
          600: '#b71e4c',
          700: '#931641',
          800: '#6f1433',
          900: '#4e1027',
          950: '#2c0714',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #cf2f63 0%, #7f1538 55%, #4e1027 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #b71e4c 0%, #6f1433 100%)',
        'ink-radial':
          'radial-gradient(900px circle at 12% -10%, rgba(183,30,76,0.22), transparent 45%), radial-gradient(700px circle at 100% 0%, rgba(80,16,40,0.35), transparent 50%)',
      },
      boxShadow: {
        soft: '0 18px 48px rgba(0,0,0,0.45)',
        card: '0 24px 70px rgba(0,0,0,0.5)',
        elevated: '0 30px 90px rgba(0,0,0,0.6)',
        glow: '0 16px 40px rgba(183,30,76,0.35)',
        'glow-sm': '0 10px 24px rgba(183,30,76,0.3)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-down': 'fade-down 0.5s ease-out both',
        'scale-in': 'scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        marquee: 'marquee 38s linear infinite',
        'marquee-reverse': 'marquee-reverse 38s linear infinite',
      },
    },
  },
  plugins: [],
};
