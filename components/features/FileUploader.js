import { useState, useCallback } from 'react';

export default function FileUploader({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      uploadFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Get a pre-signed URL from our API
      const presignedUrlResponse = await fetch('/api/r2/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error('Could not get a pre-signed URL for upload.');
      }
      const { uploadUrl } = await presignedUrlResponse.json();

      // 2. Upload the file directly to R2 using the pre-signed URL
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log('Upload successful!');
          if(onUploadSuccess) onUploadSuccess();
        } else {
          setError(`Upload failed with status: ${xhr.status}`);
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        setError('An error occurred during the upload.');
        setIsUploading(false);
      };

      xhr.send(file);

    } catch (err) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border-2 border-dashed border-overlay rounded-lg text-center">
      <div
        className="drag-drop-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p className="text-muted mb-4">Drag & drop a file here, or click to select a file</p>
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-4 py-2 bg-mauve text-background rounded-md hover:bg-lavender"
        >
          Select File
        </label>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <p>Uploading... {Math.round(uploadProgress)}%</p>
          <div className="w-full bg-surface rounded-full h-2.5 mt-2">
            <div className="bg-mauve h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}
      
      {error && <p className="text-love mt-4">Error: {error}</p>}
    </div>
  );
} 