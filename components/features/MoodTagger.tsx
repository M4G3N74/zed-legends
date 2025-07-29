'use client';

import React, { useState, useEffect } from 'react';

interface Mood {
  id: string;
  name: string;
  color: string;
}

interface MoodTaggerProps {
  songId: string;
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function MoodTagger({ songId, userId, isVisible, onClose }: MoodTaggerProps) {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMoods = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/moods');
      const data = await response.json();
      setMoods(data.moods || []);
    } catch (error) {
      console.error('Error fetching moods:', error);
    } finally {
      setLoading(false);
    }
  };

  const tagSongWithMood = async (moodId: string) => {
    if (!userId) return;
    
    try {
      await fetch('/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`
        },
        body: JSON.stringify({ song_id: songId, mood_id: moodId })
      });
      onClose();
    } catch (error) {
      console.error('Error tagging mood:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchMoods();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-6 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Tag with Mood</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-text"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-muted"></i>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {moods.map(mood => (
              <button
                key={mood.id}
                onClick={() => tagSongWithMood(mood.id)}
                className="p-3 rounded-lg border border-overlay hover:bg-overlay/50 transition-colors"
                style={{ borderColor: mood.color }}
              >
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: mood.color }}
                ></div>
                <div className="text-sm">{mood.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}