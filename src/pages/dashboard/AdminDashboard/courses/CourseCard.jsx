import React from 'react';
import './CourseCard.css';
import { ClockIcon, AcademicCapIcon, StarIcon, UserGroupIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';

const CourseCard = ({
  course,
  onView,
  onEdit,
  onEnroll,
  variant = 'default' // 'default' or 'minimal'
}) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 'Advanced':
        return '#f8d7da';
      case 'Intermediate':
        return '#fef3c7';
      default:
        return '#d1fae5';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return '#d1fae5';
      case 'Draft':
        return '#fef3c7';
      default:
        return '#f7f5ff';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="CourseCard CourseCard-minimal">
        <img
          src={course.thumbnail || '/default-course.jpg'}
          alt={course.title}
          className="CourseCard-img"
        />
        <div className="CourseCard-content">
          <h3>{course.title}</h3>
          <p className="instructor">{course.instructor}</p>
          <div className="CourseCard-chips">
            <span
              className="chip"
              style={{ backgroundColor: getLevelColor(course.level) }}
            >
              {course.level}
            </span>
            <span className="chip outlined">{course.category}</span>
          </div>
        </div>
        <div className="CourseCard-actions">
          <span className="enrolled">
            <UserGroupIcon className="icon" /> {course.enrolled}
          </span>
          <button className="action-btn" onClick={onView}>
            View
          </button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="eCard">
      <div className="CourseCard-img-container">
        <img
          src={course.thumbnail || '/default-course.jpg'}
          alt={course.title}
          className="CourseCard-img"
        />
        <span
          className="status-chip"
          style={{ backgroundColor: getStatusColor(course.status) }}
        >
          {course.status}
        </span>
      </div>
      <div className="CourseCard-content">
        <h3>{course.title}</h3>
        <p className="description">{course.shortDescription || 'No description available'}</p>
        <div className="instructor-info">
          <span className="avatar">{course.instructor?.charAt(0)}</span>
          <span>{course.instructor || 'Unknown Instructor'}</span>
        </div>
        <div className="CourseCard-chips">
          <span className="chip">
            <ClockIcon className="icon" /> {course.duration || 'N/A'}
          </span>
          <span className="chip">
            <AcademicCapIcon className="icon" /> {course.level || 'All Levels'}
          </span>
          {course.rating && (
            <span className="chip rating">
              <StarIcon className="icon" /> {course.rating}
            </span>
          )}
        </div>
      </div>
      <div className="CourseCard-actions">
        <span className="price">{course.price ? `$${course.price}` : 'Free'}</span>
        <div className="buttons">
          {onEdit && (
            <button className="action-btn" onClick={onEdit}>
              <PencilIcon className="icon" /> Edit
            </button>
          )}
          <button
            className="action-btn primary"
            onClick={onView || onEnroll}
          >
            <DocumentTextIcon className="icon" />
            {onEdit ? 'Preview' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;