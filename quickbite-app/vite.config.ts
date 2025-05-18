import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    rollupOptions: {
      external: [
        'react-admin',
        'ra-supabase',
        '@supabase/supabase-js'
      ],
      // Fix for Rollup optional dependency error
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        // Use default for everything else
        warn(warning)
      }
    },
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu'] // Exclude problematic optional dependency
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  }
})
