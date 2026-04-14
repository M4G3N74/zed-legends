'use client';

import { useState } from 'react';
import { PlayerBar, FullPlayer, QueueDrawer } from './index';

export function PlayerLayout() {
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  return (
    <>
      <PlayerBar
        onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
      />
      <FullPlayer
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        onOpenQueue={() => setIsQueueOpen(true)}
      />
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
}
