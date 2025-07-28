import DashboardClientPage from './DashboardClientPage';

export const metadata = {
  title: 'Dashboard | Zed Legends',
  description: 'Manage your music library, upload new songs, and view stats.',
  openGraph: {
    type: 'website',
    url: 'https://zed-legends.vercel.app/dashboard',
    title: 'Dashboard | Zed Legends',
    description: 'Manage your music library, upload new songs, and view stats.',
    images: [{ url: 'https://zed-legends.vercel.app/images/album-art.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://zed-legends.vercel.app/dashboard',
    title: 'Dashboard | Zed Legends',
    description: 'Manage your music library, upload new songs, and view stats.',
    images: ['https://zed-legends.vercel.app/images/album-art.png'],
  },
};

export default function DashboardPage() {
  return <DashboardClientPage />;
}