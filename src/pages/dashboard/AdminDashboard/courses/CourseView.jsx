import React, { useState, useEffect } from 'react';
import './CourseView.css';
import {
  ArrowBack, Edit, People, Schedule,
  MonetizationOn, Assessment, InsertDriveFile,
  VideoLibrary, Quiz, Assignment, PictureAsPdf,
  Description, Image, Link
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesAPI } from '../../../../config';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const CourseView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedResource, setExpandedResource] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await coursesAPI.getCourse(id);
        setCourse(response.data);
        setError('');
      } catch (error) {
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/courses');
  };

  const handleEdit = () => {
    navigate(`/admin/courses/edit/${id}`);
  };

  const formatPrice = (price, currency) => {
    const priceNumber = typeof price === 'string' ? parseFloat(price) : price;
    if (priceNumber === undefined || priceNumber === null || isNaN(priceNumber)) {
      return 'Price not set';
    }
    const currencyToUse = currency || 'NGN';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyToUse
      }).format(priceNumber);
    } catch (e) {
      return `${currencyToUse} ${priceNumber.toFixed(2)}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return '#4caf50';
      case 'Draft': return '#f59e0b';
      case 'Archived': return '#6b7280';
      default: return '#0288d1';
    }
  };

  const getLessonType = (lesson) => {
    if (lesson.lesson_type) {
      return lesson.lesson_type.toLowerCase();
    }
    const url = lesson.content_file || lesson.content_url || '';
    const extension = url.split('.').pop()?.toLowerCase();
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    return 'default';
  };

  const getLessonIcon = (type) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'video': return <VideoLibrary className="icon primary" />;
      case 'quiz': return <Quiz className="icon secondary" />;
      case 'assignment': return <Assignment className="icon info" />;
      case 'pdf': return <PictureAsPdf className="icon error" />;
      case 'word': return <Description className="icon info" />;
      case 'image': return <Image className="icon success" />;
      default: return <InsertDriveFile className="icon action" />;
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary className="icon primary" />;
      case 'pdf': return <PictureAsPdf className="icon error" />;
      case 'file': return <Description className="icon info" />;
      case 'image': return <Image className="icon success" />;
      case 'link': return <Link className="icon primary" />;
      default: return <InsertDriveFile className="icon action" />;
    }
  };

  const handleToggleResource = (resourceId) => {
    setExpandedResource(expandedResource === resourceId ? null : resourceId);
  };

  const handleToggleLesson = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className="CourseView-Loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="CourseView-Error">
        <span>{error || 'Course not found'}</span>
      </div>
    );
  }

  return (
    <div className="CourseView">
      <div className="CourseView-Top">
        <div className="CourseView-Top-Grid">
          <div className="CourseView-Top-Left">
            <button onClick={handleBack} className="back-btn">
              <ArrowBack className="icon" />
            </button>
            <h2>{course.title}</h2>
            <span className="status-badge" style={{ backgroundColor: getStatusColor(course.status) }}>
              {course.status}
            </span>
          </div>
          <div className="CourseView-Top-Right">
            <button onClick={handleEdit} className="edit-btn">
              <Edit className="icon" /> Edit Course
            </button>
          </div>
        </div>
      </div>

      <div className="CourseView-Grid">
        {/* Left Column - Course Details */}
        <div className="CourseView-Left">
          <div className="CourseView-Card">
            <h3>Course Description</h3>
            <p>{course.description}</p>

            <h3>Learning Outcomes</h3>
            <ul className="outcomes-list">
              {course.learning_outcomes.map((outcome, index) => (
                <li key={index}>• {outcome}</li>
              ))}
            </ul>
          </div>

          <div className="CourseView-Card">
            <div className="tabs">
              <button
                className={activeTab === 0 ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(0)}
              >
                Modules
              </button>
              <button
                className={activeTab === 1 ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(1)}
              >
                Resources
              </button>
            </div>
            <div className="tab-content">
              {activeTab === 0 && (
                <div>
                  {course.modules.map((module) => (
                    <div key={module.id} className="module">
                      <h4>{module.title}</h4>
                      <p className="module-description">{module.description}</p>
                      <ul className="lesson-list">
                        {module.lessons.map((lesson) => {
                          const lessonType = getLessonType(lesson);
                          const contentUrl = lesson.content_file || lesson.content_url;
                          return (
                            <li key={lesson.id} className="lesson-item">
                              <div
                                className="lesson-header"
                                onClick={() => handleToggleLesson(lesson.id)}
                              >
                                <span className="lesson-icon">{getLessonIcon(lessonType)}</span>
                                <div className="lesson-text">
                                  <span className="lesson-title">{lesson.title}</span>
                                  <span className="lesson-secondary">
                                    {lessonType === 'video' ? 'Click to play video' :
                                     lessonType === 'pdf' ? 'Click to view PDF' :
                                     lessonType === 'word' ? 'Click to view document' :
                                     lessonType === 'image' ? 'Click to view image' :
                                     lesson.duration || 'Not specified'}
                                  </span>
                                </div>
                              </div>
                              {expandedLesson === lesson.id && contentUrl && (
                                <div className="lesson-content">
                                  {lessonType === 'video' && (
                                    <div className="media-container">
                                      <video
                                        controls
                                        src={contentUrl}
                                        className="media"
                                        onError={() => alert('Failed to load video')}
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                      <a
                                        href={contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn"
                                      >
                                        Open Video in New Tab
                                      </a>
                                    </div>
                                  )}
                                  {lessonType === 'pdf' && (
                                    <div className="media-container">
                                      {import.meta.env.DEV ? (
                                        <>
                                          <Document
                                            file={contentUrl}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            onLoadError={() => alert('Failed to load PDF')}
                                          >
                                            {Array.from(new Array(numPages), (_, index) => (
                                              <Page
                                                key={`page_${index + 1}`}
                                                pageNumber={index + 1}
                                                width={800}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                              />
                                            ))}
                                          </Document>
                                          <span className="pdf-page-info">
                                            Page {1} of {numPages}
                                          </span>
                                        </>
                                      ) : (
                                        <iframe
                                          src={contentUrl}
                                          className="media-iframe"
                                          title={lesson.title}
                                        />
                                      )}
                                      <a
                                        href={contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn"
                                      >
                                        {import.meta.env.DEV ? 'Download PDF' : 'Open PDF in New Tab'}
                                      </a>
                                    </div>
                                  )}
                                  {lessonType === 'word' && (
                                    <div className="media-container">
                                      {import.meta.env.DEV ? (
                                        <a
                                          href={contentUrl}
                                          download
                                          className="action-btn primary"
                                        >
                                          Download Word Document
                                        </a>
                                      ) : (
                                        <iframe
                                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(contentUrl)}&embedded=true`}
                                          className="media-iframe"
                                          title={lesson.title}
                                        />
                                      )}
                                      <a
                                        href={contentUrl}
                                        target="_blank"
                                        className="action-btn"
                                      >
                                        {import.meta.env.DEV ? 'Open Document' : 'Download Document'}
                                      </a>
                                    </div>
                                  )}
                                  {lessonType === 'image' && (
                                    <div className="media-container">
                                      <img
                                        src={contentUrl}
                                        alt={lesson.title}
                                        className="media"
                                        onError={() => alert('Failed to load image')}
                                      />
                                      <a
                                        href={contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn"
                                      >
                                        Open Image in New Tab
                                      </a>
                                    </div>
                                  )}
                                  {lessonType === 'default' && contentUrl && (
                                    <div className="media-container">
                                      <a
                                        href={contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn primary"
                                      >
                                        Download Resource
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 1 && (
                <ul className="resource-list">
                  {course.resources.map((resource) => {
                    const resourceUrl = resource.url || resource.file;
                    return (
                      <li key={resource.id} className="resource-item">
                        <div
                          className="resource-header"
                          onClick={() => handleToggleResource(resource.id)}
                        >
                          <span className="resource-icon">{getResourceIcon(resource.resource_type)}</span>
                          <div className="resource-text">
                            <span className="resource-title">{resource.title}</span>
                            <span className="resource-secondary">
                              {resource.resource_type === 'link' ? resourceUrl :
                               resource.resource_type === 'video' ? 'Click to play video' :
                               resource.resource_type === 'pdf' ? 'Click to view PDF' :
                               resource.resource_type === 'file' ? 'Click to view document' :
                               'Resource'}
                            </span>
                          </div>
                        </div>
                        {expandedResource === resource.id && resourceUrl && (
                          <div className="resource-content">
                            {resource.resource_type === 'video' && (
                              <video
                                controls
                                src={resourceUrl}
                                className="media"
                                onError={() => alert('Failed to load video')}
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                            {resource.resource_type === 'pdf' && (
                              <div className="media-container">
                                {import.meta.env.DEV ? (
                                  <>
                                    <Document
                                      file={resourceUrl}
                                      onLoadSuccess={onDocumentLoadSuccess}
                                      onLoadError={() => alert('Failed to load PDF')}
                                    >
                                      <Page
                                        pageNumber={1}
                                        width={800}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                      />
                                    </Document>
                                    <span className="pdf-page-info">
                                      Page 1 of {numPages}
                                    </span>
                                  </>
                                ) : (
                                  <iframe
                                    src={resourceUrl}
                                    className="media-iframe"
                                    title={resource.title}
                                  />
                                )}
                              </div>
                            )}
                            {(resource.resource_type === 'file' && resourceUrl.match(/\.(doc|docx)$/i)) && (
                              <div className="media-container">
                                {import.meta.env.DEV ? (
                                  <a
                                    href={resourceUrl}
                                    download
                                    className="action-btn primary"
                                  >
                                    Download Word Document
                                  </a>
                                ) : (
                                  <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(resourceUrl)}&embedded=true`}
                                    className="media-iframe"
                                    title={resource.title}
                                  />
                                )}
                              </div>
                            )}
                            {resource.resource_type === 'link' && (
                              <a
                                href={resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="action-btn primary"
                              >
                                Visit Link
                              </a>
                            )}
                            <a
                              href={resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn"
                            >
                              {resource.resource_type === 'link' ? 'Open Link' : 'Download'}
                            </a>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Course Meta */}
        <div className="CourseView-Right">
          <div className="CourseView-Card">
            <div className="thumbnail">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="thumbnail-img" />
              ) : (
                <span className="thumbnail-placeholder">No thumbnail</span>
              )}
            </div>
            <div className="meta-grid">
              <div className="meta-item">
                <span className="meta-label">
                  <People className="icon small" /> Students
                </span>
                <span className="meta-value">{course.totalStudents || 0}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <Schedule className="icon small" /> Duration
                </span>
                <span className="meta-value">{course.duration}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <MonetizationOn className="icon small" /> Price
                </span>
                <span className="meta-value">
                  {course.discount_price ? (
                    <>
                      <span className="price-strikethrough">
                        {formatPrice(course.price, course.currency)}
                      </span>
                      <span className="price-discounted">
                        {formatPrice(course.discount_price, course.currency)}
                      </span>
                    </>
                  ) : (
                    formatPrice(course.price, course.currency)
                  )}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <Assessment className="icon small" /> Status
                </span>
                <span className="meta-value">
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(course.status) }}>
                    {course.status}
                  </span>
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Course Code</span>
                <span className="meta-value">{course.code}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{course.category?.name || 'Not specified'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Level</span>
                <span className="meta-value">{course.level}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created</span>
                <span className="meta-value">{new Date(course.created_at).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Last Updated</span>
                <span className="meta-value">{new Date(course.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;