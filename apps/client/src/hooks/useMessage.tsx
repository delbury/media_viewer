import { ShowNotificationOptions, useNotifications } from '@toolpad/core';
import { useCallback } from 'react';

interface ShowParams {
  message: string;
  type: ShowNotificationOptions['severity'];
}

export const useMessage = () => {
  const notifications = useNotifications();

  const show = useCallback(
    (params: ShowParams) => {
      notifications.show(params.message, {
        autoHideDuration: 1000,
        severity: params.type,
      });
    },
    [notifications]
  );

  return {
    show,
  };
};
