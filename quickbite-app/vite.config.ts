import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle Rollup errors
    {
      name: 'handle-rollup-errors',
      configResolved(config) {
        // Ensure the build doesn't fail due to missing optional dependencies
        const originalBuildStart = config.build.rollupOptions.onwarn || (() => {});
        config.build.rollupOptions.onwarn = (warning, warn) => {
          // Ignore specific warnings
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            warning.code === 'MISSING_EXPORT' ||
            warning.code === 'CIRCULAR_DEPENDENCY' ||
            warning.message?.includes('failed to resolve') ||
            warning.message?.includes('@rollup/rollup-') ||
            warning.message?.includes('Cannot find module')
          ) {
            console.log(`Ignoring Rollup warning: ${warning.message || warning.code}`);
            return;
          }
          originalBuildStart(warning, warn);
        };
      }
    }
  ],
  build: {
    rollupOptions: {
      // Don't mark these as external, as we need them for the build
      external: [
        'react-admin',
        'ra-supabase',
        '@supabase/supabase-js'
      ]
    },
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    emptyOutDir: true,
    commonjsOptions: {
      // Prevent Rollup from trying to resolve native modules
      ignoreDynamicRequires: true,
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  }
})
