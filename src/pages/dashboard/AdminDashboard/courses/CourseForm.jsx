import ModuleForm from './ModuleForm';
import LearningPaths from './LearningPaths';
import SCORMxAPISettings from './SCORMxAPISettings';
import CertificateSettings from './CertificateSettings';
import InstructorAssignmentDialog from './InstructorAssignmentDialog';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper, Divider,
  FormControl, InputLabel, Select, MenuItem, Chip, useTheme,
  IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  ListItemIcon, Checkbox, FormControlLabel, Tab, Tabs, Avatar,
  useMediaQuery, AppBar, Toolbar, Drawer, ListItemAvatar, Tooltip
} from '@mui/material';
import {
  Save, Cancel, CloudUpload, AddCircle, Delete,
  Link as LinkIcon, PictureAsPdf, VideoLibrary,
  InsertDriveFile, Edit, Person, People, School,
  Menu as MenuIcon, ArrowBack
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
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
    resources: [],
    instructors: [],
    learningPaths: [],
    certificateSettings: {
      enabled: false,
      template: 'default',
      customText: '',
      signature: null,
      signatureName: '',
      showDate: true,
      showCourseName: true,
      showCompletionHours: true,
      customLogo: null
    },
    scormSettings: {
      enabled: false,
      standard: 'scorm12',
      version: '1.2',
      completionThreshold: 80,
      scoreThreshold: 70,
      tracking: {
        completion: true,
        score: true,
        time: true,
        progress: true
      },
      package: null,
      packageName: ''
    }
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [errors, setErrors] = useState({});
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
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

  const availableInstructors = [
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: '', expertise: ['Web Development', 'React'] },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: '', expertise: ['Data Science', 'Python'] },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', avatar: '', expertise: ['Design', 'UX'] }
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
              { id: 1, title: 'Introduction to Hooks', duration: '30 min', type: 'video', url: 'https://example.com/video1' }
            ]
          }],
          resources: [
            {
              id: 1,
              title: 'React Documentation',
              type: 'link',
              url: 'https://reactjs.org/docs'
            }
          ],
          instructors: [
            {
              instructorId: 1,
              name: 'John Doe',
              email: 'john@example.com',
              isActive: true,
              assignedModules: 'all'
            }
          ]
        });
      }, 500);
    }
  }, [id, isEdit]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (isMobile) setMobileOpen(false);
  };

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
      const index = updatedResources.findIndex(r => r.id === currentResource.id);
      updatedResources[index] = currentResource;
    } else {
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

  const handleModuleChange = (moduleId, updatedModule) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? updatedModule : m)
    }));
  };

  const deleteModule = (moduleId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId),
      instructors: prev.instructors.map(instructor => {
        if (instructor.assignedModules !== 'all') {
          return {
            ...instructor,
            assignedModules: instructor.assignedModules.filter(id => id !== moduleId)
          };
        }
        return instructor;
      })
    }));
  };

  const handleInstructorAssignment = (instructor, assignedModules) => {
    const existingIndex = course.instructors.findIndex(i => i.instructorId === instructor.id);
    
    const newInstructor = {
      instructorId: instructor.id,
      name: instructor.name,
      email: instructor.email,
      isActive: true,
      assignedModules: assignedModules
    };

    if (existingIndex >= 0) {
      const updatedInstructors = [...course.instructors];
      updatedInstructors[existingIndex] = newInstructor;
      setCourse(prev => ({ ...prev, instructors: updatedInstructors }));
    } else {
      setCourse(prev => ({
        ...prev,
        instructors: [...prev.instructors, newInstructor]
      }));
    }
  };

  const toggleInstructorStatus = (instructorId) => {
    setCourse(prev => ({
      ...prev,
      instructors: prev.instructors.map(instructor => 
        instructor.instructorId === instructorId 
          ? { ...instructor, isActive: !instructor.isActive }
          : instructor
      )
    }));
  };

  const removeInstructor = (instructorId) => {
    setCourse(prev => ({
      ...prev,
      instructors: prev.instructors.filter(i => i.instructorId !== instructorId)
    }));
  };

  const getAssignedModulesText = (instructor) => {
    if (instructor.assignedModules === 'all') return 'Entire course';
    if (instructor.assignedModules.length === 0) return 'No modules assigned';
    if (instructor.assignedModules.length === 1) {
      const module = course.modules.find(m => m.id === instructor.assignedModules[0]);
      return module ? module.title : '1 module';
    }
    return `${instructor.assignedModules.length} modules`;
  };

  const handleNext = () => {
    if (activeTab < tabLabels.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
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

  const tabLabels = [
    { label: 'Details', icon: <Edit fontSize="small" /> },
    { label: 'Modules', icon: <School fontSize="small" /> },
    { label: 'Instructors', icon: <People fontSize="small" /> },
    { label: 'Resources', icon: <InsertDriveFile fontSize="small" /> },
    { label: 'Paths', icon: <LinkIcon fontSize="small" /> },
    { label: 'Certificates', icon: <PictureAsPdf fontSize="small" /> },
    { label: 'SCORM', icon: <VideoLibrary fontSize="small" /> }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {isEdit ? 'Edit Course' : 'Create Course'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1, pt: isMobile ? '56px' : 0 }}>
        {/* Sidebar Tabs - Hidden on mobile when drawer is closed */}
        {isMobile && mobileOpen && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': { 
                width: 240,
                boxSizing: 'border-box',
                pt: isMobile ? '56px' : 0
              },
            }}
          >
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={handleTabChange}
              sx={{ flexGrow: 1 }}
            >
              {tabLabels.map((tab, index) => (
                <Tab 
                  key={index}
                  icon={tab.icon}
                  iconPosition="start"
                  label={tab.label}
                  sx={{
                    minHeight: 'auto',
                    py: 1.5,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    px: 2,
                    gap: 1,
                    '& .MuiTab-iconWrapper': {
                      marginRight: '8px'
                    }
                  }}
                />
              ))}
            </Tabs>
          </Drawer>
        )}

        {/* Permanent tabs for desktop */}
        {!isMobile && (
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{ 
              borderRight: 1,
              borderColor: 'divider',
              minWidth: 160,
              maxWidth: 220,
              '& .MuiTab-root': {
                minHeight: 48,
                alignItems: 'flex-start',
                textAlign: 'left',
                px: 2,
                gap: 1,
                '& .MuiTab-iconWrapper': {
                  marginRight: '8px'
                }
              }
            }}
          >
            {tabLabels.map((tab, index) => (
              <Tab 
                key={index}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        )}

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: isMobile ? 1 : 3,
            overflow: 'auto',
            maxHeight: isMobile ? 'calc(100vh - 56px)' : '100vh'
          }}
        >
          <Box sx={{ mb: 2 }}>
            {isMobile && (
              <IconButton onClick={() => navigate('/admin/courses')} sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
            )}
            <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 600, display: 'inline' }}>
              {isEdit ? 'Edit Course' : 'Create New Course'}
            </Typography>
          </Box>

          <Paper sx={{ p: isMobile ? 1 : 3, mb: 3 }}>
            <form onSubmit={handleSubmit}>
              {activeTab === 0 && (
                <Grid container spacing={2}>
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
                      size={isMobile ? 'small' : 'medium'}
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
                      size={isMobile ? 'small' : 'medium'}
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
                      rows={isMobile ? 3 : 4}
                      sx={{ mb: 2 }}
                      size={isMobile ? 'small' : 'medium'}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Learning Outcomes
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      {course.learningOutcomes.map((outcome, index) => (
                        <Chip
                          key={index}
                          label={outcome}
                          onDelete={() => removeLearningOutcome(index)}
                          sx={{ m: 0.5 }}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        placeholder="What will students learn?"
                        value={newOutcome}
                        onChange={(e) => setNewOutcome(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addLearningOutcome()}
                      />
                      <Button 
                        variant="outlined" 
                        onClick={addLearningOutcome}
                        disabled={!newOutcome.trim()}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        Add
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Prerequisites
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      {course.prerequisites.map((prereq, index) => (
                        <Chip
                          key={index}
                          label={prereq}
                          onDelete={() => removePrerequisite(index)}
                          sx={{ m: 0.5 }}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        placeholder="What should students know beforehand?"
                        value={newPrerequisite}
                        onChange={(e) => setNewPrerequisite(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                      />
                      <Button 
                        variant="outlined" 
                        onClick={addPrerequisite}
                        disabled={!newPrerequisite.trim()}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        Add
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? 'small' : 'medium'}>
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

                    <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? 'small' : 'medium'}>
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

                    <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? 'small' : 'medium'}>
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
                      size={isMobile ? 'small' : 'medium'}
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
                      size={isMobile ? 'small' : 'medium'}
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
                      size={isMobile ? 'small' : 'medium'}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Button
                      fullWidth
                      variant="contained"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ mb: 2 }}
                      size={isMobile ? 'small' : 'medium'}
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
                        <IconButton onClick={() => setCourse(prev => ({ ...prev, thumbnail: null }))} size="small">
                          <Delete fontSize="small" /> 
                        </IconButton>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Course Modules
                  </Typography>

                  {course.modules.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <School sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No modules added yet
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Add modules to structure your course content
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddCircle />}
                        onClick={addModule}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        Add First Module
                      </Button>
                    </Box>
                  )}

                  {course.modules.map((module, index) => (
                    <ModuleForm 
                      key={module.id}
                      module={module}
                      index={index}
                      onChange={handleModuleChange}
                      onDelete={deleteModule}
                      isMobile={isMobile}
                    />
                  ))}

                  {course.modules.length > 0 && (
                    <Button
                      startIcon={<AddCircle />}
                      onClick={addModule}
                      sx={{ mt: 2 }}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Add Another Module
                    </Button>
                  )}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Course Instructors
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<People />}
                      onClick={() => setInstructorDialogOpen(true)}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Assign Instructor
                    </Button>
                  </Box>

                  {course.instructors.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Person sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No instructors assigned
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Assign instructors to teach this course
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<People />}
                        onClick={() => setInstructorDialogOpen(true)}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        Assign Instructor
                      </Button>
                    </Box>
                  )}

                  <List dense={isMobile}>
                    {course.instructors.map((instructor) => (
                      <ListItem key={instructor.instructorId} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {instructor.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={instructor.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {instructor.email}
                              </Typography>
                              {` • Assigned to: ${getAssignedModulesText(instructor)}`}
                            </>
                          }
                          primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}
                          secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                        />
                        <ListItemSecondaryAction>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={instructor.isActive}
                                onChange={() => toggleInstructorStatus(instructor.instructorId)}
                                size={isMobile ? 'small' : 'medium'}
                              />
                            }
                            label="Active"
                            labelPlacement="start"
                            sx={{ mr: 1 }}
                          />
                          <IconButton 
                            edge="end" 
                            onClick={() => {
                              const instructorData = availableInstructors.find(
                                i => i.id === instructor.instructorId
                              );
                              setCurrentResource({
                                ...instructor,
                                assignedModules: instructor.assignedModules
                              });
                              setInstructorDialogOpen(true);
                            }}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            <Edit fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeInstructor(instructor.instructorId)}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            <Delete fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Course Resources
                  </Typography>

                  <List dense={isMobile}>
                    {course.resources.map((resource) => (
                      <ListItem key={resource.id}>
                        <ListItemIcon>
                          {getResourceIcon(resource.type)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={resource.title}
                          secondary={resource.type === 'link' ? resource.url : resource.file?.name || resource.file}
                          primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}
                          secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            onClick={() => openResourceDialog(resource)}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            <Edit fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                          <IconButton 
                            onClick={() => deleteResource(resource.id)}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            <Delete fontSize={isMobile ? 'small' : 'medium'} />
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
                    size={isMobile ? 'small' : 'medium'}
                  >
                    Add Resource
                  </Button>
                </Box>
              )}

              {activeTab === 4 && <LearningPaths courseId={id} isMobile={isMobile} />}
              {activeTab === 5 && <CertificateSettings courseId={id} isMobile={isMobile} />}
              {activeTab === 6 && <SCORMxAPISettings courseId={id} isMobile={isMobile} />}

              <Divider sx={{ my: 2 }} />

              {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handlePrevious}
                  disabled={activeTab === 0}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Previous
                </Button>
                
                {activeTab === tabLabels.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    {isEdit ? 'Update' : 'Create'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<ArrowBack sx={{ transform: 'rotate(180deg)' }} />}
                    onClick={handleNext}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    Next
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/admin/courses')}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ ml: 'auto' }}
                >
                  Cancel
                </Button>
              </Box> */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                gap: 1,
                mt: 2
              }}>
                {/* First row on mobile, left side on desktop */}
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  order: { xs: 1, sm: 1 },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <Button
                    fullWidth={isMobile}
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={handlePrevious}
                    disabled={activeTab === 0}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ flex: isMobile ? 1 : 'none' }}
                  >
                    {!isMobile && 'Previous'}
                  </Button>

                  {activeTab === tabLabels.length - 1 ? (
                    <Button
                      fullWidth={isMobile}
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ flex: isMobile ? 1 : 'none' }}
                    >
                      {isEdit ? 'Update' : 'Create'}
                    </Button>
                  ) : (
                    <Button
                      fullWidth={isMobile}
                      variant="contained"
                      startIcon={isMobile ? null : <ArrowBack sx={{ transform: 'rotate(180deg)' }} />}
                      endIcon={isMobile ? <ArrowBack sx={{ transform: 'rotate(180deg)' }} /> : null}
                      onClick={handleNext}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ flex: isMobile ? 1 : 'none' }}
                    >
                      {isMobile ? 'Next' : 'Next'}
                    </Button>
                  )}
                </Box>

                {/* Second row on mobile, right side on desktop */}
                <Button
                  fullWidth={isMobile}
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/admin/courses')}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    order: { xs: 2, sm: 2 },
                    mt: { xs: 1, sm: 0 },
                    ml: { xs: 0, sm: 'auto' }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </Paper>

          {/* Resource Dialog */}
          <Dialog 
            open={resourceDialogOpen} 
            onClose={() => setResourceDialogOpen(false)}
            fullScreen={isMobile}
          >
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
                size={isMobile ? 'small' : 'medium'}
              />

              <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? 'small' : 'medium'}>
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
                  size={isMobile ? 'small' : 'medium'}
                />
              )}

              {(currentResource.type === 'pdf' || currentResource.type === 'video' || currentResource.type === 'file') && (
                <Button
                  fullWidth
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ mt: 1 }}
                  size={isMobile ? 'small' : 'medium'}
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
              <Button 
                onClick={() => setResourceDialogOpen(false)}
                size={isMobile ? 'small' : 'medium'}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveResource} 
                disabled={!currentResource.title.trim()}
                variant="contained"
                size={isMobile ? 'small' : 'medium'}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Instructor Assignment Dialog */}
          <InstructorAssignmentDialog
            open={instructorDialogOpen}
            onClose={() => setInstructorDialogOpen(false)}
            instructors={availableInstructors}
            modules={course.modules}
            currentAssignment={currentResource}
            onAssign={handleInstructorAssignment}
            isMobile={isMobile}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CourseForm;