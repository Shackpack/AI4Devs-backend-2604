import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const SUCCESS_AUTODISMISS_MS = 5000;

interface ToastNotificationProps {
  message: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
  onClose: () => void;
  autoDismiss?: boolean;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  variant,
  onClose,
  autoDismiss = false,
}) => {
  useEffect(() => {
    if (!autoDismiss) return;
    const timer = setTimeout(onClose, SUCCESS_AUTODISMISS_MS);
    return () => clearTimeout(timer);
  }, [autoDismiss, onClose]);

  return (
    <Alert
      variant={variant}
      dismissible
      onClose={onClose}
      className="mb-3"
    >
      {message}
    </Alert>
  );
};
