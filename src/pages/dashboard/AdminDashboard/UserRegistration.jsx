import React, { useState, useEffect } from 'react';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as PasswordIcon,
  Badge as NameIcon,
  Group as GroupIcon,
  School as LearnerIcon,
  Work as InstructorIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { rolesAPI } from '../../../config';
import './UserRegistration.css';

const UserRegistration = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learners', // Default role
  });

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch roles from the backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await rolesAPI.getRoles();
        const fetchedRoles = response.data.map(role => ({
          value: role.code,
          label: role.name,
          icon: role.code === 'learners' ? <LearnerIcon className="w-4 h-4 text-purple-600" /> :
                role.code === 'instructors' ? <InstructorIcon className="w-4 h-4 text-purple-600" /> :
                <AdminIcon className="w-4 h-4 text-purple-600" />
        }));
        setRoles(fetchedRoles);
      } catch (err) {
        setErrors(prev => ({
          ...prev,
          roles: err.response?.data?.detail || 'Failed to load roles',
        }));
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: null })); // Clear field-specific errors on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: null }));

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: 'active',
      };

      await onRegister(userData);
    } catch (error) {
      const backendErrors = error.response?.data?.errors || {};
      setErrors({
        submit: error.response?.data?.detail || 'Failed to register user',
        ...backendErrors,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="ur-container">
      {errors.submit && (
        <div className="ur-alert ur-alert-error">
          <span>{errors.submit}</span>
        </div>
      )}
      {errors.roles && (
        <div className="ur-alert ur-alert-error">
          <span>{errors.roles}</span>
        </div>
      )}
      <div className="ur-card">
        <div className="ur-header">
          <div className="ur-avatar">
            <PersonAddIcon />
          </div>
          <h1>Add New User</h1>
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
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="ur-password-toggle"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
              {errors.password && <span className="ur-error">{errors.password}</span>}
            </div>
            <div className="ur-form-field">
              <label>Confirm Password</label>
              <div className="ur-input-container">
                <PasswordIcon />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="ur-password-toggle"
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
              {errors.confirmPassword && <span className="ur-error">{errors.confirmPassword}</span>}
            </div>
            <div className="ur-form-field ur-form-field-full">
              <label>User Role</label>
              <div className="ur-input-container">
                <GroupIcon />
                {loadingRoles ? (
                  <div className="ur-spinner">Loading roles...</div>
                ) : (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={errors.role ? 'error' : ''}
                    disabled={roles.length === 0}
                  >
                    <option value="">Select a role</option>
                    {roles.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {errors.role && <span className="ur-error">{errors.role}</span>}
            </div>
            <div className="ur-form-field ur-form-field-full">
              <button
                type="submit"
                className="ur-btn ur-btn-confirm"
                disabled={isSubmitting || loadingRoles || roles.length === 0}
              >
                {isSubmitting ? (
                  <div className="ur-spinner"></div>
                ) : (
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
  );
};

export default UserRegistration;