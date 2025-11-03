'use client';

import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('./components/Page'), {
  ssr: false,
});

export default function RepeatFile() {
  return <HomePage />;
}
