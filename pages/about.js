import Head from 'next/head';
import Layout from '../components/layout/Layout';

function BetaBanner() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-mauve text-background py-2 overflow-hidden shadow-lg">
      <div className="whitespace-nowrap animate-marquee font-bold text-center text-lg">
        This site is in beta testing. Please report any issues you find.
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee {
          display: inline-block;
          min-width: 100vw;
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function About() {
  return (
    <>
      <BetaBanner />
      <Layout>
        <Head>
          <title>About | Zed Legends</title>
        </Head>
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4 py-12">
          <div className="bg-surface rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
            <h1 className="text-3xl font-bold mb-4 text-mauve">About Zed Legends</h1>
            <p className="text-lg text-muted mb-6">
              Zed Legends is a modern music streaming platform dedicated to celebrating and sharing the best of Zambian music. Enjoy curated playlists, smart shuffle, downloads, and more—all optimized for mobile and desktop users.
            </p>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Credits</h2>
              <p className="text-muted">Built with ❤️ from Zambia</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <a href="https://t.me/m4g3n74" className="text-mauve hover:underline">Purple</a>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 