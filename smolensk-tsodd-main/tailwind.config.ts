const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#62a744',
          light: '#8bc34a',
          dark: '#4a7c3a',
        },
        background: {
          default: '#fafafa',
          paper: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Golos Text', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Отключаем сброс стилей Tailwind для совместимости с MUI
  },
  important: '#__next', // Увеличиваем специфичность для переопределения MUI стилей
}

export default config