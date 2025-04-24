import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Features  from './pages/Features';
import Login from './pages/Login';
import Signup from './pages/Signup';


import InstructorDashboard from './pages/dashboard/InstructorDashboard.jsx';
import InstructorDashboards from './pages/dashboard/InstructorDashboard/InstructorDashboard.jsx';


import StudentDashboard from './pages/dashboard/StudentDashboard.jsx';
import StudentDashboards from './pages/dashboard/StudentDashboard/Studentdashboard.jsx';


import BrowseListings from './components/listings/BrowseListings';
import ListingDetails from './components/listings/ListingDetails';
import AdminDashboard from './pages/dashboard/AdminDashboard/Admin';
import FeedbackForm from './pages/dashboard/AdminDashboard/QaulityAssuranceDashboard/IQAManagement/FeedbackForm.jsx'

import { CertificateProvider } from './contexts/CertificateContext';



import './App.css'

const queryClient = new QueryClient();


function App() {

  const theme = useTheme();

  return (
  
  // <AuthProvider>

    <QueryClientProvider client={queryClient}>
    <Router>
      <CertificateProvider>
      {/* <Navbar /> */}
      <Routes>
        {/* Static Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features theme={theme} />} />
        <Route path="/feedback-form" element={<FeedbackForm />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Listing Pages */}
        <Route path="/listings" element={<BrowseListings />} />
        <Route path="/listings/:id" element={<ListingDetails />} />

        {/* Instructor Dashboard */}
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
          <Route path="/trainer-dashboard" element={<InstructorDashboards />} />

        {/* Instructor Dashboard */}
          <Route path="/learner-dashboard" element={<StudentDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboards />} />

        {/* Admin Dashboard */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        
        
      </Routes>
      {/* <Footer /> */}
      </CertificateProvider>
    </Router>
    </QueryClientProvider>
  
    
    
  );
}

export default App;
