import React, { useState } from 'react';
import './CertificateSettings.css';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';


const CertificateSettings = ({ courseId }) => {
  const [certificate, setCertificate] = useState({
    enabled: true,
    template: 'default',
    customText: 'Congratulations on completing the course!',
    signature: null,
    signatureName: 'Course Instructor',
    showDate: true,
    showCourseName: true,
    showCompletionHours: true,
    customLogo: null,
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCertificate((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCertificate((prev) => ({ ...prev, customLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCertificate((prev) => ({ ...prev, signature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setCertificate((prev) => ({ ...prev, customLogo: null }));
  };

  const removeSignature = () => {
    setSignatureFile(null);
    setCertificate((prev) => ({ ...prev, signature: null }));
  };

  const handleSave = () => {
    console.log('Certificate settings saved:', certificate);
    // API call to save settings
  };

  return (
    <div className="CertificateSettings">
      <div className="CertificateSettings-Top">
        <div className="CertificateSettings-Top-Grid">
          <div className="CertificateSettings-Top-1">
            <h2>
              <DescriptionIcon className="icon" /> Certificate Settings
            </h2>
          </div>
          <div className="CertificateSettings-Top-2">
            <label className="label">Course ID: {courseId}</label>
          </div>
        </div>

        <div className="CertificateSettings-theory">
          <ul>
            <li>
              <span>
                <CheckCircleIcon className="icon" />{' '}
                {certificate.enabled ? 'Certificates Enabled' : 'Certificates Disabled'}
              </span>
              <input
                type="checkbox"
                checked={certificate.enabled}
                onChange={handleChange}
                name="enabled"
                className="checkbox"
              />
            </li>
          </ul>
        </div>

        {certificate.enabled && (
          <>
            <div className="CertificateSettings-Content">
              <h3>Certificate Content</h3>
              <div className="CertificateSettings-Grid">
                <div className="CertificateSettings-Left">
                  <label className="label">Template</label>
                  <select
                    className="select"
                    name="template"
                    value={certificate.template}
                    onChange={handleChange}
                  >
                    <option value="default">Default</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegant</option>
                    <option value="custom">Custom</option>
                  </select>

                  <label className="label">Certificate Text</label>
                  <textarea
                    className="textarea"
                    name="customText"
                    value={certificate.customText}
                    onChange={handleChange}
                    rows={4}
                  />

                  <div className="upload-section">
                    <label className="label">Custom Logo (optional)</label>
                    {certificate.customLogo ? (
                      <div className="upload-preview">
                        <img src={certificate.customLogo} alt="Logo Preview" className="preview-img" />
                        <button onClick={removeLogo} className="remove-btn">
                          <CancelIcon className="icon" /> Remove
                        </button>
                    </div>
                    ) : (
                      <button className="upload-btn" component="label">
                        <CloudUploadIcon className="icon" /> Upload Logo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div className="CertificateSettings-Right">
                  <ul className="checkbox-list">
                    <li>
                      <input
                        type="checkbox"
                        checked={certificate.showCourseName}
                        onChange={handleChange}
                        name="showCourseName"
                        className="checkbox"
                      />
                      <span>Show course name</span>
                    </li>
                    <li>
                      <input
                        type="checkbox"
                        checked={certificate.showDate}
                        onChange={handleChange}
                        name="showDate"
                        className="checkbox"
                      />
                      <span>Show completion date</span>
                    </li>
                    <li>
                      <input
                        type="checkbox"
                        checked={certificate.showCompletionHours}
                        onChange={handleChange}
                        name="showCompletionHours"
                        className="checkbox"
                      />
                      <span>Show course hours</span>
                    </li>
                  </ul>

                  <div className="upload-section">
                    <label className="label">Signature</label>
                    <input
                      type="text"
                      className="input"
                      name="signatureName"
                      value={certificate.signatureName}
                      onChange={handleChange}
                      placeholder="Signature Name"
                    />
                    {certificate.signature ? (
                      <div className="upload-preview">
                        <img src={certificate.signature} alt="Signature Preview" className="preview-img" />
                        <button onClick={removeSignature} className="remove-btn">
                          <CancelIcon className="icon" /> Remove
                        </button>
                      </div>
                    ) : (
                      <button className="upload-btn" component="label">
                        <CloudUploadIcon className="icon" /> Upload Signature
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleSignatureUpload}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className={previewMode ? 'action-btn active' : 'action-btn'}
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <VisibilityIcon className="icon" /> {previewMode ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button className="action-btn primary" onClick={handleSave}>
                  <SaveIcon className="icon" /> Save Settings
                </button>
              </div>

              {previewMode && (
                <div className="CertificateSettings-Preview">
                  <h3>Certificate Preview</h3>
                  <div className="preview-content">
                    <h4>Certificate of Completion</h4>
                    <p>This is to certify that</p>
                    <h5>[Student Name]</h5>
                    <p>has successfully completed the course</p>
                    {certificate.showCourseName && <h5>[Course Name]</h5>}
                    <p>{certificate.customText}</p>
                    <div className="preview-details">
                      {certificate.showCompletionHours && (
                        <div>
                          <span>Total Course Hours:</span>
                          <strong>[Hours]</strong>
                        </div>
                      )}
                      {certificate.showDate && (
                        <div>
                          <span>Date Completed:</span>
                          <strong>[Date]</strong>
                        </div>
                      )}
                    </div>
                    <div className="preview-footer">
                      {certificate.signature && (
                        <div className="signature-section">
                          <img src={certificate.signature} alt="Signature" className="signature-img" />
                          <span>{certificate.signatureName}</span>
                        </div>
                      )}
                      {certificate.customLogo && (
                        <img src={certificate.customLogo} alt="Logo" className="logo-img" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CertificateSettings;