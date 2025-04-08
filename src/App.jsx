import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseListings from './components/listings/BrowseListings';
import ListingDetails from './components/listings/ListingDetails';
import Navbar from './components/common/Navbar/Navbar';
import Footer from './components/common/Footer/Footer';
import AdminDashboard from './pages/dashboard/AdminDashboard/Admin';

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        {/* Static Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Listing Pages */}
        <Route path="/listings" element={<BrowseListings />} />
        <Route path="/listings/:id" element={<ListingDetails />} />

        {/* Admin Dashboard */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
