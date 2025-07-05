import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Public as PublicIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Palette as PaletteIcon,
  BrandingWatermark as BrandingIcon,
  Article as ArticleIcon,
  ContactMail as ContactMailIcon
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import { useDropzone } from 'react-dropzone';
import './WebsiteNotificationSettings.css';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    className={`wns-tabpanel ${value === index ? 'active' : ''}`}
    id={`website-tabpanel-${index}`}
    aria-labelledby={`website-tab-${index}`}
    {...other}
  >
    {value === index && (
      <div className="wns-tabpanel-content">
        {children}
      </div>
    )}
  </div>
);

const SocialMediaInput = ({ icon, label, value, onChange, prefix, ...props }) => (
  <div className="wns-social-input">
    <span className="wns-social-icon">{icon}</span>
    <span className="wns-social-prefix">{prefix}</span>
    <input
      type="text"
      placeholder={label}
      value={value}
      onChange={onChange}
      {...props}
    />
  </div>
);

const WebsiteNotificationSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [imageNames, setImageNames] = useState({});
  const api_key = "uecltiwl4q2ez3z029492efueixvfffjwigxatfwgpu6gj43";
  const editorRefs = {
    privacyPolicy: useRef(null),
    aboutUs: useRef(null),
    cookiesPolicy: useRef(null),
    refundPolicy: useRef(null),
    termsConditions: useRef(null),
  };

  const [settings, setSettings] = useState({
    privacyPolicy: '<h2>Privacy Policy</h2><p>We respect your privacy and are committed to protecting your personal data.</p>',
    aboutUs: '<h2>About Our Company</h2><p>We are a leading provider of innovative solutions since 2010.</p>',
    cookiesPolicy: '<h2>Cookies Policy</h2><p>We use cookies to enhance your browsing experience.</p>',
    refundPolicy: '<h2>Refund Policy</h2><p>30-day money back guarantee on all products.</p>',
    termsConditions: '<h2>Terms & Conditions</h2><p>By using our services, you agree to these terms.</p>',
    contact: {
      address: '123 Business Ave, Suite 100\nTech City, TC 12345',
      openingHours: 'Monday-Friday: 9am-5pm\nSaturday: 10am-2pm\nSunday: Closed',
      email: 'support@company.com',
      phone: '+1 (555) 123-4567'
    },
    socialMedia: {
      facebook: 'company.page',
      twitter: '@company',
      instagram: '@company.official',
      linkedin: 'company-profile',
      youtube: 'channel/company'
    },
    branding: {
      primaryColor: '#4f46e5',
      secondaryColor: '#10b981',
      fontFamily: 'Inter',
      darkMode: false
    },
    images: [
      { id: 1, name: 'logo-primary.png', url: 'https://via.placeholder.com/300x150?text=Primary+Logo', isPrimary: true },
      { id: 2, name: 'logo-secondary.png', url: 'https://via.placeholder.com/300x150?text=Secondary+Logo', isPrimary: false },
      { id: 3, name: 'favicon.ico', url: 'https://via.placeholder.com/64x64?text=Favicon', isPrimary: false }
    ]
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg']
    },
    onDrop: acceptedFiles => {
      const newImages = acceptedFiles.map(file => ({
        id: Date.now(),
        name: file.name,
        url: URL.createObjectURL(file),
        isPrimary: false
      }));
      setSettings(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditorChange = (content, field) => {
    setSettings(prev => ({
      ...prev,
      [field]: content
    }));
  };

  const handleContactChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: event.target.value
      }
    }));
  };

  const handleSocialMediaChange = (platform) => (event) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: event.target.value
      }
    }));
  };

  const handleBrandingChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: event.target.value
      }
    }));
  };

  const handleToggleDarkMode = (event) => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        darkMode: event.target.checked
      }
    }));
  };

  const handleSetPrimaryImage = (id) => {
    setSettings(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === id
      }))
    }));
  };

  const handleRemoveImage = (id) => {
    setSettings(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  const handleImageNameChange = (id, name) => {
    setImageNames(prev => ({
      ...prev,
      [id]: name
    }));
  };

  const handleSaveImageNames = () => {
    setSettings(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        name: imageNames[img.id] || img.name
      }))
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSaveStatus(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveStatus('success');
      console.log('Settings saved:', settings);
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wns-container">
      <div className="wns-header">
        <span className="wns-header-icon"><SettingsIcon /></span>
        <div>
          <h1>Website Configuration</h1>
          <p>Manage all aspects of your website content and appearance</p>
        </div>
      </div>

      {saveStatus === 'success' && (
        <div className="wns-alert wns-alert-success">
          <CheckCircleIcon />
          <span>Changes saved successfully</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="wns-alert wns-alert-error">
          <ErrorIcon />
          <span>Error saving changes</span>
        </div>
      )}

      <div className="wns-card">
        <div className="wns-card-header">
          <span className="wns-card-icon"><PublicIcon /></span>
          <div>
            <h2>Website Settings Dashboard</h2>
            <p>Configure your website content, branding, and contact information</p>
          </div>
        </div>

        <div className="wns-tabs">
          <button
            className={`wns-tab ${tabValue === 0 ? 'active' : ''}`}
            onClick={() => handleTabChange(null, 0)}
          >
            <ArticleIcon />
            Content
          </button>
          <button
            className={`wns-tab ${tabValue === 1 ? 'active' : ''}`}
            onClick={() => handleTabChange(null, 1)}
          >
            <PaletteIcon />
            Branding
          </button>
          <button
            className={`wns-tab ${tabValue === 2 ? 'active' : ''}`}
            onClick={() => handleTabChange(null, 2)}
          >
            <ContactMailIcon />
            Contact
          </button>
          <button
            className={`wns-tab ${tabValue === 3 ? 'active' : ''}`}
            onClick={() => handleTabChange(null, 3)}
          >
            <BrandingIcon />
            Media
          </button>
        </div>

        <TabPanel value={tabValue} index={0}>
          <div className="wns-grid">
            <div className="wns-section">
              <h3><InfoIcon /> About Us Page</h3>
              <div className="wns-editor">
                <Editor
                  apiKey={api_key}
                  onInit={(evt, editor) => editorRefs.aboutUs.current = editor}
                  value={settings.aboutUs}
                  onEditorChange={(content) => handleEditorChange(content, 'aboutUs')}
                  init={{
                    height: 400,
                    menubar: true,
                    plugins: [
                      'advlist autolink lists link image charmap preview anchor',
                      'searchreplace visualblocks code fullscreen',
                      'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
                      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                      'link image media table | forecolor backcolor | code | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
                    skin: settings.branding.darkMode ? 'oxide-dark' : 'oxide',
                    content_css: settings.branding.darkMode ? 'dark' : 'default',
                  }}
                />
              </div>
              <div className="wns-section-actions">
                <button className="wns-btn wns-btn-secondary"><VisibilityIcon /> Preview</button>
                <button className="wns-btn wns-btn-primary"><EditIcon /> Edit SEO Settings</button>
              </div>
            </div>
            <div className="wns-section">
              <h3><InfoIcon /> Privacy Policy</h3>
              <div className="wns-editor">
                <Editor
                  apiKey={api_key}
                  onInit={(evt, editor) => editorRefs.privacyPolicy.current = editor}
                  value={settings.privacyPolicy}
                  onEditorChange={(content) => handleEditorChange(content, 'privacyPolicy')}
                  init={{
                    height: 400,
                    menubar: false,
                    plugins: ['lists link image charmap', 'wordcount'],
                    toolbar: 'undo redo | bold italic underline | bullist numlist | link image',
                    skin: settings.branding.darkMode ? 'oxide-dark' : 'oxide',
                    content_css: settings.branding.darkMode ? 'dark' : 'default',
                  }}
                />
              </div>
            </div>
            <div className="wns-section">
              <h3><InfoIcon /> Terms & Conditions</h3>
              <div className="wns-editor">
                <Editor
                  apiKey={api_key}
                  onInit={(evt, editor) => editorRefs.termsConditions.current = editor}
                  value={settings.termsConditions}
                  onEditorChange={(content) => handleEditorChange(content, 'termsConditions')}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: ['lists link', 'wordcount'],
                    toolbar: 'undo redo | bold italic | bullist numlist',
                    skin: settings.branding.darkMode ? 'oxide-dark' : 'oxide',
                    content_css: settings.branding.darkMode ? 'dark' : 'default',
                  }}
                />
              </div>
            </div>
            <div className="wns-section">
              <h3><InfoIcon /> Refund Policy</h3>
              <div className="wns-editor">
                <Editor
                  apiKey={api_key}
                  onInit={(evt, editor) => editorRefs.refundPolicy.current = editor}
                  value={settings.refundPolicy}
                  onEditorChange={(content) => handleEditorChange(content, 'refundPolicy')}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: ['lists link', 'wordcount'],
                    toolbar: 'undo redo | bold italic | bullist numlist',
                    skin: settings.branding.darkMode ? 'oxide-dark' : 'oxide',
                    content_css: settings.branding.darkMode ? 'dark' : 'default',
                  }}
                />
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="wns-grid">
            <div className="wns-section">
              <h3><PaletteIcon /> Color Scheme</h3>
              <div className="wns-color-grid">
                <div className="wns-form-field">
                  <label>Primary Color</label>
                  <div className="wns-color-input">
                    <span style={{ backgroundColor: settings.branding.primaryColor }}></span>
                    <input
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={handleBrandingChange('primaryColor')}
                    />
                  </div>
                </div>
                <div className="wns-form-field">
                  <label>Secondary Color</label>
                  <div className="wns-color-input">
                    <span style={{ backgroundColor: settings.branding.secondaryColor }}></span>
                    <input
                      type="color"
                      value={settings.branding.secondaryColor}
                      onChange={handleBrandingChange('secondaryColor')}
                    />
                  </div>
                </div>
              </div>
              <div className="wns-form-field">
                <label>Font Family</label>
                <select
                  value={settings.branding.fontFamily}
                  onChange={handleBrandingChange('fontFamily')}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <label className="wns-checkbox">
                <input
                  type="checkbox"
                  checked={settings.branding.darkMode}
                  onChange={handleToggleDarkMode}
                />
                <span>Enable Dark Mode</span>
              </label>
            </div>
            <div className="wns-section">
              <h3><ImageIcon /> Logo & Favicon</h3>
              <div {...getRootProps()} className={`wns-dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <UploadIcon />
                <h4>{isDragActive ? 'Drop branding assets here' : 'Drag & drop images here, or click to select'}</h4>
                <p>Supports PNG, JPG, SVG and ICO files (Max 5MB)</p>
              </div>
              <h4>Current Brand Assets</h4>
              <div className="wns-image-grid">
                {settings.images.map((image) => (
                  <div key={image.id} className="wns-image-preview">
                    <img src={image.url} alt={image.name} />
                    <div className="wns-image-actions">
                      <input
                        type="text"
                        defaultValue={image.name}
                        onChange={(e) => handleImageNameChange(image.id, e.target.value)}
                      />
                      <div>
                        <button
                          className={`wns-btn wns-btn-icon ${image.isPrimary ? 'primary' : ''}`}
                          onClick={() => handleSetPrimaryImage(image.id)}
                          disabled={image.isPrimary}
                          title={image.isPrimary ? 'Primary logo' : 'Set as primary'}
                        >
                          <CheckCircleIcon />
                        </button>
                        <button
                          className="wns-btn wns-btn-icon wns-btn-error"
                          onClick={() => handleRemoveImage(image.id)}
                          title="Remove"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="wns-btn wns-btn-primary" onClick={handleSaveImageNames}>
                Save Image Names
              </button>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div className="wns-grid">
            <div className="wns-section">
              <h3><LocationIcon /> Business Information</h3>
              <div className="wns-form-field">
                <label>Business Address</label>
                <div className="wns-input-group">
                  <LocationIcon />
                  <textarea
                    rows="4"
                    value={settings.contact.address}
                    onChange={handleContactChange('address')}
                  ></textarea>
                </div>
              </div>
              <div className="wns-form-field">
                <label>Opening Hours</label>
                <div className="wns-input-group">
                  <ScheduleIcon />
                  <textarea
                    rows="4"
                    value={settings.contact.openingHours}
                    onChange={handleContactChange('openingHours')}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="wns-section">
              <h3><EmailIcon /> Contact Details</h3>
              <div className="wns-form-field">
                <label>Contact Email</label>
                <div className="wns-input-group">
                  <EmailIcon />
                  <input
                    type="text"
                    value={settings.contact.email}
                    onChange={handleContactChange('email')}
                  />
                </div>
              </div>
              <div className="wns-form-field">
                <label>Phone Number</label>
                <div className="wns-input-group">
                  <PhoneIcon />
                  <input
                    type="text"
                    value={settings.contact.phone}
                    onChange={handleContactChange('phone')}
                  />
                </div>
              </div>
              <h3><PublicIcon /> Social Media Links</h3>
              <div className="wns-social-grid">
                <SocialMediaInput
                  icon={<FacebookIcon />}
                  label="Facebook"
                  value={settings.socialMedia.facebook}
                  onChange={handleSocialMediaChange('facebook')}
                  prefix="facebook.com/"
                />
                <SocialMediaInput
                  icon={<TwitterIcon />}
                  label="Twitter"
                  value={settings.socialMedia.twitter}
                  onChange={handleSocialMediaChange('twitter')}
                  prefix="twitter.com/"
                />
                <SocialMediaInput
                  icon={<InstagramIcon />}
                  label="Instagram"
                  value={settings.socialMedia.instagram}
                  onChange={handleSocialMediaChange('instagram')}
                  prefix="instagram.com/"
                />
                <SocialMediaInput
                  icon={<LinkedInIcon />}
                  label="LinkedIn"
                  value={settings.socialMedia.linkedin}
                  onChange={handleSocialMediaChange('linkedin')}
                  prefix="linkedin.com/company/"
                />
                <SocialMediaInput
                  icon={<YouTubeIcon />}
                  label="YouTube"
                  value={settings.socialMedia.youtube}
                  onChange={handleSocialMediaChange('youtube')}
                  prefix="youtube.com/"
                />
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div className="wns-section">
            <h3><ImageIcon /> Media Library</h3>
            <div {...getRootProps()} className={`wns-dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <UploadIcon />
              <h4>{isDragActive ? 'Drop media files here' : 'Drag & drop files here, or click to select'}</h4>
              <p>Supports images, videos and documents (Max 10MB per file)</p>
            </div>
            <h4>Uploaded Media Files</h4>
            <div className="wns-image-grid">
              {settings.images.map((image) => (
                <div key={image.id} className="wns-image-preview">
                  <img src={image.url} alt={image.name} />
                  <div className="wns-image-actions">
                    <span>{image.name}</span>
                    <div>
                      <button className="wns-btn wns-btn-icon" title="Rename">
                        <EditIcon />
                      </button>
                      <button
                        className="wns-btn wns-btn-icon wns-btn-error"
                        onClick={() => handleRemoveImage(image.id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <div className="wns-footer">
          <div>
            {saveStatus === 'success' && (
              <span className="wns-status success">
                <CheckCircleIcon />
                Changes saved successfully
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="wns-status error">
                <ErrorIcon />
                Error saving changes
              </span>
            )}
          </div>
          <div className="wns-footer-actions">
            <button className="wns-btn wns-btn-secondary">Discard Changes</button>
            <button
              className="wns-btn wns-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <div className="wns-spinner"></div> : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteNotificationSettings;