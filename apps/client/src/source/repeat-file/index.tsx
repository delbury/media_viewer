'use client';

import dynamic from 'next/dynamic';

const RepeatFilePage = dynamic(() => import('./components/Page'), {
  ssr: false,
});

export default function RepeatFile() {
  return <RepeatFilePage />;
}
