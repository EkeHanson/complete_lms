import React, { useState } from 'react';
import './SCORMxAPISettings.css';
import { CloudUpload, Delete, Close, Info, CheckCircle, Save } from '@mui/icons-material';

const SCORMxAPISettings = ({ courseId }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    standard: 'scorm12',
    version: '1.2',
    completionThreshold: 80,
    scoreThreshold: 70,
    tracking: {
      completion: true,
      score: true,
      time: true,
      progress: true,
    },
    package: null,
    packageName: '',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [successAlert, setSuccessAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in settings.tracking) {
      setSettings((prev) => ({
        ...prev,
        tracking: {
          ...prev.tracking,
          [name]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleStandardChange = (e) => {
    const standard = e.target.value;
    setSettings((prev) => ({
      ...prev,
      standard,
      version: standard === 'scorm12' ? '1.2' : standard === 'scorm2004' ? '4th' : '1.0.0',
    }));
  };

  const handlePackageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setSettings((prev) => ({
            ...prev,
            package: file,
            packageName: file.name,
          }));
          setSuccessAlert(true);
          setTimeout(() => setSuccessAlert(false), 5000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const removePackage = () => {
    setSettings((prev) => ({
      ...prev,
      package: null,
      packageName: '',
    }));
  };

  const handleSave = () => {
    console.log('SCORM/xAPI settings saved:', settings);
    // API call to save settings
  };

  return (
    <div className="SCORMxAPISettings">
      <div className="SCORMxAPISettings-Top">
        <div className="SCORMxAPISettings-Top-Grid">
          <div className="SCORMxAPISettings-Top-1">
            <h2>
              <Info className="icon" /> SCORM/xAPI Settings
            </h2>
          </div>
          <div className="SCORMxAPISettings-Top-2">
            <label className="label">Course ID: {courseId}</label>
          </div>
        </div>

        <div className="SCORMxAPISettings-Theory">
          <ul>
            <li>
              <span>
                <CheckCircle className="icon" />{' '}
                {settings.enabled ? 'Tracking Enabled' : 'Tracking Disabled'}
              </span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleChange}
                name="enabled"
                className="switch"
              />
            </li>
          </ul>
        </div>
      </div>

      {settings.enabled && (
        <div className="SCORMxAPISettings-Content">
          <h3>Configuration</h3>
          <div className="SCORMxAPISettings-Grid">
            <div className="SCORMxAPISettings-Left">
              <label className="label">Standard</label>
              <select
                className="select"
                value={settings.standard}
                onChange={handleStandardChange}
              >
                <option value="scorm12">SCORM 1.2</option>
                <option value="scorm2004">SCORM 2004</option>
                <option value="xapi">xAPI (Tin Can)</option>
              </select>

              <label className="label">Version</label>
              <input
                type="text"
                className="input"
                value={settings.version}
                readOnly
                placeholder="Version"
              />

              <label className="label">Tracking Options</label>
              <ul className="checkbox-list">
                <li>
                  <input
                    type="checkbox"
                    checked={settings.tracking.completion}
                    onChange={handleChange}
                    name="completion"
                    className="checkbox"
                  />
                  <span>Completion</span>
                </li>
                <li>
                  <input
                    type="checkbox"
                    checked={settings.tracking.score}
                    onChange={handleChange}
                    name="score"
                    className="checkbox"
                  />
                  <span>Score</span>
                </li>
                <li>
                  <input
                    type="checkbox"
                    checked={settings.tracking.time}
                    onChange={handleChange}
                    name="time"
                    className="checkbox"
                  />
                  <span>Time spent</span>
                </li>
                <li>
                  <input
                    type="checkbox"
                    checked={settings.tracking.progress}
                    onChange={handleChange}
                    name="progress"
                    className="checkbox"
                  />
                  <span>Progress</span>
                </li>
              </ul>

              <label className="label">Completion Threshold (%)</label>
              <input
                type="number"
                className="input"
                name="completionThreshold"
                value={settings.completionThreshold}
                onChange={handleChange}
                placeholder="Completion Threshold"
              />

              <label className="label">Passing Score Threshold (%)</label>
              <input
                type="number"
                className="input"
                name="scoreThreshold"
                value={settings.scoreThreshold}
                onChange={handleChange}
                placeholder="Passing Score Threshold"
              />
            </div>

            <div className="SCORMxAPISettings-Right">
              <div className="upload-section">
                <label className="label">SCORM/xAPI Package</label>
                {settings.package ? (
                  <div className="upload-preview">
                    <span className="chip">
                      {settings.packageName}
                      <Delete className="chip-icon" onClick={removePackage} />
                    </span>
                    <p className="caption">Package uploaded successfully</p>
                  </div>
                ) : (
                  <button className="upload-btn" disabled={uploading} component="label">
                    <CloudUpload className="icon" /> Upload Package
                    <input
                      type="file"
                      hidden
                      accept=".zip,.pif"
                      onChange={handlePackageUpload}
                    />
                  </button>
                )}

                {uploading && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="caption">Uploading: {uploadProgress}%</span>
                  </div>
                )}
              </div>

              <div className="alert info">
                <Info className="alert-icon" />
                <div>
                  <p>
                    <strong>SCORM 1.2/2004:</strong> Upload a .zip file containing
                    your SCORM package
                  </p>
                  <p>
                    <strong>xAPI:</strong> Configure your LRS endpoint in system
                    settings
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="alert error">
                  <Close
                    className="alert-icon"
                    onClick={() => setUploadError(null)}
                  />
                  <p>{uploadError}</p>
                </div>
              )}

              {successAlert && (
                <div className="alert success">
                  <CheckCircle className="alert-icon" />
                  <p>Package uploaded successfully!</p>
                  <Close
                    className="alert-close"
                    onClick={() => setSuccessAlert(false)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={handleSave}
              disabled={uploading}
            >
              <Save className="icon" /> Save Settings
            </button>
          </div>
        </div>
      )}

      {!settings.enabled && (
        <div className="alert warning">
          <Info className="alert-icon" />
          <p>
            SCORM/xAPI tracking is currently disabled. Enable it to configure
            settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default SCORMxAPISettings;