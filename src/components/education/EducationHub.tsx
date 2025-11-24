import { useState, useMemo } from 'react';
import { useEducation } from '../../hooks/useEducation';
import { useTranslation } from '../../hooks/useTranslation';
import { ArticleCategory, SDGType, ArticleFilters } from '../../types/education.types';
import { ArticleCard } from './ArticleCard';
import { ArticleViewer } from './ArticleViewer';
import LoadingSpinner from '../common/LoadingSpinner';

export const EducationHub: React.FC = () => {
  const { t } = useTranslation();
  const {
    articles,
    currentArticle,
    completedCount,
    loading,
    error,
    fetchArticles,
    fetchArticleById,
    completeArticle,
  } = useEducation();

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | ''>('');
  const [selectedSDG, setSelectedSDG] = useState<SDGType | ''>('');
  const [showCompleted, setShowCompleted] = useState<boolean | undefined>(undefined);

  const handleReadArticle = async (articleId: string) => {
    await fetchArticleById(articleId);
    setSelectedArticleId(articleId);
  };

  const handleCloseViewer = () => {
    setSelectedArticleId(null);
  };

  const handleCompleteArticle = async (articleId: string) => {
    await completeArticle(articleId);
  };

  const handleApplyFilters = () => {
    const filters: ArticleFilters = {
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      sdg: selectedSDG || undefined,
      completed: showCompleted,
    };
    fetchArticles(filters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSDG('');
    setShowCompleted(undefined);
    fetchArticles();
  };

  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.titleEn.toLowerCase().includes(query) ||
          article.titlePt.toLowerCase().includes(query) ||
          article.contentEn.toLowerCase().includes(query) ||
          article.contentPt.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    if (selectedSDG) {
      filtered = filtered.filter((article) => article.sdgRelated === selectedSDG);
    }

    if (showCompleted !== undefined) {
      filtered = filtered.filter((article) => article.completed === showCompleted);
    }

    return filtered;
  }, [articles, searchQuery, selectedCategory, selectedSDG, showCompleted]);

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('education.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('education.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          <span className="text-sm font-semibold text-green-800">
            {completedCount} / {articles.length} {t('education.articlesCompleted')}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              {t('education.search')}
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('education.searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              {t('education.category')}
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ArticleCategory | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('education.allCategories')}</option>
              {Object.values(ArticleCategory).map((category) => (
                <option key={category} value={category}>
                  {t(`education.categories.${category}`)}
                </option>
              ))}
            </select>
          </div>

          {/* SDG Filter */}
          <div>
            <label htmlFor="sdg" className="block text-sm font-medium text-gray-700 mb-1">
              {t('education.sdgFilter')}
            </label>
            <select
              id="sdg"
              value={selectedSDG}
              onChange={(e) => setSelectedSDG(e.target.value as SDGType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('education.allSDGs')}</option>
              {Object.values(SDGType).map((sdg) => (
                <option key={sdg} value={sdg}>
                  {t(`education.sdg.${sdg}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Completion Filter and Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCompleted === true}
              onChange={(e) => setShowCompleted(e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">{t('education.showCompleted')}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCompleted === false}
              onChange={(e) => setShowCompleted(e.target.checked ? false : undefined)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">{t('education.showIncomplete')}</span>
          </label>
          <button
            onClick={handleClearFilters}
            className="ml-auto text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {t('education.clearFilters')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-gray-600">{t('education.noArticles')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={handleReadArticle}
            />
          ))}
        </div>
      )}

      {/* Article Viewer Modal */}
      {selectedArticleId && currentArticle && (
        <ArticleViewer
          article={currentArticle}
          onComplete={handleCompleteArticle}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};
