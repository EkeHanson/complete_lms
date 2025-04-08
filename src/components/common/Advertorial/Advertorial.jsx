import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';

const Advertorial = () => {
  return (
    <Box sx={{ my: 4 }}>
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <CardMedia
          component="img"
          sx={{ width: { xs: '100%', md: '50%' }, height: { xs: 200, md: 'auto' } }}
          image="https://via.placeholder.com/600x400?text=Advertorial"
          alt="Advertorial"
        />
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography component="h3" variant="h5" gutterBottom>
            Featured Course
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Master the skills you need to advance your career with our premium courses.
          </Typography>
          <Typography variant="body1" paragraph>
            Join thousands of students who have transformed their careers with our expert-led courses. Limited time offer - enroll today and get 20% off!
          </Typography>
          <Button variant="contained" color="primary" size="large" sx={{ alignSelf: 'flex-start', mt: 2 }}>
            Learn More
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Advertorial;