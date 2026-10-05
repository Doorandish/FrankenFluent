import React, { type ReactNode } from 'react';

export type IconName =
  | 'arrow'
  | 'book'
  | 'check'
  | 'chevron'
  | 'flame'
  | 'grid'
  | 'headphones'
  | 'home'
  | 'keyboard'
  | 'lock'
  | 'mic'
  | 'mistakes'
  | 'pause'
  | 'play'
  | 'profile'
  | 'replay'
  | 'roadmap'
  | 'spark'
  | 'speaker'
  | 'target'
  | 'trend'
  | 'send'
  | 'alert';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '' }) => {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="m15 18-6-6 6-6" />,
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    flame: (
      <>
        <path d="M12 22c4.4 0 7-3.1 7-7.1 0-2.5-1.3-5.4-3.8-8.7-.3 2.5-1.7 3.5-2.7 4.1.2-3.8-2-6.4-4.1-8.3.1 3.6-3.4 5.8-3.4 10.9C5 18.1 8.1 22 12 22Z" />
        <path d="M9.5 17.2c0-1.7 1.2-2.8 2.6-4.3.2 1.5 1.3 2.3 1.7 3.3.8 2-1 3.3-2.1 3.3-1.2 0-2.2-.9-2.2-2.3Z" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M18 19h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5a2 2 0 0 1-2 2ZM6 19H5a2 2 0 0 1-2-2v-5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2Z" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    keyboard: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 13h.01M11 13h.01M15 13h.01M18 13h.01M7 16h10" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
      </>
    ),
    mistakes: (
      <>
        <path d="M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
        <path d="M16 3a2.1 2.1 0 0 1 3 3L11 14l-4 1 1-4Z" />
      </>
    ),
    pause: <path d="M9 8v8M15 8v8" />,
    play: <path d="m8 5 11 7-11 7Z" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    replay: (
      <>
        <path d="m3 12 3-3 3 3" />
        <path d="M6 9a7 7 0 1 1 1 7.8" />
      </>
    ),
    roadmap: (
      <>
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="6" r="3" />
        <path d="M8.5 16.5c2-1 1.5-4 3.5-5s3.5.5 4.5-3" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9Z" />
        <path d="m5 15 .7 2.3L8 18.5l-2.3 1.2L5 22l-.7-2.3L2 18.5l2.3-1.2Z" />
      </>
    ),
    speaker: (
      <>
        <path d="M11 5 6 9H2v6h4l5 4Z" />
        <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="m15 9 6-6M16 3h5v5" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    send: <path d="m22 2-7 20-4-9-9-4Z" />,
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] || paths.spark}
    </svg>
  );
};
