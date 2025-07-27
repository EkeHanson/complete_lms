import React, { useState, useEffect, useCallback, memo } from 'react';
import { throttle } from 'lodash';
import { coursesAPI, API_BASE_URL } from '../../../config';
import './StudentCourseList.css';
import {
  PlayCircle,  Bookmark,  BookmarkBorder,  Search,
  RateReview,  VideoLibrary,  PictureAsPdf,  Description,
  InsertDriveFile,  FilterList,  Sort,  Star,  StarBorder,  PlayArrow,
  Pause,  VolumeUp,  VolumeOff,  Fullscreen,
  FullscreenExit,  Speed,  Close,  CheckCircle,  HourglassEmpty
} from '@mui/icons-material';

// Memoized Course Card Component
const CourseCard = memo(({ course, bookmarked, onBookmark, onOpen, onFeedback }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // console.log('Thumbnail URL:', course.thumbnail);
  // console.log('Image Error:', imageError);

  return (
    <div className="course-card" aria-label={`Course: ${course.title}`}>
      <div className="course-card-image">
        {!imageLoaded && <div className="skeleton-image" />}
        {/* {imageLoaded && ( */}
          <img
            src={imageError ? 'https://crm-frontend-react.vercel.app/assets/global-banner-BNdpuw-A.png' : course.thumbnail}
            alt={course.title}
            className="course-image"
            onLoad={() => {
              console.log('Image loaded successfully');
              setImageLoaded(true);
            }}
            onError={() => {
              console.error('Image failed to load:', course.thumbnail);
              setImageError(true);
              setImageLoaded(true);
            }}
            loading="lazy"
          />
        {/* )} */}
      </div>
      <div className="course-card-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">
          {course.instructors.length > 0 ? `By ${course.instructors[0].name}` : 'No instructor'}
        </p>
        <div className="course-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
          </div>
          <span className="progress-text">{Math.round(course.progress)}%</span>
        </div>
        <span className={`course-status ${course.status}`}>
          {course.status.replace('_', ' ')}
        </span>
      </div>
      <div className="course-card-actions">
        <button className="action-button primary" onClick={() => onOpen(course)}>
          <PlayCircle />
          {course.progress > 0 ? 'Continue' : 'Start'}
        </button>
        <div className="secondary-actions">
          <button
            className="icon-button"
            onClick={onBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {bookmarked ? <Bookmark /> : <BookmarkBorder />}
          </button>
          <button className="action-button" onClick={() => onFeedback(course, 'course')}>
            <RateReview />
            Feedback
          </button>
        </div>
      </div>
    </div>
  );
});

// Empty State
const EmptyState = () => (
  <div className="empty-state">
    <h3>No Enrolled Courses</h3>
    <p>You haven't enrolled in any courses yet.</p>
    <a href="/courses" className="action-button primary">
      <Search />
      Browse Courses
    </a>
  </div>
);

// Media Player Component
const MediaPlayer = ({ open, onClose, media }) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [completed, setCompleted] = useState(false);
  const videoRef = React.useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleVolumeChange = (e) => {
    const newValue = parseInt(e.target.value);
    setVolume(newValue);
    if (videoRef.current) {
      videoRef.current.volume = newValue / 100;
      setMuted(newValue === 0);
    }
  };

  const handleProgressChange = (e) => {
    const newValue = parseInt(e.target.value);
    setProgress(newValue);
    if (videoRef.current) {
      videoRef.current.currentTime = (newValue / 100) * duration;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const newProgress = (currentTime / duration) * 100;
      setProgress(newProgress);
      if (duration > 0 && currentTime >= duration - 1 && !completed) {
        setCompleted(true);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.volume = volume / 100;
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleFullscreen = () => {
    if (!fullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      handlePlayPause();
    } else if (e.key === 'ArrowRight') {
      if (videoRef.current) {
        videoRef.current.currentTime += 5;
      }
    } else if (e.key === 'ArrowLeft') {
      if (videoRef.current) {
        videoRef.current.currentTime -= 5;
      }
    } else if (e.key === 'm') {
      setMuted(!muted);
    } else if (e.key === 'f') {
      handleFullscreen();
    }
  };

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.currentTime = 0;
      setPlaying(false);
      setProgress(0);
      setCompleted(false);
    }
  }, [open]);

  return (
    <div className={`media-player ${open ? 'open' : ''}`} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="media-player-content">
        <div className="media-container">
          {media.type === 'video' ? (
            <video
              ref={videoRef}
              src={media.url}
              className="media-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setPlaying(false);
                setCompleted(true);
              }}
              onClick={handlePlayPause}
              muted={muted}
            />
          ) : (
            <iframe
              src={media.url}
              className="media-iframe"
              title={media.title}
              allowFullScreen
            />
          )}
          <div className="media-controls">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="progress-slider"
            />
            <div className="controls-bar">
              <div className="controls-left">
                <button className="icon-button" onClick={handlePlayPause}>
                  {playing ? <Pause /> : <PlayArrow />}
                </button>
                <button className="icon-button" onClick={() => setMuted(!muted)}>
                  {muted ? <VolumeOff /> : <VolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
                <span className="time-display">
                  {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                </span>
              </div>
              <div className="controls-right">
                {media.type === 'video' && (
                  <select
                    value={playbackRate}
                    onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                    className="playback-rate"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <option key={rate} value={rate}>{rate}x</option>
                    ))}
                  </select>
                )}
                <button className="icon-button" onClick={handleFullscreen}>
                  {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                </button>
              </div>
            </div>
          </div>
          {completed && (
            <div className="completion-overlay">
              <CheckCircle className="completion-icon" />
              <h3>Lesson Completed</h3>
              <button
                className="action-button primary"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setPlaying(false);
                    setProgress(0);
                    setCompleted(false);
                  }
                }}
              >
                Replay
              </button>
            </div>
          )}
        </div>
        <div className="media-info">
          <div className="media-header">
            <h3>{media.title}</h3>
            <button className="icon-button" onClick={onClose}>
              <Close />
            </button>
          </div>
          <p>{media.description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Document Viewer Component
const DocumentViewer = ({ open, onClose, document }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setError(null);
      if (document.type === 'pdf') {
        setFileUrl(document.url);
        setLoading(false);
      } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(document.type)) {
        setFileUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`);
        setLoading(false);
      } else {
        fetch(document.url)
          .then(response => {
            if (!response.ok) throw new Error('Failed to load file');
            return response.blob();
          })
          .then(blob => {
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      }
    }
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [open, document]);

  const renderViewer = () => {
    if (loading) {
      return (
        <div className="viewer-loading">
          <HourglassEmpty />
        </div>
      );
    }
    if (error) {
      return (
        <div className="viewer-error">
          <p>Failed to load document: {error}</p>
          <p>
            The document couldn't be displayed. You can try to
            <a href={document.url} target="_blank" rel="noopener noreferrer" className="action-button">
              download it
            </a>
            instead.
          </p>
        </div>
      );
    }
    if (document.type === 'pdf' || ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(document.type)) {
      return (
        <iframe
          src={fileUrl}
          className="document-iframe"
          title={document.title}
        />
      );
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(document.type)) {
      return (
        <div className="image-viewer">
          <img src={fileUrl} alt={document.title} />
        </div>
      );
    }
    return (
      <div className="viewer-error">
        <p>This file type cannot be displayed in the browser.</p>
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="action-button primary"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className={`document-viewer ${open ? 'open' : ''}`}>
      <div className="document-viewer-content">
        <div className="viewer-header">
          <h3>{document?.title}</h3>
          <button className="icon-button" onClick={onClose}>
            <Close />
          </button>
        </div>
        <div className="viewer-body">{renderViewer()}</div>
        <div className="viewer-footer">
          <a
            href={document?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button primary"
          >
            <InsertDriveFile />
            Download Original File
          </a>
        </div>
      </div>
    </div>
  );
};

// Course Dialog with Feedback Form
const CourseDialog = ({ open, onClose, course, activeTab, setActiveTab, onFeedback }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackError, setFeedbackError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const renderFileIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary />;
      case 'pdf': return <PictureAsPdf />;
      case 'doc': case 'docx': return <Description />;
      default: return <InsertDriveFile />;
    }
  };

  const handleOpenMedia = (item) => {
    if (item.type === 'video' || item.type === 'audio') {
      setSelectedMedia({
        url: item.content_url || item.content_file,
        title: item.title,
        description: item.description,
        type: item.type
      });
    } else {
      setSelectedDocument({
        url: item.content_url || item.content_file,
        title: item.title,
        type: item.type
      });
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError('Feedback cannot be empty');
      return;
    }
    try {
      await coursesAPI.submitFeedback(course.course.id, { text: feedbackText, rating: feedbackRating });
      setFeedbackText('');
      setFeedbackRating(0);
      setFeedbackError(null);
      onFeedback(course, 'course', feedbackText);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback');
    }
  };

  return (
    <>
      <div className={`course-dialog ${open ? 'open' : ''}`}>
        <div className="course-dialog-content">
          <div className="dialog-header">
            <h2>{course.course.title}</h2>
            <button className="icon-button" onClick={onClose}>
              <Close />
            </button>
          </div>
          <div className="dialog-tabs">
            {['Modules', 'Resources', 'Feedback'].map((tab, index) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="dialog-content">
            {activeTab === 0 && (
              <div className="modules-tab">
                {course.course.modules.length > 0 ? (
                  course.course.modules.map(module => (
                    <div key={module.id} className="module-section">
                      <h3>{module.title}</h3>
                      {module.lessons.map(lesson => (
                        <div
                          key={lesson.id}
                          className="lesson-item"
                          onClick={() => handleOpenMedia(lesson)}
                        >
                          {renderFileIcon(lesson.type)}
                          <div className="lesson-info">
                            <span>{lesson.title}</span>
                            <span className="lesson-meta">{lesson.duration} • {lesson.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p>No modules available for this course.</p>
                )}
              </div>
            )}
            {activeTab === 1 && (
              <div className="resources-tab">
                {course.course.resources.length > 0 ? (
                  course.course.resources.map(resource => (
                    <div
                      key={resource.id}
                      className="resource-item"
                      onClick={() => handleOpenMedia(resource)}
                    >
                      {renderFileIcon(resource.type)}
                      <div className="resource-info">
                        <span>{resource.title}</span>
                        <span className="resource-meta">{resource.type.toUpperCase()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No additional resources available.</p>
                )}
              </div>
            )}
            {activeTab === 2 && (
              <div className="feedback-tab">
                <h3>Provide Feedback</h3>
                <div className="rating-section">
                  <span>Rate this course:</span>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className="icon-button"
                        onClick={() => setFeedbackRating(star)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        {feedbackRating >= star ? <Star /> : <StarBorder />}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows="5"
                  placeholder="Share your feedback about this course..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="feedback-textarea"
                />
                {feedbackError && <div className="error-message">{feedbackError}</div>}
                <button
                  className="action-button primary"
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim()}
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedMedia && (
        <MediaPlayer
          open={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          media={selectedMedia}
        />
      )}
      {selectedDocument && (
        <DocumentViewer
          open={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
        />
      )}
    </>
  );
};

const StudentCourseList = ({ courses, onFeedback }) => {

  // console.log('Courses:', courses);

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sort: 'title',
    view: 'all'
  });

  useEffect(() => {
    setBookmarks(courses.map(course => course.bookmarked || false));
    const transformedCourses = courses.map(course => ({
      ...course,
      courseId: course.course.id,
      title: course.course.title,
      thumbnail: course.course.thumbnail.includes('http')
        ? course.course.thumbnail
        : `${API_BASE_URL}${course.course.thumbnail}`,
      description: course.course.description || '',
      resources: course.course.resources || [],
      modules: course.course.modules || [],
      instructors: course.course.instructors || [],
      status: course.completed_at ? 'completed' : course.progress > 0 ? 'in_progress' : 'not_started'
    }));
    setFilteredCourses(transformedCourses);
  }, [courses]);

  useEffect(() => {
    let result = [...courses].map(course => ({
      ...course,
      courseId: course.course.id,
      title: course.course.title,
      thumbnail: course.course.thumbnail.includes('http')
        ? course.course.thumbnail
        : `${API_BASE_URL}${course.course.thumbnail}`,
      description: course.course.description || '',
      resources: course.course.resources || [],
      modules: course.course.modules || [],
      instructors: course.course.instructors || [],
      status: course.completed_at ? 'completed' : course.progress > 0 ? 'in_progress' : 'not_started'
    }));

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(course => course.title.toLowerCase().includes(searchLower));
    }

    if (filters.status !== 'all') {
      result = result.filter(course => course.status === filters.status);
    }

    if (filters.view === 'bookmarked') {
      result = result.filter((course, index) => bookmarks[index]);
    }

    result.sort((a, b) => {
      if (filters.sort === 'title') {
        return a.title.localeCompare(b.title);
      } else if (filters.sort === 'progress') {
        return b.progress - a.progress;
      } else if (filters.sort === 'enrolled_at') {
        return new Date(b.enrolled_at) - new Date(a.enrolled_at);
      }
      return 0;
    });

    setFilteredCourses(result);
  }, [courses, filters, bookmarks]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBookmark = useCallback(
    throttle(index => {
      setBookmarks(prev => {
        const newBookmarks = [...prev];
        newBookmarks[index] = !newBookmarks[index];
        return newBookmarks;
      });
    }, 300),
    []
  );

  const handleOpenCourse = useCallback(course => {
    setSelectedCourse(course);
    setActiveTab(0);
    setOpenCourseDialog(true);
  }, []);

  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'in_progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    notStarted: courses.filter(c => c.status === 'not_started').length
  };

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h1>My Learning</h1>
        <a href="/courses" className="action-button primary">
          <Search />
          Browse Courses
        </a>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Total Courses', value: stats.total },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Completed', value: stats.completed },
          { label: 'Not Started', value: stats.notStarted }
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="filters">
        <div className="filter-group">
          <Search className="filter-icon" />
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <FilterList className="filter-icon" />
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
        <div className="filter-group">
          <Sort className="filter-icon" />
          <select
            value={filters.sort}
            onChange={e => handleFilterChange('sort', e.target.value)}
            className="filter-select"
          >
            <option value="title">Sort by Title</option>
            <option value="progress">Sort by Progress</option>
            <option value="enrolled_at">Sort by Enrollment Date</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.view}
            onChange={e => handleFilterChange('view', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
        </div>
      </div>
      <div className="course-grid">
        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          filteredCourses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              bookmarked={bookmarks[index]}
              onBookmark={() => handleBookmark(index)}
              onOpen={() => handleOpenCourse(course)}
              onFeedback={onFeedback}
            />
          ))
        )}
      </div>
      {selectedCourse && (
        <CourseDialog
          open={openCourseDialog}
          onClose={() => setOpenCourseDialog(false)}
          course={selectedCourse}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onFeedback={onFeedback}
        />
      )}
    </div>
  );
};

export default StudentCourseList;
