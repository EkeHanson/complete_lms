import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  CalendarToday as CalendarIcon, Person as PersonIcon,
  Group as GroupIcon, MoreVert as MoreIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon, Check as CheckIcon,
  Close as CloseIcon, Schedule as ScheduleIcon, Search as SearchIcon,
  ArrowForward as ArrowForwardIcon, Refresh as RefreshIcon,
  Videocam as VideocamIcon, Groups as TeamsIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO, isBefore } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { scheduleAPI, groupsAPI, userAPI } from '../../../config';
import { debounce } from 'lodash';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar, 
  Tooltip, Link, Chip, Autocomplete, Checkbox, FormControlLabel, 
  FormGroup, Divider, useMediaQuery, IconButton, Stack, 
  Collapse, Card, CardContent, CardActions, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, TablePagination, Grid,
  LinearProgress, CircularProgress, Badge,
} from '@mui/material';
import './Schedule.css';

const responseOptions = [
  { value: 'pending', label: 'Pending', color: '#6251a4' },
  { value: 'accepted', label: 'Accepted', color: '#065f46' },
  { value: 'declined', label: 'Declined', color: '#991b1b' },
  { value: 'tentative', label: 'Tentative', color: '#d97706' },
];

const Schedule = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [expandedSchedule, setExpandedSchedule] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: null,
    dateTo: null,
    showPast: false
  });

  const { lastMessage, sendMessage } = useWebSocket(
    `ws://${window.location.host}/ws/schedules/`
  );

  const generateGoogleCalendarLink = (schedule) => {
    const startTime = new Date(schedule.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = new Date(schedule.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const title = `&text=${encodeURIComponent(schedule.title || '')}`;
    const dates = `&dates=${startTime}/${endTime}`;
    const details = `&details=${encodeURIComponent(schedule.description || '')}`;
    const location = `&location=${encodeURIComponent(schedule.location || '')}`;
    return `${baseUrl}${title}${dates}${details}${location}`;
  };

  const truncateUrl = (url, maxLength = 30) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      let displayUrl = urlObj.hostname.replace('www.', '');
      if (urlObj.hostname.includes('meet.google.com')) return 'Google Meet';
      if (urlObj.hostname.includes('teams.microsoft.com')) return 'Microsoft Teams';
      if (urlObj.hostname.includes('zoom.us')) return 'Zoom Meeting';
      if (displayUrl.length + urlObj.pathname.length <= maxLength) {
        return `${displayUrl}${urlObj.pathname}`;
      }
      return displayUrl;
    } catch {
      return url.length <= maxLength ? url : `${url.substring(0, maxLength - 3)}...`;
    }
  };

  const getPlatformIcon = (url) => {
    if (!url) return <VideocamIcon className="sch-icon" />;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('meet.google.com')) {
        return <VideocamIcon className="sch-icon sch-icon-google" />;
      }
      if (urlObj.hostname.includes('teams.microsoft.com')) {
        return <TeamsIcon className="sch-icon sch-icon-teams" />;
      }
      if (urlObj.hostname.includes('zoom.us')) {
        return <VideocamIcon className="sch-icon sch-icon-zoom" />;
      }
    } catch {
      // Fallback
    }
    return <VideocamIcon className="sch-icon" />;
  };

  const fetchUsers = useCallback(async (searchQuery = '') => {
    try {
      const params = { search: searchQuery, page_size: 50 };
      const usersRes = await userAPI.getUsers(params);
      setUsers(usersRes.data.results || []);
    } catch (error) {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
      console.error('Error fetching users:', error);
    }
  }, [enqueueSnackbar]);

  const debouncedFetchUsers = useCallback(
    debounce((query) => fetchUsers(query), 300),
    [fetchUsers]
  );

  const handleUserSearch = (event, value) => {
    setUserSearchQuery(value);
    debouncedFetchUsers(value);
  };

  const fetchGroups = useCallback(async (searchQuery = '') => {
    try {
      const params = { search: searchQuery, page_size: 50 };
      const groupsRes = await groupsAPI.getGroups(params);
      setFilteredGroups(groupsRes.data.results || []);
    } catch (error) {
      enqueueSnackbar('Failed to load groups', { variant: 'error' });
      console.error('Error fetching groups:', error);
    }
  }, [enqueueSnackbar]);

  const debouncedFetchGroups = useCallback(
    debounce((query) => fetchGroups(query), 300),
    [fetchGroups]
  );

  const handleGroupSearch = (event, value) => {
    setGroupSearchQuery(value);
    debouncedFetchGroups(value);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: rowsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { date_from: format(filters.dateFrom, 'yyyy-MM-dd') }),
        ...(filters.dateTo && { date_to: format(filters.dateTo, 'yyyy-MM-dd') }),
        show_past: filters.showPast
      };
      const [schedulesRes, groupsRes] = await Promise.all([
        scheduleAPI.getSchedules(params),
        groupsAPI.getGroups({ page_size: 50 })
      ]);
      setSchedules(schedulesRes.data.results || []);
      setGroups(groupsRes.data.results || []);
      setFilteredGroups(groupsRes.data.results || []);
      setPagination({
        count: schedulesRes.data.count || 0,
        next: schedulesRes.data.next,
        previous: schedulesRes.data.previous,
        page: pagination.page
      });
      await fetchUsers('');
    } catch (error) {
      setError(error.message);
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, rowsPerPage, filters]);

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'new_schedule') {
        if (pagination.page === 1) {
          setSchedules(prev => [data.schedule, ...prev.slice(0, -1)]);
          setPagination(prev => ({ ...prev, count: prev.count + 1 }));
        } else {
          setPagination(prev => ({ ...prev, count: prev.count + 1 }));
        }
      } else if (data.type === 'schedule_updated') {
        setSchedules(prev => prev.map(s => s.id === data.schedule.id ? data.schedule : s));
      } else if (data.type === 'schedule_deleted') {
        setSchedules(prev => prev.filter(s => s.id !== data.schedule_id));
        setPagination(prev => ({ ...prev, count: prev.count - 1 }));
      } else if (data.type === 'schedule_response') {
        setSchedules(prev => prev.map(s => {
          if (s.id === data.schedule_id) {
            const updatedParticipants = s.participants.map(p =>
              p.user?.id === data.user_id ? { ...p, response_status: data.response_status } : p
            );
            return { ...s, participants: updatedParticipants };
          }
          return s;
        }));
      }
    }
  }, [lastMessage, pagination.page]);

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMM d, yyyy - h:mm a');
  };

  const isPastEvent = (schedule) => {
    return isBefore(parseISO(schedule.end_time), new Date());
  };

  const handleOpenDialog = (schedule = null) => {
    const defaultSchedule = {
      title: '',
      description: '',
      start_time: new Date(),
      end_time: new Date(Date.now() + 3600000),
      location: '',
      is_all_day: false
    };
    if (schedule) {
      setCurrentSchedule({
        ...schedule,
        start_time: parseISO(schedule.start_time),
        end_time: parseISO(schedule.end_time)
      });
      setSelectedUsers(schedule.participants.filter(p => p.user).map(p => ({
        id: p.user.id,
        email: p.user.email,
        first_name: p.user.first_name,
        last_name: p.user.last_name
      })));
      setSelectedGroups(schedule.participants.filter(p => p.group).map(p => ({
        id: p.group.id,
        name: p.group.name
      })));
    } else {
      setCurrentSchedule(defaultSchedule);
      setSelectedUsers([]);
      setSelectedGroups([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSchedule(null);
    setSelectedUsers([]);
    setSelectedGroups([]);
  };

  const handleSaveSchedule = async () => {
    try {
      const formData = {
        title: currentSchedule.title,
        description: currentSchedule.description,
        start_time: currentSchedule.start_time.toISOString(),
        end_time: currentSchedule.end_time.toISOString(),
        location: currentSchedule.location,
        is_all_day: currentSchedule.is_all_day,
        participant_users: selectedUsers.map(user => user.id),
        participant_groups: selectedGroups.map(group => group.id)
      };
      const response = currentSchedule.id
        ? await scheduleAPI.updateSchedule(currentSchedule.id, formData)
        : await scheduleAPI.createSchedule(formData);
      setSnackbar({
        open: true,
        message: currentSchedule.id ? 'Schedule updated successfully!' : 'Schedule created successfully!',
        severity: 'success'
      });
      fetchData();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving schedule',
        severity: 'error'
      });
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await scheduleAPI.deleteSchedule(id);
      setSnackbar({
        open: true,
        message: 'Schedule deleted successfully!',
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting schedule',
        severity: 'error'
      });
    }
  };

  const handleRespondToSchedule = async (scheduleId, response) => {
    try {
      await scheduleAPI.respondToSchedule(scheduleId, response);
      setSnackbar({
        open: true,
        message: `Response "${response}" recorded!`,
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error recording response',
        severity: 'error'
      });
    }
  };

  const handleRemoveParticipant = (participantToRemove) => {
    if (participantToRemove.email) {
      setSelectedUsers(selectedUsers.filter(user => user.id !== participantToRemove.id));
    } else {
      setSelectedGroups(selectedGroups.filter(group => group.id !== participantToRemove.id));
    }
  };

  const toggleExpandSchedule = (scheduleId) => {
    setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      dateFrom: null,
      dateTo: null,
      showPast: false
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getResponseColor = (responseStatus) => {
    const option = responseOptions.find(opt => opt.value === responseStatus);
    return option ? option.color : '#6251a4';
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderUserAutocomplete = () => (
    <div className="sch-form-field sch-form-field-full">
      <label>Select Users</label>
      <div className="sch-autocomplete">
        <div className="sch-search-input">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search users"
            value={userSearchQuery}
            onChange={(e) => handleUserSearch(null, e.target.value)}
          />
        </div>
        <div className="sch-autocomplete-options">
          {users.map((option) => (
            <div
              key={option.id}
              className={`sch-autocomplete-option ${selectedUsers.some(u => u.id === option.id) ? 'selected' : ''}`}
              onClick={() => {
                if (selectedUsers.some(u => u.id === option.id)) {
                  handleRemoveParticipant(option);
                } else {
                  setSelectedUsers([...selectedUsers, option]);
                }
              }}
            >
              <div>{`${option.first_name} ${option.last_name} (${option.email})`}</div>
              {selectedUsers.some(u => u.id === option.id) && <CheckIcon />}
            </div>
          ))}
        </div>
        <div className="sch-chip-container">
          {selectedUsers.map((option, index) => (
            <span key={option.id} className="sch-chip">
              <PersonIcon />
              {`${option.first_name} ${option.last_name}`}
              <button onClick={() => handleRemoveParticipant(option)}>
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGroupAutocomplete = () => (
    <div className="sch-form-field sch-form-field-full">
      <label>Select Groups</label>
      <div className="sch-autocomplete">
        <div className="sch-search-input">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search groups"
            value={groupSearchQuery}
            onChange={(e) => handleGroupSearch(null, e.target.value)}
          />
        </div>
        <div className="sch-autocomplete-options">
          {filteredGroups.map((option) => (
            <div
              key={option.id}
              className={`sch-autocomplete-option ${selectedGroups.some(g => g.id === option.id) ? 'selected' : ''}`}
              onClick={() => {
                if (selectedGroups.some(g => g.id === option.id)) {
                  handleRemoveParticipant(option);
                } else {
                  setSelectedGroups([...selectedGroups, option]);
                }
              }}
            >
              <div>{option.name}</div>
              {selectedGroups.some(g => g.id === option.id) && <CheckIcon />}
            </div>
          ))}
        </div>
        <div className="sch-chip-container">
          {selectedGroups.map((option, index) => (
            <span key={option.id} className="sch-chip">
              <GroupIcon />
              {option.name}
              <button onClick={() => handleRemoveParticipant(option)}>
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMobileScheduleCards = () => (
    <div className="sch-card-container">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="sch-card">
          <div className="sch-card-header">
            <div className="sch-card-title">
              {isPastEvent(schedule) ? (
                <EventBusyIcon className="sch-icon sch-icon-error" />
              ) : (
                <EventAvailableIcon className="sch-icon sch-icon-primary" />
              )}
              <span>{schedule.title}</span>
            </div>
            <button
              className="sch-btn sch-btn-expand"
              onClick={() => toggleExpandSchedule(schedule.id)}
            >
              {expandedSchedule === schedule.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
          </div>
          <div className="sch-card-content">
            <span className="sch-text-secondary">
              {formatDate(schedule.start_time)} - {formatDate(schedule.end_time)}
            </span>
            {expandedSchedule === schedule.id && (
              <div className="sch-card-expanded">
                <p>{schedule.description}</p>
                {schedule.location && (
                  <div className="sch-location">
                    {getPlatformIcon(schedule.location)}
                    <span>{truncateUrl(schedule.location)}</span>
                    <button
                      className="sch-btn sch-btn-icon"
                      onClick={() => window.open(schedule.location, '_blank')}
                    >
                      <ArrowForwardIcon />
                    </button>
                  </div>
                )}
                <div className="sch-participants">
                  <span>Participants:</span>
                  <div className="sch-chip-container">
                    {schedule.participants.map((participant, i) => (
                      <span
                        key={i}
                        className="sch-chip"
                        style={{ backgroundColor: `${getResponseColor(participant.response_status)}20` }}
                      >
                        {participant.group ? <GroupIcon /> : <PersonIcon />}
                        {participant.user
                          ? `${participant.user.first_name} ${participant.user.last_name}`
                          : participant.group.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sch-response">
                  <span>Your Response:</span>
                  <div className="sch-response-btns">
                    {responseOptions.map((option) => (
                      <button
                        key={option.value}
                        className="sch-btn sch-btn-response"
                        style={{ borderColor: option.color, color: option.color }}
                        onClick={() => handleRespondToSchedule(schedule.id, option.value)}
                      >
                        {option.value === 'accepted' && <CheckIcon />}
                        {option.value === 'declined' && <CloseIcon />}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="sch-btn sch-btn-primary sch-btn-full"
                  onClick={() => window.open(generateGoogleCalendarLink(schedule), '_blank')}
                >
                  <CalendarIcon />
                  Add to Google Calendar
                </button>
              </div>
            )}
          </div>
          <div className="sch-card-actions">
            <div>
              <button
                className="sch-btn sch-btn-secondary"
                onClick={() => window.open(generateGoogleCalendarLink(schedule), '_blank')}
              >
                <CalendarIcon />
                Add to Google
              </button>
              <button
                className="sch-btn sch-btn-secondary"
                onClick={() => handleOpenDialog(schedule)}
              >
                <EditIcon />
                Edit
              </button>
            </div>
            <button
              className="sch-btn sch-btn-error"
              onClick={() => handleDeleteSchedule(schedule.id)}
            >
              <DeleteIcon />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDesktopScheduleTable = () => (
    <div className="sch-table-container">
      <table className="sch-table">
        <thead>
          <tr>
            <th><span>Title</span></th>
            <th><span>Time</span></th>
            <th><span>Location</span></th>
            <th><span>Participants</span></th>
            <th><span>Your Response</span></th>
            <th><span>Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <React.Fragment key={schedule.id}>
              <tr
                className={expandedSchedule === schedule.id ? 'expanded' : ''}
                onClick={() => toggleExpandSchedule(schedule.id)}
              >
                <td>
                  <div className="sch-table-cell">
                    {isPastEvent(schedule) ? (
                      <EventBusyIcon className="sch-icon sch-icon-error" />
                    ) : (
                      <EventAvailableIcon className="sch-icon sch-icon-primary" />
                    )}
                    <span style={{ fontWeight: isPastEvent(schedule) ? 'normal' : '600' }}>
                      {schedule.title}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="sch-text-secondary">
                    {formatDate(schedule.start_time)} - {formatDate(schedule.end_time)}
                  </span>
                </td>
                <td>
                  {schedule.location && (
                    <div className="sch-table-cell">
                      {getPlatformIcon(schedule.location)}
                      <a href={schedule.location} target="_blank" rel="noopener">
                        {truncateUrl(schedule.location)}
                      </a>
                    </div>
                  )}
                </td>
                <td>
                  <div className="sch-chip-container">
                    {schedule.participants.slice(0, 2).map((participant, i) => (
                      <span
                        key={i}
                        className="sch-chip"
                        style={{ backgroundColor: `${getResponseColor(participant.response_status)}20` }}
                      >
                        {participant.group ? <GroupIcon /> : <PersonIcon />}
                        {participant.user
                          ? `${participant.user.first_name} ${participant.user.last_name}`
                          : participant.group.name}
                      </span>
                    ))}
                    {schedule.participants.length > 2 && (
                      <span className="sch-chip">+{schedule.participants.length - 2}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="sch-text-secondary">
                    {schedule.participants.find(p => p.user)?.response_status || 'Not invited'}
                  </span>
                </td>
                <td>
                  <div className="sch-action-btns">
                    <button
                      className="sch-btn sch-btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(generateGoogleCalendarLink(schedule), '_blank');
                      }}
                    >
                      <CalendarIcon />
                    </button>
                    <button
                      className="sch-btn sch-btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(schedule);
                      }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="sch-btn sch-btn-icon sch-btn-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSchedule(schedule.id);
                      }}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedSchedule === schedule.id && (
                <tr>
                  <td colSpan="6">
                    <div className="sch-table-expanded">
                      <p>{schedule.description}</p>
                      <div className="sch-location">
                        <span>{schedule.location || 'No location specified'}</span>
                      </div>
                      <div className="sch-participants">
                        <span>Participants:</span>
                        <div className="sch-chip-container">
                          {schedule.participants.map((participant, i) => (
                            <span
                              key={i}
                              className="sch-chip"
                              style={{ backgroundColor: `${getResponseColor(participant.response_status)}20` }}
                            >
                              {participant.group ? <GroupIcon /> : <PersonIcon />}
                              {participant.user
                                ? `${participant.user.first_name} ${participant.user.last_name}`
                                : participant.group.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="sch-response">
                        <span>Your Response:</span>
                        <div className="sch-response-btns">
                          {responseOptions.map((option) => (
                            <button
                              key={option.value}
                              className="sch-btn sch-btn-response"
                              style={{ borderColor: option.color, color: option.color }}
                              onClick={() => handleRespondToSchedule(schedule.id, option.value)}
                            >
                              {option.value === 'accepted' && <CheckIcon />}
                              {option.value === 'declined' && <CloseIcon />}
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        className="sch-btn sch-btn-primary"
                        onClick={() => window.open(generateGoogleCalendarLink(schedule), '_blank')}
                      >
                        <CalendarIcon />
                        Add to Google Calendar
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="sch-container">
        {snackbar.open && (
          <div className={`sch-alert sch-alert-${snackbar.severity}`}>
            <span>{snackbar.message}</span>
            <button onClick={() => setSnackbar(prev => ({ ...prev, open: false }))} className="sch-alert-close">
              <CloseIcon />
            </button>
          </div>
        )}
        <div className="sch-header">
          <h1>
            Schedule Manager
            <span className="sch-badge">
              {schedules.filter(s => !isPastEvent(s)).length}
              <CalendarIcon />
            </span>
          </h1>
          <div className="sch-header-btns">
            <button className="sch-btn sch-btn-primary" onClick={() => handleOpenDialog()}>
              <AddIcon />
              New Schedule
            </button>
            <button
              className="sch-btn sch-btn-secondary"
              onClick={() => {
                schedules.forEach(schedule => {
                  window.open(generateGoogleCalendarLink(schedule), '_blank');
                });
              }}
              disabled={schedules.length === 0}
            >
              <CalendarIcon />
              Export All to Google Calendar
            </button>
          </div>
        </div>
        <div className="sch-filters">
          <div className="sch-search">
            <div className="sch-search-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search schedules..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="sch-date-picker">
            <label>From</label>
            <DatePicker
              value={filters.dateFrom}
              onChange={(newValue) => handleFilterChange('dateFrom', newValue)}
              renderInput={({ inputProps, ...params }) => (
                <input {...inputProps} {...params} />
              )}
            />
          </div>
          <div className="sch-date-picker">
            <label>To</label>
            <DatePicker
              value={filters.dateTo}
              onChange={(newValue) => handleFilterChange('dateTo', newValue)}
              renderInput={({ inputProps, ...params }) => (
                <input {...inputProps} {...params} />
              )}
            />
          </div>
          <div className="sch-checkbox">
            <input
              type="checkbox"
              checked={filters.showPast}
              onChange={(e) => handleFilterChange('showPast', e.target.checked)}
            />
            <span>Show Past Events</span>
          </div>
          <button className="sch-btn sch-btn-icon" onClick={resetFilters}>
            <RefreshIcon />
          </button>
        </div>
        {isLoading ? (
          <div className="sch-loading">
            <div className="sch-progress"></div>
          </div>
        ) : error ? (
          <div className="sch-no-data sch-error">{error}</div>
        ) : schedules.length === 0 ? (
          <div className="sch-no-data">No schedules found</div>
        ) : window.innerWidth <= 600 ? renderMobileScheduleCards() : renderDesktopScheduleTable()}
        <div className="sch-pagination">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pagination.count}
            rowsPerPage={rowsPerPage}
            page={pagination.page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
        <div className="sch-dialog" style={{ display: openDialog ? 'block' : 'none' }}>
          <div className="sch-dialog-backdrop" onClick={handleCloseDialog}></div>
          <div className="sch-dialog-content sch-dialog-wide">
            <div className="sch-dialog-header">
              <h3>{currentSchedule?.id ? 'Edit Schedule' : 'Create New Schedule'}</h3>
              <button className="sch-dialog-close" onClick={handleCloseDialog}>
                <CloseIcon />
              </button>
            </div>
            <div className="sch-dialog-body">
              <div className="sch-form-field">
                <label>Title</label>
                <input
                  type="text"
                  value={currentSchedule?.title || ''}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, title: e.target.value })}
                />
              </div>
              <div className="sch-form-field sch-form-field-full">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={currentSchedule?.description || ''}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, description: e.target.value })}
                ></textarea>
              </div>
              <div className="sch-form-grid">
                <div className="sch-form-field">
                  <label>Start Time</label>
                  <DatePicker
                    value={currentSchedule?.start_time}
                    onChange={(newValue) => setCurrentSchedule({ ...currentSchedule, start_time: newValue })}
                    renderInput={({ inputProps, ...params }) => (
                      <input {...inputProps} {...params} />
                    )}
                  />
                </div>
                <div className="sch-form-field">
                  <label>End Time</label>
                  <DatePicker
                    value={currentSchedule?.end_time}
                    onChange={(newValue) => setCurrentSchedule({ ...currentSchedule, end_time: newValue })}
                    minDateTime={currentSchedule?.start_time}
                    renderInput={({ inputProps, ...params }) => (
                      <input {...inputProps} {...params} />
                    )}
                  />
                </div>
              </div>
              <div className="sch-form-field">
                <label>Location</label>
                <input
                  type="text"
                  value={currentSchedule?.location || ''}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, location: e.target.value })}
                />
              </div>
              <div className="sch-form-field">
                <label className="sch-checkbox">
                  <input
                    type="checkbox"
                    checked={currentSchedule?.is_all_day || false}
                    onChange={(e) => setCurrentSchedule({ ...currentSchedule, is_all_day: e.target.checked })}
                  />
                  <span>All Day Event</span>
                </label>
              </div>
              <div className="sch-form-field sch-form-field-full">
                <h4>Participants</h4>
                {renderUserAutocomplete()}
                {renderGroupAutocomplete()}
              </div>
            </div>
            <div className="sch-dialog-actions">
              <button className="sch-btn sch-btn-cancel" onClick={handleCloseDialog}>
                Cancel
              </button>
              <button
                className="sch-btn sch-btn-confirm"
                onClick={handleSaveSchedule}
                disabled={!currentSchedule?.title || !currentSchedule?.start_time || !currentSchedule?.end_time}
              >
                {currentSchedule?.id ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default Schedule;