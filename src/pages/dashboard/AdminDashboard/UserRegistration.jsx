import React, { useState } from 'react';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as PasswordIcon,
  Badge as NameIcon,
  Group as GroupIcon,
  School as LearnerIcon,
  Work as InstructorIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import './UserRegistration.css';

const UserRegistration = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learner',
    birthDate: null,
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { value: 'learner', label: 'Learner', icon: <LearnerIcon className="ur-icon" /> },
    { value: 'instructor', label: 'Instructor/Trainer', icon: <InstructorIcon className="ur-icon" /> },
    { value: 'admin', label: 'Administrator', icon: <AdminIcon className="ur-icon" /> },
    { value: 'owner', label: 'Owner', icon: <AdminIcon className="ur-icon" /> }
  ];

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      birthDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        birth_date: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null,
        status: 'active'
      };

      await onRegister(userData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to register user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="ur-container">
        {errors.submit && (
          <div className="ur-alert ur-alert-error">
            <span>{errors.submit}</span>
          </div>
        )}
        <div className="ur-card">
          <div className="ur-header">
            <div className="ur-avatar">
              <PersonAddIcon />
            </div>
            <h1>Add New User</h1>
            <p>Add a new user to the system</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="ur-form-grid">
              <div className="ur-form-field">
                <label>First Name</label>
                <div className="ur-input-container">
                  <NameIcon />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                </div>
                {errors.firstName && <span className="ur-error">{errors.firstName}</span>}
              </div>
              <div className="ur-form-field">
                <label>Last Name</label>
                <div className="ur-input-container">
                  <NameIcon />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                </div>
                {errors.lastName && <span className="ur-error">{errors.lastName}</span>}
              </div>
              <div className="ur-form-field ur-form-field-full">
                <label>Email Address</label>
                <div className="ur-input-container">
                  <EmailIcon />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="ur-error">{errors.email}</span>}
              </div>
              <div className="ur-form-field">
                <label>Password</label>
                <div className="ur-input-container">
                  <PasswordIcon />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                  />
                </div>
                {errors.password && <span className="ur-error">{errors.password}</span>}
              </div>
              <div className="ur-form-field">
                <label>Confirm Password</label>
                <div className="ur-input-container">
                  <PasswordIcon />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                </div>
                {errors.confirmPassword && <span className="ur-error">{errors.confirmPassword}</span>}
              </div>
              <div className="ur-form-field">
                <label>Date of Birth</label>
                <DatePicker
                  value={formData.birthDate}
                  onChange={handleDateChange}
                  renderInput={({ inputRef, inputProps, InputProps }) => (
                    <div className="ur-input-container">
                      {InputProps?.endAdornment}
                      <input ref={inputRef} {...inputProps} className={errors.birthDate ? 'error' : ''} />
                    </div>
                  )}
                />
                {errors.birthDate && <span className="ur-error">{errors.birthDate}</span>}
              </div>
              <div className="ur-form-field">
                <label>User Role</label>
                <div className="ur-input-container">
                  <GroupIcon />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    {roles.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ur-form-field ur-form-field-full">
                <label className="ur-checkbox">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                  </span>
                </label>
                {errors.termsAccepted && <span className="ur-error">{errors.termsAccepted}</span>}
              </div>
              <div className="ur-form-field ur-form-field-full">
                <button
                  type="submit"
                  className="ur-btn ur-btn-confirm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <div className="ur-spinner"></div> : (
                    <>
                      <PersonAddIcon />
                      Add User
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default UserRegistration;