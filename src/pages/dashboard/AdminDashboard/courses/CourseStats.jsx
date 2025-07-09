import React from 'react';
import './CourseStats.css';
import { Star, Warning, Category, AccessTime } from '@mui/icons-material';

const CourseStats = () => {
  // Dummy data
  const stats = {
    totalCourses: 42,
    totalEnrollments: 1256,
    mostPopularCourse: {
      title: "Advanced React Development",
      enrollments: 342,
      instructor: "Jane Smith",
    },
    leastPopularCourse: {
      title: "Introduction to Cobol",
      enrollments: 3,
      instructor: "John Doe",
    },
    noEnrollmentCourses: 5,
    completedCourses: 689,
    ongoingCourses: 567,
    averageCompletionRate: 68,
    recentCourses: [
      { title: "AI Fundamentals", date: "2023-05-15", instructor: "Dr. Chen" },
      { title: "DevOps Crash Course", date: "2023-05-10", instructor: "Alex Johnson" },
      { title: "UX Design Principles", date: "2023-05-05", instructor: "Sarah Williams" },
    ],
    categories: [
      { name: "Programming", count: 18 },
      { name: "Design", count: 8 },
      { name: "Business", count: 7 },
      { name: "Data Science", count: 9 },
    ],
    averageRating: 4.3,
  };

  return (
    <div className="CourseStats">
      <div className="CourseStats-Grid">
        {/* Most Popular Course */}
        <div className="CourseStats-Card">
          <div className="CourseStats-Card-Header">
            <Star className="icon" sx={{ color: '#f59e0b' }} />
            <span className="label">Most Popular</span>
          </div>
          <div className="CourseStats-Card-Content">
            <p className="title">{stats.mostPopularCourse.title}</p>
            <span className="subtitle">{stats.mostPopularCourse.enrollments} enrollments</span>
          </div>
        </div>

        {/* Least Popular Course */}
        <div className="CourseStats-Card">
          <div className="CourseStats-Card-Header">
            <Warning className="icon" sx={{ color: '#b91c1c' }} />
            <span className="label">Least Popular</span>
          </div>
          <div className="CourseStats-Card-Content">
            <p className="title">{stats.leastPopularCourse.title}</p>
            <span className="subtitle">{stats.leastPopularCourse.enrollments} enrollments</span>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="CourseStats-Card">
          <div className="CourseStats-Card-Header">
            <Category className="icon" sx={{ color: '#7226FF' }} />
            <span className="label">Categories</span>
          </div>
          <div className="CourseStats-Card-Content">
            <div className="categories">
              {stats.categories.slice(0, 3).map((category) => (
                <span key={category.name} className="category-chip">
                  {category.name} ({category.count})
                </span>
              ))}
              {stats.categories.length > 3 && (
                <span className="category-chip">+{stats.categories.length - 3}</span>
              )}
            </div>
          </div>
        </div>

        {/* Recently Added Courses */}
        <div className="CourseStats-Card">
          <div className="CourseStats-Card-Header">
            <AccessTime className="icon" sx={{ color: '#d78c0b' }} />
            <span className="label">Recent</span>
          </div>
          <div className="CourseStats-Card-Content">
            <ul className="recent-courses">
              {stats.recentCourses.slice(0, 2).map((course, index) => (
                <li key={index} className="recent-course-item">
                  <p className="title">{course.title}</p>
                  <span className="subtitle">{course.instructor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStats;