'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { history } from '@/lib/db';
import type { Song } from '@/lib/api';

export const historyKeys = {
  all: ['history'] as const,
};

export function useHistory(limit = 50) {
  return useQuery({
    queryKey: [...historyKeys.all, limit] as const,
    queryFn: () => history.getRecent(limit),
  });
}

export function useAddToHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      song,
      durationPlayed = 0,
    }: {
      song: Song;
      durationPlayed?: number;
    }) => history.add(song, durationPlayed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => history.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}
