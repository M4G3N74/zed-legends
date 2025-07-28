import LibraryClientPage from './LibraryClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zed Legends | Library',
  description: 'Browse the full library of legendary Zambian music. Infinite scroll, search, and more.',
  openGraph: {
    type: 'website',
    url: 'https://zed-legends.vercel.app/library',
    title: 'Zed Legends | Library',
    description: 'Browse the full library of legendary Zambian music. Infinite scroll, search, and more.',
    images: [
      {
        url: 'https://zed-legends.vercel.app/images/album-art.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zed Legends | Library',
    description: 'Browse the full library of legendary Zambian music. Infinite scroll, search, and more.',
    images: ['https://zed-legends.vercel.app/images/album-art.png'],
  },
};

export default function LibraryPage() {
  return <LibraryClientPage />;
}