import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isVercel = process.env.VERCEL === '1'

export default defineConfig({
  base: isVercel ? '/' : '/azhar/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/admin')) {
            return 'admin';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
    },
  },
})
