import Layout from '../components/layout/Layout';
import Head from 'next/head';

export default function SupportPage() {
  return (
    <Layout>
      <Head>
        <title>Support | Zed Legends</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4 py-12">
        <div className="bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg p-8 max-w-lg w-full text-center border border-overlay/30">
          <h1 className="text-2xl font-bold mb-4 text-mauve">Support & Contact</h1>
          <p className="text-muted mb-6">
            Need help or want to get in touch? Use the contact info below or reach out via the banner above.
          </p>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Contact Numbers</h2>
            <p className="font-bold text-mauve mb-2">+260 750 195 451</p>
            <p className="font-bold text-mauve mb-2">+260 964 943 277</p>
            <p className="text-muted">Available on WhatsApp and Telegram</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Other Support</h2>
            <p className="text-muted">For song removal, copyright, or urgent issues, please mention the song name and your request.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 