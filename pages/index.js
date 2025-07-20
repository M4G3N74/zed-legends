import Head from 'next/head';
import Layout from '../components/layout/Layout';
import SongList from '../components/features/SongList';
import Visualizer from '../components/ui/Visualizer';
import { useLibrary } from '../components/context/LibraryContext';
import SEO from '../components/ui/SEO';
import React from 'react';

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

export default function Home() {
  const { isLoading, error } = useLibrary();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicStore",
    "name": "Zed Legends",
    "url": "https://zed-legends.vercel.app/",
    "description": "Discover and stream legendary Zambian music.",
    "image": "https://zed-legends.vercel.app/images/album-art.png"
  };

  return (
    <>
      <Head>
        <title>Zed Legends | Home</title>
        <meta name="description" content="Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience." />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zed-legends.vercel.app/" />
        <meta property="og:title" content="Zed Legends | Home" />
        <meta property="og:description" content="Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience." />
        <meta property="og:image" content="https://zed-legends.vercel.app/images/album-art.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://zed-legends.vercel.app/" />
        <meta name="twitter:title" content="Zed Legends | Home" />
        <meta name="twitter:description" content="Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience." />
        <meta name="twitter:image" content="https://zed-legends.vercel.app/images/album-art.png" />
      </Head>
      <BetaBanner />
      <SEO
        title="Zed Legends | Home"
        description="Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience."
        image="/images/album-art.png"
        url="https://zed-legends.vercel.app/"
        jsonLd={jsonLd}
      />
      <Layout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-mauve/10 via-lavender/5 to-blue/10 rounded-3xl border border-overlay/20 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-mauve/5 to-transparent"></div>
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-mauve via-lavender to-blue bg-clip-text text-transparent mb-4">
                    Zambian Legends
                  </h1>
                  <p className="text-xl text-muted mb-6 max-w-2xl">
                    Discover the rich sounds of Zambian music. From traditional rhythms to modern beats, 
                    experience the best of Zambian musical heritage.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-surface/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-overlay/30">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-music text-mauve"></i>
                        <span className="text-sm font-medium">Premium Quality</span>
                      </div>
                    </div>
                    <div className="bg-surface/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-overlay/30">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-headphones text-blue"></i>
                        <span className="text-sm font-medium">AI DJ</span>
                      </div>
                    </div>
                    <div className="bg-surface/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-overlay/30">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-heart text-love"></i>
                        <span className="text-sm font-medium">Free Streaming</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <Visualizer />
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon: AI DJ */}
          <div className="bg-gradient-to-br from-mauve/10 to-lavender/10 rounded-2xl border border-overlay/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-mauve to-lavender rounded-xl flex items-center justify-center">
                <i className="fas fa-robot text-background text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold">DJ Purple - Coming Soon</h2>
                <p className="text-muted">AI-powered music curation</p>
              </div>
            </div>
            <p className="text-sm text-muted">Our AI DJ feature is currently in development and will be available soon!</p>
          </div>
          
          {/* Music Library Section */}
          <div className="bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl rounded-2xl border border-overlay/30 shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue to-sky rounded-xl flex items-center justify-center">
                  <i className="fas fa-compact-disc text-background text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Music Library</h2>
                  <p className="text-muted">Explore our collection of Zambian music</p>
                </div>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mauve"></div>
                </div>
              ) : error ? (
                <div className="bg-love/10 border border-love/30 rounded-xl p-4 text-love">
                  <i className="fas fa-exclamation-circle mr-2"></i>{error}
                </div>
              ) : (
                <SongList />
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
