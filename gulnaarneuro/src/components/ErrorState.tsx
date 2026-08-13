import React from 'react';
import { InfoIcon } from './Icons';

interface ErrorStateProps {
  title?: string;
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
}) => {
  return (
    <div className="error-state">
      <InfoIcon size={24} className="text-accent" style={{ marginBottom: 'var(--n-space-sm)' }} />
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
    </div>
  );
};
