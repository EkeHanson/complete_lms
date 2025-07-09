import { coursesAPI, userAPI } from '../../../../config';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ModuleForm, DraggableModule } from './ModuleForm';
import React, { useState, useEffect } from 'react';
import {
  Save, Cancel, CloudUpload, AddCircle, Delete,
  Link as LinkIcon, PictureAsPdf, VideoLibrary,
  InsertDriveFile, Edit, Person, People, School,
  Menu as MenuIcon, ArrowBack, Add, Star, CheckCircle
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LearningPaths from './LearningPaths';
import SCORMxAPISettings from './SCORMxAPISettings';
import CertificateSettings from './CertificateSettings';
import GamificationManager from './GamificationManager';
import InstructorAssignmentDialog from './InstructorAssignmentDialog';
import './CourseForm.css';

const resourceTypes = [
  { value: 'link', label: 'Web Link', icon: <LinkIcon /> },
  { value: 'pdf', label: 'PDF Document', icon: <PictureAsPdf /> },
  { value: 'video', label: 'Video', icon: <VideoLibrary /> },
  { value: 'file', label: 'File', icon: <InsertDriveFile /> }
];

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [course, setCourse] = useState({
    title: '',
    code: '',
    description: '',
    category_id: '',
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

  const [categories, setCategories] = useState([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newOutcome, setNewOutcome] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState({
    id: null,
    title: '',
    type: 'link',
    url: '',
    file: null
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      try {
        const response = await coursesAPI.getCategories();
        setCategories(response.data.results || response.data);
      } catch (error) {
        setApiError('Failed to load categories');
      } finally {
        setCategoryLoading(false);
      }
    };

    const fetchCourseData = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const response = await coursesAPI.getCourse(id);
        const courseData = response.data;
        setCourse({
          ...course,
          title: courseData.title || '',
          code: courseData.code || '',
          description: courseData.description || '',
          category_id: courseData.category?.id || courseData.category_id || '',
          level: courseData.level || 'Beginner',
          status: courseData.status || 'Draft',
          duration: courseData.duration || '',
          price: courseData.price || 0,
          discountPrice: courseData.discount_price || null,
          currency: courseData.currency || 'NGN',
          learningOutcomes: Array.isArray(courseData.learning_outcomes) ? courseData.learning_outcomes : [],
          prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : [],
          thumbnail: null,
          modules: courseData.modules || [],
          resources: courseData.resources || [],
          instructors: courseData.instructors || []
        });
      } catch (error) {
        setApiError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchCourseData();
  }, [id, isEdit]);

  const toggleModuleSelection = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const moveModule = (dragIndex, hoverIndex) => {
    setCourse(prev => {
      const newModules = [...prev.modules];
      const draggedModule = newModules[dragIndex];
      newModules.splice(dragIndex, 1);
      newModules.splice(hoverIndex, 0, draggedModule);
      const updatedModules = newModules.map((module, idx) => ({
        ...module,
        order: idx
      }));
      return { ...prev, modules: updatedModules };
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (mobileOpen) setMobileOpen(false);
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

  const saveResource = async () => {
    if (!currentResource.title.trim()) {
      setApiError('Resource title is required');
      return;
    }
    if (currentResource.type === 'link' && !currentResource.url.trim()) {
      setApiError('URL is required for web link resources');
      return;
    }
    if (['pdf', 'video', 'file'].includes(currentResource.type) && !currentResource.file && !currentResource.id) {
      setApiError('File is required for this resource type');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const formData = new FormData();
      formData.append('title', currentResource.title);
      formData.append('resource_type', currentResource.type);
      if (currentResource.type === 'link') {
        formData.append('url', currentResource.url || '');
      } else if (currentResource.file) {
        formData.append('file', currentResource.file);
      }
      formData.append('order', course.resources.length);

      let updatedResource;
      if (currentResource.id && !isNaN(currentResource.id)) {
        const response = await coursesAPI.updateResource(id, currentResource.id, formData);
        updatedResource = response.data;
        setCourse(prev => ({
          ...prev,
          resources: prev.resources.map(r => (r.id === currentResource.id ? updatedResource : r)),
        }));
      } else {
        const response = await coursesAPI.createResource(id, formData);
        updatedResource = response.data;
        setCourse(prev => ({
          ...prev,
          resources: [...prev.resources, updatedResource],
        }));
      }

      setResourceDialogOpen(false);
      setCurrentResource({
        id: null,
        title: '',
        type: 'link',
        url: '',
        file: null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setApiError(error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (id) => {
    setLoading(true);
    setApiError('');

    try {
      await coursesAPI.deleteResource(course.id || id, id);
      setCourse(prev => ({
        ...prev,
        resources: prev.resources.filter(r => r.id !== id),
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setApiError(error.response?.data?.detail || 'Failed to delete resource');
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    try {
      setLoading(true);

      if (!isEdit) {
        const courseResponse = await coursesAPI.createCourse({
          title: course.title || 'New Course',
          code: course.code || `TEMP-${Date.now()}`,
          description: course.description || '',
          category_id: course.category_id || categories[0]?.id,
          level: course.level,
          status: 'Draft',
        });

        setCourse(prev => ({ ...prev, id: courseResponse.data.id }));
        navigate(`/admin/courses/${courseResponse.data.id}/edit`, { replace: true });
      }

      const courseId = id || course.id;
      if (!courseId) {
        throw new Error('Course ID is not available');
      }

      const response = await coursesAPI.createModule(courseId, {
        course: courseId,
        title: 'New Module',
        description: '',
        order: course.modules.length,
        is_published: false
      });

      setCourse(prev => ({
        ...prev,
        modules: [...prev.modules, {
          ...response.data,
          lessons: []
        }]
      }));
    } catch (error) {
      setApiError(error.response?.data?.detail || error.message || 'Failed to create module');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = (moduleId, updatedModule) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? updatedModule : m)
    }));
  };

  const deleteModule = async (moduleId) => {
    try {
      setLoading(true);
      if (!isNaN(moduleId)) {
        await coursesAPI.deleteModule(moduleId);
      }
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
    } catch (error) {
      setApiError('Failed to delete module');
    } finally {
      setLoading(false);
    }
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

  const handleCategoryDialogOpen = (category = null) => {
    setEditingCategory(category);
    setNewCategory(category ? { name: category.name, description: category.description } : { name: '', description: '' });
    setCategoryDialogOpen(true);
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  const saveCategory = async () => {
    if (!newCategory.name.trim()) {
      setErrors({ categoryName: 'Category name is required' });
      return;
    }

    setCategoryLoading(true);
    setErrors({});
    try {
      const payload = {
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || ''
      };

      if (editingCategory) {
        const response = await coursesAPI.updateCategory(editingCategory.id, payload);
        setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? response.data : cat));
        setApiError('');
      } else {
        const response = await coursesAPI.createCategory(payload);
        setCategories(prev => [...prev, response.data]);
        setApiError('');
      }
      setCategoryDialogOpen(false);
      setNewCategory({ name: '', description: '' });
      setEditingCategory(null);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.name?.[0] || 
                          'Failed to save category';
      setApiError(errorMessage);
    } finally {
      setCategoryLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setCategoryLoading(true);
    try {
      await coursesAPI.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setApiError('');
    } catch (error) {
      setApiError(error.response?.data?.detail || 'Failed to delete category');
    } finally {
      setCategoryLoading(false);
    }
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

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!course.title.trim()) newErrors.title = 'Title is required';
    if (!course.code.trim()) newErrors.code = 'Course code is required';
    if (!course.description.trim()) newErrors.description = 'Description is required';
    if (!course.category_id) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('code', course.code);
      formData.append('description', course.description);
      formData.append('category_id', course.category_id);
      formData.append('level', course.level);
      formData.append('status', course.status);
      formData.append('duration', course.duration);
      formData.append('price', course.price);
      if (course.discountPrice) formData.append('discount_price', course.discountPrice);
      formData.append('currency', course.currency || 'NGN');
      course.learningOutcomes.forEach(outcome => formData.append('learning_outcomes', outcome));
      course.prerequisites.forEach(prereq => formData.append('prerequisites', prereq));
      if (course.thumbnail instanceof File) formData.append('thumbnail', course.thumbnail);

      let response;
      if (isEdit) {
        response = await coursesAPI.updateCourse(id, formData);
      } else {
        response = await coursesAPI.createCourse(formData);
        navigate(`/admin/courses/edit/${response.data.id}`, { replace: true });
      }

      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (isEdit) {
        setCourse(prev => ({
          ...prev,
          title: response.data.title || prev.title,
          code: response.data.code || prev.code,
          description: response.data.description || prev.description,
          category_id: response.data.category_id || prev.category_id,
          level: response.data.level || prev.level,
          status: response.data.status || prev.status,
          duration: response.data.duration || prev.duration,
          price: response.data.price || prev.price,
          discountPrice: response.data.discount_price || prev.discountPrice,
          currency: response.data.currency || prev.currency,
          learningOutcomes: prev.learningOutcomes,
          prerequisites: prev.prerequisites,
          modules: prev.modules,
          resources: prev.resources,
          instructors: prev.instructors,
          thumbnail: prev.thumbnail
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to save course';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!course.title.trim()) newErrors.title = 'Title is required';
    if (!course.code.trim()) newErrors.code = 'Course code is required';
    if (!course.description.trim()) newErrors.description = 'Description is required';
    if (!course.category_id) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('code', course.code);
      formData.append('description', course.description);
      formData.append('category_id', course.category_id);
      formData.append('level', course.level);
      formData.append('status', course.status);
      formData.append('duration', course.duration);
      formData.append('price', course.price);
      if (course.discountPrice) formData.append('discount_price', course.discountPrice);
      formData.append('currency', course.currency || 'NGN');
      course.learningOutcomes.forEach(outcome => formData.append('learning_outcomes', outcome));
      course.prerequisites.forEach(prereq => formData.append('prerequisites', prereq));
      if (course.thumbnail instanceof File) formData.append('thumbnail', course.thumbnail);

      if (isEdit) {
        await coursesAPI.updateCourse(id, formData);
      } else {
        await coursesAPI.createCourse(formData);
      }
      navigate('/admin/courses');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to save course';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
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
    { label: 'SCORM', icon: <VideoLibrary fontSize="small" /> },
    { label: 'Gamification', icon: <Star fontSize="small" /> },
  ];

  return (
    <div className="CourseForm">
      <div className="CourseForm-Header">
        <div className="CourseForm-Header-Grid">
          <div className="CourseForm-Header-Title">
            <h2>
              <Edit className="icon" /> {isEdit ? 'Edit Course' : 'Create New Course'}
            </h2>
          </div>
          <div className="CourseForm-Header-Actions">
            <button className="action-btn" onClick={() => navigate('/admin/courses')}>
              <ArrowBack className="icon" /> Back to Courses
            </button>
          </div>
        </div>
      </div>

      <div className="CourseForm-Main">
        <div className={`CourseForm-Sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="CourseForm-Sidebar-Header">
            <button className="sidebar-toggle" onClick={handleDrawerToggle}>
              <MenuIcon className="icon" />
            </button>
            <h3>Course Sections</h3>
          </div>
          <ul className="sidebar-nav">
            {tabLabels.map((tab, index) => (
              <li
                key={index}
                className={`sidebar-item ${activeTab === index ? 'active' : ''}`}
                onClick={() => handleTabChange(null, index)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="CourseForm-Content">
          {apiError && (
            <div className="notification error">
              <span>{apiError}</span>
            </div>
          )}
          {saveSuccess && (
            <div className="notification success">
              <CheckCircle className="icon" /> Course saved successfully!
            </div>
          )}

          <div className="CourseForm-Section">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {activeTab === 0 && (
                  <div className="CourseForm-Grid">
                    <div className="CourseForm-Left">
                      <label className="label">Course Title</label>
                      <input
                        type="text"
                        className="input"
                        name="title"
                        value={course.title}
                        onChange={handleChange}
                        placeholder="Enter course title"
                      />
                      {errors.title && <span className="error-text">{errors.title}</span>}

                      <label className="label">Course Code</label>
                      <input
                        type="text"
                        className="input"
                        name="code"
                        value={course.code}
                        onChange={handleChange}
                        placeholder="Enter course code"
                      />
                      {errors.code && <span className="error-text">{errors.code}</span>}

                      <label className="label">Description</label>
                      <textarea
                        className="textarea"
                        name="description"
                        value={course.description}
                        onChange={handleChange}
                        placeholder="Enter course description"
                        rows={4}
                      />
                      {errors.description && <span className="error-text">{errors.description}</span>}

                      <div className="section-divider"></div>

                      <h3>Learning Outcomes</h3>
                      <div className="chip-list">
                        {course.learningOutcomes.map((outcome, index) => (
                          <span key={index} className="chip">
                            {outcome}
                            <Delete
                              className="chip-icon"
                              onClick={() => removeLearningOutcome(index)}
                            />
                          </span>
                        ))}
                      </div>
                      <div className="input-group">
                        <input
                          type="text"
                          className="input"
                          placeholder="What will students learn?"
                          value={newOutcome}
                          onChange={(e) => setNewOutcome(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addLearningOutcome()}
                        />
                        <button
                          className="action-btn"
                          onClick={addLearningOutcome}
                          disabled={!newOutcome.trim()}
                        >
                          <Add className="icon" /> Add
                        </button>
                      </div>

                      <div className="section-divider"></div>

                      <h3>Prerequisites</h3>
                      <div className="chip-list">
                        {course.prerequisites.map((prereq, index) => (
                          <span key={index} className="chip">
                            {prereq}
                            <Delete
                              className="chip-icon"
                              onClick={() => removePrerequisite(index)}
                            />
                          </span>
                        ))}
                      </div>
                      <div className="input-group">
                        <input
                          type="text"
                          className="input"
                          placeholder="What should students know beforehand?"
                          value={newPrerequisite}
                          onChange={(e) => setNewPrerequisite(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                        />
                        <button
                          className="action-btn"
                          onClick={addPrerequisite}
                          disabled={!newPrerequisite.trim()}
                        >
                          <Add className="icon" /> Add
                        </button>
                      </div>
                    </div>

                    <div className="CourseForm-Right">
                      <div className="input-group">
                        <label className="label">Category</label>
                        <select
                          className="select"
                          name="category_id"
                          value={course.category_id || ''}
                          onChange={handleChange}
                        >
                          <option value="">Select a category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {errors.category && <span className="error-text">{errors.category}</span>}
                        <button
                          className="action-btn"
                          onClick={() => handleCategoryDialogOpen()}
                        >
                          <Add className="icon" /> Add Category
                        </button>
                      </div>

                      {categoryLoading && <div className="loading">Loading categories...</div>}

                      <ul className="category-list">
                        {categories.map(category => (
                          <li key={category.id} className="category-item">
                            <span>{category.name}</span>
                            <div className="category-actions">
                              <button
                                className="icon-btn"
                                onClick={() => handleCategoryDialogOpen(category)}
                              >
                                <Edit className="icon" />
                              </button>
                              <button
                                className="icon-btn danger"
                                onClick={() => deleteCategory(category.id)}
                              >
                                <Delete className="icon" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <label className="label">Level</label>
                      <select
                        className="select"
                        name="level"
                        value={course.level}
                        onChange={handleChange}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>

                      <label className="label">Status</label>
                      <select
                        className="select"
                        name="status"
                        value={course.status}
                        onChange={handleChange}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>

                      <label className="label">Duration</label>
                      <input
                        type="text"
                        className="input"
                        name="duration"
                        value={course.duration}
                        onChange={handleChange}
                        placeholder="e.g. 8 weeks, 30 hours"
                      />

                      <div className="section-divider"></div>

                      <h3>Pricing</h3>
                      <label className="label">Price ({course.currency})</label>
                      <input
                        type="number"
                        className="input"
                        value={course.price}
                        onChange={handlePriceChange}
                      />
                      <label className="label">Discount Price (optional)</label>
                      <input
                        type="number"
                        className="input"
                        value={course.discountPrice || ''}
                        onChange={handleDiscountChange}
                        placeholder="Enter discount price"
                      />

                      <div className="section-divider"></div>

                      <button className="action-btn" component="label">
                        <CloudUpload className="icon" /> Upload Thumbnail
                        <input
                          type="file"
                          hidden
                          onChange={(e) => setCourse(prev => ({ ...prev, thumbnail: e.target.files[0] }))}
                          accept="image/*"
                        />
                      </button>
                      {course.thumbnail && (
                        <div className="upload-preview">
                          <span>{course.thumbnail.name || 'Thumbnail selected'}</span>
                          <button
                            className="icon-btn danger"
                            onClick={() => setCourse(prev => ({ ...prev, thumbnail: null }))}
                          >
                            <Delete className="icon" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div>
                    <h3>Course Modules</h3>
                    {course.modules.length === 0 && (
                      <div className="empty-state">
                        <School className="empty-icon" />
                        <h4>No modules added yet</h4>
                        <p>Add modules to structure your course content</p>
                        <button className="action-btn primary" onClick={addModule}>
                          <AddCircle className="icon" /> Add First Module
                        </button>
                      </div>
                    )}
                    {selectedModules.length > 0 && (
                      <div className="module-actions">
                        <span>{selectedModules.length} selected</span>
                        <button
                          className="action-btn"
                          onClick={() => togglePublishSelectedModules(true)}
                          disabled={loading}
                        >
                          Publish
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => togglePublishSelectedModules(false)}
                          disabled={loading}
                        >
                          Unpublish
                        </button>
                        <button
                          className="action-btn"
                          onClick={duplicateSelectedModules}
                          disabled={loading}
                        >
                          Duplicate
                        </button>
                        <button
                          className="action-btn danger"
                          onClick={deleteSelectedModules}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <DndProvider backend={HTML5Backend}>
                      {course.modules.map((module, index) => (
                        <DraggableModule
                          key={module.id}
                          index={index}
                          module={module}
                          moveModule={moveModule}
                          selectedModules={selectedModules}
                          toggleModuleSelection={toggleModuleSelection}
                          onChange={handleModuleChange}
                          onDelete={deleteModule}
                          isMobile={window.innerWidth <= 768}
                          courseId={id}
                        />
                      ))}
                    </DndProvider>

                    {course.modules.length > 0 && (
                      <button className="action-btn" onClick={addModule}>
                        <AddCircle className="icon" /> Add Another Module
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 2 && (
                  <div>
                    <div className="section-header">
                      <h3>Course Instructors</h3>
                      <button
                        className="action-btn primary"
                        onClick={() => setInstructorDialogOpen(true)}
                      >
                        <People className="icon" /> Assign Instructor
                      </button>
                    </div>

                    {course.instructors.length === 0 && (
                      <div className="empty-state">
                        <Person className="empty-icon" />
                        <h4>No instructors assigned</h4>
                        <p>Assign instructors to teach this course</p>
                        <button
                          className="action-btn primary"
                          onClick={() => setInstructorDialogOpen(true)}
                        >
                          <People className="icon" /> Assign Instructor
                        </button>
                      </div>
                    )}

                    <ul className="instructor-list">
                      {course.instructors.map((instructor) => (
                        <li key={instructor.instructorId} className="instructor-item">
                          <div className="instructor-info">
                            <span className="avatar">{instructor.name.charAt(0)}</span>
                            <div>
                              <span className="instructor-name">{instructor.name}</span>
                              <p className="instructor-details">
                                {instructor.email} • Assigned to: {getAssignedModulesText(instructor)}
                              </p>
                            </div>
                          </div>
                          <div className="instructor-actions">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={instructor.isActive}
                                onChange={() => toggleInstructorStatus(instructor.instructorId)}
                                className="checkbox"
                              />
                              Active
                            </label>
                            <button
                              className="icon-btn"
                              onClick={() => {
                                const instructorData = course.instructors.find(
                                  (i) => i.instructorId === instructor.instructorId
                                );
                                setCurrentResource({
                                  ...instructorData,
                                  assignedModules: instructorData.assignedModules,
                                });
                                setInstructorDialogOpen(true);
                              }}
                            >
                              <Edit className="icon" />
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => removeInstructor(instructor.instructorId)}
                            >
                              <Delete className="icon" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 3 && (
                  <div>
                    <h3>Course Resources</h3>
                    <ul className="resource-list">
                      {course.resources.map((resource) => (
                        <li key={resource.id} className="resource-item">
                          <span className="resource-icon">{getResourceIcon(resource.type)}</span>
                          <div>
                            <span className="resource-title">{resource.title}</span>
                            <p className="resource-details">
                              {resource.type === 'link' ? resource.url : resource.file?.name || resource.file}
                            </p>
                          </div>
                          <div className="resource-actions">
                            <button
                              className="icon-btn"
                              onClick={() => openResourceDialog(resource)}
                            >
                              <Edit className="icon" />
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => deleteResource(resource.id)}
                            >
                              <Delete className="icon" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="action-btn"
                      onClick={() => openResourceDialog()}
                    >
                      <AddCircle className="icon" /> Add Resource
                    </button>
                  </div>
                )}

                {activeTab === 4 && <LearningPaths courseId={id} isMobile={window.innerWidth <= 768} />}
                {activeTab === 5 && <CertificateSettings courseId={id} isMobile={window.innerWidth <= 768} />}
                {activeTab === 6 && <SCORMxAPISettings courseId={id} isMobile={window.innerWidth <= 768} />}
                {activeTab === 7 && <GamificationManager courseId={id} isMobile={window.innerWidth <= 768} />}

                <div className="action-buttons">
                  <button
                    className="action-btn"
                    onClick={handlePrevious}
                    disabled={activeTab === 0}
                  >
                    <ArrowBack className="icon" /> Previous
                  </button>
                  <button
                    className="action-btn primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      <>
                        <Save className="icon" /> Save
                      </>
                    )}
                  </button>
                  {activeTab === tabLabels.length - 1 ? (
                    <button
                      className="action-btn primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        <>
                          <Save className="icon" /> {isEdit ? 'Update & Finish' : 'Create & Finish'}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="action-btn primary"
                      onClick={handleNext}
                    >
                      <ArrowBack className="icon rotate" /> Next
                    </button>
                  )}
                  <button
                    className="action-btn cancel"
                    onClick={() => navigate('/admin/courses')}
                  >
                    <Cancel className="icon" /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={`dialog ${resourceDialogOpen ? 'open' : ''}`}>
            <div className="dialog-overlay" onClick={() => setResourceDialogOpen(false)}></div>
            <div className="dialog-content">
              <div className="dialog-header">
                <h3>{currentResource.id ? 'Edit Resource' : 'Add Resource'}</h3>
                <button className="dialog-close" onClick={() => setResourceDialogOpen(false)}>
                  <Cancel className="icon" />
                </button>
              </div>
              <div className="dialog-body">
                <label className="label">Resource Title</label>
                <input
                  type="text"
                  className="input"
                  name="title"
                  value={currentResource.title}
                  onChange={handleResourceChange}
                  placeholder="Enter resource title"
                />
                {errors.resourceTitle && <span className="error-text">{errors.resourceTitle}</span>}

                <label className="label">Resource Type</label>
                <select
                  className="select"
                  name="type"
                  value={currentResource.type}
                  onChange={handleResourceChange}
                >
                  {resourceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {currentResource.type === 'link' && (
                  <>
                    <label className="label">URL</label>
                    <input
                      type="text"
                      className="input"
                      name="url"
                      value={currentResource.url}
                      onChange={handleResourceChange}
                      placeholder="Enter resource URL"
                    />
                    {errors.resourceUrl && <span className="error-text">{errors.resourceUrl}</span>}
                  </>
                )}

                {(currentResource.type === 'pdf' || currentResource.type === 'video' || currentResource.type === 'file') && (
                  <button className="action-btn" component="label">
                    <CloudUpload className="icon" /> Upload File
                    <input
                      type="file"
                      hidden
                      onChange={handleResourceFileChange}
                      accept={
                        currentResource.type === 'pdf' ? 'application/pdf' : 
                        currentResource.type === 'video' ? 'video/*' : '*'
                      }
                    />
                  </button>
                )}

                {currentResource.file && (
                  <span className="file-info">Selected: {currentResource.file.name || currentResource.file}</span>
                )}
              </div>
              <div className="dialog-actions">
                <button
                  className="action-btn"
                  onClick={() => setResourceDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="action-btn primary"
                  onClick={saveResource}
                  disabled={loading || !currentResource.title.trim()}
                >
                  {loading ? <span className="loading-spinner"></span> : 'Save'}
                </button>
              </div>
            </div>
          </div>

          <div className={`dialog ${categoryDialogOpen ? 'open' : ''}`}>
            <div className="dialog-overlay" onClick={() => setCategoryDialogOpen(false)}></div>
            <div className="dialog-content">
              <div className="dialog-header">
                <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                <button className="dialog-close" onClick={() => setCategoryDialogOpen(false)}>
                  <Cancel className="icon" />
                </button>
              </div>
              <div className="dialog-body">
                <label className="label">Category Name</label>
                <input
                  type="text"
                  className="input"
                  name="name"
                  value={newCategory.name}
                  onChange={handleCategoryChange}
                  placeholder="Enter category name"
                />
                {errors.categoryName && <span className="error-text">{errors.categoryName}</span>}

                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  name="description"
                  value={newCategory.description}
                  onChange={handleCategoryChange}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="dialog-actions">
                <button
                  className="action-btn"
                  onClick={() => setCategoryDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="action-btn primary"
                  onClick={saveCategory}
                  disabled={categoryLoading || !newCategory.name.trim()}
                >
                  {categoryLoading ? <span className="loading-spinner"></span> : (editingCategory ? 'Update' : 'Add')}
                </button>
              </div>
            </div>
          </div>

          <InstructorAssignmentDialog
            open={instructorDialogOpen}
            onClose={() => setInstructorDialogOpen(false)}
            modules={course.modules}
            currentAssignment={currentResource}
            onAssign={handleInstructorAssignment}
            isMobile={window.innerWidth <= 768}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
