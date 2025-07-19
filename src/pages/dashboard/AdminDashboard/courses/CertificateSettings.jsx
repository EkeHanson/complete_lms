import React, { useState, useEffect } from 'react';
import { Alert, Button, FormControl, InputLabel, Select, MenuItem, TextField, Checkbox, FormControlLabel } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import { coursesAPI } from  '../../../../config';
import './CertificateSettings.css';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (courseId) {
      const fetchCertificate = async () => {
        setLoading(true);
        try {
          const response = await coursesAPI.getCertificate(courseId);
          setCertificate(response.data);
        } catch (err) {
          setError('Failed to fetch certificate settings: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCertificate();
    }
  }, [courseId]);

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

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('enabled', certificate.enabled);
      formData.append('template', certificate.template);
      formData.append('customText', certificate.customText);
      formData.append('signatureName', certificate.signatureName);
      formData.append('showDate', certificate.showDate);
      formData.append('showCourseName', certificate.showCourseName);
      formData.append('showCompletionHours', certificate.showCompletionHours);
      if (logoFile) formData.append('customLogo', logoFile);
      if (signatureFile) formData.append('signature', signatureFile);

      await coursesAPI.updateCertificate(courseId, formData);
      setSuccess('Certificate settings saved successfully!');
    } catch (err) {
      setError('Failed to save certificate settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CertificateSettings">
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={certificate.enabled}
                    onChange={handleChange}
                    name="enabled"
                    className="checkbox"
                  />
                }
                label=""
              />
            </li>
          </ul>
        </div>

        {certificate.enabled && (
          <div className="CertificateSettings-Content">
            <h3>Certificate Content</h3>
            <div className="CertificateSettings-Grid">
              <div className="CertificateSettings-Left">
                <FormControl fullWidth margin="normal">
                  <InputLabel>Template</InputLabel>
                  <Select
                    name="template"
                    value={certificate.template}
                    onChange={handleChange}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="modern">Modern</MenuItem>
                    <MenuItem value="elegant">Elegant</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Certificate Text"
                    name="customText"
                    value={certificate.customText}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </FormControl>

                <div className="upload-section">
                  <label className="label">Custom Logo (optional)</label>
                  {certificate.customLogo ? (
                    <div className="upload-preview">
                      <img src={certificate.customLogo} alt="Logo Preview" className="preview-img" />
                      <Button onClick={removeLogo} className="remove-btn">
                        <CancelIcon className="icon" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <Button className="upload-btn" component="label">
                      <CloudUploadIcon className="icon" /> Upload Logo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </Button>
                  )}
                </div>
              </div>

              <div className="CertificateSettings-Right">
                <ul className="checkbox-list">
                  <li>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={certificate.showCourseName}
                          onChange={handleChange}
                          name="showCourseName"
                          className="checkbox"
                        />
                      }
                      label="Show course name"
                    />
                  </li>
                  <li>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={certificate.showDate}
                          onChange={handleChange}
                          name="showDate"
                          className="checkbox"
                        />
                      }
                      label="Show completion date"
                    />
                  </li>
                  <li>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={certificate.showCompletionHours}
                          onChange={handleChange}
                          name="showCompletionHours"
                          className="checkbox"
                        />
                      }
                      label="Show course hours"
                    />
                  </li>
                </ul>

                <div className="upload-section">
                  <label className="label">Signature</label>
                  <TextField
                    fullWidth
                    label="Signature Name"
                    name="signatureName"
                    value={certificate.signatureName}
                    onChange={handleChange}
                  />
                  {certificate.signature ? (
                    <div className="upload-preview">
                      <img src={certificate.signature} alt="Signature Preview" className="preview-img" />
                      <Button onClick={removeSignature} className="remove-btn">
                        <CancelIcon className="icon" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <Button className="upload-btn" component="label">
                      <CloudUploadIcon className="icon" /> Upload Signature
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleSignatureUpload}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                className={previewMode ? 'action-btn active' : 'action-btn'}
                onClick={() => setPreviewMode(!previewMode)}
              >
                <VisibilityIcon className="icon" /> {previewMode ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                className="action-btn primary"
                onClick={handleSave}
                disabled={loading}
              >
                <SaveIcon className="icon" /> Save Settings
              </Button>
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
        )}
      </div>
    </div>
  );
};

export default CertificateSettings;