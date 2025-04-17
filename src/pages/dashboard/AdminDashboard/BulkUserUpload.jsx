import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Button,
  Divider, Alert, LinearProgress, useTheme,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow
} from '@mui/material';
import {
  Publish as UploadIcon,
  Description as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  CloudDownload as DownloadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import API_BASE_URL, { userAPI } from '../../../config';

const BulkUserUpload = ({ onUpload }) => {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  // Define the complete template with all required fields
  const templateData = [
    [
      'firstName', 'lastName', 'email', 'password', 
      'role', 'birthDate', 'status', 'department'
    ],
    [
      'John', 'Doe', 'john@example.com', 'SecurePass123!', 
      'learner', '1990-01-15', 'active', 'Engineering'
    ],
    [
      'Jane', 'Smith', 'jane@example.com', 'SecurePass456!', 
      'instructor', '1985-05-22', 'active', 'Mathematics'
    ]
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length) {
        setFile(acceptedFiles[0]);
        setUploadResult(null);
        
        // Preview first few rows
        const data = await acceptedFiles[0].arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(jsonData.slice(0, 5)); // Show up to 5 rows
      }
    }
  });

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.writeFile(wb, "user_upload_template.xlsx");
  };

  const validateUserData = (userData, index) => {
    const errors = [];
    
    // Required fields validation
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
    requiredFields.forEach(field => {
      if (!userData[field]) {
        errors.push(`Row ${index + 2}: Missing required field: ${field}`);
      }
    });

    // Email format validation
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push(`Row ${index + 2}: Invalid email format`);
    }

    // Password strength validation
    if (userData.password && userData.password.length < 8) {
      errors.push(`Row ${index + 2}: Password must be at least 8 characters`);
    }

    // Role validation
    const validRoles = ['admin', 'instructor', 'learner', 'owner'];
    if (userData.role && !validRoles.includes(userData.role.toLowerCase())) {
      errors.push(`Row ${index + 2}: Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Date format validation (if provided)
    if (userData.birthDate && isNaN(new Date(userData.birthDate).getTime())) {
      errors.push(`Row ${index + 2}: Invalid birth date format (use YYYY-MM-DD)`);
    }

    // Status validation (if provided)
    if (userData.status) {
      const validStatuses = ['active', 'pending', 'suspended'];
      if (!validStatuses.includes(userData.status.toLowerCase())) {
        errors.push(`Row ${index + 2}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return errors.length ? errors : null;
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setUploadResult(null);
    
    try {
      const response = await userAPI.bulkUpload(file);
      
      if (response.data.success) {
        setUploadResult({
          success: true,
          message: `Successfully processed ${response.data.created_count} users`,
          details: response.data.errors || []
        });
        
        if (onUpload && response.data.created_count > 0) {
          // Optionally refresh user list
          onUpload();
        }
      } else {
        setUploadResult({
          success: false,
          message: response.data.error || 'Upload failed',
          details: response.data.errors || []
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorDetails = [];
      
      if (error.response?.data?.errors) {
        errorDetails = error.response.data.errors;
      } else if (error.response?.data?.error) {
        errorDetails = [error.response.data.error];
      } else {
        errorDetails = [error.message || 'Network error'];
      }
      
      setUploadResult({
        success: false,
        message: 'Error processing file',
        details: errorDetails
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Bulk User Upload
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Upload an Excel or CSV file to register multiple users at once
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            sx={{ mr: 2 }}
          >
            Download Template
          </Button>
          <Typography variant="caption" color="text.secondary">
            Use our template to ensure proper formatting
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Required Fields:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            - firstName, lastName, email, password, role
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Optional Fields:
          </Typography>
          <Typography variant="body2">
            - birthDate (YYYY-MM-DD), status (active/pending/suspended), department
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 1,
            p: 4,
            textAlign: 'center',
            backgroundColor: isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
            cursor: 'pointer',
            mb: 3
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <>
              <FileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">{file.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(file.size / 1024)} KB
              </Typography>
            </>
          ) : (
            <>
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Excel (.xlsx, .xls) or CSV files only
              </Typography>
            </>
          )}
        </Box>
        
        {previewData.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              File Preview (First {previewData.length} Rows)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {templateData[0].map((header, index) => (
                      <TableCell key={index}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {templateData[0].map((header, colIndex) => (
                        <TableCell key={colIndex}>{row[header] || '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {file && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setFile(null);
                setPreviewData([]);
              }}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={processFile}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Upload & Process'}
            </Button>
          </Box>
        )}
        
        {isProcessing && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Processing your file...
            </Typography>
          </Box>
        )}
        
        {uploadResult && (
          <Alert
            icon={uploadResult.success ? <SuccessIcon fontSize="inherit" /> : <ErrorIcon fontSize="inherit" />}
            severity={uploadResult.success ? 'success' : 'error'}
            sx={{ mt: 3 }}
          >
            <Typography fontWeight="bold">{uploadResult.message}</Typography>
            {uploadResult.details && (
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {uploadResult.details.map((detail, index) => {
                  // Handle both string errors and error objects
                  const errorMessage = typeof detail === 'string' 
                    ? detail 
                    : (detail.error || detail.errors || 'Unknown error');
                  
                  // Convert to array if not already
                  const errorsArray = Array.isArray(errorMessage) 
                    ? errorMessage 
                    : [errorMessage];
                  
                  return (
                    <li key={index}>
                      <Typography variant="body2">
                        {errorsArray.join(', ')}
                      </Typography>
                    </li>
                  );
                })}
              </Box>
            )}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default BulkUserUpload;