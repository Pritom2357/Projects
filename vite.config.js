import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default {
  server: {
    proxy: {
      // '/api': {
      //   target: 'https://r.applovin.com',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },
      '/api': 'http://localhost:5000',//proxy configuration
    },
  },
};
