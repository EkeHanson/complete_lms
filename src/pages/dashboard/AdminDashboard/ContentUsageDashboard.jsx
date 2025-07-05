import React, { useState } from 'react';
import {
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  Assignment as RequestIcon,
  Refresh as RefreshIcon,
  ArrowForward as DetailsIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingIcon,
  SentimentDissatisfied as AbandonedIcon,
  ThumbUp as PositiveIcon,
  ThumbDown as NegativeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TablePagination } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import './ContentUsageDashboard.css';

const ContentUsageDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    activePages: { page: 0, rowsPerPage: 5 },
    popularSearches: { page: 0, rowsPerPage: 5 },
    abandonedCarts: { page: 0, rowsPerPage: 5 },
    customerFeedback: { page: 0, rowsPerPage: 5 },
    serviceRequests: { page: 0, rowsPerPage: 5 }
  });

  const dataSources = {
    activePages: [
      { id: 1, path: '/products/electronics', views: 1245, avgTime: '2:45', bounceRate: '32%' },
      { id: 2, path: '/home', views: 987, avgTime: '1:30', bounceRate: '45%' },
      { id: 3, path: '/products/fashion', views: 876, avgTime: '3:15', bounceRate: '28%' },
      { id: 4, path: '/blog/post-123', views: 654, avgTime: '4:20', bounceRate: '22%' },
      { id: 5, path: '/account/dashboard', views: 543, avgTime: '5:10', bounceRate: '18%' }
    ],
    popularSearches: [
      { id: 1, query: 'wireless headphones', count: 342, results: 45, noResults: false },
      { id: 2, query: 'summer dress', count: 287, results: 32, noResults: false },
      { id: 3, query: 'smartphone 2023', count: 198, results: 28, noResults: false },
      { id: 4, query: 'xys123zzz', count: 156, results: 0, noResults: true },
      { id: 5, query: 'home decor', count: 132, results: 56, noResults: false }
    ],
    abandonedCarts: [
      { id: 1, user: 'user123@example.com', items: 3, value: '$145.99', step: 'Payment', time: '15 min ago' },
      { id: 2, user: 'guest-4587', items: 1, value: '$49.99', step: 'Shipping', time: '32 min ago' },
      { id: 3, user: 'customer@example.com', items: 5, value: '$287.50', step: 'Cart', time: '1 hour ago' },
      { id: 4, user: 'guest-6721', items: 2, value: '$89.98', step: 'Payment', time: '2 hours ago' },
      { id: 5, user: 'user456@example.com', items: 1, value: '$24.99', step: 'Shipping', time: '3 hours ago' }
    ],
    customerFeedback: [
      { id: 1, user: 'happy_customer@example.com', type: 'Review', rating: 5, comment: 'Great product! Fast shipping.', date: '2023-06-15' },
      { id: 2, user: 'frustrated@example.com', type: 'Complaint', rating: 1, comment: 'Item arrived damaged', date: '2023-06-14' },
      { id: 3, user: 'neutral_user@example.com', type: 'Review', rating: 3, comment: 'Average quality, could be better', date: '2023-06-14' },
      { id: 4, user: 'support_case_4587', type: 'Support', rating: null, comment: 'Need help with return process', date: '2023-06-13' },
      { id: 5, user: 'loyal_customer@example.com', type: 'Review', rating: 4, comment: 'Good value for money', date: '2023-06-12' }
    ],
    serviceRequests: [
      { id: 1, requestId: 'SR-4587', type: 'Installation', status: 'Completed', date: '2023-06-15', assigned: 'Tech Team A' },
      { id: 2, requestId: 'SR-4588', type: 'Repair', status: 'In Progress', date: '2023-06-14', assigned: 'Tech Team B' },
      { id: 3, requestId: 'SR-4589', type: 'Consultation', status: 'Pending', date: '2023-06-14', assigned: 'Sales Team' },
      { id: 4, requestId: 'SR-4590', type: 'Maintenance', status: 'Scheduled', date: '2023-06-13', assigned: 'Tech Team A' },
      { id: 5, requestId: 'SR-4591', type: 'Installation', status: 'Completed', date: '2023-06-12', assigned: 'Tech Team C' }
    ]
  };

  const recentActivity = [
    { id: 1, type: 'Review', description: 'New 5-star review received', secondary: '15 minutes ago - "Great service!"', icon: <PositiveIcon />, bgColor: '#e6fffa' },
    { id: 2, type: 'Cart', description: 'Cart abandoned at payment', secondary: '1 hour ago - Value: $145.99', icon: <CartIcon />, bgColor: '#fff7e6' },
    { id: 3, type: 'Complaint', description: 'Customer complaint received', secondary: '2 hours ago - Damaged item', icon: <NegativeIcon />, bgColor: '#fee2e2' },
    { id: 4, type: 'Search', description: 'Popular search with no results', secondary: '3 hours ago - "xys123zzz"', icon: <SearchIcon />, bgColor: '#f3f0fd' }
  ];

  const pageViewsData = [
    { name: 'Products', value: 45 },
    { name: 'Home', value: 25 },
    { name: 'Blog', value: 15 },
    { name: 'Account', value: 10 },
    { name: 'Other', value: 5 }
  ];

  const searchTrendsData = [
    { name: 'Mon', count: 400 },
    { name: 'Tue', count: 300 },
    { name: 'Wed', count: 600 },
    { name: 'Thu', count: 200 },
    { name: 'Fri', count: 500 },
    { name: 'Sat', count: 800 },
    { name: 'Sun', count: 700 }
  ];

  const COLORS = ['#7226FF', '#F042FF', '#00C49F', '#FFBB28', '#8884D8'];

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleDateChange = (newValue, index) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const handleFollowUp = (id) => {
    console.log(`Following up on item ${id}`);
  };

  const statusColorClass = (status) => {
    switch (status) {
      case 'Completed': return 'cud-status-completed';
      case 'In Progress': return 'cud-status-active';
      case 'Pending': return 'cud-status-pending';
      case 'Scheduled': return 'cud-status-active';
      default: return '';
    }
  };

  const feedbackColorClass = (type) => {
    switch (type) {
      case 'Review': return 'cud-status-active';
      case 'Complaint': return 'cud-status-rejected';
      case 'Support': return 'cud-status-pending';
      default: return '';
    }
  };

  const getPaginatedData = (dataKey) => {
    const { page, rowsPerPage } = pagination[dataKey];
    const data = dataSources[dataKey];
    const filteredData = data.filter(item =>
      Object.values(item).some(val =>
        val && val.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    const startIndex = page * rowsPerPage;
    return {
      data: filteredData.slice(startIndex, startIndex + rowsPerPage),
      total: filteredData.length
    };
  };

  const handleChangePage = (dataKey, event, newPage) => {
    setPagination(prev => ({
      ...prev,
      [dataKey]: { ...prev[dataKey], page: newPage }
    }));
  };

  const handleChangeRowsPerPage = (dataKey, event) => {
    setPagination(prev => ({
      ...prev,
      [dataKey]: { ...prev[dataKey], rowsPerPage: parseInt(event.target.value, 10), page: 0 }
    }));
  };

  const renderPagination = (dataKey) => {
    const { total } = getPaginatedData(dataKey);
    const { page, rowsPerPage } = pagination[dataKey];
    return (
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => handleChangePage(dataKey, e, newPage)}
        onRowsPerPageChange={(e) => handleChangeRowsPerPage(dataKey, e)}
      />
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="cud-container">
        <div className="cud-content-wrapper">
          <div className="cud-main">
            <div className="cud-header">
              <h1>
                <AnalyticsIcon />
                Content & Usage Analytics
              </h1>
              <button className="cud-btn cud-btn-refresh">
                <RefreshIcon />
                Refresh Data
              </button>
            </div>

            <div className="cud-cards">
              <div className="cud-card">
                <span className="cud-card-title">Page Views (24h)</span>
                <div className="cud-card-content">
                  <TrendingIcon />
                  <h3>12,456</h3>
                </div>
              </div>
              <div className="cud-card">
                <span className="cud-card-title">Unique Searches</span>
                <div className="cud-card-content">
                  <SearchIcon />
                  <h3>2,187</h3>
                </div>
              </div>
              <div className="cud-card">
                <span className="cud-card-title">Abandoned Carts</span>
                <div className="cud-card-content">
                  <AbandonedIcon />
                  <h3>42</h3>
                </div>
              </div>
              <div className="cud-card">
                <span className="cud-card-title">Avg. Rating</span>
                <div className="cud-card-content">
                  <StarIcon />
                  <h3>4.2</h3>
                </div>
              </div>
              <div className="cud-card">
                <span className="cud-card-title">Open Requests</span>
                <div className="cud-card-content">
                  <RequestIcon />
                  <h3>18</h3>
                </div>
              </div>
              <div className="cud-card">
                <span className="cud-card-title">Conversion Rate</span>
                <div className="cud-card-content">
                  <PositiveIcon />
                  <h3>3.8%</h3>
                </div>
              </div>
            </div>

            <div className="cud-charts">
              <div className="cud-chart-card">
                <h4>PAGE VIEWS DISTRIBUTION</h4>
                <div className="cud-chart-container">
                  <ResponsiveContainer width="90%" height={300}>
                    <PieChart>
                      <Pie
                        data={pageViewsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pageViewsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#6251a4' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="cud-chart-card">
                <h4>SEARCH TRENDS (LAST 7 DAYS)</h4>
                <div className="cud-chart-container">
                  <ResponsiveContainer width="90%" height={300}>
                    <BarChart data={searchTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e3defc" />
                      <XAxis dataKey="name" tick={{ fill: '#6251a4', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6251a4', fontSize: 12 }} />
                      <Bar dataKey="count" fill="#7226FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="cud-main-content">
              <div className="cud-tabs">
                <button className={`cud-tab ${tabValue === 0 ? 'active' : ''}`} onClick={() => handleTabChange(0)}>
                  <TrendingIcon />
                  Active Pages
                </button>
                <button className={`cud-tab ${tabValue === 1 ? 'active' : ''}`} onClick={() => handleTabChange(1)}>
                  <SearchIcon />
                  Popular Searches
                </button>
                <button className={`cud-tab ${tabValue === 2 ? 'active' : ''}`} onClick={() => handleTabChange(2)}>
                  <CartIcon />
                  Abandoned Carts
                </button>
                <button className={`cud-tab ${tabValue === 3 ? 'active' : ''}`} onClick={() => handleTabChange(3)}>
                  <StarIcon />
                  Customer Feedback
                </button>
                <button className={`cud-tab ${tabValue === 4 ? 'active' : ''}`} onClick={() => handleTabChange(4)}>
                  <RequestIcon />
                  Service Requests
                </button>
              </div>

              <div className="cud-filter-bar">
                <div className="cud-search-input">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="cud-date-filter">
                  <CalendarIcon />
                  <DatePicker
                    label="From"
                    value={dateRange[0]}
                    onChange={(newValue) => handleDateChange(newValue, 0)}
                    renderInput={(params) => (
                      <input
                        className="cud-date-input"
                        value={params.inputProps.value}
                        onChange={params.inputProps.onChange}
                        placeholder="From"
                      />
                    )}
                  />
                  <span>-</span>
                  <DatePicker
                    label="To"
                    value={dateRange[1]}
                    onChange={(newValue) => handleDateChange(newValue, 1)}
                    renderInput={(params) => (
                      <input
                        className="cud-date-input"
                        value={params.inputProps.value}
                        onChange={params.inputProps.onChange}
                        placeholder="To"
                      />
                    )}
                  />
                </div>
                <button className="cud-btn cud-btn-filter">
                  <FilterIcon />
                  Filters
                </button>
              </div>

              <div className="cud-table-container">
                {tabValue === 0 && (
                  <>
                    <table className="cud-table">
                      <thead>
                        <tr>
                          <th><span>Page Path</span></th>
                          <th><span>Views</span></th>
                          <th><span>Avg. Time</span></th>
                          <th><span>Bounce Rate</span></th>
                          <th><span>Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData('activePages').data.map((row) => (
                          <tr key={row.id}>
                            <td>{row.path}</td>
                            <td>{row.views}</td>
                            <td>{row.avgTime}</td>
                            <td>{row.bounceRate}</td>
                            <td>
                              <button className="cud-btn cud-btn-action" title="View details">
                                <DetailsIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {renderPagination('activePages')}
                  </>
                )}
                {tabValue === 1 && (
                  <>
                    <table className="cud-table">
                      <thead>
                        <tr>
                          <th><span>Search Query</span></th>
                          <th><span>Count</span></th>
                          <th><span>Results Found</span></th>
                          <th><span>Status</span></th>
                          <th><span>Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData('popularSearches').data.map((row) => (
                          <tr key={row.id}>
                            <td>{row.query}</td>
                            <td>{row.count}</td>
                            <td>{row.results}</td>
                            <td>
                              <span className={`cud-status ${row.noResults ? 'cud-status-rejected' : 'cud-status-completed'}`}>
                                {row.noResults ? 'No Results' : 'Results Found'}
                              </span>
                            </td>
                            <td>
                              <button className="cud-btn cud-btn-action" title="View details">
                                <DetailsIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {renderPagination('popularSearches')}
                  </>
                )}
                {tabValue === 2 && (
                  <>
                    <table className="cud-table">
                      <thead>
                        <tr>
                          <th><span>User</span></th>
                          <th><span>Items</span></th>
                          <th><span>Value</span></th>
                          <th><span>Abandoned At</span></th>
                          <th><span>Time</span></th>
                          <th><span>Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData('abandonedCarts').data.map((row) => (
                          <tr key={row.id}>
                            <td>{row.user}</td>
                            <td>{row.items}</td>
                            <td>{row.value}</td>
                            <td>{row.step}</td>
                            <td>{row.time}</td>
                            <td>
                              <button
                                className="cud-btn cud-btn-action cud-btn-follow-up"
                                title="Follow up"
                                onClick={() => handleFollowUp(row.id)}
                              >
                                <DetailsIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {renderPagination('abandonedCarts')}
                  </>
                )}
                {tabValue === 3 && (
                  <>
                    <table className="cud-table">
                      <thead>
                        <tr>
                          <th><span>User</span></th>
                          <th><span>Type</span></th>
                          <th><span>Rating</span></th>
                          <th><span>Comment</span></th>
                          <th><span>Date</span></th>
                          <th><span>Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData('customerFeedback').data.map((row) => (
                          <tr key={row.id}>
                            <td>{row.user}</td>
                            <td>
                              <span className={`cud-status ${feedbackColorClass(row.type)}`}>
                                {row.type}
                              </span>
                            </td>
                            <td>
                              {row.rating && (
                                <div className="cud-rating">
                                  <StarIcon />
                                  <span>{row.rating}</span>
                                </div>
                              )}
                            </td>
                            <td className="cud-comment">{row.comment}</td>
                            <td>{row.date}</td>
                            <td>
                              <button className="cud-btn cud-btn-action" title="View details">
                                <DetailsIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {renderPagination('customerFeedback')}
                  </>
                )}
                {tabValue === 4 && (
                  <>
                    <table className="cud-table">
                      <thead>
                        <tr>
                          <th><span>Request ID</span></th>
                          <th><span>Type</span></th>
                          <th><span>Status</span></th>
                          <th><span>Date</span></th>
                          <th><span>Assigned To</span></th>
                          <th><span>Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData('serviceRequests').data.map((row) => (
                          <tr key={row.id}>
                            <td>{row.requestId}</td>
                            <td>{row.type}</td>
                            <td>
                              <span className={`cud-status ${statusColorClass(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                            <td>{row.date}</td>
                            <td>{row.assigned}</td>
                            <td>
                              <button className="cud-btn cud-btn-action" title="View details">
                                <DetailsIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {renderPagination('serviceRequests')}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="cud-sidebar">
            <h3>Recent User Activity</h3>
            <div className="cud-activity-list">
              {recentActivity.map((item) => (
                <div key={item.id} className="cud-activity-item">
                  <div className="cud-activity-icon" style={{ backgroundColor: item.bgColor }}>
                    {item.icon}
                  </div>
                  <div className="cud-activity-text">
                    <span>{item.description}</span>
                    <span className="cud-text-secondary">{item.secondary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default ContentUsageDashboard;