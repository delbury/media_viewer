import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ErrorBoundary as RawErrorBoundary } from 'react-error-boundary';

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations();
  return <RawErrorBoundary fallback={<Box>{t('Common.SomethingWentWrong')}</Box>}>{children}</RawErrorBoundary>;
};

export default ErrorBoundary;
