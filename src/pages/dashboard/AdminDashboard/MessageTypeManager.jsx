import React, { useState } from 'react';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Check as CheckIcon, Close as CloseIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { messagingAPI } from '../../../config';
import './MessageTypeManager.css';

const MessageTypeManager = ({ open, onClose, onUpdate, messageTypes, loading }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [currentType, setCurrentType] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [valueError, setValueError] = useState('');

  // Validate value: only lowercase letters, numbers, and underscores
  const validateValue = (value) => {
    const regex = /^[a-z0-9_]+$/;
    if (!value) return 'Value is required';
    if (!regex.test(value)) return 'Value may contain only lowercase letters, numbers and underscores';
    return '';
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setCurrentType({ ...currentType, value: newValue });
    setValueError(validateValue(newValue));
  };

  const handleLabelChange = (e) => {
    setCurrentType({ ...currentType, label: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valueErrorMsg = validateValue(currentType.value);
    if (valueErrorMsg) {
      enqueueSnackbar(valueErrorMsg, { variant: 'error' });
      return;
    }
    try {
      if (editMode) {
        await messagingAPI.updateMessageType(currentType.id, {
          value: currentType.value,
          label: currentType.label
        });
        enqueueSnackbar('Message type updated successfully', { variant: 'success' });
      } else {
        await messagingAPI.createMessageType({
          value: currentType.value,
          label: currentType.label
        });
        enqueueSnackbar('Message type created successfully', { variant: 'success' });
      }
      setCurrentType(null);
      setEditMode(false);
      onUpdate();
    } catch (error) {
      const errorMsg = error.response?.data?.value?.[0] || error.response?.data?.detail || 'Operation failed';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await messagingAPI.deleteMessageType(id);
      enqueueSnackbar('Message type deleted successfully', { variant: 'success' });
      onUpdate();
    } catch (error) {
      enqueueSnackbar('Failed to delete message type', { variant: 'error' });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await messagingAPI.setDefaultMessageType(id);
      enqueueSnackbar('Default message type set', { variant: 'success' });
      onUpdate();
    } catch (error) {
      enqueueSnackbar('Failed to set default', { variant: 'error' });
    }
  };

  return (
    <div className={`mtm-dialog ${open ? 'mtm-dialog-open' : 'mtm-dialog-closed'}`}>
      <div className="mtm-dialog-backdrop" onClick={onClose}></div>
      <div className="mtm-dialog-content">
        <div className="mtm-dialog-header">
          <h3>Manage Message Types</h3>
          <button className="mtm-dialog-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="mtm-dialog-body">
          {loading ? (
            <div className="mtm-loading">
              <div className="mtm-spinner"></div>
            </div>
          ) : currentType ? (
            <form onSubmit={handleSubmit} className="mtm-form">
              <div className="mtm-form-field">
                <label>Value (internal identifier)</label>
                <input
                  type="text"
                  value={currentType.value}
                  onChange={handleValueChange}
                  disabled={editMode}
                  required
                />
                {valueError && <span className="mtm-helper-text mtm-error">{valueError}</span>}
                {!valueError && <span className="mtm-helper-text">Lowercase letters, numbers and underscores only</span>}
              </div>
              <div className="mtm-form-field">
                <label>Display Label</label>
                <input
                  type="text"
                  value={currentType.label}
                  onChange={handleLabelChange}
                  required
                />
              </div>
              <div className="mtm-form-actions">
                <button
                  type="button"
                  className="mtm-btn mtm-btn-cancel"
                  onClick={() => {
                    setCurrentType(null);
                    setEditMode(false);
                    setValueError('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="mtm-btn mtm-btn-confirm" disabled={!!valueError}>
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mtm-header-actions">
                <button
                  className="mtm-btn mtm-btn-primary"
                  onClick={() => setCurrentType({ value: '', label: '' })}
                >
                  <AddIcon />
                  New Message Type
                </button>
              </div>
              <div className="mtm-table-container">
                <table className="mtm-table">
                  <thead>
                    <tr>
                      <th><span>Value</span></th>
                      <th><span>Label</span></th>
                      <th><span>Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {messageTypes.map((type) => (
                      <tr key={type.id}>
                        <td>{type.value}</td>
                        <td>{type.label}</td>
                        <td>
                          <div className="mtm-action-btns">
                            <button
                              className="mtm-btn mtm-btn-edit"
                              onClick={() => {
                                setCurrentType(type);
                                setEditMode(true);
                                setValueError('');
                              }}
                            >
                              <EditIcon />
                            </button>
                            <button
                              className="mtm-btn mtm-btn-delete"
                              onClick={() => handleDelete(type.id)}
                            >
                              <DeleteIcon />
                            </button>
                            <button
                              className="mtm-btn mtm-btn-default"
                              onClick={() => handleSetDefault(type.id)}
                            >
                              <CheckIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="mtm-dialog-actions">
          <button className="mtm-btn mtm-btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageTypeManager;