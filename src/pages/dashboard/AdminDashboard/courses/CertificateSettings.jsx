import React, { useState, useEffect, useCallback } from 'react';
import styles from './CertificateSettings.module.css';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CircularProgress from '@mui/material/CircularProgress';
import { coursesAPI, API_BASE_URL } from '../../../../config';

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
    completionCriteria: {
      minScore: 80,
      requireAllModules: true,
    },
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isImported, setIsImported] = useState(false); // Add this line

  // Fetch current course certificate settings
  useEffect(() => {
    if (courseId) {
      const fetchCertificate = async () => {
        setLoading(true);
        try {
          const response = await coursesAPI.getCertificate(courseId);
          setCertificate({
            enabled: response.data.is_active ?? true,
            template: response.data.template ?? 'default',
            customText: response.data.custom_text ?? 'Congratulations on completing the course!',
            signature: response.data.signature ?? null,
            signatureName: response.data.signature_name ?? 'Course Instructor',
            showDate: response.data.show_date ?? true,
            showCourseName: response.data.show_course_name ?? true,
            showCompletionHours: response.data.show_completion_hours ?? true,
            customLogo: response.data.logo ?? null,
            completionCriteria: {
              minScore: response.data.min_score ?? 80,
              requireAllModules: response.data.require_all_modules ?? true,
            },
          });
        } catch (err) {
          console.error('Fetch certificate error:', err.response?.data || err.message);
          setError(`Failed to fetch certificate settings: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchCertificate();
    }
  }, [courseId]);

  // Fetch list of courses for import dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let allCourses = [];
        let nextPage = 1;
        while (nextPage) {
          const response = await coursesAPI.getCourses({ page: nextPage });
          const data = response.data.results || response.data || [];
          allCourses = [...allCourses, ...data];
          nextPage = response.data.next ? nextPage + 1 : null;
        }
        setCourses(allCourses.filter(course => course.id !== parseInt(courseId)));
      } catch (err) {
        console.error('Fetch courses error:', err.response?.data || err.message);
        setError('Failed to fetch courses for import');
      }
    };
    fetchCourses();
  }, [courseId]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('completionCriteria.')) {
      const field = name.split('.')[1];
      if (field === 'minScore') {
        const numValue = Number(value);
        if (numValue < 0 || numValue > 100) return; // Prevent invalid values
      }
      setCertificate((prev) => ({
        ...prev,
        completionCriteria: { ...prev.completionCriteria, [field]: type === 'checkbox' ? checked : Number(value) },
      }));
    } else {
      setCertificate((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  }, []);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB.');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCertificate((prev) => ({ ...prev, customLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSignatureUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB.');
        return;
      }
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCertificate((prev) => ({ ...prev, signature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeLogo = useCallback(() => {
    setLogoFile(null);
    setCertificate((prev) => ({ ...prev, customLogo: null }));
  }, []);

  const removeSignature = useCallback(() => {
    setSignatureFile(null);
    setCertificate((prev) => ({ ...prev, signature: null }));
  }, []);

const handleImport = useCallback(async () => {
  if (!selectedCourseId) {
    setError('Please select a course to import from.');
    return;
  }
  setLoading(true);
  setError(null);
  try {
    const response = await coursesAPI.getCertificate(selectedCourseId);
    console.log('Imported certificate settings:', response.data);
    const importedSettings = response.data;
    const newCertificateState = {
      enabled: importedSettings.is_active ?? true,
      template: importedSettings.template ?? 'default',
      customText: importedSettings.custom_text ?? 'Congratulations on completing the course!',
      signature: importedSettings.signature ? (Array.isArray(importedSettings.signature) ? importedSettings.signature[0] : importedSettings.signature) : null,
      signatureName: importedSettings.signature_name ?? 'Course Instructor',
      showDate: importedSettings.show_date ?? true,
      showCourseName: importedSettings.show_course_name ?? true,
      showCompletionHours: importedSettings.show_completion_hours ?? true,
      customLogo: importedSettings.logo ? (Array.isArray(importedSettings.logo) ? importedSettings.logo[0] : importedSettings.logo) : null,
      completionCriteria: {
        minScore: importedSettings.min_score ?? 80,
        requireAllModules: importedSettings.require_all_modules ?? true,
      },
    };
    setCertificate(newCertificateState);
    console.log('Updated certificate state:', newCertificateState);
    setIsImported(true);
    setSuccess('Certificate settings imported successfully! Click Save to apply.');
  } catch (err) {
    console.error('Import certificate error:', err.response?.data || err.message);
    setError(`Failed to import certificate settings: ${err.message}`);
  } finally {
    setLoading(false);
  }
}, [selectedCourseId]);

// const handleSave = useCallback(async () => {
//   setLoading(true);
//   setError(null);
//   setSuccess(null);
//   try {
//     const formData = new FormData();
//     formData.append('is_active', certificate.enabled);
//     formData.append('template', certificate.template);
//     formData.append('custom_text', certificate.customText);
//     formData.append('signature_name', certificate.signatureName);
//     formData.append('show_date', certificate.showDate);
//     formData.append('show_course_name', certificate.showCourseName);
//     formData.append('show_completion_hours', certificate.showCompletionHours);
//     formData.append('min_score', certificate.completionCriteria.minScore);
//     formData.append('require_all_modules', certificate.completionCriteria.requireAllModules);
//     if (logoFile) {
//       formData.append('logo', logoFile);
//     } else if (certificate.customLogo && !certificate.customLogo.startsWith('data:image')) {
//       formData.append('logo_url', String(certificate.customLogo)); // Ensure string
//     }
//     if (signatureFile) {
//       formData.append('signature', signatureFile);
//     } else if (certificate.signature && !certificate.signature.startsWith('data:image')) {
//       formData.append('signature_url', String(certificate.signature)); // Ensure string
//     }
//     formData.append('is_import', 'true');

//     // Log formData content
//     for (let [key, value] of formData.entries()) {
//       console.log(`formData: ${key}=${value}`);
//     }

//     const response = await coursesAPI.updateCertificate(courseId, formData);
//     console.log('Save response:', response.data);
//     setSuccess('Certificate settings saved successfully!');
//   } catch (err) {
//     console.error('Save certificate error:', err.response?.data || err.message);
//     setError(`Failed to save certificate settings: ${err.message}`);
//   } finally {
//     setLoading(false);
//   }
// }, [certificate, logoFile, signatureFile, courseId]);


  const getImageSrc = (image) => {
    if (!image) return '';
    if (image.startsWith('data:image') || image.startsWith('http')) {
      return image; // Already a base64 string or full URL
    }
    return `${API_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`; // Ensure leading slash
  };

  const handleSave = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('is_active', certificate.enabled);
      formData.append('template', certificate.template);
      formData.append('custom_text', certificate.customText);
      formData.append('signature_name', certificate.signatureName);
      formData.append('show_date', certificate.showDate);
      formData.append('show_course_name', certificate.showCourseName);
      formData.append('show_completion_hours', certificate.showCompletionHours);
      formData.append('min_score', certificate.completionCriteria.minScore);
      formData.append('require_all_modules', certificate.completionCriteria.requireAllModules);
      if (logoFile) {
        formData.append('logo', logoFile);
      } else if (certificate.customLogo && !certificate.customLogo.startsWith('data:image')) {
        formData.append('logo_url', certificate.customLogo);
      }
      if (signatureFile) {
        formData.append('signature', signatureFile);
      } else if (certificate.signature && !certificate.signature.startsWith('data:image')) {
        formData.append('signature_url', certificate.signature);
      }
      formData.append('is_import', 'true');

      // Log formData content
      for (let [key, value] of formData.entries()) {
        console.log(`formData: ${key}=${value}`);
      }

      const response = await coursesAPI.updateCertificate(courseId, formData);
      console.log('Save response:', response.data); // Log response
      setSuccess('Certificate settings saved successfully!');
    } catch (err) {
      console.error('Save certificate error:', err.response?.data || err.message);
      setError(`Failed to save certificate settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [certificate, logoFile, signatureFile, courseId]);

  return (
    <div className={styles.container}>
      {loading && <CircularProgress className={styles.loader} size={24} />}
      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.headerTitle}>
            <DescriptionIcon className={styles.icon} /> Certificate Settings
          </h2>
          <span className={styles.courseId}>Course ID: {courseId}</span>
        </div>
        <div className={styles.status}>
          <span className={styles.statusText}>
            <CheckCircleIcon className={styles.icon} />
            {certificate.enabled ? 'Certificates Enabled' : 'Certificates Disabled'}
          </span>
          <label className={styles.checkboxContainer} title="Enable or disable certificates for this course">
            <input
              type="checkbox"
              checked={certificate.enabled}
              onChange={handleChange}
              name="enabled"
              className={styles.checkbox}
            />
            <span className={styles.checkboxCustom}></span>
          </label>
        </div>
      </div>

      {certificate.enabled && (
        <div className={styles.content}>
          <h3 className={styles.sectionTitle}>Configure Certificate</h3>
          {/* Import Section */}
          <div className={styles.importSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Import Settings From Another Course</label>
              <div className={styles.importGroup}>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={handleImport}
                  disabled={!selectedCourseId || loading}
                >
                  <FileCopyIcon className={styles.icon} /> Import Settings
                </button>
              </div>
            </div>
          </div>
          <div className={styles.accordion}>
            <details className={styles.accordionItem} open aria-expanded="true">
              <summary className={styles.accordionSummary} role="button" aria-controls="general-settings">
                <h4 className={styles.accordionTitle}>General Settings</h4>
                <ExpandMoreIcon className={styles.accordionIcon} />
              </summary>
              <div id="general-settings" className={styles.accordionDetails}>
                <div className={styles.formGroup} title="Select a template for the certificate design">
                  <label className={styles.label}>Template</label>
                  <select
                    name="template"
                    value={certificate.template || 'default'}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="default">Default</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegant</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className={styles.formGroup} title="Custom message to display on the certificate">
                  <label className={styles.label}>Certificate Text</label>
                  <textarea
                    name="customText"
                    value={certificate.customText}
                    onChange={handleChange}
                    rows={4}
                    className={styles.textarea}
                  />
                </div>
              </div>
            </details>
            <details className={styles.accordionItem} aria-expanded="false">
              <summary className={styles.accordionSummary} role="button" aria-controls="appearance-settings">
                <h4 className={styles.accordionTitle}>Appearance</h4>
                <ExpandMoreIcon className={styles.accordionIcon} />
              </summary>
              <div id="appearance-settings" className={styles.accordionDetails}>
                <div className={styles.grid}>
                  <div className={styles.gridItem}>
                    <div className={styles.uploadSection}>
                      <label className={styles.label}>Custom Logo (optional)</label>
                      {certificate.customLogo ? (
                        <div className={styles.uploadPreview}>
                          <img
                            src={getImageSrc(certificate.customLogo)}
                            alt="Logo Preview"
                            className={styles.previewImg}
                          />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className={styles.removeButton}
                          >
                            <CancelIcon className={styles.icon} /> Remove
                          </button>
                        </div>
                      ) : (
                        <label className={styles.uploadButton}>
                          <CloudUploadIcon className={styles.icon} /> Upload Logo
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className={styles.gridItem}>
                    <div className={styles.uploadSection}>
                      <label className={styles.label}>Signature</label>
                      <input
                        type="text"
                        name="signatureName"
                        value={certificate.signatureName}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Signature Name"
                      />
                      {certificate.signature ? (
                        <div className={styles.uploadPreview}>
                          <img
                            src={getImageSrc(certificate.signature)}
                            alt="Signature Preview"
                            className={styles.previewImg}
                          />
                          <button
                            type="button"
                            onClick={removeSignature}
                            className={styles.removeButton}
                          >
                            <CancelIcon className={styles.icon} /> Remove
                          </button>
                        </div>
                      ) : (
                        <label className={styles.uploadButton}>
                          <CloudUploadIcon className={styles.icon} /> Upload Signature
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleSignatureUpload}
                          />
                        </label>
                      )}
                    </div>
                    <ul className={styles.checkboxList}>
                      <li className={styles.checkboxItem} title="Include the course name on the certificate">
                        <label className={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            checked={certificate.showCourseName}
                            onChange={handleChange}
                            name="showCourseName"
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxCustom}></span>
                          Show Course Name
                        </label>
                      </li>
                      <li className={styles.checkboxItem} title="Include the completion date on the certificate">
                        <label className={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            checked={certificate.showDate}
                            onChange={handleChange}
                            name="showDate"
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxCustom}></span>
                          Show Completion Date
                        </label>
                      </li>
                      <li className={styles.checkboxItem} title="Include the course hours on the certificate">
                        <label className={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            checked={certificate.showCompletionHours}
                            onChange={handleChange}
                            name="showCompletionHours"
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxCustom}></span>
                          Show Course Hours
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </details>
            <details className={styles.accordionItem} aria-expanded="false">
              <summary className={styles.accordionSummary} role="button" aria-controls="criteria-settings">
                <h4 className={styles.accordionTitle}>Completion Criteria</h4>
                <ExpandMoreIcon className={styles.accordionIcon} />
              </summary>
              <div id="criteria-settings" className={styles.accordionDetails}>
                <div className={styles.formGroup} title="Minimum score (%) required to earn the certificate">
                  <label className={styles.label}>Minimum Score (%)</label>
                  <input
                    type="number"
                    name="completionCriteria.minScore"
                    value={certificate.completionCriteria.minScore}
                    onChange={handleChange}
                    className={styles.input}
                    min="0"
                    max="100"
                    placeholder="Enter minimum score"
                  />
                </div>
                <div className={styles.formGroup} title="Require completion of all course modules">
                  <label className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={certificate.completionCriteria.requireAllModules}
                      onChange={handleChange}
                      name="completionCriteria.requireAllModules"
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxCustom}></span>
                    Require All Modules
                  </label>
                </div>
              </div>
            </details>
            <div className={styles.actionButtons}>
              <button
                type="button"
                className={`${styles.actionButton} ${previewMode ? styles.active : ''}`}
                onClick={() => setPreviewMode(!previewMode)}
              >
                <VisibilityIcon className={styles.icon} />
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.primary}`}
                onClick={handleSave}
                disabled={loading}
              >
                <SaveIcon className={styles.icon} />
                Save Settings
              </button>
            </div>
          </div>
          {previewMode && (
            <div className={styles.preview}>
              <h3 className={styles.sectionTitle}>Certificate Preview</h3>
              <div className={styles.previewContent}>
                {certificate.customLogo && (
                  <div className={styles.logoContainer}>
                    <img
                      src={getImageSrc(certificate.customLogo)}
                      alt="Logo"
                      className={styles.previewLogo}
                    />
                  </div>
                )}
                <h4 className={styles.previewTitle}>Certificate of Completion</h4>
                <p className={styles.previewText}>This is to certify that</p>
                <h5 className={`${styles.previewSubtitle} ${styles.previewPlaceholder}`}>
                  [Learner Name]
                </h5>
                <p className={styles.previewText}>has successfully completed</p>
                {certificate.showCourseName && (
                  <h5 className={`${styles.previewSubtitle} ${styles.previewPlaceholder}`}>
                    [Course Name]
                  </h5>
                )}
                <p className={styles.previewText}>{certificate.customText}</p>
                <div className={styles.previewDetails}>
                  {certificate.showCompletionHours && (
                    <div className={styles.previewDetail}>
                      <span>Hours:</span>{' '}
                      <strong className={styles.previewPlaceholder}>[Hours]</strong>
                    </div>
                  )}
                  {certificate.showDate && (
                    <div className={styles.previewDetail}>
                      <span>Date:</span>{' '}
                      <strong className={styles.previewPlaceholder}>[Date]</strong>
                    </div>
                  )}
                </div>
                {certificate.signature && (
                  <div className={styles.signatureContainer}>
                    <div className={styles.signatureSection}>
                      <img
                        src={getImageSrc(certificate.signature)}
                        alt="Signature"
                        className={styles.signatureImg}
                      />
                      <span>{certificate.signatureName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateSettings;