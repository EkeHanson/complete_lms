import React, { useState } from 'react';
import './ContentUpload.css';
import { UploadIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ContentUpload = ({ label, onFileChange }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <div className="ContentUpload">
      <label className="label">{label}</label>
      {file ? (
        <div className="file-preview">
          <span className="file-name">{file.name}</span>
          <button onClick={handleRemove} className="remove-btn">
            <XCircleIcon className="icon" /> Remove
          </button>
        </div>
      ) : (
        <button className="upload-btn" component="label">
          <UploadIcon className="icon" /> Upload File
          <input
            type="file"
            hidden
            onChange={handleFileChange}
            accept="image/*"
          />
        </button>
      )}
    </div>
  );
};

export default ContentUpload;