import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../../config';
import './PaymentSettings.css';

function PaymentSettings() {
  const [gateways, setGateways] = useState([]);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedGatewayId, setSelectedGatewayId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingActiveGateway, setPendingActiveGateway] = useState(null);

  useEffect(() => {
    const fetchGateways = async () => {
      setGatewayLoading(true);
      try {
        const res = await paymentAPI.getAllGateways();
        setGateways(res.data);
      } catch (err) {
        setError('Failed to fetch payment gateways.');
      } finally {
        setGatewayLoading(false);
      }
    };
    fetchGateways();
  }, []);

  const activeGateway = gateways.find(g => g.is_active);
  const inactiveGateways = gateways.filter(g => !g.is_active);

  const selectedGateway = gateways.find(g => g.id === selectedGatewayId);

  const handleGatewayConfigChange = (gatewayId, key, value) => {
    setGateways(gateways =>
      gateways.map(g =>
        g.id === gatewayId
          ? { ...g, config: { ...g.config, [key]: value } }
          : g
      )
    );
  };

  const handleSaveGatewayConfig = async (gateway) => {
    setGatewayLoading(true);
    setError('');
    setSuccess('');
    try {
      await paymentAPI.updateGatewayConfig(gateway.id, { config: gateway.config });
      setSuccess(`Config for ${gateway.name} saved.`);
    } catch (err) {
      setError('Failed to save gateway config.');
    } finally {
      setGatewayLoading(false);
    }
  };

  const handleDeleteGatewayConfig = async (gateway) => {
    setGatewayLoading(true);
    setError('');
    setSuccess('');
    try {
      await paymentAPI.deleteGatewayConfig(gateway.id);
      setSuccess(`Config for ${gateway.name} deleted.`);
      setSelectedGatewayId(null);
      // Optionally refetch gateways here
    } catch (err) {
      setError('Failed to delete gateway config.');
    } finally {
      setGatewayLoading(false);
    }
  };

  const handleToggleTestMode = async (gateway) => {
    setGatewayLoading(true);
    setError('');
    setSuccess('');
    try {
      await paymentAPI.updateGateway(gateway.id, { is_test_mode: !gateway.is_test_mode });
      setGateways(gateways =>
        gateways.map(g =>
          g.id === gateway.id ? { ...g, is_test_mode: !g.is_test_mode } : g
        )
      );
      setSuccess(`${gateway.name} switched to ${gateway.is_test_mode ? 'Live' : 'Test'} mode.`);
    } catch (err) {
      setError('Failed to switch mode.');
    } finally {
      setGatewayLoading(false);
    }
  };

  const handleSetActiveGateway = async (gateway) => {
    setGatewayLoading(true);
    setError('');
    setSuccess('');
    try {
      await paymentAPI.updateGateway(gateway.id, { is_active: true });
      setSuccess(`${gateway.name} is now the active gateway.`);
      // Optionally refetch gateways to update UI
      const res = await paymentAPI.getAllGateways();
      setGateways(res.data);
      setSelectedGatewayId(null);
    } catch (err) {
      setError('Failed to set gateway as active.');
    } finally {
      setGatewayLoading(false);
    }
  };

  return (
    <div className="ps-container">
      <h2 className="ps-header">Payment Gateways</h2>
      {error && <div className="ps-alert ps-alert-error">{error}</div>}
      {success && <div className="ps-alert ps-alert-success">{success}</div>}

      {/* Active Gateway Card */}
      {activeGateway && (
        <div className="ps-gateway-card">
          <div className="ps-gateway-header">
            <span className="ps-gateway-name">{activeGateway.name}</span>
            <span className="ps-gateway-badge active">Active</span>
            {activeGateway.is_default && (
              <span className="ps-gateway-badge default">Default</span>
            )}
          </div>
          <div className="ps-gateway-desc">{activeGateway.description}</div>
          {/* Mode Toggle */}
          <div style={{ margin: '10px 0 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 500, color: '#6366f1' }}>Mode:</span>
            <button
              className={`ps-btn ${activeGateway.is_test_mode ? 'ps-btn-test' : 'ps-btn-live'}`}
              style={{
                background: activeGateway.is_test_mode ? '#6366f1' : '#22c55e',
                color: '#fff',
                borderRadius: 16,
                padding: '4px 18px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95em'
              }}
              onClick={() => handleToggleTestMode(activeGateway)}
              disabled={gatewayLoading}
              type="button"
            >
              {activeGateway.is_test_mode ? 'Test' : 'Live'}
            </button>
          </div>
          <div className="ps-gateway-config">
            {activeGateway.config && Object.keys(activeGateway.config).map(key => (
              <div key={key} className="ps-form-field">
                <label>{key}</label>
                <input
                  type={key.toLowerCase().includes('secret') ? 'password' : 'text'}
                  value={activeGateway.config[key] || ''}
                  onChange={e => handleGatewayConfigChange(activeGateway.id, key, e.target.value)}
                  disabled={gatewayLoading}
                />
              </div>
            ))}
          </div>
          <div className="ps-gateway-actions">
            <button
              className="ps-btn ps-btn-confirm"
              onClick={() => handleSaveGatewayConfig(activeGateway)}
              disabled={gatewayLoading}
            >
              Save Config
            </button>
          </div>
        </div>
      )}

      {/* Dropdown for Inactive Gateways */}
      {inactiveGateways.length > 0 && (
        <div style={{ margin: '24px 0' }}>
          <label htmlFor="inactive-gateway-select" style={{ fontWeight: 500, color: '#7226FF' }}>
            View or Edit Other Gateways:
          </label>
          <select
            id="inactive-gateway-select"
            className="ps-select"
            value={selectedGatewayId || ''}
            onChange={e => setSelectedGatewayId(Number(e.target.value))}
          >
            <option value="">Select a gateway...</option>
            {inactiveGateways.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Inactive Gateway Card */}
      {selectedGateway && (
        <div className="ps-gateway-card">
          <div className="ps-gateway-header">
            <span className="ps-gateway-name">{selectedGateway.name}</span>
            <span className="ps-gateway-badge inactive">Inactive</span>
            {selectedGateway.is_test_mode && (
              <span className="ps-gateway-badge test">Test Mode</span>
            )}
            {selectedGateway.is_default && (
              <span className="ps-gateway-badge default">Default</span>
            )}
          </div>
          <div className="ps-gateway-desc">{selectedGateway.description}</div>
          {/* Mode Toggle for selected gateway */}
          <div style={{ margin: '10px 0 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 500, color: '#6366f1' }}>Mode:</span>
            <button
              className={`ps-btn ${selectedGateway.is_test_mode ? 'ps-btn-test' : 'ps-btn-live'}`}
              style={{
                background: selectedGateway.is_test_mode ? '#6366f1' : '#22c55e',
                color: '#fff',
                borderRadius: 16,
                padding: '4px 18px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95em'
              }}
              onClick={() => handleToggleTestMode(selectedGateway)}
              disabled={gatewayLoading}
              type="button"
            >
              {selectedGateway.is_test_mode ? 'Test' : 'Live'}
            </button>
          </div>
          <div className="ps-gateway-config">
            {selectedGateway.config && Object.keys(selectedGateway.config).map(key => (
              <div key={key} className="ps-form-field">
                <label>{key}</label>
                <input
                  type={key.toLowerCase().includes('secret') ? 'password' : 'text'}
                  value={selectedGateway.config[key] || ''}
                  onChange={e => handleGatewayConfigChange(selectedGateway.id, key, e.target.value)}
                  disabled={gatewayLoading}
                />
              </div>
            ))}
          </div>
          <div className="ps-gateway-actions">
            <button
              className="ps-btn ps-btn-confirm"
              onClick={() => handleSaveGatewayConfig(selectedGateway)}
              disabled={gatewayLoading}
            >
              Save Config
            </button>
            <button
              className="ps-btn ps-btn-delete"
              onClick={() => handleDeleteGatewayConfig(selectedGateway)}
              disabled={gatewayLoading}
            >
              Delete Config
            </button>
            <button
              className="ps-btn ps-btn-primary"
              onClick={() => {
                setPendingActiveGateway(selectedGateway);
                setShowModal(true);
              }}
              disabled={gatewayLoading || selectedGateway.is_active}
              style={{ marginLeft: 8 }}
            >
              Set as Active
            </button>
          </div>
        </div>
      )}

      {/* Modal for confirming active gateway switch */}
      {showModal && pendingActiveGateway && (
        <div className="ps-modal-overlay">
          <div className="ps-modal">
            <div className="ps-modal-header">
              <span className="ps-modal-title">Switch Active Gateway?</span>
            </div>
            <div className="ps-modal-body">
              <p>
                <strong>Warning:</strong> Changing the active payment gateway will affect all new transactions on your platform.<br />
                <span style={{ color: "#ef4444" }}>
                  Users will only be able to pay using <b>{pendingActiveGateway.name}</b> until you change it again.
                </span>
              </p>
            </div>
            <div className="ps-modal-actions">
              <button
                className="ps-btn ps-btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="ps-btn ps-btn-primary"
                style={{ marginLeft: 12 }}
                onClick={async () => {
                  setShowModal(false);
                  await handleSetActiveGateway(pendingActiveGateway);
                  setPendingActiveGateway(null);
                }}
              >
                Yes, Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In each gateway card, add the toggle */}
      {/* {gateways.map(gateway => (
        <div key={gateway.id} style={{ margin: '10px 0 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500, color: '#6366f1' }}>
            Mode:
          </span>
          <button
            className={`ps-btn ${gateway.is_test_mode ? 'ps-btn-test' : 'ps-btn-live'}`}
            style={{
              background: gateway.is_test_mode ? '#6366f1' : '#22c55e',
              color: '#fff',
              borderRadius: 16,
              padding: '4px 18px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.95em'
            }}
            onClick={() => handleToggleTestMode(gateway)}
            disabled={gatewayLoading}
            type="button"
          >
            {gateway.is_test_mode ? 'Test' : 'Live'}
          </button>
        </div>
      ))} */}
    </div>
  );
}

export default PaymentSettings;