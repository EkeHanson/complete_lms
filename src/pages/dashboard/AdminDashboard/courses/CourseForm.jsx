import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper, Divider,
  FormControl, InputLabel, Select, MenuItem, Chip, useTheme,
  IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Save, Cancel, CloudUpload, AddCircle, Delete,
  Link as LinkIcon, PictureAsPdf, VideoLibrary,
  InsertDriveFile, Edit, MoreVert
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleForm from './ModuleForm';

const resourceTypes = [
  { value: 'link', label: 'Web Link', icon: <LinkIcon /> },
  { value: 'pdf', label: 'PDF Document', icon: <PictureAsPdf /> },
  { value: 'video', label: 'Video', icon: <VideoLibrary /> },
  { value: 'file', label: 'File', icon: <InsertDriveFile /> }
];

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
    modules: [],
    resources: []
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [errors, setErrors] = useState({});
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState({
    id: null,
    title: '',
    type: 'link',
    url: '',
    file: null
  });

  const categories = [
    'Web Development', 'Mobile Development', 'Data Science',
    'Design', 'Business', 'Marketing', 'Photography'
  ];

  useEffect(() => {
    if (isEdit) {
      setTimeout(() => {
        setCourse({
          title: 'Advanced React Development',
          code: 'REACT-401',
          description: 'Master advanced React concepts',
          category: 'Web Development',
          level: 'Advanced',
          status: 'Published',
          duration: '8 weeks',
          price: 199,
          discountPrice: 149,
          currency: 'NGN',
          learningOutcomes: ['Build complex React apps', 'Optimize performance'],
          prerequisites: ['Basic JavaScript', 'React fundamentals'],
          thumbnail: null,
          modules: [{
            id: 1,
            title: 'React Hooks Deep Dive',
            description: 'Learn about hooks',
            lessons: [
              { id: 1, title: 'Introduction to Hooks', duration: '30 min' }
            ]
          }],
          resources: [
            {
              id: 1,
              title: 'React Documentation',
              type: 'link',
              url: 'https://reactjs.org/docs'
            },
            {
              id: 2,
              title: 'Performance Guide',
              type: 'pdf',
              file: 'performance-guide.pdf'
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

  const openResourceDialog = (resource = null) => {
    setCurrentResource(resource || {
      id: null,
      title: '',
      type: 'link',
      url: '',
      file: null
    });
    setResourceDialogOpen(true);
  };

  const handleResourceChange = (e) => {
    const { name, value } = e.target;
    setCurrentResource(prev => ({ ...prev, [name]: value }));
  };

  const handleResourceFileChange = (e) => {
    setCurrentResource(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const saveResource = () => {
    if (!currentResource.title.trim()) return;

    const updatedResources = [...course.resources];
    if (currentResource.id) {
      // Update existing resource
      const index = updatedResources.findIndex(r => r.id === currentResource.id);
      updatedResources[index] = currentResource;
    } else {
      // Add new resource
      updatedResources.push({
        ...currentResource,
        id: Date.now()
      });
    }

    setCourse(prev => ({ ...prev, resources: updatedResources }));
    setResourceDialogOpen(false);
  };

  const deleteResource = (id) => {
    setCourse(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== id)
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!course.title) newErrors.title = 'Title is required';
    if (!course.code) newErrors.code = 'Course code is required';
    if (!course.description) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Submitting course:', course);
    navigate('/admin/courses');
  };

  const getResourceIcon = (type) => {
    const resourceType = resourceTypes.find(t => t.value === type);
    return resourceType ? resourceType.icon : <InsertDriveFile />;
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

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Course Resources
              </Typography>

              <List dense>
                {course.resources.map((resource) => (
                  <ListItem key={resource.id}>
                    <ListItemIcon>
                      {getResourceIcon(resource.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={resource.title}
                      secondary={resource.type === 'link' ? resource.url : resource.file?.name || resource.file}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => openResourceDialog(resource)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteResource(resource.id)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Button
                variant="outlined"
                startIcon={<AddCircle />}
                onClick={() => openResourceDialog()}
                sx={{ mt: 1 }}
              >
                Add Resource
              </Button>
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

              <Button
                fullWidth
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Upload Thumbnail
                <input
                  type="file"
                  hidden
                  onChange={(e) => setCourse(prev => ({ ...prev, thumbnail: e.target.files[0] }))}
                  accept="image/*"
                />
              </Button>

              {course.thumbnail && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {course.thumbnail.name || 'Thumbnail selected'}
                  </Typography>
                  <IconButton onClick={() => setCourse(prev => ({ ...prev, thumbnail: null }))}>
                    <Delete />
                  </IconButton>
                </Box>
              )}
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

      {/* Resource Dialog */}
      <Dialog open={resourceDialogOpen} onClose={() => setResourceDialogOpen(false)}>
        <DialogTitle>
          {currentResource.id ? 'Edit Resource' : 'Add Resource'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resource Title"
            fullWidth
            name="title"
            value={currentResource.title}
            onChange={handleResourceChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Resource Type</InputLabel>
            <Select
              name="type"
              value={currentResource.type}
              onChange={handleResourceChange}
              label="Resource Type"
            >
              {resourceTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentResource.type === 'link' && (
            <TextField
              margin="dense"
              label="URL"
              fullWidth
              name="url"
              value={currentResource.url}
              onChange={handleResourceChange}
            />
          )}

          {(currentResource.type === 'pdf' || currentResource.type === 'video' || currentResource.type === 'file') && (
            <Button
              fullWidth
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ mt: 1 }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleResourceFileChange}
                accept={
                  currentResource.type === 'pdf' ? 'application/pdf' : 
                  currentResource.type === 'video' ? 'video/*' : '*'
                }
              />
            </Button>
          )}

          {currentResource.file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {currentResource.file.name || currentResource.file}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResourceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveResource} 
            disabled={!currentResource.title.trim()}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseForm;