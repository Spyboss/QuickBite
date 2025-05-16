import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  DeleteButton, // Added DeleteButton import
  Filter,
  SelectInput,
} from 'react-admin';
import type { ListProps } from 'react-admin'; // For OrderList

// Props that react-admin's List component injects into the custom filter component
interface InjectedListFilterProps {
  displayedFilters?: Record<string, boolean>;
  filterValues?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  setFilters?: (filters: any, displayedFilters?: any, debounce?: boolean) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  hideFilter?: (filterName: string) => void;
  showFilter?: (filterName: string, defaultValue?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  resource?: string;
  // Allow any other props that might be passed by spreading
  [x: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Define a filter for order status
const OrderFilter = (props: InjectedListFilterProps) => (
  <Filter {...props}> {/* Spread the received props to the actual Filter component */}
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'pending', name: 'Pending' },
        { id: 'preparing', name: 'Preparing' },
        { id: 'ready', name: 'Ready' },
        { id: 'paid', name: 'Paid' },
        { id: 'failed', name: 'Failed' },
        { id: 'delivered', name: 'Delivered' }, // Assuming a delivered status might be used
      ]}
    />
  </Filter>
);

export const OrderList = (props: ListProps) => (
  <List filters={<OrderFilter />} {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="user_id" label="User ID" />
      {/* Displaying items might require a custom field */}
      <NumberField source="total" options={{ style: 'currency', currency: 'LKR' }} />
      <TextField source="status" />
      <TextField source="payment_method" label="Payment Method" />
      <DateField source="created_at" showTime />
      <EditButton />
      {/* Delete is generally not recommended for orders, but included as per plan */}
      <DeleteButton />
    </Datagrid>
  </List>
);

// TODO: Add Edit and Create components for Orders
