// PaymentSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  useTheme,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const paymentMethods = [
  {
    name: 'Paystack',
    fields: [
      { label: 'Public Key', key: 'publicKey' },
      { label: 'Secret Key', key: 'secretKey' }
    ]
  },
  {
    name: 'Paypal',
    fields: [
      { label: 'Sandbox Client ID', key: 'sandboxClientId' },
      { label: 'Sandbox Secret Key', key: 'sandboxSecretKey' }
    ]
  },
  {
    name: 'Remita',
    fields: [
      { label: 'Public Key', key: 'publicKey' },
      { label: 'Secret Key', key: 'secretKey' }
    ]
  },
  {
    name: 'Stripe',
    fields: [
      { label: 'Publishable Key', key: 'publishableKey' },
      { label: 'Secret Key', key: 'secretKey' }
    ]
  },
  {
    name: 'Flutterwave',
    fields: [
      { label: 'Public Key', key: 'publicKey' },
      { label: 'Secret Key', key: 'secretKey' }
    ]
  }
];

const currencies = ['USD', 'NGN', 'EUR', 'GBP', 'KES', 'GHS'];

function PaymentSettings() {
  const theme = useTheme();
  const [paymentConfigs, setPaymentConfigs] = useState([]);
  const [currency, setCurrency] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Simulated API response - replace with actual API call
        const data = {};
        if (Object.keys(data).length > 0) {
          setPaymentConfigs(data.configs || []);
          setCurrency(data.currency || '');
          setHasExistingConfig(true);
        }
      } catch (error) {
        console.error('Error fetching payment config:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleAddMethod = () => {
    if (newMethod && !paymentConfigs.some(config => config.method === newMethod)) {
      const methodConfig = {
        method: newMethod,
        config: {},
        isActive: false
      };
      setPaymentConfigs([...paymentConfigs, methodConfig]);
      setNewMethod('');
    }
  };

  const handleFieldChange = (methodIndex, key, value) => {
    setPaymentConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[methodIndex] = {
        ...newConfigs[methodIndex],
        config: {
          ...newConfigs[methodIndex].config,
          [key]: value
        }
      };
      return newConfigs;
    });
  };

  const handleToggleActive = (index) => {
    setPaymentConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[index] = {
        ...newConfigs[index],
        isActive: !newConfigs[index].isActive
      };
      return newConfigs;
    });
  };

  const handleDeleteMethod = (index) => {
    setPaymentConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setOpenConfirm(true);
  };

  const handleConfirmSave = async () => {
    const configData = {
      configs: paymentConfigs,
      currency
    };

    try {
      const method = hasExistingConfig ? 'PATCH' : 'POST';
      const url = hasExistingConfig ? '/api/payment-config/update' : '/api/payment-config';
      
      console.log(`Making ${method} request to ${url} with data:`, configData);
      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(configData)
      // });
      // if (!response.ok) throw new Error('Failed to save config');

      setHasExistingConfig(true);
      setOpenConfirm(false);
    } catch (error) {
      console.error('Error saving payment config:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Payment Settings
      </Typography>
      
      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Add Payment Method</InputLabel>
            <Select
              value={newMethod}
              label="Add Payment Method"
              onChange={(e) => setNewMethod(e.target.value)}
            >
              {paymentMethods
                .filter(method => !paymentConfigs.some(config => config.method === method.name))
                .map(method => (
                  <MenuItem key={method.name} value={method.name}>
                    {method.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMethod}
            disabled={!newMethod}
          >
            Add
          </Button>
        </Box>

        <List>
          {paymentConfigs.map((config, index) => {
            const methodDetails = paymentMethods.find(m => m.name === config.method);
            return (
              <ListItem 
                key={config.method} 
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'stretch', 
                  mb: 2,
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 1
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                  <ListItemText 
                    primary={config.method}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Box>
                    <Switch
                      checked={config.isActive}
                      onChange={() => handleToggleActive(index)}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      onClick={() => handleDeleteMethod(index)}
                      edge="end"
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                {methodDetails.fields.map(field => (
                  <TextField
                    key={field.key}
                    fullWidth
                    label={field.label}
                    value={config.config[field.key] || ''}
                    onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />
                ))}
              </ListItem>
            );
          })}
        </List>

        <FormControl fullWidth sx={{ mb: 3, maxWidth: 200 }}>
          <InputLabel>Currency</InputLabel>
          <Select
            value={currency}
            label="Currency"
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map(curr => (
              <MenuItem key={curr} value={curr}>
                {curr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={paymentConfigs.length === 0 || !currency}
          sx={{ mt: 2 }}
        >
          Save Settings
        </Button>
      </Paper>

      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', mb: 2 }}>
          Confirm Changes
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {hasExistingConfig ? 'update' : 'save'} these payment settings?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenConfirm(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSave}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PaymentSettings;