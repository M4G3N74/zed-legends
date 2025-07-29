'use client';

import FileUploader from '../../../components/features/FileUploader.tsx';

export default function UploadPage() {
  const handleUploadSuccess = () => {
    // Refresh or show success message
    console.log('Upload successful');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              <i className="fas fa-arrow-left"></i>
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Center</h1>
              <p className="text-gray-600 text-sm">Add new music files to the platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-cloud-upload-alt text-blue-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Music Files</h2>
            <p className="text-gray-600">Drag and drop your music files or click to browse</p>
          </div>

          <FileUploader onUploadSuccess={handleUploadSuccess} />

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Upload Guidelines:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Supported formats: MP3, WAV, FLAC</li>
              <li>• Maximum file size: 50MB per file</li>
              <li>• Ensure proper metadata (title, artist, album)</li>
              <li>• High quality audio recommended (320kbps or higher)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}