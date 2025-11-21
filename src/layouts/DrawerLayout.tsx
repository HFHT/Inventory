import { type ReactNode } from 'react';

import { SaveOrCancel, Title } from '../components/form';
import type { ViewerDbTypes } from '../types';


/**
 * @param title Drawer title
 */
export function DrawerLayout({ title, data, onClose, children }: {
  data: ViewerDbTypes;
  title?: string;
  onClose: () => void;
  children?: ReactNode; // Drawer content
}) {


  return (
    <>
      {title && <Title>{title}</Title>}
      <SaveOrCancel
        onSave={() => {
          console.log('save')
        }}
        onCancel={onClose}
      />
      {children}
    </>
  );
}