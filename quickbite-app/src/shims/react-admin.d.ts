/**
 * Type definitions for react-admin shim
 */

// Re-export everything from ra-core and ra-ui-materialui
export * from './ra-core';
export * from './ra-ui-materialui';

// Additional exports
export const Admin: any;
export const Resource: any;
export const AdminContext: any;
export const AdminUI: any;
export const CustomRoutes: any;
export const mergeTranslations: any;

// Default export
declare const _default: any;
export default _default;
