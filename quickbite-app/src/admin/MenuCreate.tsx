import React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, Labeled } from 'react-admin';
import type { CreateProps } from 'react-admin';

export const MenuCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Menu Item" {...props}>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <TextInput source="description" multiline fullWidth />
      <Labeled label="Price (LKR)">
        <NumberInput source="price" validate={required()} />
      </Labeled>
      <TextInput source="image_url" label="Image URL" fullWidth />
      {/* Supabase automatically handles id, created_at, and updated_at on creation */}
    </SimpleForm>
  </Create>
);

// Basic required validation (can be moved to a shared utils file)
const required = (message = 'Required') =>
    (value: unknown) => value || value === 0 ? undefined : message;