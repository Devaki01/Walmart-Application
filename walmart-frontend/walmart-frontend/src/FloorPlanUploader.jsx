// src/FloorPlanUploader.jsx

import React, { useState } from 'react';
import { uploadFloorPlan } from './api';

/**
 * A component that provides a UI for uploading a floor plan file.
 * @param {object} props - The component's props.
 * @param {function} props.onUploadSuccess - A callback function to be executed after a successful upload.
 */
function FloorPlanUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  // Updates the state when a user selects a file from the dialog
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handles the upload button click
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setMessage('Uploading...');
    const responseText = await uploadFloorPlan(selectedFile);

    setMessage(responseText || 'Upload failed. See console for details.');
    
    // If the upload was successful (i.e., we got a response back),
    // call the onUploadSuccess function passed from the parent component.
    if (responseText) {
      // This tells the AdminPage to refresh its own data.
      onUploadSuccess(); 
    }
  };

  return (
    <div className="floor-plan-uploader">
      <h2>Upload New Floor Plan</h2>
      <p>Upload a new map image (JPG, PNG, SVG). The current map shown to all users will be replaced.</p>
      
      <div className="upload-controls">
        <input type="file" accept="image/jpeg, image/png, image/svg+xml" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile}>
          Upload
        </button>
      </div>
      
      {/* Display feedback messages to the admin */}
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default FloorPlanUploader;