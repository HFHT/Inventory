import { useRef } from 'react';

import { useInventoryStore } from '../stores';
import { FormFields, SaveOrCancel, Title } from '../components/form';


/**
 * @param title Drawer title
 */
export function DrawerFormLayout({ title }: { title: string }) {
  const addItem = useInventoryStore((s) => s.addItem);
  const closeDrawer = useInventoryStore((s) => s.closeDrawer);

  // For this minimal example, hold value in a ref
  const nameRef = useRef('');

  return (
    <>
      <Title>{title}</Title>
      <FormFields onChange={(val) => (nameRef.current = val)} />
      <SaveOrCancel
        onSave={() => {
          if (nameRef.current.trim()) {
            addItem({ id: Date.now(), name: nameRef.current });
            nameRef.current = '';
          }
        }}
        onCancel={closeDrawer}
      />
    </>
  );
}