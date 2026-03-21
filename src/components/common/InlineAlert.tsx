import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface InlineAlertProps {
  variant?: AlertVariant;
  title: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

const styles: Record<AlertVariant, string> = {
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300',
  success:
    'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
};

export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = 'info',
  title,
  message,
  retryLabel,
  onRetry,
  className,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[variant]} ${className || ''}`}>
      <div className="font-medium">{title}</div>
      {message && <div className="mt-1 text-sm opacity-90">{message}</div>}
      {onRetry && (
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            {retryLabel || t('retry')}
          </Button>
        </div>
      )}
    </div>
  );
};
