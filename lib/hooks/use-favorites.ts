'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favorites } from '@/lib/db';
import type { Favorite } from '@/lib/database.types';
import type { Song } from '@/lib/api';

export const favoriteKeys = {
  all: ['favorites'] as const,
};

export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.all,
    queryFn: () => favorites.getAll(),
  });
}

export function useIsFavorite(songId: string) {
  return useQuery({
    queryKey: [...favoriteKeys.all, 'isFavorite', songId] as const,
    queryFn: () => favorites.isFavorite(songId),
    enabled: Boolean(songId),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (song: Song) => favorites.toggle(song),
    onMutate: async (song) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });

      const previousFavorites = queryClient.getQueryData<Favorite[]>(
        favoriteKeys.all
      );

      queryClient.setQueryData<Favorite[]>(favoriteKeys.all, (old) => {
        if (!old) return old;
        const isCurrentlyFavorite = old.some((f) => f.song_id === song.id);
        if (isCurrentlyFavorite) {
          return old.filter((f) => f.song_id !== song.id);
        } else {
          const newFavorite: Favorite = {
            id: `temp_${Date.now()}`,
            user_id: 'current',
            song_id: song.id,
            song_path: song.path,
            song_title: song.title,
            song_artist: song.artist,
            song_url: song.url,
            created_at: new Date().toISOString(),
          };
          return [newFavorite, ...old];
        }
      });

      return { previousFavorites };
    },
    onError: (err, song, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoriteKeys.all, context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
