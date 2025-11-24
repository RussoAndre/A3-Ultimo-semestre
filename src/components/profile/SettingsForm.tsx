import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useProfile } from '../../hooks/useProfile';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/authSlice';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import type { UserProfile, PasswordChangeData } from '../../types/profile.types';

interface SettingsFormProps {
  profile: UserProfile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const { t, changeLanguage } = useTranslation();
  const { updateProfile, changePassword, deleteAccount, isLoading } = useProfile();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Language settings
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'pt'>(profile.preferredLanguage);

  // Notification preferences
  const [notifications, setNotifications] = useState(profile.notificationPreferences);

  // Privacy settings
  const [leaderboardConsent, setLeaderboardConsent] = useState(profile.consentLeaderboard);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLanguageChange = async (lang: 'en' | 'pt') => {
    try {
      setSelectedLanguage(lang);
      await updateProfile({ preferredLanguage: lang });
      changeLanguage(lang);
      setSuccessMessage(t('profile.updateSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(t('profile.updateError'));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    try {
      const updatedNotifications = { ...notifications, [key]: value };
      setNotifications(updatedNotifications);
      await updateProfile({ notificationPreferences: updatedNotifications });
      setSuccessMessage(t('profile.updateSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(t('profile.updateError'));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleLeaderboardConsentChange = async (value: boolean) => {
    try {
      setLeaderboardConsent(value);
      await updateProfile({ consentLeaderboard: value });
      setSuccessMessage(t('profile.updateSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(t('profile.updateError'));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('auth.passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('auth.passwordMinLength'));
      return;
    }

    try {
      await changePassword(passwordData);
      setSuccessMessage(t('profile.passwordChanged'));
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setPasswordError(error.message || t('profile.updateError'));
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setErrorMessage(t('auth.passwordRequired'));
      return;
    }

    try {
      await deleteAccount({ password: deletePassword, reason: deleteReason });
      setSuccessMessage(t('profile.accountDeletedSuccess'));
      setTimeout(() => {
        dispatch(logout());
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || t('profile.updateError'));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Language Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.language')}</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="language"
              value="en"
              checked={selectedLanguage === 'en'}
              onChange={() => handleLanguageChange('en')}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-gray-700">{t('languages.english')}</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="language"
              value="pt"
              checked={selectedLanguage === 'pt'}
              onChange={() => handleLanguageChange('pt')}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-gray-700">{t('languages.portuguese')}</span>
          </label>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.notifications')}</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">{t('profile.emailNotifications')}</span>
            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">{t('profile.recommendationAlerts')}</span>
            <input
              type="checkbox"
              checked={notifications.recommendationAlerts}
              onChange={(e) => handleNotificationChange('recommendationAlerts', e.target.checked)}
              className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">{t('profile.achievementNotifications')}</span>
            <input
              type="checkbox"
              checked={notifications.achievementNotifications}
              onChange={(e) =>
                handleNotificationChange('achievementNotifications', e.target.checked)
              }
              className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">{t('profile.weeklyReports')}</span>
            <input
              type="checkbox"
              checked={notifications.weeklyReports}
              onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
              className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
            />
          </label>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.privacy')}</h3>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-gray-700 font-medium">{t('profile.leaderboardConsent')}</div>
            <div className="text-sm text-gray-500 mt-1">
              {t('rewards.leaderboard.privacyMessage')}
            </div>
          </div>
          <input
            type="checkbox"
            checked={leaderboardConsent}
            onChange={(e) => handleLeaderboardConsentChange(e.target.checked)}
            className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
          />
        </label>
      </Card>

      {/* Password Change */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.changePassword')}</h3>
        {!showPasswordForm ? (
          <Button variant="secondary" onClick={() => setShowPasswordForm(true)}>
            {t('profile.changePassword')}
          </Button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
                {passwordError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.currentPassword')}
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.confirmNewPassword')}
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : t('common.save')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError('');
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Account Deletion */}
      <Card>
        <h3 className="text-lg font-semibold text-red-600 mb-4">{t('profile.deleteAccount')}</h3>
        {!showDeleteConfirm ? (
          <div>
            <p className="text-gray-600 mb-4">{t('profile.deleteAccountWarning')}</p>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(true)}>
              {t('profile.deleteAccount')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-medium mb-2">{t('profile.deleteAccountConfirm')}</p>
              <p className="text-sm">{t('profile.deleteAccountWarning')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.deleteAccountReason')}
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={isLoading || !deletePassword}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : t('profile.deleteAccount')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeleteReason('');
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
