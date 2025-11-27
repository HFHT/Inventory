import { type ReactNode } from 'react';
import { Title } from '../components/form';

/**
 * @param title Drawer title
 */
export function DrawerLayout({ title, children }: {
  title?: string;
  children?: ReactNode; // Drawer content
}) {

  return (
    <>
      {title && <Title>{title}</Title>}
      {children}
    </>
  );
}