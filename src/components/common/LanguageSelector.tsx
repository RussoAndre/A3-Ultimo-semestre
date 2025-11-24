import { useTranslation } from '../../hooks/useTranslation';

/**
 * LanguageSelector Component
 * Allows users to switch between English and Portuguese
 * Persists language preference to localStorage
 */
const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as 'en' | 'pt';
    changeLanguage(newLanguage);
  };

  return (
    <div className="language-selector">
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-700"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
