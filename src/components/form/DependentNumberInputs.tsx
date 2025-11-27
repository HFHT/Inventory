import React, { useState, useEffect } from "react";
import { NumberInput, SimpleGrid, Stack, Text } from "@mantine/core";

type WarnLevels = {
  notify: number;
  warn: number;
};

type DependentNumberInputsProps = {
  warnLevels: WarnLevels;
  onChange: (levels: WarnLevels) => void;
};

export const DependentNumberInputs: React.FC<DependentNumberInputsProps> = ({
  warnLevels,
  onChange,
}) => {
  const [values, setValues] = useState<WarnLevels>(warnLevels);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  // Reset state when warnLevels prop changes
  useEffect(() => {
    setValues(warnLevels);
    if (warnLevels.warn > 0 && warnLevels.notify <= warnLevels.warn) {
      setNotifyError("Notify must be greater than Warn.");
    } else {
      setNotifyError(null);
    }
  }, [warnLevels]);

  // Helper to validate state
  const validate = (vals: WarnLevels): string | null => {
    if (vals.warn > 0 && vals.notify <= vals.warn) {
      return "Notify must be greater than Warn.";
    }
    return null;
  };

  const handleWarnChange = (value: string | number) => {
    const newWarn =
      typeof value === "number"
        ? value
        : value === ""
        ? 0
        : Number(value);
    const newValues = { ...values, warn: newWarn };
    setValues(newValues);

    const error = validate(newValues);
    setNotifyError(error);
    if (!error) {
      onChange(newValues);
    }
  };

  const handleNotifyChange = (value: string | number) => {
    const newNotify =
      typeof value === "number"
        ? value
        : value === ""
        ? 0
        : Number(value);
    const newValues = { ...values, notify: newNotify };
    setValues(newValues);

    const error = validate(newValues);
    setNotifyError(error);
    if (!error) {
      onChange(newValues);
    }
  };

  return (
    <SimpleGrid cols={2}>
      <Stack>
        <NumberInput
          label="Warn value"
          value={values.warn}
          onChange={handleWarnChange}
          min={0}
          step={1}
        />
        {notifyError && (
          <Text c="red" size="sm">
            &nbsp;
          </Text>
        )}
      </Stack>
      <Stack>
        <NumberInput
          label="Notify value"
          value={values.notify}
          onChange={handleNotifyChange}
          min={0}
          step={1}
          error={!!notifyError}
        />
        {notifyError && (
          <Text c="red" size="sm">
            {notifyError}
          </Text>
        )}
      </Stack>
    </SimpleGrid>
  );
};