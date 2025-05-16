import React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, Labeled } from 'react-admin';
import type { EditProps } from 'react-admin';

const MenuTitle = ({ record }: { record?: { name?: string } }) => {
  return <span>Menu Item {record ? `"${record.name}"` : ''}</span>;
};

export const MenuEdit: React.FC<EditProps> = (props) => (
  <Edit title={<MenuTitle />} {...props}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="name" validate={required()} />
      <TextInput source="description" multiline fullWidth />
      <Labeled label="Price (LKR)">
        <NumberInput source="price" validate={required()} />
      </Labeled>
      <TextInput source="image_url" label="Image URL" fullWidth />
      {/* Supabase automatically handles created_at and updated_at, so no need to display/edit them here unless specifically required */}
    </SimpleForm>
  </Edit>
);

// Basic required validation
const required = (message = 'Required') =>
    (value: unknown) => value || value === 0 ? undefined : message;