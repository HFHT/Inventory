import { Button, Group } from '@mantine/core';
import { useInventoryStore } from '../../stores';

export function Controls() {
  const openDrawer = useInventoryStore((s) => s.openDrawer);
  return (
    <Group mt="md">
      <Button onClick={openDrawer}>Add Item</Button>
    </Group>
  );
}