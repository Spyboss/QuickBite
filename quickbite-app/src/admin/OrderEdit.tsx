import React from 'react';
import { Edit, SimpleForm, SelectInput, TextInput, DateInput, NumberField, ReferenceInput, AutocompleteInput } from 'react-admin'; // Changed NumberInput to NumberField
import type { EditProps } from 'react-admin';

const OrderTitle = ({ record }: { record?: { id?: string } }) => {
  return <span>Order {record ? `"${record.id}"` : ''}</span>;
};

export const OrderEdit: React.FC<EditProps> = (props) => (
  <Edit title={<OrderTitle />} {...props}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <ReferenceInput label="User" source="user_id" reference="users" allowEmpty>
        {/* Assuming you might have a 'users' resource or want to display user email/name */}
        {/* For now, let's use AutocompleteInput if users are few, or a simpler display if many */}
        <AutocompleteInput optionText="email" disabled /> 
        {/* Or <TextInput source="user_id" disabled /> if direct display is preferred */}
      </ReferenceInput>
      <DateInput source="created_at" disabled />
      <NumberField source="total" options={{ style: 'currency', currency: 'LKR' }} /> {/* Removed disabled prop */}
      <TextInput source="payment_method" disabled />
      <SelectInput
        source="status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'pending_payment', name: 'Pending Payment' },
          { id: 'paid', name: 'Paid' },
          { id: 'preparing', name: 'Preparing' },
          { id: 'ready', name: 'Ready' },
          { id: 'completed', name: 'Completed' }, // Assuming a completed status
          { id: 'cancelled', name: 'Cancelled' },
          { id: 'failed', name: 'Failed' },
        ]}
      />
      {/* Consider adding a RichTextInput or ArrayInput for 'items' if detailed editing is needed, though typically items aren't edited post-order. */}
      {/* For now, items are not editable here. */}
      <TextInput source="customer_name" />
      <TextInput source="customer_phone" />
    </SimpleForm>
  </Edit>
);