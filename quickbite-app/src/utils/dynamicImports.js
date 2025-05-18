/**
 * Dynamic imports utility for code splitting
 * 
 * This file provides examples of how to use dynamic imports for code splitting
 * to reduce the initial bundle size and improve performance.
 */
import { lazy } from 'react';

// Example of dynamically importing MUI components
export const DynamicAutocomplete = lazy(() => import('@mui/material/Autocomplete'));
export const DynamicDialog = lazy(() => import('@mui/material/Dialog'));
export const DynamicDrawer = lazy(() => import('@mui/material/Drawer'));
export const DynamicDataGrid = lazy(() => import('@mui/x-data-grid/DataGrid'));

// Example usage in a component:
/*
import { Suspense, useState } from 'react';
import { DynamicDialog } from '../utils/dynamicImports';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Dialog</button>
      
      {open && (
        <Suspense fallback={<div>Loading...</div>}>
          <DynamicDialog open={open} onClose={() => setOpen(false)}>
            <div>Dialog content</div>
          </DynamicDialog>
        </Suspense>
      )}
    </>
  );
}
*/
