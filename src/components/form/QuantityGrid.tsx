import React, { useState } from 'react';
import { NumberInput, Grid, Text, Fieldset, ActionIcon, Stack, Flex, Tooltip } from '@mantine/core';
import { IconLock, IconLockOpen2 } from '@tabler/icons-react';

export type LocationQuantity = { loc: string, qty: number };

interface LocationQuantityGridProps {
  values: LocationQuantity[];  // Now: { "loc1": qty, ... }
  onChange: (updated: { total: number, byLocation: LocationQuantity[] }) => void;
  totalPosition?: 'above' | 'below';
  label?: string;
  unlocked?: boolean;
}

export const QuantityGrid: React.FC<LocationQuantityGridProps> = ({
  values,
  onChange,
  totalPosition = 'below',
  unlocked = false,
  label,
}) => {
  // Example: values = {loc1: 1, loc2: 2}
  const total = () => values.reduce((sum, loc) => sum + (loc.qty || 0), 0);

  const [locked, setLocked] = useState(!unlocked)
  const handleQtyChange = (loc: string, qty: number) => {
    const val = Number.isNaN(qty) || qty == null ? 0 : qty;
    const idx = values.findIndex(f => f.loc === loc)
    values[idx].qty = val
    onChange({ total: total(), byLocation: values });
  };

  // const entries = Object.entries(values); // [ [loc1, qty1], ... ]

  const TotalLabel = (
    <Grid gutter="xs" align="center">
      <Grid.Col span={6}>
        <NumberInput
          value={total()}
          readOnly
          tabIndex={-1}
          styles={{ input: { cursor: 'default' } }}
          hideControls={false}
          allowDecimal={false}
          size="sm"
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Text>Total</Text>
      </Grid.Col>
    </Grid>
  );

  const grid = (
    <Grid gutter="xs" align="center">
      {values.map((v) => (
        <React.Fragment key={v.loc}>
          <Grid.Col span={6}>
            <NumberInput
              value={v.qty}
              min={0}
              step={1}
              onChange={val => handleQtyChange(v.loc, Number(val))}
              hideControls={false}
              allowDecimal={false}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{v.loc}</Text>
          </Grid.Col>
        </React.Fragment>
      ))}
    </Grid>
  );

  const LockedText = () => {
    if (!locked) return <Text size='sm'>Lock the quantities.</Text>
    return <>
      <Stack gap={0} justify='center' align='center'>
        <Text size='sm'><b>Important Note:</b></Text>
        <Text size='sm'>Updating these quantities should only be used to correct errors.</Text>
        <Text size='sm'>Use the Transfer or Palletize actions to move items from one location to another.</Text>
      </Stack>

    </>
  }

  return (
    <Stack>
      <Flex>
        {label && (
          <Text mt="xs" fw={500} size="sm">
            {label}
          </Text>
        )}
        <Tooltip label={<LockedText />}>
          <ActionIcon variant='transparent' color='unset' mt={6} onClick={() => setLocked(!locked)}>
            {locked ?
              <IconLock size={18} />
              :
              <IconLockOpen2 size={18} />
            }
          </ActionIcon>
        </Tooltip>
      </Flex>
      <Fieldset disabled={locked}>
        {totalPosition === 'above' && TotalLabel}
        {grid}
        {totalPosition === 'below' && <div style={{ marginTop: 8 }}>{TotalLabel}</div>}
      </Fieldset>
    </Stack>
  );
};