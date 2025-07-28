import HomeClientPage from './HomeClientPage';

export const metadata = {
  title: 'Zed Legends | Music Streaming',
  description: 'Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience.',
  openGraph: {
    type: 'website',
    url: 'https://zed-legends.vercel.app',
    title: 'Zed Legends | Music Streaming',
    description: 'Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience.',
    images: [{ url: 'https://zed-legends.vercel.app/images/album-art.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://zed-legends.vercel.app',
    title: 'Zed Legends | Music Streaming',
    description: 'Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience.',
    images: ['https://zed-legends.vercel.app/images/album-art.png'],
  },
};

export default function Home() {
  return <HomeClientPage />;
}