import { showNotification } from '@mantine/notifications';

interface FetchWithNotificationOptions {
  showSuccessNotification?: boolean;
  /**
   * Optional custom notification handler. 
   * Receives the HTTP response, optionally handles notification.
   * Return `true` if handled, or `false`/`undefined` to fall back to the default mapping.
   */
  notificationHandler?: (response: Response) => boolean | void;
}

type NotificationConfig = {
  title: string;
  message: string;
  color: 'orange' | 'green' | 'red' | 'yellow' | 'gray';
};

/**
 * Maps HTTP status codes to notification configurations.
 */
const statusNotificationMap: Record<number, NotificationConfig> = {
  400: {
    title: 'OpenAI Error',
    message: 'Failed to process the OpenAI request (400).',
    color: 'orange',
  },
  404: {
    title: 'Database Error',
    message: 'Failed to update the MongoDB database (404).',
    color: 'orange',
  },
  500: {
    title: 'Server Error',
    message: 'A program error occurred on the server (500).',
    color: 'red',
  },
  501: {
    title: 'Unrecognized Command',
    message: 'Client sent an unrecognized command (501).',
    color: 'yellow',
  },
};

/**
 * Fetch data with notification feedback using Mantine notifications.
 *
 * @template T - The expected response data type.
 * @param {RequestInfo} input - The resource to fetch.
 * @param {RequestInit} [init] - An object containing settings to apply to the request.
 * @param {FetchWithNotificationOptions} [options] - Optional fetch and notification settings.
 * @returns {Promise<T | undefined>} The parsed JSON data or undefined in case of error.
 */
export async function fetchWithNotification<T>(
  input: RequestInfo,
  init?: RequestInit,
  options: FetchWithNotificationOptions = {}
): Promise<T | undefined> {
  try {
    const { showSuccessNotification = true, notificationHandler } = options;
    const response = await fetch(input, init);

    // Success
    if (response.status === 200) {
      if (showSuccessNotification) {
        showNotification({
          title: 'Success',
          message: 'Operation completed successfully.',
          color: 'green',
        });
      }
      return await response.json();
    }

    // Custom notification handler hook
    if (notificationHandler) {
      const handled = notificationHandler(response);
      if (handled) {
        return undefined;
      }
      // If not handled by custom handler, fallback to mapped/default
    }

    // Default mapped notifications
    const notif = statusNotificationMap[response.status];
    if (notif) {
      showNotification(notif);
    } else {
      showNotification({
        title: 'Unknown error',
        message: `Unexpected response: ${response.status}`,
        color: 'gray',
      });
    }
    return undefined;
  } catch (error: any) {
    showNotification({
      title: 'Network Error',
      message: error?.message ?? 'An unexpected error has occurred.',
      color: 'red',
    });
    return undefined;
  }
}