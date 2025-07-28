import SupportClientPage from './SupportClientPage';

export const metadata = {
  title: 'Support | Zed Legends',
  description: 'Need help or want to get in touch with Zed Legends? Contact us for support, song removal, copyright, or urgent issues.',
  openGraph: {
    type: 'website',
    url: 'https://zed-legends.vercel.app/support',
    title: 'Support | Zed Legends',
    description: 'Need help or want to get in touch with Zed Legends? Contact us for support, song removal, copyright, or urgent issues.',
    images: [{ url: 'https://zed-legends.vercel.app/images/album-art.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://zed-legends.vercel.app/support',
    title: 'Support | Zed Legends',
    description: 'Need help or want to get in touch with Zed Legends? Contact us for support, song removal, copyright, or urgent issues.',
    images: ['https://zed-legends.vercel.app/images/album-art.png'],
  },
};

export default function SupportPage() {
  return <SupportClientPage />;
}