import React from 'react';
import { List, Datagrid, TextField, NumberField, EditButton, DeleteButton } from 'react-admin';
import type { ListProps } from 'react-admin';

export const MenuList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      <NumberField source="price" options={{ style: 'currency', currency: 'LKR' }} />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// TODO: Add Edit and Create components for Menu
