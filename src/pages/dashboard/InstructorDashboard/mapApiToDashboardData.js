// Maps the API response from /api/courses/instructors/me/ to the dummyData structure used in your dashboard

export function mapApiToDashboardData(apiData) {
  return {
    instructor: {
      name: `${apiData.user.first_name} ${apiData.user.last_name}`,
      email: apiData.user.email,
      bio: apiData.bio,
      avatar: apiData.user.avatar,
      department: apiData.department,
      lastLogin: apiData.last_login || '', // fallback if not present
      phone: apiData.user.phone || '',
      isActive: apiData.is_active,
    },
    metrics: {
      courses: apiData.courses?.length || 0,
      students: apiData.students?.length || 0,
      pendingTasks: apiData.assignments?.filter(a => !a.graded)?.length || 0,
      completionRate: apiData.analytics?.completions
        ? Math.round(
            (apiData.analytics.completions.reduce((acc, c) => acc + (c.completed || 0), 0) /
              (apiData.analytics.completions.reduce((acc, c) => acc + (c.total || 0), 0) || 1)) *
              100
          )
        : 0,
      upcomingEvents: apiData.schedule?.length || 0,
    },
    courses: (apiData.courses || []).map(course => ({
      id: course.id,
      title: course.title,
      category: course.category || '',
      status: course.status,
      students: course.num_students,
      thumbnail: course.thumbnail || '',
      lastUpdated: course.last_updated || '',
      modules: course.modules || [],
      prerequisites: course.prerequisites || [],
      versionHistory: course.versionHistory || [],
      description: course.description || '',
      start_date: course.start_date || '',
      end_date: course.end_date || '',
      ratings: course.ratings || 0,
      assignments: course.assignments || [],
      quizzes: course.quizzes || [],
    })),
    students: apiData.students || [],
    assignments: apiData.assignments || [],
    quizzes: apiData.quizzes || [],
    messages: apiData.messages || [],
    activities: apiData.activities || [],
    schedules: apiData.schedule || [],
    materials: apiData.materials || [],
    feedbackHistory: apiData.feedbackHistory || [],
    forums: apiData.forums || [],
    analytics: apiData.analytics || {},
    certifications: apiData.certifications || [],
    attendance: apiData.attendance || [],
    compliance: apiData.compliance || {},
  };
}