import React, { createContext, useContext, useState, useEffect } from 'react';
import { qualityAPI } from '../services/qualityAPI'; // Mock API

const QualityContext = createContext();

export const QualityProvider = ({ children }) => {
  // Risk thresholds for sampling
  const [riskThresholds, setRiskThresholds] = useState({
    newAssessor: 0.5,  // 50% sampling
    highRisk: 0.7,     // 70% sampling
    default: 0.2       // 20% sampling
  });

  // Active quality actions
  const [actionItems, setActionItems] = useState([]);
  
  // Standardization meetings
  const [meetings, setMeetings] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [actions, upcomingMeetings] = await Promise.all([
          qualityAPI.getActionItems(),
          qualityAPI.getStandardizationMeetings()
        ]);
        setActionItems(actions);
        setMeetings(upcomingMeetings);
      } catch (error) {
        console.error('Failed to load QA data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Calculate risk score for an assessor (dummy algorithm)
  const calculateRiskScore = (assessor) => {
    const baseScore = assessor.isNew ? 0.8 : 0.2;
    const errorScore = Math.min(assessor.recentErrors / 10, 0.5);
    return baseScore + errorScore; // Score 0-1
  };

  // Add a new action item
  const addActionItem = (item) => {
    setActionItems([...actionItems, { 
      ...item, 
      id: Date.now(), 
      status: 'open' 
    }]);
  };

  return (
    <QualityContext.Provider
      value={{
        riskThresholds,
        actionItems,
        meetings,
        calculateRiskScore,
        addActionItem,
        updateRiskThresholds: setRiskThresholds
      }}
    >
      {children}
    </QualityContext.Provider>
  );
};

export const useQuality = () => {
  const context = useContext(QualityContext);
  if (!context) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return context;
};