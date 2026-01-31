import { Button, Group } from '@mantine/core';

interface SaveOrCancelProps {
  onSave: () => void,
  onCancel: () => void,
  disabled?: boolean,
  style?: any
}

export function SaveOrCancel({ onSave, onCancel, disabled }: SaveOrCancelProps) {
  return (
    <Group mt="md">
      <Button disabled={disabled} onClick={onSave}>Save</Button>
      <Button variant="outline" color="red" onClick={onCancel}>Cancel</Button>
    </Group>
  );
}