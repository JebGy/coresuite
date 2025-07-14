/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {
      // Configuración para evitar oklch
      colorFunction: 'hex',
      // Forzar uso de colores hexadecimales
      experimental: {
        optimizeUniversalDefaults: false,
      },
    },
  },
}

export default config
