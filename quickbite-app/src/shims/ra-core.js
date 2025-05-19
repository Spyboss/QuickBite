/**
 * Shim for ra-core
 *
 * This file provides empty implementations of the functions and components from ra-core
 * that are being imported by ra-supabase.
 */

// Create a factory function for components
const createComponent = (name) => {
  const Component = () => null;
  Component.displayName = name;
  return Component;
};

// Create empty functions
export const useNotify = () => () => {};
export const useRedirect = () => () => {};
export const useRefresh = () => () => {};
export const useDataProvider = () => ({});
export const useGetOne = () => ({ data: null, loading: false, error: null });
export const useGetList = () => ({ data: [], total: 0, loading: false, error: null });
export const useGetMany = () => ({ data: [], loading: false, error: null });
export const useGetManyReference = () => ({ data: [], total: 0, loading: false, error: null });
export const useCreate = () => [() => {}, { loading: false, error: null }];
export const useUpdate = () => [() => {}, { loading: false, error: null }];
export const useUpdateMany = () => [() => {}, { loading: false, error: null }];
export const useDelete = () => [() => {}, { loading: false, error: null }];
export const useDeleteMany = () => [() => {}, { loading: false, error: null }];
export const useQuery = () => ({ data: null, loading: false, error: null });
export const useMutation = () => [() => {}, { loading: false, error: null }];
export const useQueryWithStore = () => ({ data: null, loading: false, error: null });
export const useAuthenticated = () => {};
export const useAuthProvider = () => ({});
export const usePermissions = () => ({ data: null, loading: false, error: null });
export const useGetPermissions = () => [() => {}, { loading: false, error: null }];
export const useLogin = () => [() => {}, { loading: false, error: null }];
export const useLogout = () => [() => {}, { loading: false, error: null }];
export const useCheckAuth = () => () => Promise.resolve();
export const useCheckError = () => () => {};
export const useGetIdentity = () => ({ data: null, loading: false, error: null });
export const useTranslate = () => (key) => key;
export const useLocale = () => 'en';
export const useSetLocale = () => () => {};
export const useSafeSetState = (initialState) => [initialState, () => {}];
export const useVersion = () => '1';
export const useResourceContext = () => 'resource';
export const useResourceDefinition = () => ({});
export const useGetResourceLabel = () => () => '';
export const useRecordContext = () => ({});
export const useReference = () => ({ referenceRecord: null, error: null, loading: false });
export const useWarnWhenUnsavedChanges = () => {};
export const useFormContext = () => ({});
export const useInput = () => ({ input: {}, meta: {} });
export const useChoices = () => ({ choices: [] });
export const usePaginationState = () => [{ page: 1, perPage: 10 }, () => {}];
export const useSortState = () => [{ field: 'id', order: 'ASC' }, () => {}];
export const useFilterState = () => [{ filter: {} }, () => {}];
export const useListContext = () => ({});
export const useListController = () => ({});
export const useEditContext = () => ({});
export const useEditController = () => ({});
export const useCreateContext = () => ({});
export const useCreateController = () => ({});
export const useShowContext = () => ({});
export const useShowController = () => ({});

// Additional functions that were missing
export const required = () => '';
export const fetchUtils = {
  fetchJson: async () => ({ json: {} }),
  createHeadersFromOptions: () => ({}),
  queryParameters: () => ''
};

// Create empty components
export const CoreAdmin = createComponent('CoreAdmin');
export const CoreResource = createComponent('CoreResource');
export const Form = createComponent('Form');
export const FormWithRedirect = createComponent('FormWithRedirect');
export const ResourceContextProvider = createComponent('ResourceContextProvider');
export const RecordContextProvider = createComponent('RecordContextProvider');
export const ListContextProvider = createComponent('ListContextProvider');
export const EditContextProvider = createComponent('EditContextProvider');
export const CreateContextProvider = createComponent('CreateContextProvider');
export const ShowContextProvider = createComponent('ShowContextProvider');
export const TranslationProvider = createComponent('TranslationProvider');
export const DataProviderContext = createComponent('DataProviderContext');
export const AuthContext = createComponent('AuthContext');
export const NotificationContext = createComponent('NotificationContext');
export const RedirectionContext = createComponent('RedirectionContext');
export const StoreContext = createComponent('StoreContext');
export const ResourceContext = createComponent('ResourceContext');
export const RecordContext = createComponent('RecordContext');
export const ListContext = createComponent('ListContext');
export const EditContext = createComponent('EditContext');
export const CreateContext = createComponent('CreateContext');
export const ShowContext = createComponent('ShowContext');

// Additional components that were missing
export const CreateBase = createComponent('CreateBase');
export const EditBase = createComponent('EditBase');
export const ListBase = createComponent('ListBase');
export const ShowBase = createComponent('ShowBase');
export class InferredElement {
  constructor(type, props, children) {
    this.type = type;
    this.props = props || {};
    this.children = children;
  }
}

// Export a default object with all the functions and components
export default {
  useNotify,
  useRedirect,
  useRefresh,
  useDataProvider,
  useGetOne,
  useGetList,
  useGetMany,
  useGetManyReference,
  useCreate,
  useUpdate,
  useUpdateMany,
  useDelete,
  useDeleteMany,
  useQuery,
  useMutation,
  useQueryWithStore,
  useAuthenticated,
  useAuthProvider,
  usePermissions,
  useGetPermissions,
  useLogin,
  useLogout,
  useCheckAuth,
  useCheckError,
  useGetIdentity,
  useTranslate,
  useLocale,
  useSetLocale,
  useSafeSetState,
  useVersion,
  useResourceContext,
  useResourceDefinition,
  useGetResourceLabel,
  useRecordContext,
  useReference,
  useWarnWhenUnsavedChanges,
  useFormContext,
  useInput,
  useChoices,
  usePaginationState,
  useSortState,
  useFilterState,
  useListContext,
  useListController,
  useEditContext,
  useEditController,
  useCreateContext,
  useCreateController,
  useShowContext,
  useShowController,
  CoreAdmin,
  CoreResource,
  Form,
  FormWithRedirect,
  ResourceContextProvider,
  RecordContextProvider,
  ListContextProvider,
  EditContextProvider,
  CreateContextProvider,
  ShowContextProvider,
  TranslationProvider,
  DataProviderContext,
  AuthContext,
  NotificationContext,
  RedirectionContext,
  StoreContext,
  ResourceContext,
  RecordContext,
  ListContext,
  EditContext,
  CreateContext,
  ShowContext
};
