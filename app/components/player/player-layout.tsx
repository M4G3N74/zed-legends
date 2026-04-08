'use client';

import { useState } from 'react';
import { PlayerBar, FullPlayer } from './index';

export function PlayerLayout() {
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  return (
    <>
      <PlayerBar onOpenFullPlayer={() => setIsFullPlayerOpen(true)} />
      <FullPlayer
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
      />
    </>
  );
}
