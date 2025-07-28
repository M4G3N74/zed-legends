
export const metadata = {
  title: 'About | Zed Legends',
  description: 'Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music.',
  openGraph: {
    type: 'website',
    url: 'https://zed-legends.vercel.app/about',
    title: 'About | Zed Legends',
    description: 'Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music.',
    images: [{ url: 'https://zed-legends.vercel.app/images/album-art.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://zed-legends.vercel.app/about',
    title: 'About | Zed Legends',
    description: 'Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music.',
    images: ['https://zed-legends.vercel.app/images/album-art.png'],
  },
};

export default function About() {
  return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4 py-12">
        <div className="bg-surface rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-mauve">About Zed Legends</h1>
          <p className="text-lg text-muted mb-6">
            Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music. Enjoy curated playlists, smart shuffle, downloads, and more—all optimized for mobile and desktop users.
          </p>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Credits</h2>
            <p className="font-bold mb-2 text-color-red">
              All songs rights reserved to their respective owners. if you are the owner of a song and you want it removed, please contact us.
            </p>
            <p className="text-muted">Built with ❤️ from Zambia</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <a href="https://t.me/m4g3n74" className="text-mauve hover:underline">Purple</a>
          </div>
        </div>
      </div>
  );
} 
