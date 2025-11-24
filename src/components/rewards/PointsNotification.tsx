import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface PointsNotificationProps {
  points: number;
  description: string;
  onClose: () => void;
}

const PointsNotification = ({
  points,
  description,
  onClose,
}: PointsNotificationProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg p-4 min-w-[300px]">
        <div className="flex items-center space-x-3">
          <div className="text-3xl animate-bounce">🎉</div>
          <div className="flex-1">
            <div className="font-bold text-lg">
              +{points} {t('rewards.points')}
            </div>
            <div className="text-sm opacity-90">{description}</div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointsNotification;
