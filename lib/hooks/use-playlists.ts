'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlists } from '@/lib/db';
import type { Playlist, PlaylistWithSongs } from '@/lib/database.types';
import type { Song } from '@/lib/api';

export const playlistKeys = {
  all: ['playlists'] as const,
  detail: (id: string) => ['playlists', id] as const,
};

export function usePlaylists() {
  return useQuery({
    queryKey: playlistKeys.all,
    queryFn: () => playlists.getAll(),
  });
}

export function usePlaylist(playlistId: string) {
  return useQuery({
    queryKey: playlistKeys.detail(playlistId),
    queryFn: () => playlists.getWithSongs(playlistId),
    enabled: Boolean(playlistId),
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => playlists.create(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Playlist> }) =>
      playlists.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(id) });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playlists.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}

export function useAddToPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, song }: { playlistId: string; song: Song }) =>
      playlists.addSong(playlistId, song),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(playlistId),
      });
    },
  });
}

export function useRemoveFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playlistId,
      songId,
    }: {
      playlistId: string;
      songId: string;
    }) => playlists.removeSong(playlistId, songId),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(playlistId),
      });
    },
  });
}
