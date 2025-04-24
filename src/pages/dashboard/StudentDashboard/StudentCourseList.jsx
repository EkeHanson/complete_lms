import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardMedia, CardContent, Button, LinearProgress, IconButton } from '@mui/material';
import { PlayCircle, Bookmark, BookmarkBorder, RateReview, Search  } from '@mui/icons-material';

const StudentCourseList = ({ courses, onFeedback }) => {
  const [bookmarks, setBookmarks] = useState(courses.map(course => course.bookmarked));

  const handleBookmark = (index) => {
    const newBookmarks = [...bookmarks];
    newBookmarks[index] = !newBookmarks[index];
    setBookmarks(newBookmarks);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">My Courses</Typography>
        <Button variant="outlined" startIcon={<Search />}>
          Find New Courses
        </Button>
      </Box>

      <Grid container spacing={3}>
        {courses.map((course, index) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia component="img" height="140" image={course.thumbnail} alt={course.title} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">{course.title}</Typography>
                <Typography variant="body2" color="text.secondary">Instructor: {course.instructor}</Typography>
                <Typography variant="body2" color="text.secondary">Rating: {course.rating} / 5</Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <LinearProgress variant="determinate" value={course.progress} sx={{ width: '100%', mr: 2, height: 8 }} />
                  <Typography variant="body2">{course.progress}%</Typography>
                </Box>
                <Typography variant="body2">{course.assignmentsDue} {course.assignmentsDue === 1 ? 'assignment' : 'assignments'} due</Typography>
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button size="small" startIcon={<PlayCircle />} href={`/course/${course.id}`}>
                  Continue
                </Button>
                <Box>
                  <IconButton onClick={() => handleBookmark(index)}>
                    {bookmarks[index] ? <Bookmark color="primary" /> : <BookmarkBorder />}
                  </IconButton>
                  <Button size="small" startIcon={<RateReview />} onClick={() => onFeedback(course, 'course')}>
                    Feedback
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default StudentCourseList;