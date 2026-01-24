export type ToastType = 'validation' | 'server' | 'success' | 'warning';

export interface ToastProps {
  message: string;
  title?: string;
  type: ToastType;
  duration?: number;
  t: {
    id: string;
    visible: boolean;
  };
}

export interface ShowToastProps {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}
