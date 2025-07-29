'use client';

import React, { useState, useEffect } from 'react';

interface QueueManagerProps {
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function QueueManager({ userId, isVisible, onClose }: QueueManagerProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/queue', {
        headers: { Authorization: `Bearer ${userId}` }
      });
      const data = await response.json();
      setQueue(data.queue || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromQueue = async (queueItemId: string) => {
    try {
      await fetch(`/api/queue/${queueItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userId}` }
      });
      setQueue(prev => prev.filter(item => item.id !== queueItemId));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  };

  const clearQueue = async () => {
    try {
      await fetch('/api/queue', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userId}` }
      });
      setQueue([]);
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchQueue();
    }
  }, [isVisible, userId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg w-96 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-overlay">
          <h2 className="text-lg font-bold">Queue</h2>
          <div className="flex gap-2">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-sm text-muted hover:text-love"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted hover:text-text"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-muted"></i>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-list text-2xl text-muted mb-2"></i>
              <p className="text-muted">Queue is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-background rounded-md">
                  <span className="text-sm text-muted w-6">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">{item.songs?.title}</div>
                    <div className="text-xs text-muted truncate">{item.songs?.artist}</div>
                  </div>
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="text-muted hover:text-love"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}