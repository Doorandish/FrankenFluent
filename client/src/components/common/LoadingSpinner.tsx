import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('animate-spin rounded-full border-b-2 border-brand-500', className)} style={{ width: '1em', height: '1em' }}></div>
  );
};
