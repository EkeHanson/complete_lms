import React, { useState } from 'react';
import {
  Paper, Typography, Grid, Card, CardMedia, CardContent, Button, TextField,
  Table, TableBody, TableCell, TableHead, TableRow, Box, Divider, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import { Delete, Download, ShoppingCart, FavoriteBorder, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { format } from 'date-fns';
import { coursesAPI } from '../../../config';
import { useSnackbar } from 'notistack';

const accent = '#1976d2';

const StudentCartWishlist = ({ cart, wishlist, paymentHistory, setCart, setWishlist }) => {
  const [coupon, setCoupon] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // Loader states for bookmark and cart actions
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const [cartLoading, setCartLoading] = useState({});

  // Helper: always extract course ID for comparison
  const getCourseId = (item) => typeof item.course === 'object' ? item.course.id : item.course;

  // Helper: check if course is in wishlist/cart
  const isWishlisted = (courseId) =>
    Array.isArray(wishlist) && wishlist.some(item => getCourseId(item) === courseId);

  const isInCart = (courseId) =>
    Array.isArray(cart) && cart.some(item => getCourseId(item) === courseId);

  // Add/remove wishlist (bookmark) with loader
  const handleBookmark = async (courseId) => {
    setBookmarkLoading(prev => ({ ...prev, [courseId]: true }));
    try {
      if (isWishlisted(courseId)) {
        // Remove from wishlist
        const item = wishlist.find(w => getCourseId(w) === courseId);
        await coursesAPI.removeFromWishlist(item.id);
        setWishlist(wishlist.filter(w => getCourseId(w) !== courseId));
        enqueueSnackbar && enqueueSnackbar('Removed from wishlist', { variant: 'info' });
      } else {
        const res = await coursesAPI.addToWishlist({ course_id: courseId });
        setWishlist([...wishlist, res.data]);
        enqueueSnackbar && enqueueSnackbar('Added to wishlist', { variant: 'success' });
      }
    } catch (error) {
      let msg = 'An error occurred. Please try again.';
      if (error?.response?.data?.detail) {
        msg = error.response.data.detail;
      } else if (error?.message) {
        msg = error.message;
      }
      enqueueSnackbar && enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Add to cart with loader
  const handleAddToCart = async (courseId) => {
    if (isInCart(courseId)) {
      enqueueSnackbar && enqueueSnackbar('Already in cart', { variant: 'warning' });
      return;
    }
    setCartLoading(prev => ({ ...prev, [courseId]: true }));
    try {
      const res = await coursesAPI.addToCart({ course_id: courseId });
      setCart([...cart, res.data]);
      enqueueSnackbar && enqueueSnackbar('Added to cart', { variant: 'success' });
    } catch (error) {
      let msg = 'An error occurred. Please try again.';
      if (error?.response?.data?.detail) {
        msg = error.response.data.detail;
      } else if (error?.message) {
        msg = error.message;
      }
      enqueueSnackbar && enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setCartLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Remove from cart
  const handleRemoveFromCart = async (cartItemId) => {
    setCartLoading(prev => ({ ...prev, [cartItemId]: true }));
    try {
      await coursesAPI.removeFromCart(cartItemId);
      setCart(cart.filter(item => item.id !== cartItemId));
      enqueueSnackbar && enqueueSnackbar('Removed from cart', { variant: 'info' });
    } catch (error) {
      let msg = 'An error occurred. Please try again.';
      if (error?.response?.data?.detail) {
        msg = error.response.data.detail;
      } else if (error?.message) {
        msg = error.message;
      }
      enqueueSnackbar && enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setCartLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = async (wishlistItemId) => {
    setBookmarkLoading(prev => ({ ...prev, [wishlistItemId]: true }));
    try {
      await coursesAPI.removeFromWishlist(wishlistItemId);
      setWishlist(wishlist.filter(item => item.id !== wishlistItemId));
      enqueueSnackbar && enqueueSnackbar('Removed from wishlist', { variant: 'info' });
    } catch (error) {
      let msg = 'An error occurred. Please try again.';
      if (error?.response?.data?.detail) {
        msg = error.response.data.detail;
      } else if (error?.message) {
        msg = error.message;
      }
      enqueueSnackbar && enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [wishlistItemId]: false }));
    }
  };

  // Helper for price display
  const renderPrice = (course) => {
    if (!course) return null;
    if (course.discount_price && course.discount_price !== course.price) {
      return (
        <Box>
          <span style={{ color: '#ff6600', fontWeight: 700, fontSize: 17 }}>
            ₦{course.discount_price}
          </span>
          <span style={{
            textDecoration: 'line-through',
            color: '#888',
            marginLeft: 8,
            fontWeight: 500,
            fontSize: 15
          }}>
            ₦{course.price}
          </span>
        </Box>
      );
    }
    return (
      <span style={{ color: accent, fontWeight: 700, fontSize: 17 }}>
        ₦{course.price}
      </span>
    );
  };

  return (
    <Paper elevation={4} sx={{
      p: { xs: 2, md: 4 },
      borderRadius: 3,
      background: 'linear-gradient(135deg, #f9fafd 0%, #fce4ec 100%)',
      maxWidth: 1200,
      mx: 'auto',
      mt: 4
    }}>
      <Typography variant="h4" fontWeight={700} color={accent} gutterBottom align="center">
        <ShoppingCart sx={{ mr: 1, fontSize: 32, verticalAlign: 'middle' }} />
        My Cart & Wishlist
      </Typography>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Cart Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{
            background: '#fff',
            borderRadius: 2,
            boxShadow: 2,
            p: 2,
            minHeight: 350
          }}>
            <Typography variant="h6" fontWeight={600} color="#222" gutterBottom>
              Shopping Cart ({cart.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {cart.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
                Your cart is empty.
              </Typography>
            ) : cart.map(item => (
              <Card
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  border: '1px solid #ececec',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: 90,
                    height: 90,
                    objectFit: 'cover',
                    borderRadius: 2,
                    background: '#f7f7fa',
                    m: 1
                  }}
                  image={item.course?.thumbnail}
                  alt={item.course?.title}
                />
                <CardContent sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 180
                    }}
                  >
                    {item.course?.title}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{renderPrice(item.course)}</Box>
                </CardContent>
                <Tooltip title="Remove from cart">
                  <span>
                    <IconButton
                      color="error"
                      sx={{ mr: 1 }}
                      onClick={() => handleRemoveFromCart(item.id)}
                      disabled={!!cartLoading[item.id]}
                    >
                      {cartLoading[item.id] ? (
                        <CircularProgress size={22} thickness={5} color="error" />
                      ) : (
                        <Delete />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={isWishlisted(getCourseId(item)) ? "Remove from wishlist" : "Add to wishlist"}>
                  <span>
                    <IconButton
                      color="primary"
                      onClick={() => handleBookmark(getCourseId(item))}
                      disabled={!!bookmarkLoading[getCourseId(item)]}
                    >
                      {bookmarkLoading[getCourseId(item)] ? (
                        <CircularProgress size={22} thickness={5} color="primary" />
                      ) : isWishlisted(getCourseId(item)) ? (
                        <Bookmark />
                      ) : (
                        <BookmarkBorder />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Card>
            ))}
            <Box sx={{ mt: 3 }}>
              <TextField
                label="Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  background: accent,
                  boxShadow: 2,
                  py: 1.2,
                  fontSize: 18,
                  '&:hover': { background: '#1565c0' }
                }}
                disabled={cart.length === 0}
              >
                Checkout
              </Button>
            </Box>
          </Box>
        </Grid>
        {/* Wishlist Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{
            background: '#fff',
            borderRadius: 2,
            boxShadow: 2,
            p: 2,
            minHeight: 350
          }}>
            <Typography variant="h6" fontWeight={600} color="#222" gutterBottom>
              <FavoriteBorder sx={{ mr: 1, color: '#ff6600', verticalAlign: 'middle' }} />
              Wishlist ({wishlist.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {wishlist.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
                Your wishlist is empty.
              </Typography>
            ) : wishlist.map(item => (
              <Card
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  border: '1px solid #ececec',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: 90,
                    height: 90,
                    objectFit: 'cover',
                    borderRadius: 2,
                    background: '#f7f7fa',
                    m: 1
                  }}
                  image={item.course?.thumbnail}
                  alt={item.course?.title}
                />
                <CardContent sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 180
                    }}
                  >
                    {item.course?.title}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{renderPrice(item.course)}</Box>
                </CardContent>
                <Tooltip title="Remove from wishlist">
                  <span>
                    <IconButton
                      color="error"
                      sx={{ mr: 1 }}
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      disabled={!!bookmarkLoading[item.id]}
                    >
                      {bookmarkLoading[item.id] ? (
                        <CircularProgress size={22} thickness={5} color="error" />
                      ) : (
                        <Delete />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={isInCart(getCourseId(item)) ? "In cart" : "Add to cart"}>
                  <span>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        background: accent,
                        px: 2,
                        mr: 1,
                        '&:hover': { background: '#1565c0' }
                      }}
                      disabled={isInCart(getCourseId(item)) || !!cartLoading[getCourseId(item)]}
                      onClick={() => handleAddToCart(getCourseId(item))}
                    >
                      {cartLoading[getCourseId(item)] ? (
                        <CircularProgress size={20} thickness={5} color="inherit" />
                      ) : isInCart(getCourseId(item)) ? (
                        <>
                          <ShoppingCart sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                          In Cart
                        </>
                      ) : (
                        'Add to Cart'
                      )}
                    </Button>
                  </span>
                </Tooltip>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
      {/* Payment History Section */}
      <Box sx={{
        background: '#fff',
        borderRadius: 2,
        boxShadow: 2,
        p: 2,
        mt: 5
      }}>
        <Typography variant="h6" fontWeight={600} color="#222" gutterBottom>
          Payment History
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Invoice</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: '#888' }}>
                  No payment history yet.
                </TableCell>
              </TableRow>
            ) : paymentHistory.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{payment.course}</TableCell>
                <TableCell>₦{payment.amount}</TableCell>
                <TableCell>{format(new Date(payment.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Button startIcon={<Download />} variant="outlined" size="small">
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default StudentCartWishlist;