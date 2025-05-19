/**
 * Shim for ra-ui-materialui
 *
 * This file provides empty implementations of the components from ra-ui-materialui
 * that are being imported by ra-supabase-ui-materialui.
 */

// Create a factory function for components
const createComponent = (name) => {
  const Component = () => null;
  Component.displayName = name;
  return Component;
};

// Create empty components for all the imports used in ra-supabase-ui-materialui
export const Login = createComponent('Login');
export const Link = createComponent('Link');
export const SaveButton = createComponent('SaveButton');
export const TextInput = createComponent('TextInput');
export const Notification = createComponent('Notification');
export const LoginForm = createComponent('LoginForm');
export const PasswordInput = createComponent('PasswordInput');
export const Loading = createComponent('Loading');
export const showFieldTypes = {};
export const ShowView = createComponent('ShowView');
export const EditView = createComponent('EditView');
export const listFieldTypes = {};
export const ListView = createComponent('ListView');
export const SearchInput = createComponent('SearchInput');
export const AutocompleteInput = createComponent('AutocompleteInput');
export const editFieldTypes = {};
export const ReferenceArrayInput = createComponent('ReferenceArrayInput');
export const ReferenceInput = createComponent('ReferenceInput');

// Additional components that might be imported
export const SimpleForm = createComponent('SimpleForm');
export const TabbedForm = createComponent('TabbedForm');
export const FormTab = createComponent('FormTab');
export const Datagrid = createComponent('Datagrid');
export const List = createComponent('List');
export const Edit = createComponent('Edit');
export const Create = createComponent('Create');
export const Show = createComponent('Show');
export const SimpleShowLayout = createComponent('SimpleShowLayout');
export const TextField = createComponent('TextField');
export const DateField = createComponent('DateField');
export const EmailField = createComponent('EmailField');
export const NumberField = createComponent('NumberField');
export const BooleanField = createComponent('BooleanField');
export const ReferenceField = createComponent('ReferenceField');
export const ReferenceManyField = createComponent('ReferenceManyField');
export const DateInput = createComponent('DateInput');
export const NumberInput = createComponent('NumberInput');
export const BooleanInput = createComponent('BooleanInput');
export const SelectInput = createComponent('SelectInput');
export const ReferenceArrayField = createComponent('ReferenceArrayField');
export const SingleFieldList = createComponent('SingleFieldList');
export const ChipField = createComponent('ChipField');
export const Filter = createComponent('Filter');
export const FilterButton = createComponent('FilterButton');
export const CreateButton = createComponent('CreateButton');
export const EditButton = createComponent('EditButton');
export const ShowButton = createComponent('ShowButton');
export const DeleteButton = createComponent('DeleteButton');
export const ExportButton = createComponent('ExportButton');
export const BulkDeleteButton = createComponent('BulkDeleteButton');
export const BulkExportButton = createComponent('BulkExportButton');
export const Toolbar = createComponent('Toolbar');
export const TopToolbar = createComponent('TopToolbar');
export const Pagination = createComponent('Pagination');
export const SortButton = createComponent('SortButton');
export const Title = createComponent('Title');
export const Labeled = createComponent('Labeled');
export const Layout = createComponent('Layout');
export const AppBar = createComponent('AppBar');
export const Menu = createComponent('Menu');
export const Sidebar = createComponent('Sidebar');
export const Error = createComponent('Error');
export const NotFound = createComponent('NotFound');
export const Resource = createComponent('Resource');
export const Admin = createComponent('Admin');

// Export a default object with all the components
const components = {
  Login,
  Link,
  SaveButton,
  TextInput,
  Notification,
  LoginForm,
  PasswordInput,
  Loading,
  showFieldTypes,
  ShowView,
  EditView,
  listFieldTypes,
  ListView,
  SearchInput,
  AutocompleteInput,
  editFieldTypes,
  ReferenceArrayInput,
  ReferenceInput,
  SimpleForm,
  TabbedForm,
  FormTab,
  Datagrid,
  List,
  Edit,
  Create,
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  EmailField,
  NumberField,
  BooleanField,
  ReferenceField,
  ReferenceManyField,
  DateInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  Filter,
  FilterButton,
  CreateButton,
  EditButton,
  ShowButton,
  DeleteButton,
  ExportButton,
  BulkDeleteButton,
  BulkExportButton,
  Toolbar,
  TopToolbar,
  Pagination,
  SortButton,
  Title,
  Labeled,
  Layout,
  AppBar,
  Menu,
  Sidebar,
  Error,
  NotFound,
  Resource,
  Admin
};

export default components;
