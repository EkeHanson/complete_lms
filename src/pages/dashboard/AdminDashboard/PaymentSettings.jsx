import React, { useState, useEffect } from 'react';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { paymentAPI, paymentMethods, currencies } from '../../../config';
import './PaymentSettings.css';

function PaymentSettings() {
  const [paymentConfigs, setPaymentConfigs] = useState([]);
  const [currency, setCurrency] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [hasExistingPaymentConfig, setHasExistingPaymentConfig] = useState(false);
  const [hasExistingSiteConfig, setHasExistingSiteConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true);
      setError('');
      try {
        const paymentResponse = await paymentAPI.getPaymentConfig();
        const paymentData = paymentResponse.data;
        if (Object.keys(paymentData).length > 0) {
          setPaymentConfigs(paymentData.configs || []);
          setHasExistingPaymentConfig(true);
        }

        const siteResponse = await paymentAPI.getSiteConfig();
        const siteData = siteResponse.data;
        if (Object.keys(siteData).length > 0) {
          setCurrency(siteData.currency || 'USD');
          setHasExistingSiteConfig(true);
        }
      } catch (err) {
        setError('Failed to fetch configurations. Please try again.');
        console.error('Error fetching configs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleAddMethod = () => {
    if (newMethod && !paymentConfigs.some(config => config.method === newMethod)) {
      const methodConfig = {
        method: newMethod,
        config: {},
        isActive: false,
      };
      setPaymentConfigs([...paymentConfigs, methodConfig]);
      setNewMethod('');
      setSuccess(`Added ${newMethod} to the configuration. Save to persist changes.`);
    }
  };

  const handleFieldChange = (methodIndex, key, value) => {
    setPaymentConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[methodIndex] = {
        ...newConfigs[methodIndex],
        config: {
          ...newConfigs[methodIndex].config,
          [key]: value,
        },
      };
      return newConfigs;
    });
  };

  const handleToggleActive = (index) => {
    setPaymentConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[index] = {
        ...newConfigs[index],
        isActive: !newConfigs[index].isActive,
      };
      return newConfigs;
    });
    setSuccess('Changes made. Save to persist changes.');
  };

  const handleDeleteMethod = (index) => {
    const methodName = paymentConfigs[index].method;
    setPaymentConfigs(prev => prev.filter((_, i) => i !== index));
    setSuccess(`Removed ${methodName} from the configuration. Save to persist changes.`);
  };

  const handleSave = () => {
    setOpenConfirm(true);
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const paymentData = { configs: paymentConfigs };
      if (hasExistingPaymentConfig) {
        await paymentAPI.updatePaymentConfig(paymentData);
      } else {
        await paymentAPI.createPaymentConfig(paymentData);
      }

      const siteData = { currency };
      if (hasExistingSiteConfig) {
        await paymentAPI.updateSiteConfig(siteData);
      } else {
        await paymentAPI.createSiteConfig(siteData);
      }

      setHasExistingPaymentConfig(true);
      setHasExistingSiteConfig(true);
      setSuccess('Payment settings saved successfully!');
      setOpenConfirm(false);
    } catch (err) {
      setError('Failed to save configurations. Please try again.');
      console.error('Error saving configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await paymentAPI.deletePaymentConfig();
      setPaymentConfigs([]);
      setHasExistingPaymentConfig(false);
      setSuccess('Payment configuration deleted successfully!');
    } catch (err) {
      setError('Failed to delete payment configuration. Please try again.');
      console.error('Error deleting config:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-container">
      <h1 className="ps-header">Payment Settings</h1>

      {loading && (
        <div className="ps-loading">
          <div className="ps-spinner"></div>
        </div>
      )}

      {error && (
        <div className="ps-alert ps-alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ps-alert-close">
            <DeleteIcon />
          </button>
        </div>
      )}

      {success && (
        <div className="ps-alert ps-alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ps-alert-close">
            <DeleteIcon />
          </button>
        </div>
      )}

      <div className="ps-card">
        <div className="ps-currency">
          <label>Currency</label>
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              setSuccess('Currency changed. Save to persist changes.');
            }}
          >
            {currencies.map(curr => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        <div className="ps-add-method">
          <div className="ps-form-field">
            <label>Add Payment Method</label>
            <select
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
            >
              <option value="">Select a method</option>
              {paymentMethods
                .filter(method => !paymentConfigs.some(config => config.method === method.name))
                .map(method => (
                  <option key={method.name} value={method.name}>
                    {method.name}
                  </option>
                ))}
            </select>
          </div>
          <button
            className="ps-btn ps-btn-primary"
            onClick={handleAddMethod}
            disabled={!newMethod}
          >
            <AddIcon />
            Add Method
          </button>
        </div>

        <div className="ps-methods-list">
          {paymentConfigs.map((config, index) => {
            const methodDetails = paymentMethods.find(m => m.name === config.method);
            return (
              <div key={config.method} className="ps-method-item">
                <div className="ps-method-header">
                  <span>{config.method}</span>
                  <div className="ps-method-actions">
                    <label className="ps-switch">
                      <input
                        type="checkbox"
                        checked={config.isActive}
                        onChange={() => handleToggleActive(index)}
                      />
                      <span className="ps-slider"></span>
                    </label>
                    <button
                      className="ps-btn ps-btn-delete"
                      onClick={() => handleDeleteMethod(index)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
                <div className="ps-method-fields">
                  {methodDetails.fields.map(field => (
                    <div key={field.key} className="ps-form-field">
                      <label>{field.label}</label>
                      <input
                        type={field.key.toLowerCase().includes('secret') ? 'password' : 'text'}
                        value={config.config[field.key] || ''}
                        onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="ps-actions">
          <button
            className="ps-btn ps-btn-confirm"
            onClick={handleSave}
            disabled={loading || (!currency && paymentConfigs.length === 0)}
          >
            Save Settings
          </button>
          {hasExistingPaymentConfig && (
            <button
              className="ps-btn ps-btn-delete"
              onClick={handleDeleteConfig}
              disabled={loading}
            >
              Delete Configuration
            </button>
          )}
        </div>
      </div>

      <div className="ps-dialog" style={{ display: openConfirm ? 'block' : 'none' }}>
        <div className="ps-dialog-backdrop" onClick={() => setOpenConfirm(false)}></div>
        <div className="ps-dialog-content">
          <div className="ps-dialog-header">
            <h3>Confirm Changes</h3>
          </div>
          <div className="ps-dialog-body">
            <p>Are you sure you want to {hasExistingPaymentConfig || hasExistingSiteConfig ? 'update' : 'save'} these payment settings?</p>
          </div>
          <div className="ps-dialog-actions">
            <button
              className="ps-btn ps-btn-cancel"
              onClick={() => setOpenConfirm(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ps-btn ps-btn-confirm"
              onClick={handleConfirmSave}
              disabled={loading}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSettings;