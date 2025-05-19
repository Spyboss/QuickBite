/**
 * Shim for react-admin
 *
 * This file provides empty implementations of the components and functions from react-admin
 * that are being imported by ra-supabase.
 */

// Import our shims
import * as raCore from './ra-core.js';
import * as raUiMaterialui from './ra-ui-materialui.js';

// Re-export everything from ra-core and ra-ui-materialui
export * from './ra-core.js';
export * from './ra-ui-materialui.js';

// Create a factory function for components
const createComponent = (name) => {
  const Component = () => null;
  Component.displayName = name;
  return Component;
};

// Create the Admin component
export const Admin = createComponent('Admin');
Admin.defaultProps = {
  dataProvider: {},
  authProvider: {},
  i18nProvider: {},
  theme: {},
  layout: raUiMaterialui.Layout,
  catchAll: raUiMaterialui.Error,
  loginPage: raUiMaterialui.Login,
  logoutButton: raUiMaterialui.Logout
};

// Create the Resource component
export const Resource = createComponent('Resource');
Resource.defaultProps = {
  icon: null,
  options: {},
  list: null,
  create: null,
  edit: null,
  show: null
};

// Additional components and functions that were missing
export const AdminContext = createComponent('AdminContext');
export const AdminUI = createComponent('AdminUI');
export const CustomRoutes = createComponent('CustomRoutes');
export const mergeTranslations = (...translations) => ({});

// Export a default object with all the components and functions
export default {
  ...raCore,
  ...raUiMaterialui,
  Admin,
  Resource,
  AdminContext,
  AdminUI,
  CustomRoutes,
  mergeTranslations
};
