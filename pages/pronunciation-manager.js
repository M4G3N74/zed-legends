import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { useUser } from '../components/context/UserContext';
import { useRouter } from 'next/router';

export default function PronunciationManager() {
  const [pronunciations, setPronunciations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    originalText: '',
    pronunciation: '',
    type: 'artist'
  });
  const { user, role } = useUser();
  const router = useRouter();
  
  // Redirect if not admin
  useEffect(() => {
    if (role !== 'admin') {
      router.push('/');
    }
  }, [role, router]);
  
  // Load pronunciations
  useEffect(() => {
    const fetchPronunciations = async () => {
      try {
        const response = await fetch('/api/pronunciation');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pronunciations: ${response.status}`);
        }
        const data = await response.json();
        setPronunciations(data.pronunciations || []);
      } catch (error) {
        console.error('Error fetching pronunciations:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPronunciations();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/pronunciation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save pronunciation');
      }
      
      const data = await response.json();
      
      // Update the list with the new pronunciation
      setPronunciations(prev => {
        const exists = prev.some(p => p.id === data.pronunciation.id);
        if (exists) {
          return prev.map(p => p.id === data.pronunciation.id ? data.pronunciation : p);
        } else {
          return [...prev, data.pronunciation];
        }
      });
      
      // Reset form
      setFormData({
        originalText: '',
        pronunciation: '',
        type: 'artist'
      });
      
      // Reload dynamic pronunciations
      import('../lib/constants/pronunciationGuide')
        .then(module => {
          module.loadDynamicPronunciations();
        });
        
    } catch (error) {
      console.error('Error saving pronunciation:', error);
      setError(error.message);
    }
  };
  
  // Handle pronunciation deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/pronunciation', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete pronunciation');
      }
      
      // Remove from list
      setPronunciations(prev => prev.filter(p => p.id !== id));
      
      // Reload dynamic pronunciations
      import('../lib/constants/pronunciationGuide')
        .then(module => {
          module.loadDynamicPronunciations();
        });
        
    } catch (error) {
      console.error('Error deleting pronunciation:', error);
      setError(error.message);
    }
  };
  
  // Edit a pronunciation
  const handleEdit = (pronunciation) => {
    setFormData({
      originalText: pronunciation.originalText,
      pronunciation: pronunciation.pronunciation,
      type: pronunciation.type
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (role !== 'admin') {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <>
      <Head>
        <title>DJ Pronunciation Manager | Zed Legends</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">DJ Pronunciation Manager</h1>
          
          {/* Add/Edit Form */}
          <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 mb-8 border border-overlay/30">
            <h2 className="text-xl font-semibold mb-4">
              {formData.originalText ? 'Edit Pronunciation' : 'Add New Pronunciation'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Original Text</label>
                  <input
                    type="text"
                    name="originalText"
                    value={formData.originalText}
                    onChange={handleChange}
                    className="w-full bg-background/50 border border-overlay/30 rounded-lg px-3 py-2"
                    placeholder="e.g. PilAto"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Pronunciation</label>
                  <input
                    type="text"
                    name="pronunciation"
                    value={formData.pronunciation}
                    onChange={handleChange}
                    className="w-full bg-background/50 border border-overlay/30 rounded-lg px-3 py-2"
                    placeholder="e.g. Pee-LAH-toh"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="artist"
                      checked={formData.type === 'artist'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Artist
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="song"
                      checked={formData.type === 'song'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Song
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-mauve text-background rounded-lg hover:bg-mauve/90 transition-colors"
                >
                  {formData.originalText ? 'Update' : 'Add'} Pronunciation
                </button>
                
                {formData.originalText && (
                  <button
                    type="button"
                    onClick={() => setFormData({ originalText: '', pronunciation: '', type: 'artist' })}
                    className="px-4 py-2 bg-surface text-muted rounded-lg hover:bg-overlay/50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* Pronunciation List */}
          <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-overlay/30">
            <h2 className="text-xl font-semibold mb-4">Pronunciation Guide</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauve"></div>
              </div>
            ) : error ? (
              <div className="bg-love/10 border border-love/30 rounded-lg p-4 text-love">
                <i className="fas fa-exclamation-circle mr-2"></i>{error}
              </div>
            ) : pronunciations.length === 0 ? (
              <p className="text-center py-8 text-muted">No pronunciations added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-overlay/30">
                      <th className="text-left py-2 px-4">Type</th>
                      <th className="text-left py-2 px-4">Original Text</th>
                      <th className="text-left py-2 px-4">Pronunciation</th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pronunciations.map(item => (
                      <tr key={item.id} className="border-b border-overlay/10 hover:bg-background/20">
                        <td className="py-2 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            item.type === 'artist' ? 'bg-blue/20 text-blue' : 'bg-green/20 text-green'
                          }`}>
                            {item.type === 'artist' ? 'Artist' : 'Song'}
                          </span>
                        </td>
                        <td className="py-2 px-4">{item.originalText}</td>
                        <td className="py-2 px-4">{item.pronunciation}</td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue hover:text-blue/80 mr-3"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-love hover:text-love/80"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Pronunciation Tips */}
          <div className="mt-8 bg-surface/50 rounded-lg p-4 text-sm text-muted">
            <h3 className="font-semibold mb-2">Pronunciation Tips:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use hyphens to separate syllables (e.g., "Pee-LAH-toh")</li>
              <li>Capitalize syllables that should be emphasized</li>
              <li>Use phonetic spelling to help the DJ pronounce words correctly</li>
              <li>For numbers, write them out as words (e.g., "One-Eight-Seven" instead of "187")</li>
              <li>Test pronunciations by listening to the DJ announce songs</li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
}