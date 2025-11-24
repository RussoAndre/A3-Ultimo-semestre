import { createContext, useContext, useState, ReactNode } from 'react';
import { useRewards } from '../hooks/useRewards';
import { POINTS_CONFIG } from '../services/rewards.service';
import PointsNotification from '../components/rewards/PointsNotification';

interface PointsNotificationData {
  id: string;
  points: number;
  description: string;
}

interface PointsContextType {
  awardDeviceRegistrationPoints: () => Promise<void>;
  awardDeviceDisposalPoints: (method: 'recycling' | 'donation' | 'proper') => Promise<void>;
  awardRecommendationPoints: (potentialSavingsKwh: number) => Promise<void>;
  awardEducationPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const { awardPoints } = useRewards();
  const [notifications, setNotifications] = useState<PointsNotificationData[]>([]);

  const showNotification = (points: number, description: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, points, description }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const awardDeviceRegistrationPoints = async () => {
    try {
      await awardPoints({
        points: POINTS_CONFIG.DEVICE_REGISTRATION,
        actionType: 'device_registration',
        description: 'Device registered',
      });
      showNotification(POINTS_CONFIG.DEVICE_REGISTRATION, 'Device registered successfully!');
    } catch (error) {
      console.error('Failed to award device registration points:', error);
    }
  };

  const awardDeviceDisposalPoints = async (method: 'recycling' | 'donation' | 'proper') => {
    let points = POINTS_CONFIG.DEVICE_DISPOSAL_PROPER;
    let description = 'Device disposed properly';

    if (method === 'recycling') {
      points = POINTS_CONFIG.DEVICE_DISPOSAL_RECYCLING;
      description = 'Device recycled';
    } else if (method === 'donation') {
      points = POINTS_CONFIG.DEVICE_DISPOSAL_DONATION;
      description = 'Device donated';
    }

    try {
      await awardPoints({
        points,
        actionType: `device_disposal_${method}`,
        description,
      });
      showNotification(points, `${description} successfully!`);
    } catch (error) {
      console.error('Failed to award device disposal points:', error);
    }
  };

  const awardRecommendationPoints = async (potentialSavingsKwh: number) => {
    const points = POINTS_CONFIG.RECOMMENDATION_COMPLETED + Math.floor(potentialSavingsKwh / 10);
    
    try {
      await awardPoints({
        points,
        actionType: 'recommendation_completed',
        description: 'Recommendation completed',
      });
      showNotification(points, 'Recommendation completed!');
    } catch (error) {
      console.error('Failed to award recommendation points:', error);
    }
  };

  const awardEducationPoints = async () => {
    try {
      await awardPoints({
        points: POINTS_CONFIG.EDUCATION_ARTICLE_READ,
        actionType: 'education_article_read',
        description: 'Educational article completed',
      });
      showNotification(POINTS_CONFIG.EDUCATION_ARTICLE_READ, 'Article completed!');
    } catch (error) {
      console.error('Failed to award education points:', error);
    }
  };

  return (
    <PointsContext.Provider
      value={{
        awardDeviceRegistrationPoints,
        awardDeviceDisposalPoints,
        awardRecommendationPoints,
        awardEducationPoints,
      }}
    >
      {children}
      {notifications.map((notification) => (
        <PointsNotification
          key={notification.id}
          points={notification.points}
          description={notification.description}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </PointsContext.Provider>
  );
};
