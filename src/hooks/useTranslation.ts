import { useTranslation as useI18nextTranslation } from 'react-i18next';

/**
 * Type-safe wrapper for useTranslation hook
 * Provides translation function with type safety and language switching
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nextTranslation();

  /**
   * Change the current language and persist to localStorage
   * @param language - Language code ('en' or 'pt')
   */
  const changeLanguage = async (language: 'en' | 'pt') => {
    await i18n.changeLanguage(language);
    localStorage.setItem('ecotech-language', language);
  };

  /**
   * Get the current language
   * @returns Current language code
   */
  const currentLanguage = i18n.language as 'en' | 'pt';

  return {
    t,
    changeLanguage,
    currentLanguage,
    i18n,
  };
};

export default useTranslation;
