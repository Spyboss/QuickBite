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
            warning.message?.includes('@rollup/rollup-linux') ||
            warning.message?.includes('Cannot find module') ||
            warning.message?.includes('failed to resolve')
          ) {
            return;
          }
          originalBuildStart(warning, warn);
        };
      }
    }
  ],
  build: {
    rollupOptions: {
      external: [
        'react-admin',
        'ra-supabase',
        '@supabase/supabase-js',
        '@rollup/rollup-linux-x64-gnu',
        '@rollup/rollup-darwin-x64',
        '@rollup/rollup-linux-x64-musl',
        '@rollup/rollup-win32-x64-msvc',
        '@rollup/rollup-darwin-arm64'
      ]
    },
    target: 'es2018',
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
  optimizeDeps: {
    exclude: [
      '@rollup/rollup-linux-x64-gnu',
      '@rollup/rollup-darwin-x64',
      '@rollup/rollup-linux-x64-musl',
      '@rollup/rollup-win32-x64-msvc',
      '@rollup/rollup-darwin-arm64'
    ]
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  }
})
