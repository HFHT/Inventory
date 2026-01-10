import { useState } from 'react';

/**
 * State-of-multiple-modals manager. Only one modal may be open at any time.
 * @param {string[]} modalIds - List of unique modal names/ids.
 * @returns {{
 *   opened: Record<string, boolean>,
 *   open: (modalId: string) => void,
 *   close: (modalId: string) => void,
 *   closeAll: () => void,
 *   toggle: (modalId: string) => void,
 *   anyOpened: boolean
 * }}
 */
export function useMultiDisclosure(modalIds: string[]) {
  // All modals closed at start
  const [opened, setOpened] = useState<Record<string, boolean>>(
    modalIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
  );

  function open(modalId: string) {
    setOpened(
      modalIds.reduce((acc, id) => ({ ...acc, [id]: id === modalId }), {})
    );
  }

  function close(modalId: string) {
    setOpened(prev => ({ ...prev, [modalId]: false }));
  }

  function closeAll() {
    setOpened(modalIds.reduce((acc, id) => ({ ...acc, [id]: false }), {}));
  }

  function toggle(modalId: string) {
    setOpened(prev =>
      prev[modalId]
        ? { ...prev, [modalId]: false }
        : modalIds.reduce((acc, id) => ({ ...acc, [id]: id === modalId }), {})
    );
  }

  // true if ANY modal is open
  const anyOpened = Object.values(opened).some(v => v);

  return { opened, open, close, closeAll, toggle, anyOpened };
}