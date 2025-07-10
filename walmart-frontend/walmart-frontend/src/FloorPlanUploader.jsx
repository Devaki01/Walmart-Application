import React, { useState } from 'react';
import { uploadFloorPlan } from './api';

function FloorPlanUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setMessage('Uploading...');
    try {
        const responseText = await uploadFloorPlan(selectedFile);
        setMessage(responseText || 'Upload failed. See console for details.');
        if (responseText && onUploadSuccess) {
            onUploadSuccess(); 
        }
    } catch (error) {
        setMessage('Upload failed. The backend for this feature is not implemented.');
    }
  };

  return (
    <div className="floor-plan-uploader">
      <h4>Upload New Floor Plan</h4>
      <p>Replace the current map image (JPG, PNG, SVG). Note: Backend for this is not implemented.</p>
      
      <div className="upload-controls">
        <input type="file" accept="image/jpeg, image/png, image/svg+xml" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile}>
          Upload
        </button>
      </div>
      
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default FloorPlanUploader;
