import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to handle "use client" directives in MUI components
    {
      name: 'ignore-use-client-directive',
      transform(code) {
        if (code.includes('"use client"') || code.includes("'use client'")) {
          // Remove the "use client" directive
          return code.replace(/"use client";?/g, '').replace(/'use client';?/g, '');
        }
        return null;
      }
    },
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
      // Don't mark any packages as external to ensure all dependencies are bundled
      external: [],
      output: {
        // Implement manual chunks for better code splitting
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-firebase': ['firebase'],
          'vendor-admin': ['react-admin', 'ra-ui-materialui', 'ra-core', 'ra-language-english'],
          'vendor-supabase': ['@supabase/supabase-js', 'ra-supabase'],
          'vendor-utils': ['date-fns', 'zod', 'axios']
        }
      }
    },
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    emptyOutDir: true,
    // Increase the chunk size warning limit to avoid unnecessary warnings
    chunkSizeWarningLimit: 600,
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
