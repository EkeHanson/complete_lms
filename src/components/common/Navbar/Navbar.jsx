import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const navLinks = [
  { label: 'Courses', path: '/courses' },
  { label: 'Book a Class', path: '/book-class' },
  { label: 'About Us', path: '/about' }
];

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  const openProfileMenu = Boolean(profileMenuAnchor);
  const openMobileMenu = Boolean(mobileMenuAnchor);

  const handleOpenProfileMenu = (e) => setProfileMenuAnchor(e.currentTarget);
  const handleCloseProfileMenu = () => setProfileMenuAnchor(null);

  const handleOpenMobileMenu = (e) => setMobileMenuAnchor(e.currentTarget);
  const handleCloseMobileMenu = () => setMobileMenuAnchor(null);

  const renderProfileMenu = (
    <Menu
      anchorEl={profileMenuAnchor}
      open={openProfileMenu}
      onClose={handleCloseProfileMenu}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={handleCloseProfileMenu}>Profile</MenuItem>
      <MenuItem onClick={handleCloseProfileMenu}>My Account</MenuItem>
      <MenuItem onClick={handleCloseProfileMenu}>Logout</MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={openMobileMenu}
      onClose={handleCloseMobileMenu}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {navLinks.map(({ label, path }) => (
        <MenuItem key={label} component={Link} to={path} onClick={handleCloseMobileMenu}>
          {label}
        </MenuItem>
      ))}
      <MenuItem onClick={(e) => {
        handleCloseMobileMenu();
        handleOpenProfileMenu(e);
      }}>
        <IconButton size="large" color="inherit">
          <AccountCircle />
        </IconButton>
        <Typography variant="body1" sx={{ ml: 1 }}>Profile</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ height: 50 }} />
          </Link>

          {/* Desktop Menu */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navLinks.map(({ label, path }) => (
                <Button
                  key={label}
                  color="inherit"
                  component={Link}
                  to={path}
                >
                  {label}
                </Button>
              ))}
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleOpenProfileMenu}
              >
                <AccountCircle />
              </IconButton>
            </Box>
          ) : (
            // Mobile Hamburger
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleOpenMobileMenu}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {renderMobileMenu}
      {renderProfileMenu}
    </Box>
  );
};

export default Navbar;
