import { Button, Group } from '@mantine/core';

export function SaveOrCancel({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <Group mt="md">
      <Button onClick={onSave}>Save</Button>
      <Button variant="outline" color="red" onClick={onCancel}>Cancel</Button>
    </Group>
  );
}