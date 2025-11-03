import { ShowNotificationOptions, useNotifications } from '@toolpad/core';
import { useCallback } from 'react';

type MessageType = NonNullable<ShowNotificationOptions['severity']>;

interface ShowParams {
  message: string;
  type: MessageType;
  duration?: number;
}

const TYPE_DEFAULT_DURATION: Partial<Record<MessageType, number>> = {
  error: 2000,
  success: 1000,
};

export const useMessage = () => {
  const notifications = useNotifications();

  const show = useCallback(
    (params: ShowParams) => {
      notifications.show(params.message, {
        autoHideDuration: params.duration ?? TYPE_DEFAULT_DURATION[params.type] ?? 1000,
        severity: params.type,
      });
    },
    [notifications]
  );

  return {
    show,
  };
};
