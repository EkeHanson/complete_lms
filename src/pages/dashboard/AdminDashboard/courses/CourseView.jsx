import React, { useState, useEffect } from 'react';
import './CourseView.css';
import {
  ArrowBack, Edit, People, Schedule,
  MonetizationOn, Assessment, InsertDriveFile,
  VideoLibrary, Quiz, Assignment, PictureAsPdf,
  Description, Image, Link, Slideshow, YouTube
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesAPI } from '../../../../config';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// YouTube Player Component
const YouTubePlayer = ({ url, title }) => {
  const getYouTubeEmbedUrl = (url) => {
    try {
      const urlObj = new URL(url);
      let videoId = '';
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.split('/')[1] || '';
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch (error) {
      console.error(`Error parsing YouTube URL for ${title}:`, error, { url });
      return url;
    }
  };

  return (
    <div className="media-container">
      <iframe
        src={getYouTubeEmbedUrl(url)}
        className="media-iframe"
        title={`YouTube: ${title}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={(e) => console.error(`YouTube iframe error for ${title}:`, e, { url })}
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="action-btn"
      >
        Open YouTube Video in New Tab
      </a>
    </div>
  );
};

// PowerPoint Viewer Component
const PPTViewer = ({ url, title }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url, { method: 'HEAD', credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          const headers = {};
          response.headers.forEach((value, key) => { headers[key] = value; });
          const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
          console.error(`PowerPoint fetch error for ${title}:`, errorMsg, { url, headers });
          setError(`Failed to access PowerPoint: ${errorMsg}`);
        }
      })
      .catch(err => {
        console.error(`PowerPoint fetch error for ${title}:`, err, { url });
        setError('Failed to access PowerPoint: Network or CORS issue');
      });
  }, [url, title]);

  return (
    <div className="media-container">
      {error ? (
        <div className="error-message">
          <span>{error}</span>
          <a
            href={url}
            download
            className="action-btn primary"
          >
            Download PowerPoint
          </a>
        </div>
      ) : (
        <>
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            className="media-iframe"
            title={`PowerPoint: ${title}`}
            frameBorder="0"
            onError={(e) => {
              const errorMsg = 'Unable to load PowerPoint. File may not be publicly accessible or is invalid.';
              console.error(`PowerPoint iframe error for ${title}:`, e, { url, errorMsg });
              setError(errorMsg);
            }}
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
          >
            Open PowerPoint in New Tab
          </a>
        </>
      )}
    </div>
  );
};

// Video Player Component
const VideoPlayer = ({ url, title }) => (
  <div className="media-container">
    <video
      controls
      src={url}
      className="media"
      onError={(e) => console.error(`Video load error for ${title}:`, e, { url })}
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="action-btn"
    >
      Open Video in New Tab
    </a>
  </div>
);

// PDF Viewer Component
const PDFViewer = ({ url, title }) => {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url, { method: 'HEAD', credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          const headers = {};
          response.headers.forEach((value, key) => { headers[key] = value; });
          const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
          console.error(`PDF fetch error for ${title}:`, errorMsg, { url, headers });
          setError(`Failed to access PDF: ${errorMsg}`);
        }
      })
      .catch(err => {
        console.error(`PDF fetch error for ${title}:`, err, { url });
        setError('Failed to access PDF: Network or CORS issue');
      });
  }, [url, title]);

  return (
    <div className="media-container">
      {error ? (
        <div className="error-message">
          <span>{error}</span>
          <a
            href={url}
            download
            className="action-btn primary"
          >
            Download PDF
          </a>
        </div>
      ) : (
        <>
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setError(null);
            }}
            onLoadError={(err) => {
              const errorMsg = 'Unable to load PDF. File may be corrupted or inaccessible.';
              console.error(`PDF load error for ${title}:`, err, { url, errorMsg });
              setError(errorMsg);
            }}
          >
            {numPages ? (
              Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={800}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))
            ) : (
              <div>Loading PDF...</div>
            )}
          </Document>
          <span className="pdf-page-info">
            Page {numPages ? 1 : 0} of {numPages || 'loading'}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
          >
            Open PDF in New Tab
          </a>
        </>
      )}
    </div>
  );
};

// Word Document Viewer Component
const WordViewer = ({ url, title }) => (
  <div className="media-container">
    <iframe
      src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
      className="media-iframe"
      title={`Word Document: ${title}`}
      onError={(e) => console.error(`Word document load error for ${title}:`, e, { url })}
    />
    <a
      href={url}
      download
      className="action-btn primary"
    >
      Download Word Document
    </a>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="action-btn"
    >
      Open Document in New Tab
    </a>
  </div>
);

const CourseView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedResource, setExpandedResource] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);

  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [field];
      }
    }
    return [field];
  };

  const parseListField = (field) => {
    try {
      if (!field || !Array.isArray(field)) return [];
      return field.map(item => {
        try {
          const parsed = JSON.parse(item);
          return Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {
          return item;
        }
      }).filter(item => typeof item === 'string' && item.trim());
    } catch (error) {
      console.error('Error parsing list field:', error);
      return [];
    }
  };

  const convertDraftToHTML = (draftString) => {
    if (!draftString || typeof draftString !== 'string') {
      console.warn('Draft.js content is empty or invalid:', draftString);
      return { __html: DOMPurify.sanitize('No description available') };
    }
    if (draftString.trim().startsWith('{')) {
      try {
        const rawContent = JSON.parse(draftString);
        const contentState = convertFromRaw(rawContent);
        const htmlContent = draftToHtml(contentState);
        return { __html: DOMPurify.sanitize(htmlContent) };
      } catch (error) {
        console.error('Error converting Draft.js content:', error, { draftString });
      }
    }
    // Handle markdown or plain text
    try {
      const htmlContent = marked ? marked.parse(draftString) : draftString;
      return { __html: DOMPurify.sanitize(htmlContent) };
    } catch (error) {
      console.error('Error parsing markdown content:', error, { draftString });
      return { __html: DOMPurify.sanitize(draftString) };
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await coursesAPI.getCourse(id);
        console.log('Fetched course data:', response.data);
        setCourse({
          ...response.data,
          learning_outcomes: parseListField(response.data.learning_outcomes),
          prerequisites: parseListField(response.data.prerequisites),
          modules: response.data.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson => ({
              ...lesson,
              content_file: lesson.content_file ? `${lesson.content_file}?t=${Date.now()}` : null,
              content_url: lesson.content_url ? `${lesson.content_url}?t=${Date.now()}` : null
            }))
          }))
        });
        setError('');
      } catch (error) {
        console.error('Error fetching course:', error.response?.data || error.message);
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
    } catch {
      return `${currencyToUse} ${priceNumber.toFixed(2)}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return '#4caf50';
      case 'draft': return '#f59e0b';
      case 'archived': return '#6b7280';
      default: return '#0288d1';
    }
  };

  const getLessonType = (lesson) => {
    console.log('Lesson:', lesson.title, 'Type:', lesson.lesson_type, 'URL:', lesson.content_file || lesson.content_url);
    if (lesson.lesson_type) {
      const type = lesson.lesson_type.toLowerCase();
      if (type === 'link' && lesson.content_url) {
        if (lesson.content_url.includes('youtube.com') || lesson.content_url.includes('youtu.be')) {
          return 'youtube';
        }
      }
      if (type === 'file') {
        const url = lesson.content_file || lesson.content_url || '';
        const extension = url.split('.').pop()?.toLowerCase();
        if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
        if (['doc', 'docx'].includes(extension)) return 'word';
        if (extension === 'pdf') return 'pdf';
      }
      return type;
    }
    const url = lesson.content_file || lesson.content_url || '';
    const extension = url.split('.').pop()?.toLowerCase();
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
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
      case 'powerpoint': return <Slideshow className="icon secondary" />;
      case 'image': return <Image className="icon success" />;
      case 'youtube': return <YouTube className="icon primary" />;
      case 'link': return <Link className="icon primary" />;
      case 'text': return <InsertDriveFile className="icon action" />;
      default: return <InsertDriveFile className="icon action" />;
    }
  };

  const getResourceIcon = (type) => {
    const normalizedType = type?.toLowerCase();
    switch (normalizedType) {
      case 'video': return <VideoLibrary className="icon primary" />;
      case 'pdf': return <PictureAsPdf className="icon error" />;
      case 'file': return <Description className="icon info" />;
      case 'powerpoint': return <Slideshow className="icon secondary" />;
      case 'image': return <Image className="icon success" />;
      case 'youtube': return <YouTube className="icon primary" />;
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
            <div 
              className="course-description"
              dangerouslySetInnerHTML={convertDraftToHTML(course.description)} 
            />

            <h3>Learning Outcomes</h3>
            <ul className="outcomes-list">
              {parseArrayField(course.learning_outcomes).map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>

            <h3>Prerequisites</h3>
            <ul className="outcomes-list">
              {parseArrayField(course.prerequisites).map((prereq, index) => (
                <li key={index}>{prereq}</li>
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
                  {course.modules && course.modules.length > 0 ? (
                    course.modules.map((module) => (
                      <div key={module.id} className="module">
                        <h4>{module.title}</h4>
                        <p className="module-description">{module.description}</p>
                        <ul className="lesson-list">
                          {module.lessons && module.lessons.length > 0 ? (
                            module.lessons.map((lesson) => {
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
                                         lessonType === 'word' ? 'Click to view Word document' :
                                         lessonType === 'powerpoint' ? 'Click to view PowerPoint' :
                                         lessonType === 'image' ? 'Click to view image' :
                                         lessonType === 'youtube' ? 'Click to play YouTube video' :
                                         lessonType === 'link' ? lesson.content_url :
                                         lesson.duration || 'Not specified'}
                                      </span>
                                    </div>
                                  </div>
                                  {expandedLesson === lesson.id && contentUrl && (
                                    <div className="lesson-content">
                                      {lessonType === 'video' && (
                                        <VideoPlayer url={contentUrl} title={lesson.title} />
                                      )}
                                      {lessonType === 'pdf' && (
                                        <PDFViewer url={contentUrl} title={lesson.title} />
                                      )}
                                      {lessonType === 'word' && (
                                        <WordViewer url={contentUrl} title={lesson.title} />
                                      )}
                                      {lessonType === 'powerpoint' && (
                                        <PPTViewer url={contentUrl} title={lesson.title} />
                                      )}
                                      {lessonType === 'image' && (
                                        <div className="media-container">
                                          <img
                                            src={contentUrl}
                                            alt={lesson.title}
                                            className="media"
                                            onError={(e) => console.error(`Image load error for ${lesson.title}:`, e, { url: contentUrl })}
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
                                      {lessonType === 'youtube' && (
                                        <YouTubePlayer url={contentUrl} title={lesson.title} />
                                      )}
                                      {lessonType === 'link' && (
                                        <div className="media-container">
                                          <a
                                            href={contentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn primary"
                                          >
                                            Visit Link
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
                            })
                          ) : (
                            <li>No lessons available</li>
                          )}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div>No modules available</div>
                  )}
                </div>
              )}
              {activeTab === 1 && (
                <ul className="resource-list">
                  {course.resources && course.modules.length > 0 ? (
                    course.resources.map((resource) => {
                      const resourceUrl = resource.url || resource.file;
                      const resourceType = resource.resource_type === 'file' && resourceUrl.match(/\.(ppt|pptx)$/i) ? 'powerpoint' : 
                                          resource.resource_type === 'link' && resourceUrl.match(/youtube\.com|youtu\.be/) ? 'youtube' : 
                                          resource.resource_type;
                      return (
                        <li key={resource.id} className="resource-item">
                          <div
                            className="resource-header"
                            onClick={() => handleToggleResource(resource.id)}
                          >
                            <span className="resource-icon">{getResourceIcon(resourceType)}</span>
                            <div className="resource-text">
                              <span className="resource-title">{resource.title}</span>
                              <span className="resource-secondary">
                                {resourceType === 'link' ? resourceUrl :
                                 resourceType === 'video' ? 'Click to play video' :
                                 resourceType === 'pdf' ? 'Click to view PDF' :
                                 resourceType === 'powerpoint' ? 'Click to view PowerPoint' :
                                 resourceType === 'youtube' ? 'Click to play YouTube video' :
                                 resourceType === 'file' ? 'Click to view document' :
                                 'Resource'}
                              </span>
                            </div>
                          </div>
                          {expandedResource === resource.id && resourceUrl && (
                            <div className="resource-content">
                              {resourceType === 'video' && (
                                <VideoPlayer url={resourceUrl} title={resource.title} />
                              )}
                              {resourceType === 'pdf' && (
                                <PDFViewer url={resourceUrl} title={resource.title} />
                              )}
                              {resourceType === 'file' && (
                                <WordViewer url={resourceUrl} title={resource.title} />
                              )}
                              {resourceType === 'powerpoint' && (
                                <PPTViewer url={resourceUrl} title={resource.title} />
                              )}
                              {resourceType === 'youtube' && (
                                <YouTubePlayer url={resourceUrl} title={resource.title} />
                              )}
                              {resourceType === 'link' && (
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
                                {resourceType === 'link' || resourceType === 'youtube' ? 'Open Link' : 'Download'}
                              </a>
                            </div>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li>No resources available</li>
                  )}
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
                <span className="meta-value">{course.total_enrollments || 0}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <Schedule className="icon small" /> Duration
                </span>
                <span className="meta-value">{course.duration || 'Not specified'}</span>
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