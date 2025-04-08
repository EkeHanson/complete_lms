// WebsiteNotificationSettings.js
import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Input,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled component for rich text editor-like experience
const RichTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    minHeight: '200px',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
  },
  '& .MuiInputBase-input': {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`website-tabpanel-${index}`}
      aria-labelledby={`website-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function WebsiteNotificationSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [frontendSettings, setFrontendSettings] = useState({
    privacyPolicy: '',
    aboutUs: '',
    cookiesPolicy: '',
    refundPolicy: '',
    termsConditions: '',
  });
  const [contactInfo, setContactInfo] = useState({
    address: '',
    openingHours: '',
  });
  const [logosImages, setLogosImages] = useState([]);
  const [hasExistingData, setHasExistingData] = useState(false); // You'd typically fetch this from an API

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFrontendChange = (field) => (event) => {
    setFrontendSettings({ ...frontendSettings, [field]: event.target.value });
  };

  const handleContactChange = (field) => (event) => {
    setContactInfo({ ...contactInfo, [field]: event.target.value });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setLogosImages([...logosImages, ...newImages]);
  };

  const handleSubmit = async () => {
    const method = hasExistingData ? 'PATCH' : 'POST';
    const endpoint = '/api/website-settings'; // Replace with your actual endpoint

    const formData = new FormData();
    formData.append('frontendSettings', JSON.stringify(frontendSettings));
    formData.append('contactInfo', JSON.stringify(contactInfo));
    logosImages.forEach((image, index) => {
      formData.append(`images[${index}]`, image.file);
      formData.append(`imageNames[${index}]`, image.name);
    });

    try {
      const response = await fetch(endpoint, {
        method,
        body: formData,
      });
      if (response.ok) {
        setHasExistingData(true);
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Website Notification Settings
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Frontend Settings" />
        <Tab label="Contact Information" />
        <Tab label="Logos & Images" />
      </Tabs>

      {/* Frontend Settings Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RichTextField
              label="Privacy Policy"
              value={frontendSettings.privacyPolicy}
              onChange={handleFrontendChange('privacyPolicy')}
              fullWidth
              multiline
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <RichTextField
              label="About Us"
              value={frontendSettings.aboutUs}
              onChange={handleFrontendChange('aboutUs')}
              fullWidth
              multiline
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <RichTextField
              label="Cookies Policy"
              value={frontendSettings.cookiesPolicy}
              onChange={handleFrontendChange('cookiesPolicy')}
              fullWidth
              multiline
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <RichTextField
              label="Refund Policy"
              value={frontendSettings.refundPolicy}
              onChange={handleFrontendChange('refundPolicy')}
              fullWidth
              multiline
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <RichTextField
              label="Terms and Conditions"
              value={frontendSettings.termsConditions}
              onChange={handleFrontendChange('termsConditions')}
              fullWidth
              multiline
              variant="outlined"
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Contact Information Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Address"
              value={contactInfo.address}
              onChange={handleContactChange('address')}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Opening Hours"
              value={contactInfo.openingHours}
              onChange={handleContactChange('openingHours')}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Logos & Images Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel htmlFor="image-upload">Upload Logos/Images</InputLabel>
            <Input
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageUpload}
            />
            <FormHelperText>Upload multiple images at once</FormHelperText>
          </FormControl>

          <Grid container spacing={2}>
            {logosImages.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px' }}
                  />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    {image.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ px: 4 }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default WebsiteNotificationSettings;