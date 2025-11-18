import { useState } from 'react';
import { TextInput } from '@mantine/core';

/**
 * @param props.onChange callback with new name string
 */
export function FormFields({ onChange }: { onChange: (val: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <TextInput
      label="Name"
      value={value}
      onChange={(e) => {
        setValue(e.currentTarget.value);
        onChange(e.currentTarget.value);
      }}
    />
  );
}