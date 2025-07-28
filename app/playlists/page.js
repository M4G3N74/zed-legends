import PlaylistsClientPage from './PlaylistsClientPage';

export const metadata = {
  title: 'Zed Legends | Top 10 Playlists',
  description: 'Listen to the top 10 most liked Zambian songs on Zed Legends. Updated dynamically by user likes.',
  openGraph: {
    type: 'website',
    url: 'https://zed-legends.vercel.app/playlists',
    title: 'Zed Legends | Top 10 Playlists',
    description: 'Listen to the top 10 most liked Zambian songs on Zed Legends. Updated dynamically by user likes.',
    images: [{ url: 'https://zed-legends.vercel.app/images/album-art.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://zed-legends.vercel.app/playlists',
    title: 'Zed Legends | Top 10 Playlists',
    description: 'Listen to the top 10 most liked Zambian songs on Zed Legends. Updated dynamically by user likes.',
    images: ['https://zed-legends.vercel.app/images/album-art.png'],
  },
};

export default function PlaylistsPage() {
  return <PlaylistsClientPage />;
}