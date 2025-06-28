import Layout from '../components/layout/Layout';
import Head from 'next/head';

export default function RequestPage() {
  return (
    <Layout>
      <Head>
        <title>Request | Zed Legends</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4 py-12">
        <div className="bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg p-8 max-w-lg w-full text-center border border-overlay/30">
          <h1 className="text-2xl font-bold mb-4 text-mauve">Request a Feature or Song</h1>
          <p className="text-muted mb-6">
            Have an idea for a new feature or want a song added/removed? Let us know below!
          </p>
          <form className="flex flex-col gap-4">
            <textarea
              className="bg-background/70 border border-overlay rounded-md p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-mauve"
              rows={4}
              placeholder="Describe your request..."
              required
            />
            <button
              type="submit"
              className="bg-mauve text-background font-semibold py-2 rounded-lg hover:bg-mauve/90 transition-colors shadow-md"
              disabled
              title="Feature coming soon! For now, use the contact info in the banner."
            >
              Submit Request
            </button>
          </form>
          <p className="text-xs text-muted mt-4">
            For urgent requests, use the contact info in the banner above.
          </p>
        </div>
      </div>
    </Layout>
  );
} 