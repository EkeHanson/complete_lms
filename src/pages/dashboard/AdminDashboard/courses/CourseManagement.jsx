import React, { useState, useEffect } from 'react';
import './CourseManagement.css';
import {
  Add, School, People, CheckCircle, TrendingUp, Warning,
  Star, Category, Assignment
} from '@mui/icons-material';

import CourseList from './CourseList';
import CourseContentManagement from './CourseContentManagement';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../../../config'; // Adjust the import path as needed

const CourseManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [courseStats, setCourseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        setLoading(true);
        const [coursesRes, enrollmentsRes, mostPopularRes, leastPopularRes, categoriesRes] = await Promise.all([
          coursesAPI.getCourses(),
          coursesAPI.getAllEnrollments(),
          coursesAPI.getMostPopularCourses(),
          coursesAPI.getLeastPopularCourses(),
          coursesAPI.getCategories()
        ]);

        const totalCourses = coursesRes.data.count;
        const totalEnrollments = enrollmentsRes.data.count;

        const mostPopularCourse = mostPopularRes.data ? {
          id: mostPopularRes.data.id,
          title: mostPopularRes.data.title,
          enrollments: mostPopularRes.data.enrollment_count || 0,
          instructor: mostPopularRes.data.instructor || "No instructor assigned"
        } : {
          title: "No courses available",
          enrollments: 0,
          instructor: "No instructor assigned"
        };

        const leastPopularCourse = leastPopularRes.data ? {
          id: leastPopularRes.data.id,
          title: leastPopularRes.data.title,
          enrollments: leastPopularRes.data.enrollment_count || 0,
          instructor: leastPopularRes.data.instructor || "No instructor assigned"
        } : {
          title: "No courses available",
          enrollments: 0,
          instructor: "No instructor assigned"
        };

        const completedCourses = enrollmentsRes.data.results.filter(e => e.completed).length;
        const averageCompletionRate = totalEnrollments > 0 
          ? Math.round((completedCourses / totalEnrollments) * 100) 
          : 0;

        const categories = categoriesRes.data.results.map(cat => ({
          name: cat.name,
          count: cat.course_count || 0
        }));

        setCourseStats({
          totalCourses,
          totalEnrollments,
          mostPopularCourse,
          leastPopularCourse,
          completedCourses,
          ongoingCourses: totalEnrollments - completedCourses,
          averageCompletionRate,
          categories,
          noEnrollmentCourses: 0,
          recentCourses: [],
          averageRating: 0,
          attentionNeeded: []
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch course statistics');
        console.error('Error fetching course stats:', err);
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
          {courseStats.mostPopularCourse && (
            <div className="Course-Card" onClick={() => navigate(`/admin/course-details/${courseStats.mostPopularCourse.id}`, {
              state: { enrollments: courseStats.mostPopularCourse.enrollments }
            })}>
              <div className="Course-Card-Content">
                <span className="Course-Card-Header">
                  <Star className="icon warning" /> Most Popular
                </span>
                <h3>{courseStats.mostPopularCourse?.title || 'No popular course'}</h3>
                <span className="Course-Card-Subtitle">
                  Instructor: {courseStats.mostPopularCourse?.instructor || 'Unknown'}
                </span>
                <div className="Course-Card-Stats">
                  <People className="icon" />
                  <span>{courseStats.mostPopularCourse?.enrollments ?? 0} enrollments</span>
                </div>
              </div>
            </div>
          )}

          <div className="Course-Card" onClick={() => navigate(`/admin/course-details/${courseStats.leastPopularCourse.id}`, {
            state: { enrollments: courseStats.leastPopularCourse.enrollments }
          })}>
            <div className="Course-Card-Content">
              <span className="Course-Card-Header">
                <Warning className="icon error" /> Least Popular
              </span>
              <h3>{courseStats.leastPopularCourse.title}</h3>
              <span className="Course-Card-Subtitle">
                Instructor: {courseStats.leastPopularCourse.instructor}
              </span>
              <div className="Course-Card-Stats">
                <People className="icon" />
                <span>{courseStats.leastPopularCourse.enrollments} enrollments</span>
              </div>
            </div>
          </div>

          <div className="Categories-Card">
            <div className="Categories-Card-Content">
              <span className="Course-Card-Header">
                <Category className="icon purple" /> Categories
              </span>
              <div className="Categories-List">
                {courseStats.categories.map((category) => (
                  <div key={category.name} className="Category-Item">
                    <span>{category.name} ({category.count})</span>
                    <div className="Progress-Bar">
                      <div
                        className="Progress-Fill"
                        style={{ width: `${(category.count / courseStats.totalCourses) * 100}%` }}
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
            {activeTab === 1 && <CourseContentManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
