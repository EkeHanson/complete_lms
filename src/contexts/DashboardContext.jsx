import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI, coursesAPI, messagingAPI, scheduleAPI, activityAPI, paymentAPI, authAPI, getAuthHeader } from '../config';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

const fetchDashboardData = async (userId) => {
  const defaultData = {
    student: null,
    metrics: {
      enrolledCourses: 0,
      completedCourses: 0,
      assignmentsDue: 0,
      averageGrade: 0,
      learningHours: 0,
      strongestModule: 'Unknown',
      weakestModule: 'Unknown',
    },
    enrolledCourses: [],
    assignments: [],
    messages: [],
    schedules: [],
    feedbackHistory: [],
    cart: [],
    wishlist: [],
    paymentHistory: [],
    certificates: [],
    gamification: { points: 0, badges: [], leaderboardRank: 0 },
    activities: [],
    analytics: { timeSpent: { total: '0h', weekly: '0h' }, strengths: [], weaknesses: [] },
  };

  if (!userId) {
    console.warn('User ID not available, returning default data');
    return defaultData;
  }

  const headers = getAuthHeader();

  // Fetch student profile
  let student = defaultData.student;
  try {
    const profileResponse = await userAPI.getUser('me');
    student = {
      id: profileResponse.data.id || 0,
      name: `${profileResponse.data.first_name || ''} ${profileResponse.data.last_name || ''}`.trim() || 'Unknown User',
      email: profileResponse.data.email || 'No email available',
      bio: profileResponse.data.bio || 'No bio available',
      avatar: profileResponse.data.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg',
      department: profileResponse.data.department || 'Not specified',
      lastLogin: profileResponse.data.last_login || new Date().toISOString(),
      enrollmentDate: profileResponse.data.signup_date || new Date().toISOString(),
      interests: profileResponse.data.interests || [],
      learningTrack: profileResponse.data.learning_track || 'Intermediate',
      points: profileResponse.data.points || 0,
      badges: profileResponse.data.badges || [],
      language: profileResponse.data.language || 'en',
    };
  } catch (error) {
    console.warn('Error fetching student profile:', error);
  }

  // Fetch enrolled courses with full course data
  let enrolledCourses = defaultData.enrolledCourses;
  try {
    const enrollmentsResponse = await coursesAPI.getAllMyEnrollments();
    
    console.log("enrollmentsResponse")
    console.log(enrollmentsResponse)
    console.log("enrollmentsResponse")

    enrolledCourses = (enrollmentsResponse.data || []).map((enrollment) => ({
      id: enrollment.id || 0,
      course: {
        id: enrollment.course?.id || 0,
        title: enrollment.course?.title || 'Untitled Course',
        description: enrollment.course?.description || 'No description available',
        thumbnail: enrollment.course?.thumbnail || 'https://source.unsplash.com/random/300x200?course',
        category: enrollment.course?.category?.name || 'Uncategorized',
        resources: (enrollment.course?.resources || []).map((r) => ({
          id: r.id || 0,
          title: r.title || 'Untitled Resource',
          type: r.resource_type || 'Unknown',
          url: r.url || null,
          order: r.order || 0,
          file: r.file || null,
        })),
        modules: (enrollment.course?.modules || []).map((m) => ({
          id: m.id || 0,
          title: m.title || 'Untitled Module',
          order: m.order || 0,
          lessons: (m.lessons || []).map((l) => ({
            id: l.id || 0,
            title: l.title || 'Untitled Lesson',
            type: l.lesson_type || 'Unknown',
            duration: l.duration || 'Unknown',
            order: l.order || 0,
            is_published: l.is_published || false,
            content_url: l.content_url || null,
            content_file: l.content_file || null,
          })),
        })),
        instructors: (enrollment.course?.instructors || []).map((i) => ({
          id: i.id || 0,
          name: i.name || 'Unknown Instructor',
          bio: i.bio || 'No bio available',
        })),
      },
      progress: enrollment.progress || 0,
      enrolled_at: enrollment.enrolled_at || new Date().toISOString(),
      completed_at: enrollment.completed_at || null,
      assignmentsDue: enrollment.assignments_due || 0,
      price: enrollment.course?.price || 0,
      rating: enrollment.course?.rating || 0,
      bookmarked: enrollment.bookmarked || false,
    }));
  } catch (error) {
    console.warn('Error fetching enrolled courses:', error);
  }

  // Fetch user activities
  let activities = defaultData.activities;
  try {
    const activitiesResponse = await activityAPI.getUserActivities(userId);
    const activitiesData = activitiesResponse.data.results || activitiesResponse.data;
    activities = (Array.isArray(activitiesData) ? activitiesData : []).map((activity) => ({
      id: activity.id || 0,
      action: activity.details || 'No details available',
      date: activity.timestamp || new Date().toISOString(),
      course: activity.course?.title || null,
      type: activity.activity_type || 'unknown',
    }));
    console.log('Activities response:', activitiesResponse);
  } catch (error) {
    console.warn('Error fetching user activities:', error);
  }

  // Fetch certificates
  let certificates = defaultData.certificates;
  try {
    const certificatesResponse = await coursesAPI.getCertificates();
    certificates = (certificatesResponse.data || []).map((cert) => ({
      id: cert.id || 0,
      course: cert.enrollment?.course?.title || 'Unknown Course',
      date: cert.issued_at || new Date().toISOString(),
      code: cert.certificate_code || 'N/A',
    }));
  } catch (error) {
    console.warn('Error fetching certificates:', error);
  }

  // Fetch gamification data
  let gamification = defaultData.gamification;
  try {
    const pointsResponse = await coursesAPI.getLeaderboard();
    const badgesResponse = await coursesAPI.getBadges();
    gamification = {
      points: pointsResponse.data.results?.find((entry) => entry.user_id === student?.id)?.points || 0,
      badges: badgesResponse.data?.filter((badge) => badge.user_id === student?.id).map((badge) => badge.title || 'Unknown') || [],
      leaderboardRank: pointsResponse.data.results?.find((entry) => entry.user_id === student?.id)?.rank || 15,
    };
  } catch (error) {
    console.warn('Error fetching gamification data:', error);
  }

  // Fetch messages
  let messages = defaultData.messages;
  try {
    const messagesResponse = await messagingAPI.getMessages();
    messages = (messagesResponse.data.results || []).map((msg) => ({
      id: msg.id || 0,
      sender: msg.sender?.email || 'Unknown Sender',
      content: msg.content || 'No content',
      date: msg.date || new Date().toISOString(),
      read: msg.read || false,
      important: msg.important || false,
      course: msg.course?.title || null,
    }));
  } catch (error) {
    console.warn('Error fetching messages:', error);
  }

  // Fetch schedules
  let schedules = defaultData.schedules;
  try {
    const schedulesResponse = await scheduleAPI.getSchedules();
    schedules = (schedulesResponse.data.results || []).map((schedule) => ({
      id: schedule.id || 0,
      title: schedule.title || 'Untitled Schedule',
      date: schedule.start_time || new Date().toISOString(),
      time: schedule.start_time || new Date().toISOString(),
      instructor: schedule.instructor?.name || 'TBD',
      status: schedule.response_status || 'Pending',
      course: schedule.course?.title || null,
    }));
  } catch (error) {
    console.warn('Error fetching schedules:', error);
  }

  // Fetch assignments
  let assignments = defaultData.assignments;
  try {
    const assignmentsResponse = await coursesAPI.getAssignments();
    assignments = (assignmentsResponse.data.results || []).map((assignment) => ({
      id: assignment.id || 0,
      title: assignment.title || 'Untitled Assignment',
      course: assignment.course || 'Unknown Course',
      dueDate: assignment.due_date || new Date().toISOString(),
      status: assignment.status || 'Pending',
      grade: assignment.grade || null,
      feedback: assignment.feedback || null,
      type: assignment.type || 'Unknown',
    }));
  } catch (error) {
    console.warn('Error fetching assignments:', error);
  }

  // Fetch feedback history
  let feedbackHistory = defaultData.feedbackHistory;
  try {
    const feedbackResponse = await coursesAPI.getFeedback();
    feedbackHistory = (feedbackResponse.data.results || []).map((feedback) => ({
      id: feedback.id || 0,
      course: feedback.course || 'Unknown Course',
      type: feedback.type || 'Unknown',
      content: feedback.content || 'No content',
      rating: feedback.rating || 0,
      date: feedback.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn('Error fetching feedback history:', error);
  }

  // Fetch cart
  let cart = defaultData.cart;
  try {
    const cartResponse = await coursesAPI.getCart();
    cart = (cartResponse.data.results || []).map((item) => ({
      id: item.id || 0,
      course: item.course || 'Unknown Course',
      addedAt: item.added_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn('Error fetching cart:', error);
  }

  // Fetch wishlist
  let wishlist = defaultData.wishlist;
  try {
    const wishlistResponse = await coursesAPI.getWishlist();
    wishlist = (wishlistResponse.data.results || []).map((item) => ({
      id: item.id || 0,
      course: item.course || 'Unknown Course',
      addedAt: item.added_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn('Error fetching wishlist:', error);
  }

  // Fetch grades
  let grades = [];
  try {
    const gradesResponse = await coursesAPI.getGrades();
    grades = (gradesResponse.data.results || []).map((grade) => ({
      id: grade.id || 0,
      course: grade.course || 'Unknown Course',
      assignment: grade.assignment || 'Unknown Assignment',
      score: grade.score || 0,
      date: grade.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn('Error fetching grades:', error);
  }

  // Fetch analytics
  let analytics = defaultData.analytics;
  try {
    const analyticsResponse = await coursesAPI.getAnalytics();
    analytics = (analyticsResponse.data.results || []).reduce(
      (acc, curr) => ({
        timeSpent: {
          total: `${Math.floor(curr.total_time_spent / 60) || 0}h`,
          weekly: `${Math.floor(curr.weekly_time_spent / 60) || 0}h`,
        },
        strengths: curr.strengths || acc.strengths || ['Unknown'],
        weaknesses: curr.weaknesses || acc.weaknesses || ['Unknown'],
      }),
      { timeSpent: { total: '0h', weekly: '0h' }, strengths: ['Unknown'], weaknesses: ['Unknown'] }
    );
  } catch (error) {
    console.warn('Error fetching analytics:', error);
  }

  // Fetch payment history
  let paymentHistory = defaultData.paymentHistory;
  try {
    const paymentHistoryResponse = await paymentAPI.getSiteConfig();
    paymentHistory = (paymentHistoryResponse.data.transactions || []).map((txn) => ({
      id: txn.id || 0,
      course: txn.course?.title || 'N/A',
      amount: txn.amount || 0,
      currency: txn.currency || 'USD',
      date: txn.date || new Date().toISOString(),
      paymentMethod: txn.payment_method || 'Unknown',
      status: txn.status || 'Unknown',
    }));
  } catch (error) {
    console.warn('Error fetching payment history:', error);
  }

  // Calculate metrics
  const metrics = {
    enrolledCourses: enrolledCourses.length || 0,
    completedCourses: enrolledCourses.filter((course) => course.completed_at).length || 0,
    assignmentsDue: assignments.filter((a) => a.status !== 'submitted').length || 0,
    averageGrade: grades.length > 0 ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length : 0,
    learningHours: analytics.timeSpent.total ? parseInt(analytics.timeSpent.total) : 0,
    strongestModule: analytics.strengths[0] || 'Unknown',
    weakestModule: analytics.weaknesses[0] || 'Unknown',
  };

  return {
    student,
    metrics,
    enrolledCourses,
    assignments,
    messages,
    schedules,
    feedbackHistory,
    cart,
    wishlist,
    paymentHistory,
    certificates,
    gamification,
    activities,
    analytics,
  };
};

export const DashboardProvider = ({ user, authLoading, children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !user) return;
      setLoading(true);
      try {
        const data = await fetchDashboardData(user.id);
        setDashboardData(data);
      } catch (err) {
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, authLoading]);

  return (
    <DashboardContext.Provider value={{ dashboardData, setDashboardData, loading }}>
      {children}
    </DashboardContext.Provider>
  );
};
