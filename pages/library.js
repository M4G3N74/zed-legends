import Layout from '../components/layout/Layout';
import SongList from '../components/features/SongList';

export default function LibraryPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">All Songs</h1>
        <SongList />
      </div>
    </Layout>
  );
} 