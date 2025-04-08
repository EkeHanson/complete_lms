import React from 'react';
import logo from '../../../assets/logo.png';
import { 
  Box, Container, Grid, Link, Typography, Button, 
  Divider, TextField, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Facebook, Twitter, LinkedIn, Instagram, YouTube,
  Email, Phone, LocationOn, ArrowRightAlt,
  Copyright
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const FooterBackground = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(255,255,255,0.1) 0%, transparent 30%)',
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.common.white,
    transform: 'translateX(4px)',
    textDecoration: 'none'
  }
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: 'rgba(255,255,255,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
    transform: 'translateY(-3px)'
  }
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Center', href: '/press' },
    { label: 'Become an Instructor', href: '/teach' }
  ];

  const resourceLinks = [
    { label: 'Blog', href: '/blog' },
    { label: 'Help Center', href: '/help' },
    { label: 'Tutorials', href: '/tutorials' },
    { label: 'Webinars', href: '/webinars' }
  ];

  const legalLinks = [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' }
  ];

  const contactInfo = [
    { icon: <Email fontSize="small" />, text: 'hello@learnly.com' },
    { icon: <Phone fontSize="small" />, text: '+1 (555) 123-4567' },
    { icon: <LocationOn fontSize="small" />, text: '123 Education Blvd, San Francisco, CA 94107' }
  ];

  return (
    <FooterBackground component="footer" sx={{ pt: 10, pb: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* Newsletter Column */}
          <Grid item xs={12} md={5}>
            <Typography variant="h4" sx={{ 
              mb: 3, 
              fontWeight: 700,
              background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.secondary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Stay Updated
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Subscribe to our newsletter for the latest courses, news, and special offers.
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Your email address"
                variant="outlined"
                size="small"
                InputProps={{
                  sx: {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: 'common.white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.4)'
                    }
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="secondary" 
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  whiteSpace: 'nowrap'
                }}
              >
                Subscribe
              </Button>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.8 }}>
              Follow us on social media:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <SocialIcon aria-label="Facebook">
                <Facebook />
              </SocialIcon>
              <SocialIcon aria-label="Twitter">
                <Twitter />
              </SocialIcon>
              <SocialIcon aria-label="LinkedIn">
                <LinkedIn />
              </SocialIcon>
              <SocialIcon aria-label="Instagram">
                <Instagram />
              </SocialIcon>
              <SocialIcon aria-label="YouTube">
                <YouTube />
              </SocialIcon>
            </Box>
          </Grid>

          {/* Links Columns */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={4}>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Company
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {companyLinks.map((link, index) => (
                    <li key={index} style={{ marginBottom: theme.spacing(1) }}>
                      <FooterLink href={link.href} underline="none">
                        <ArrowRightAlt fontSize="small" />
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Resources
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {resourceLinks.map((link, index) => (
                    <li key={index} style={{ marginBottom: theme.spacing(1) }}>
                      <FooterLink href={link.href} underline="none">
                        <ArrowRightAlt fontSize="small" />
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Legal
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {legalLinks.map((link, index) => (
                    <li key={index} style={{ marginBottom: theme.spacing(1) }}>
                      <FooterLink href={link.href} underline="none">
                        <ArrowRightAlt fontSize="small" />
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Contact
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {contactInfo.map((item, index) => (
                    <li key={index} style={{ 
                      marginBottom: theme.spacing(2),
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: theme.spacing(1)
                    }}>
                      <Box sx={{ 
                        color: theme.palette.secondary.light,
                        mt: '2px'
                      }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {item.text}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 6, 
          borderColor: 'rgba(255,255,255,0.1)',
          background: `linear-gradient(to right, transparent, ${theme.palette.secondary.light}, transparent)`,
          height: '1px'
        }} />

        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="img" 
                src={logo}
                alt="Learnly Logo"
                sx={{ height: 40 }}
              />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                <Copyright fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {new Date().getFullYear()} Learnly, Inc. All rights reserved.
              </Typography>
            </Box>
          </Grid>
          
          {!isMobile && (
            <Grid item>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Made with ❤️ for lifelong learners
              </Typography>
            </Grid>
          )}

          <Grid item>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              v{ '1.0.0'}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </FooterBackground>
  );
};

export default Footer;