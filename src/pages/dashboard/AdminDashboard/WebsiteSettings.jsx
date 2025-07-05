import React, { useState, useEffect } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import './WebsiteSettings.css';

const WebsiteSettings = () => {
  const [settings, setSettings] = useState({
    websiteName: 'Arts Training',
    websiteTitle: 'Arts Training Academy',
    websiteKeywords: 'Arts Training Academy',
    websiteDescription: 'Study any topic, anytime. explore thousands of courses for the lowest price ever!',
    author: 'nece',
    slogan: 'A course based learning experience',
    systemEmail: 'support@artstraining.co.uk',
    address: 'Sydney, Australia',
    phone: '+143-52-97483',
    youtubeApiKey: 'youtube-and-google-drive-api-key',
    vimeoApiKey: 'vimeo-api-key',
    systemLanguage: 'English',
    studentEmailVerification: false,
    courseAccessibility: 'Public',
    numberOfDevices: 1,
    courseSellingTax: 0,
    googleAnalyticsId: '',
    metaPixelId: '',
    footerText: 'nece TM',
    bannerLink: 'https://example.com/banner',
    timezone: 'Australia/Sydney',
    publicSignup: true,
    canStudentsDisableAccount: false
  });
  const [isExistingData, setIsExistingData] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = { data: null }; // Simulate API response
      if (response.data) {
        setSettings(response.data);
        setIsExistingData(true);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isExistingData ? 'PATCH' : 'POST';
    const url = isExistingData ? '/api/settings/update' : '/api/settings/create';
    try {
      console.log(`Sending ${method} request to ${url} with data:`, settings);
      setIsExistingData(true);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  return (
    <div className="ws-container">
      <h1 className="ws-title">Website Notification Settings</h1>
      <div className="ws-form-container">
        <form onSubmit={handleSubmit}>
          <div className="ws-section">
            <h2>Website Information</h2>
            <div className="ws-divider"></div>
            <div className="ws-grid">
              <div className="ws-form-field">
                <label>Website Name</label>
                <input
                  type="text"
                  name="websiteName"
                  value={settings.websiteName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ws-form-field">
                <label>Website Title</label>
                <input
                  type="text"
                  name="websiteTitle"
                  value={settings.websiteTitle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ws-form-field ws-form-field-full">
                <label>Website Keywords</label>
                <input
                  type="text"
                  name="websiteKeywords"
                  value={settings.websiteKeywords}
                  onChange={handleChange}
                />
                <span className="ws-helper-text">Comma-separated keywords</span>
              </div>
              <div className="ws-form-field ws-form-field-full">
                <label>Website Description</label>
                <textarea
                  rows="3"
                  name="websiteDescription"
                  value={settings.websiteDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="ws-section">
            <h2>Contact Information</h2>
            <div className="ws-divider"></div>
            <div className="ws-grid">
              <div className="ws-form-field">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={settings.author}
                  onChange={handleChange}
                />
              </div>
              <div className="ws-form-field">
                <label>Slogan</label>
                <input
                  type="text"
                  name="slogan"
                  value={settings.slogan}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ws-form-field">
                <label>System Email</label>
                <input
                  type="email"
                  name="systemEmail"
                  value={settings.systemEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ws-form-field">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="ws-form-field ws-form-field-full">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="ws-section">
            <h2>API Settings</h2>
            <div className="ws-divider"></div>
            <div className="ws-grid">
              <div className="ws-form-field">
                <label>YouTube API Key</label>
                <input
                  type="text"
                  name="youtubeApiKey"
                  value={settings.youtubeApiKey}
                  onChange={handleChange}
                  required
                />
                <a href="https://developers.google.com/youtube/v3" target="_blank" className="ws-helper-link">
                  Get YouTube API Key
                </a>
              </div>
              <div className="ws-form-field">
                <label>Vimeo API Key</label>
                <input
                  type="text"
                  name="vimeoApiKey"
                  value={settings.vimeoApiKey}
                  onChange={handleChange}
                  required
                />
                <a href="https://developer.vimeo.com/" target="_blank" className="ws-helper-link">
                  Get Vimeo API Key
                </a>
              </div>
            </div>
          </div>

          <div className="ws-section">
            <h2>System Configuration</h2>
            <div className="ws-divider"></div>
            <div className="ws-grid">
              <div className="ws-form-field">
                <label>System Language</label>
                <select
                  name="systemLanguage"
                  value={settings.systemLanguage}
                  onChange={handleChange}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div className="ws-form-field">
                <label>Course Accessibility</label>
                <select
                  name="courseAccessibility"
                  value={settings.courseAccessibility}
                  onChange={handleChange}
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>
              <div className="ws-form-field">
                <label>Number of Authorized Devices</label>
                <input
                  type="number"
                  name="numberOfDevices"
                  value={settings.numberOfDevices}
                  onChange={handleChange}
                  required
                />
                <span className="ws-helper-text">Devices per account</span>
              </div>
              <div className="ws-form-field">
                <label>Course Selling Tax (%)</label>
                <input
                  type="number"
                  name="courseSellingTax"
                  value={settings.courseSellingTax}
                  onChange={handleChange}
                  required
                />
                <span className="ws-helper-text">Enter 0 to disable</span>
              </div>
            </div>
          </div>

          <div className="ws-section">
            <h2>Analytics</h2>
            <div className="ws-divider"></div>
            <div className="ws-grid">
              <div className="ws-form-field">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  name="googleAnalyticsId"
                  value={settings.googleAnalyticsId}
                  onChange={handleChange}
                />
                <span className="ws-helper-text">Leave blank to disable</span>
              </div>
              <div className="ws-form-field">
                <label>Meta Pixel ID</label>
                <input
                  type="text"
                  name="metaPixelId"
                  value={settings.metaPixelId}
                  onChange={handleChange}
                />
                <span className="ws-helper-text">Leave blank to disable</span>
              </div>
            </div>
          </div>

          <div className="ws-section">
            <h2>Additional Settings</h2>
            <div className="ws-divider"></div>
            <div className="ws-grid">
              <div className="ws-form-field ws-form-field-full">
                <label>Footer Text</label>
                <input
                  type="text"
                  name="footerText"
                  value={settings.footerText}
                  onChange={handleChange}
                />
              </div>
              <div className="ws-form-field ws-form-field-full">
                <label>Banner Link</label>
                <input
                  type="text"
                  name="bannerLink"
                  value={settings.bannerLink}
                  onChange={handleChange}
                />
                <span className="ws-helper-text">URL for banner image</span>
              </div>
              <div className="ws-form-field">
                <label>Timezone</label>
                <input
                  type="text"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="ws-section">
            <div className="ws-form-field ws-form-field-full">
              <label className="ws-checkbox">
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.studentEmailVerification}
                      onChange={handleChange}
                      name="studentEmailVerification"
                    />
                  }
                  label="Student Email Verification"
                />
              </label>
            </div>
            <div className="ws-form-field ws-form-field-full">
              <label className="ws-checkbox">
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.publicSignup}
                      onChange={handleChange}
                      name="publicSignup"
                    />
                  }
                  label="Public Signup"
                />
              </label>
            </div>
            <div className="ws-form-field ws-form-field-full">
              <label className="ws-checkbox">
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.canStudentsDisableAccount}
                      onChange={handleChange}
                      name="canStudentsDisableAccount"
                    />
                  }
                  label="Can Students Disable Their Own Accounts?"
                />
              </label>
            </div>
          </div>

          <div className="ws-actions">
            <button type="submit" className="ws-btn ws-btn-confirm">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteSettings;