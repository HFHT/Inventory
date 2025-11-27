import React from 'react';
import { NumberInput, Grid, Text, Box } from '@mantine/core';

export type LocationQuantity = { loc: string, qty: number };

interface LocationQuantityGridProps {
  values: LocationQuantity[];  // Now: { "loc1": qty, ... }
  onChange: (updated: { total: number, byLocation: LocationQuantity[] }) => void;
  totalPosition?: 'above' | 'below';
  label?: string;
}

export const QuantityGrid: React.FC<LocationQuantityGridProps> = ({
  values,
  onChange,
  totalPosition = 'below',
  label,
}) => {
  // Example: values = {loc1: 1, loc2: 2}
  const total = () => values.reduce((sum, loc) => sum + (loc.qty || 0), 0);

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

  return (
    <div>
      {label && (
        <Text mt="xs" fw={500} size="sm">
          {label}
        </Text>
      )}
      <Box
        p="md"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
          width: 'fit-content'
        }}
      >
        {totalPosition === 'above' && TotalLabel}
        {grid}
        {totalPosition === 'below' && <div style={{ marginTop: 8 }}>{TotalLabel}</div>}
      </Box>
    </div>
  );
};