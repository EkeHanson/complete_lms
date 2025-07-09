import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CourseDetailPage.css';
import { School, People, AccessTime, Star, Warning, ArrowBack } from '@mui/icons-material';
import { coursesAPI }  from '../../../../config';

const CourseDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const enrollments = location.state?.enrollments || 0;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await coursesAPI.getCourse(id);
        setCourse(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch course details');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="CourseDetailPage">
        <div className="loading">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="CourseDetailPage">
        <div className="error">
          <Warning className="icon" />
          <span>{error}</span>
          <button className="action-btn" onClick={() => navigate(-1)}>
            <ArrowBack className="icon" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="CourseDetailPage">
        <div className="error">
          <Warning className="icon" />
          <span>Course not found</span>
          <button className="action-btn" onClick={() => navigate(-1)}>
            <ArrowBack className="icon" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="CourseDetailPage">
      <div className="CourseDetailPage-Top">
        <button className="action-btn" onClick={() => navigate(-1)}>
          <ArrowBack className="icon" /> Back to Courses
        </button>
      </div>

      <div className="CourseDetailPage-Header">
        <div className="CourseDetailPage-Header-Grid">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="course-thumbnail"
            />
          )}
          <div className="header-content">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <ul className="course-stats">
              <li>
                <span>
                  <People className="icon" /> {enrollments} Enrollments
                </span>
              </li>
              <li>
                <span>
                  <AccessTime className="icon" /> {course.duration}
                </span>
              </li>
              <li>
                <span>
                  <School className="icon" /> {course.level}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="CourseDetailPage-Content">
        <div className="content-main">
          <div className="content-section">
            <h3>What You'll Learn</h3>
            <ul className="content-list">
              {course.learning_outcomes?.map((outcome, index) => (
                <li key={index}>
                  <Star className="icon" /> {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h3>Prerequisites</h3>
            <ul className="content-list">
              {course.prerequisites?.map((prereq, index) => (
                <li key={index}>
                  <span>• {prereq}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h3>Course Content</h3>
            {course.modules?.map((module) => (
              <div key={module.id} className="module-section">
                <h4>{module.title}</h4>
                <p className="module-description">{module.description}</p>
                <ul className="content-list">
                  {module.lessons?.map((lesson) => (
                    <li key={lesson.id}>
                      <span>
                        {lesson.title} • {lesson.duration} • {lesson.lesson_type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="content-sidebar">
          <div className="sidebar-section">
            <h3>Course Details</h3>
            <ul className="content-list">
              <li>
                <span>Category: {course.category?.name || 'Not specified'}</span>
              </li>
              <li>
                <span>Status: {course.status}</span>
              </li>
              <li>
                <span>Price: {course.currency} {course.current_price}</span>
              </li>
              {course.discount_price && (
                <li className="discount-price">
                  <span>
                    Original Price: {course.currency} {course.price}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {course.resources?.length > 0 && (
            <div className="sidebar-section">
              <h3>Resources</h3>
              <ul className="content-list">
                {course.resources.map((resource) => (
                  <li key={resource.id}>
                    <span>
                      {resource.title} • {resource.resource_type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;