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
    // Custom plugin to handle missing modules
    {
      name: 'handle-missing-modules',
      resolveId(id) {
        // If the module is one of the React Admin modules we've marked as external,
        // return a virtual module that exports an empty object
        if (id === 'ra-ui-materialui' || id === 'ra-core' || id === 'ra-language-english') {
          return { id, external: true };
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
      // Mark React Admin packages as external to avoid bundling issues
      external: [
        'react-admin',
        'ra-ui-materialui',
        'ra-core',
        'ra-language-english'
      ],
      output: {
        // Implement manual chunks for better code splitting
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-firebase': ['firebase'],
          'vendor-supabase': ['@supabase/supabase-js'],
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
    alias: [
      { find: '@', replacement: '/src' },
      // Use our shim for ra-ui-materialui
      { find: 'ra-ui-materialui', replacement: '/src/shims/ra-ui-materialui.js' },
      // Also handle the case where it's imported from node_modules
      { find: /^ra-ui-materialui$/, replacement: '/src/shims/ra-ui-materialui.js' },
      // Use our shim for ra-core
      { find: 'ra-core', replacement: '/src/shims/ra-core.js' },
      // Also handle the case where it's imported from node_modules
      { find: /^ra-core$/, replacement: '/src/shims/ra-core.js' },
      // Use our shim for react-admin
      { find: 'react-admin', replacement: '/src/shims/react-admin.js' },
      // Also handle the case where it's imported from node_modules
      { find: /^react-admin$/, replacement: '/src/shims/react-admin.js' }
    ]
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  }
})
