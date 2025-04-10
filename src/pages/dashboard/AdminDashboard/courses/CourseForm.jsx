import React, { useState, useEffect } from 'react';
import {
  Box,  Typography,  TextField,  Button,  Grid,  Paper,  Divider,  FormControl,  InputLabel,
  Select,  MenuItem,  Chip,  FormHelperText,  useTheme,  InputAdornment,  IconButton
} from '@mui/material';
import { 
  Save,   Cancel,   CloudUpload,   AddCircle,   Delete,  Add
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleForm from './ModuleForm';
import ContentUpload from './ContentUpload';

const CourseForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [course, setCourse] = useState({
    title: '',
    code: '',
    description: '',
    category: '',
    level: 'Beginner',
    status: 'Draft',
    duration: '',
    price: 0,
    discountPrice: null,
    currency: 'NGN',
    learningOutcomes: [],
    prerequisites: [],
    thumbnail: null,
    modules: []
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [errors, setErrors] = useState({});

  // Dummy categories for demo
  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Business',
    'Marketing',
    'Photography'
  ];

  // Dummy course data for editing
  useEffect(() => {
    if (isEdit) {
      // Simulate API call with dummy data
      setTimeout(() => {
        setCourse({
          title: 'Advanced React Development',
          code: 'REACT-401',
          description: 'Master advanced React concepts including hooks, context, and performance optimization',
          category: 'Web Development',
          level: 'Advanced',
          status: 'Published',
          duration: '8 weeks',
          price: 199,
          discountPrice: 149,
          currency: 'NGN',
          learningOutcomes: [
            'Build complex React applications',
            'Optimize React performance',
            'Implement advanced state management'
          ],
          prerequisites: [
            'Basic JavaScript knowledge',
            'React fundamentals'
          ],
          thumbnail: null,
          modules: [
            {
              id: 1,
              title: 'React Hooks Deep Dive',
              description: 'Learn all about useState, useEffect, and custom hooks',
              lessons: [
                { id: 1, title: 'Introduction to Hooks', duration: '30 min' },
                { id: 2, title: 'useState in Depth', duration: '45 min' }
              ]
            }
          ]
        });
      }, 500);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCourse(prev => ({ ...prev, price: value }));
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value);
    setCourse(prev => ({ ...prev, discountPrice: value }));
  };

  const addLearningOutcome = () => {
    if (newOutcome.trim()) {
      setCourse(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, newOutcome.trim()]
      }));
      setNewOutcome('');
    }
  };

  const removeLearningOutcome = (index) => {
    setCourse(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setCourse(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index) => {
    setCourse(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    const newErrors = {};
    if (!course.title) newErrors.title = 'Title is required';
    if (!course.code) newErrors.code = 'Course code is required';
    if (!course.description) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit logic - would be API call in real app
    console.log('Submitting course:', course);
    navigate('/admin/courses');
  };

  const addModule = () => {
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, {
        id: Date.now(),
        title: '',
        description: '',
        lessons: []
      }]
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        {isEdit ? 'Edit Course' : 'Create New Course'}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={course.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Course Code"
                name="code"
                value={course.code}
                onChange={handleChange}
                error={!!errors.code}
                helperText={errors.code}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={course.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Learning Outcomes
              </Typography>

              <Box sx={{ mb: 2 }}>
                {course.learningOutcomes.map((outcome, index) => (
                  <Chip
                    key={index}
                    label={outcome}
                    onDelete={() => removeLearningOutcome(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="What will students learn?"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLearningOutcome()}
                />
                <Button 
                  variant="outlined" 
                  onClick={addLearningOutcome}
                  disabled={!newOutcome.trim()}
                >
                  Add
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Prerequisites
              </Typography>

              <Box sx={{ mb: 2 }}>
                {course.prerequisites.map((prereq, index) => (
                  <Chip
                    key={index}
                    label={prereq}
                    onDelete={() => removePrerequisite(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="What should students know beforehand?"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                />
                <Button 
                  variant="outlined" 
                  onClick={addPrerequisite}
                  disabled={!newPrerequisite.trim()}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={course.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={course.level}
                  onChange={handleChange}
                  label="Level"
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={course.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Published">Published</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={course.duration}
                onChange={handleChange}
                placeholder="e.g. 8 weeks, 30 hours"
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Pricing
              </Typography>

              <TextField
                fullWidth
                label="Price"
                type="number"
                value={course.price}
                onChange={handlePriceChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {course.currency}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Discount Price (optional)"
                type="number"
                value={course.discountPrice || ''}
                onChange={handleDiscountChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {course.currency}
                    </InputAdornment>
                  ),
                }}
              />

              <Divider sx={{ my: 2 }} />

              <ContentUpload 
                label="Course Thumbnail"
                onFileChange={(file) => setCourse(prev => ({ ...prev, thumbnail: file }))}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Course Modules
          </Typography>

          {course.modules.map((module, index) => (
            <ModuleForm 
              key={module.id}
              module={module}
              index={index}
              onChange={(updatedModule) => {
                const updatedModules = [...course.modules];
                updatedModules[index] = updatedModule;
                setCourse(prev => ({ ...prev, modules: updatedModules }));
              }}
              onDelete={() => {
                const updatedModules = course.modules.filter((_, i) => i !== index);
                setCourse(prev => ({ ...prev, modules: updatedModules }));
              }}
            />
          ))}

          <Button
            startIcon={<AddCircle />}
            onClick={addModule}
            sx={{ mt: 2 }}
          >
            Add Module
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate('/admin/courses')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
            >
              {isEdit ? 'Update Course' : 'Create Course'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CourseForm;