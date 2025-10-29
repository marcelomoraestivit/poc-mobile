// Utility to send native notifications via Mobile Bridge
// Replaces Mantine notifications with native React Native toasts

interface NotificationOptions {
  title?: string;
  message: string;
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'orange';
}

declare global {
  interface Window {
    WebBridge?: {
      sendToNative: (type: string, payload: any) => Promise<any>;
    };
  }
}

export const notifications = {
  show: async (options: NotificationOptions) => {
    const { title, message, color = 'blue' } = options;

    if (window.WebBridge) {
      try {
        await window.WebBridge.sendToNative('showNotification', {
          title: title || 'Notificação',
          message,
          color,
        });
      } catch (error) {
        console.error('Failed to show native notification:', error);
        // Fallback to console
        console.log(`[${color}] ${title || 'Notificação'}: ${message}`);
      }
    } else {
      // Not running in native app, log to console
      console.log(`[${color}] ${title || 'Notificação'}: ${message}`);
    }
  },

  success: async (title: string, message: string) => {
    await notifications.show({ title, message, color: 'green' });
  },

  error: async (title: string, message: string) => {
    await notifications.show({ title, message, color: 'red' });
  },

  info: async (title: string, message: string) => {
    await notifications.show({ title, message, color: 'blue' });
  },

  warning: async (title: string, message: string) => {
    await notifications.show({ title, message, color: 'yellow' });
  },
};
