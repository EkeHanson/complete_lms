import React from 'react';
import {
  Paper, Typography, Box, Grid, Card, CardContent, List, ListItem, ListItemText,
  Divider, Avatar, Chip, Tooltip
} from '@mui/material';
import { School, People, Assignment, Quiz, Forum, Email, Phone, VerifiedUser } from '@mui/icons-material';
import { format } from 'date-fns';

const metricCards = [
  { key: 'courses', label: 'Courses', icon: <School color="primary" sx={{ fontSize: 32 }} /> },
  { key: 'students', label: 'Students', icon: <People color="primary" sx={{ fontSize: 32 }} /> },
  { key: 'pendingTasks', label: 'Pending Tasks', icon: <Assignment color="warning" sx={{ fontSize: 32 }} /> },
  { key: 'completionRate', label: 'Completion Rate', icon: <Quiz color="success" sx={{ fontSize: 32 }} /> },
  { key: 'upcomingEvents', label: 'Upcoming Events', icon: <Forum color="info" sx={{ fontSize: 32 }} /> },
];

const InstructorOverview = ({ instructor, metrics = {}, activities = [] }) => {
  const safeMetrics = {
    courses: metrics.courses || 0,
    students: metrics.students || 0,
    pendingTasks: metrics.pendingTasks || 0,
    completionRate: metrics.completionRate || 0,
    upcomingEvents: metrics.upcomingEvents || 0,
    ...metrics
  };

  const formattedDate =
    instructor.lastLogin && !isNaN(new Date(instructor.lastLogin))
      ? format(new Date(instructor.lastLogin), 'MMM dd, yyyy h:mm a')
      : 'N/A';

      // console.log("instructor")
      // console.log(instructor)
      // console.log("instructor")

  return (
    <Box>
      {/* Profile Card */}
      <Paper elevation={4} sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        bgcolor: '#f8fafc',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
      }}>
        <Avatar src={instructor.avatar} sx={{ width: 100, height: 100, mr: 3, border: '3px solid #1976d2' }} />
        <Box flex={1}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {instructor.name}
            {instructor.isActive && (
              <Tooltip title="Active Instructor">
                <VerifiedUser color="success" sx={{ ml: 1, fontSize: 28 }} />
              </Tooltip>
            )}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 18, mb: 1 }}>
            {instructor.department}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Chip icon={<Email />} label={instructor.email} variant="outlined" />
            {instructor.phone && <Chip icon={<Phone />} label={instructor.phone} variant="outlined" />}
          </Box>
          <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
            Last login: {formattedDate}
          </Typography>
        </Box>
      </Paper>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map(card => (
          <Grid item xs={12} sm={6} md={2.4} key={card.key}>
            <Card elevation={2} sx={{
              borderRadius: 3,
              textAlign: 'center',
              p: 2,
              bgcolor: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ mb: 1 }}>{card.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {card.key === 'completionRate'
                  ? `${safeMetrics[card.key]}%`
                  : safeMetrics[card.key]}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 15 }}>
                {card.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bio Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#f4f6fb' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>About</Typography>
        <Typography variant="body1" color="text.secondary">{instructor.bio || 'No bio provided.'}</Typography>
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: '#f4f6fb' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Activity</Typography>
        {activities.length === 0 ? (
          <Typography color="text.secondary">No recent activity.</Typography>
        ) : (
          <List>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id || index}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {activity.action}
                      </Typography>
                    }
                    secondary={
                      activity.date && !isNaN(new Date(activity.date))
                        ? (
                          <Typography variant="body2" color="text.secondary">
                            {activity.course} &nbsp;•&nbsp; {format(new Date(activity.date), 'MMM dd, yyyy h:mm a')}
                          </Typography>
                        )
                        : (
                          <Typography variant="body2" color="text.secondary">
                            {activity.course} &nbsp;•&nbsp; N/A
                          </Typography>
                        )
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default InstructorOverview;
