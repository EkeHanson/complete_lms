import React, { useState, useEffect } from 'react';
import './CourseManagement.css';
import {
  Add, School, People, CheckCircle, TrendingUp, Warning,
  Star, Category, Assignment
} from '@mui/icons-material';
import CourseList from './CourseList';
import CourseContentManagement from './CourseContentManagement';
import CategoryManagement from './CategoryManagement';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../../../config';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [courseStats, setCourseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        setLoading(true);
        const [coursesRes, enrollmentsRes, mostPopularRes, leastPopularRes, categoriesRes] = await Promise.all([
          coursesAPI.getCourses(),
          coursesAPI.getAllEnrollments(),
          coursesAPI.getMostPopularCourses().catch((err) => ({
            data: { message: 'No courses with enrollments yet', course: null, enrollment_count: 0 },
            status: err.response?.status || 500
          })),
          coursesAPI.getLeastPopularCourses().catch((err) => ({
            data: { message: 'No courses with enrollments yet', course: null, enrollment_count: 0 },
            status: err.response?.status || 500
          })),
          coursesAPI.getCategories()
        ]);

        setCourses(coursesRes.data.results || []); // <-- Store courses here

        const totalCourses = coursesRes.data.count || 0;


        const totalEnrollments = enrollmentsRes.data.count || 0;

        const mostPopularCourse = mostPopularRes.data.course ? {
          id: mostPopularRes.data.course.id,
          title: mostPopularRes.data.course.title,
          enrollments: mostPopularRes.data.enrollment_count || 0,
          instructor: mostPopularRes.data.course.instructor || "No instructor assigned",
          message: null
        } : {
          id: null,
          title: mostPopularRes.data.message || "No courses with enrollments yet",
          enrollments: 0,
          instructor: "N/A",
          message: mostPopularRes.data.message
        };

        const leastPopularCourse = leastPopularRes.data.course ? {
          id: leastPopularRes.data.course.id,
          title: leastPopularRes.data.course.title,
          enrollments: leastPopularRes.data.enrollment_count || 0,
          instructor: leastPopularRes.data.course.instructor || "No instructor assigned",
          message: null
        } : {
          id: null,
          title: leastPopularRes.data.message || "No courses with enrollments yet",
          enrollments: 0,
          instructor: "N/A",
          message: leastPopularRes.data.message
        };

        const completedCourses = enrollmentsRes.data.results?.filter(e => e.completed).length || 0;
        const averageCompletionRate = totalEnrollments > 0 
          ? Math.round((completedCourses / totalEnrollments) * 100) 
          : 0;

        const categories = categoriesRes.data.results?.map(cat => ({
          id: cat.id,
          name: cat.name,
          count: cat.course_count || 0
        })) || [];

        setCourseStats({
          totalCourses,
          totalEnrollments,
          mostPopularCourse,
          leastPopularCourse,
          completedCourses,
          ongoingCourses: totalEnrollments - completedCourses,
          averageCompletionRate,
          categories,
          noEnrollmentCourses: totalCourses - totalEnrollments,
          recentCourses: [],
          averageRating: 0,
          attentionNeeded: []
        });
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch course statistics');
        console.error('Error fetching course stats:', err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStats();
  }, []);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="StatCard">
      <div className="StatCard-Content">
        <span className={`StatCard-Icon ${color}`}>
          {icon}
        </span>
        <div className="StatCard-Text">
          <span className="StatCard-Title">{title}</span>
          <span className="StatCard-Value">{loading ? 'Loading...' : value}</span>
        </div>
      </div>
    </div>
  );

  const handleAddCourse = () => {
    navigate('/admin/courses/new');
  };

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="Loading">
          <span>Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="Error">
          <span>Error: {error}</span>
          <button className="Retry-Button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      );
    }

    if (!courseStats) {
      return null;
    }

    return (
      <>
        <div className="Stats-Grid">
          <StatCard
            icon={<School />}
            title="Total Courses"
            value={courseStats.totalCourses}
            color="primary"
          />
          <StatCard
            icon={<People />}
            title="Enrollments"
            value={courseStats.totalEnrollments}
            color="secondary"
          />
          <StatCard
            icon={<CheckCircle />}
            title="Completed"
            value={courseStats.completedCourses}
            color="success"
          />
          <StatCard
            icon={<TrendingUp />}
            title="Completion %"
            value={`${courseStats.averageCompletionRate}%`}
            color="info"
          />
        </div>

        <div className="Detailed-Stats">
          <div 
            className={`Course-Card ${!courseStats.mostPopularCourse.id ? 'disabled' : ''}`} 
            onClick={() => courseStats.mostPopularCourse.id && navigate(`/admin/course-details/${courseStats.mostPopularCourse.id}`, {
              state: { enrollments: courseStats.mostPopularCourse.enrollments }
            })}
          >
            <div className="Course-Card-Content">
              <span className="Course-Card-Header">
                <Star className="icon warning" /> Most Popular
              </span>
              <h3>{courseStats.mostPopularCourse.title}</h3>
              {courseStats.mostPopularCourse.message ? (
                <span className="Course-Card-Message">{courseStats.mostPopularCourse.message}</span>
              ) : (
                <>
                  <span className="Course-Card-Subtitle">
                    Instructor: {courseStats.mostPopularCourse.instructor}
                  </span>
                  <div className="Course-Card-Stats">
                    <People className="icon" />
                    <span>{courseStats.mostPopularCourse.enrollments} enrollments</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div 
            className={`Course-Card ${!courseStats.leastPopularCourse.id ? 'disabled' : ''}`} 
            onClick={() => courseStats.leastPopularCourse.id && navigate(`/admin/course-details/${courseStats.leastPopularCourse.id}`, {
              state: { enrollments: courseStats.leastPopularCourse.enrollments }
            })}
          >
            <div className="Course-Card-Content">
              <span className="Course-Card-Header">
                <Warning className="icon error" /> Least Popular
              </span>
              <h3>{courseStats.leastPopularCourse.title}</h3>
              {courseStats.leastPopularCourse.message ? (
                <span className="Course-Card-Message">{courseStats.leastPopularCourse.message}</span>
              ) : (
                <>
                  <span className="Course-Card-Subtitle">
                    Instructor: {courseStats.leastPopularCourse.instructor}
                  </span>
                  <div className="Course-Card-Stats">
                    <People className="icon" />
                    <span>{courseStats.leastPopularCourse.enrollments} enrollments</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div 
            className="Categories-Card"
            onClick={() => setShowCategoryManagement(true)}
          >
            <div className="Categories-Card-Content">
              <span className="Course-Card-Header">
                <Category className="icon purple" /> Categories
              </span>
              <div className="Categories-List">
                {courseStats.categories.map((category) => (
                  <div key={category.id} className="Category-Item">
                    <span>{category.name} ({category.count})</span>
                    <div className="Progress-Bar">
                      <div
                        className="Progress-Fill"
                        style={{ width: `${courseStats.totalCourses ? (category.count / courseStats.totalCourses) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="Course-List-Card">
          <CourseList />
        </div>

        {showCategoryManagement && (
          <CategoryManagement 
            categories={courseStats.categories}
            onClose={() => setShowCategoryManagement(false)}
          />
        )}
      </>
    );
  };

  return (
    <div className="CourseManagement">
      <div className="CourseManagement-Top">
        <div className="CourseManagement-Top-Grid">
          <div className="CourseManagement-Top-1">
            <h2><School className="icon" /> Course Management</h2>
          </div>
          <div className="CourseManagement-Top-2">
            <button className="Add-Course-Button" onClick={handleAddCourse}>
              <Add className="icon" /> Add New Course
            </button>
          </div>
        </div>

        <div className="Tabs-Container">
          <div className="Tabs">
            <button
              className={`Tab ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              <School className="icon" /> Overview
            </button>
            <button
              className={`Tab ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              <Assignment className="icon" /> Content Management
            </button>
          </div>
          <div className="Tab-Content">
            {activeTab === 0 && renderOverview()}
            {activeTab === 1 && <CourseContentManagement courses={courses} />} {/* Pass courses here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;