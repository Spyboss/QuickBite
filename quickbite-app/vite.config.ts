import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    // Custom plugin to handle module resolution
    {
      name: 'module-resolver',
      resolveId(id, importer) {
        // Handle bare module specifiers for our shims
        if (id === 'react-admin') {
          return path.resolve(__dirname, 'src/shims/react-admin.js');
        }
        if (id === 'ra-ui-materialui') {
          return path.resolve(__dirname, 'src/shims/ra-ui-materialui.js');
        }
        if (id === 'ra-core') {
          return path.resolve(__dirname, 'src/shims/ra-core.js');
        }
        if (id === 'firebase' || id === 'firebase/app' || id === 'firebase/auth' ||
            id === 'firebase/messaging' || id === 'firebase/analytics') {
          return path.resolve(__dirname, 'src/shims/firebase.js');
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
            warning.message?.includes('Cannot find module') ||
            warning.message?.includes('ra-ui-materialui') ||
            warning.message?.includes('ra-core') ||
            warning.message?.includes('ra-language-english') ||
            warning.message?.includes('react-admin')
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
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['date-fns', 'zod', 'axios'],
          'vendor-shims': [
            './src/shims/firebase.js',
            './src/shims/ra-core.js',
            './src/shims/ra-ui-materialui.js',
            './src/shims/react-admin.js'
          ]
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
      '@': path.resolve(__dirname, 'src'),
      'react-admin': path.resolve(__dirname, 'src/shims/react-admin.js'),
      'ra-ui-materialui': path.resolve(__dirname, 'src/shims/ra-ui-materialui.js'),
      'ra-core': path.resolve(__dirname, 'src/shims/ra-core.js'),
      'firebase': path.resolve(__dirname, 'src/shims/firebase.js'),
      'firebase/app': path.resolve(__dirname, 'src/shims/firebase.js'),
      'firebase/auth': path.resolve(__dirname, 'src/shims/firebase.js'),
      'firebase/messaging': path.resolve(__dirname, 'src/shims/firebase.js'),
      'firebase/analytics': path.resolve(__dirname, 'src/shims/firebase.js')
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  }
})
