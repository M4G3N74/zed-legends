'use client';

import { useState, useEffect } from 'react';

interface UserPreferences {
  theme: string;
  volume: number;
  shuffle_enabled: boolean;
  repeat_mode: string;
  crossfade_duration: number;
  equalizer_preset: string;
  auto_play: boolean;
}

export const usePreferences = (userId: string) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    volume: 1.0,
    shuffle_enabled: false,
    repeat_mode: 'none',
    crossfade_duration: 0,
    equalizer_preset: 'flat',
    auto_play: true
  });
  const [loading, setLoading] = useState(false);

  const fetchPreferences = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/preferences', {
        headers: { Authorization: `Bearer ${userId}` }
      });
      const data = await response.json();
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`
        },
        body: JSON.stringify(newPreferences)
      });
      const data = await response.json();
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  return { preferences, loading, updatePreferences };
};