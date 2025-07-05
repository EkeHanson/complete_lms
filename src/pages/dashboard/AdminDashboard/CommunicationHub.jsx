import React, { useState, useEffect } from 'react';
import { Forum as ForumIcon, Email as EmailIcon, CalendarToday as CalendarIcon, Flag as FlagIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Messaging from './Messaging';
import Schedule from './ScheduleManagement';
import ForumManager from './ForumManager';
import ModerationQueue from './ModerationQueue';
import { messagingAPI, forumAPI, moderationAPI } from '../../../config';
import './CommunicationHub.css';

const CommunicationHub = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    unreadMessages: 0,
    upcomingEvents: 0,
    activeForums: 0,
    pendingModeration: 0
  });

  const fetchStats = async () => {
    try {
      const [messageStats, scheduleStats, forumStats, moderationStats] = await Promise.all([
        messagingAPI.getUnreadCount(),
        messagingAPI.getTotalMessages(),
        forumAPI.getForumStats(),
        moderationAPI.getPendingCount()
      ]);

      setStats({
        unreadMessages: messageStats.data.count || 0,
        upcomingEvents: scheduleStats.data.total_schedules || 0,
        activeForums: forumStats.data.active_forums || 0,
        pendingModeration: moderationStats.data.count || 0
      });
    } catch (error) {
      enqueueSnackbar('Failed to load communication statistics', { variant: 'error' });
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="chub-container">
      <h1 className="chub-title">Communication Hub</h1>

      <div className="chub-overview">
        <h3 className="chub-overview-title">Overview</h3>
        <div className="chub-cards">
          <div className="chub-card">
            <div className="chub-card-icon">
              <EmailIcon />
              {stats.unreadMessages > 0 && (
                <span className="chub-badge chub-badge-error">{stats.unreadMessages}</span>
              )}
            </div>
            <h5>Unread Messages</h5>
            <h3>{stats.unreadMessages}</h3>
          </div>
          <div className="chub-card">
            <div className="chub-card-icon">
              <CalendarIcon />
              {stats.upcomingEvents > 0 && (
                <span className="chub-badge chub-badge-primary">{stats.upcomingEvents}</span>
              )}
            </div>
            <h5>Upcoming Events</h5>
            <h3>{stats.upcomingEvents}</h3>
          </div>
          <div className="chub-card">
            <div className="chub-card-icon">
              <ForumIcon />
              {stats.activeForums > 0 && (
                <span className="chub-badge chub-badge-secondary">{stats.activeForums}</span>
              )}
            </div>
            <h5>Active Forums</h5>
            <h3>{stats.activeForums}</h3>
          </div>
          <div className="chub-card">
            <div className="chub-card-icon">
              <FlagIcon />
              {stats.pendingModeration > 0 && (
                <span className="chub-badge chub-badge-warning">{stats.pendingModeration}</span>
              )}
            </div>
            <h5>Pending Moderation</h5>
            <h3>{stats.pendingModeration}</h3>
          </div>
        </div>
      </div>

      <div className="chub-tabs">
        <button
          className={`chub-tab ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => handleTabChange(null, 0)}
        >
          <div className="chub-tab-content">
            <EmailIcon />
            {stats.unreadMessages > 0 && (
              <span className="chub-badge chub-badge-error">{stats.unreadMessages}</span>
            )}
            <span>Messages</span>
          </div>
        </button>
        <button
          className={`chub-tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => handleTabChange(null, 1)}
        >
          <div className="chub-tab-content">
            <CalendarIcon />
            {stats.upcomingEvents > 0 && (
              <span className="chub-badge chub-badge-primary">{stats.upcomingEvents}</span>
            )}
            <span>Schedules</span>
          </div>
        </button>
        <button
          className={`chub-tab ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => handleTabChange(null, 2)}
        >
          <div className="chub-tab-content">
            <ForumIcon />
            {stats.activeForums > 0 && (
              <span className="chub-badge chub-badge-secondary">{stats.activeForums}</span>
            )}
            <span>Forums</span>
          </div>
        </button>
        <button
          className={`chub-tab ${activeTab === 3 ? 'active' : ''}`}
          onClick={() => handleTabChange(null, 3)}
        >
          <div className="chub-tab-content">
            <FlagIcon />
            {stats.pendingModeration > 0 && (
              <span className="chub-badge chub-badge-warning">{stats.pendingModeration}</span>
            )}
            <span>Moderation</span>
          </div>
        </button>
      </div>

      <div className="chub-content">
        {activeTab === 0 && <Messaging />}
        {activeTab === 1 && <Schedule />}
        {activeTab === 2 && <ForumManager />}
        {activeTab === 3 && <ModerationQueue />}
      </div>
    </div>
  );
};

export default CommunicationHub;