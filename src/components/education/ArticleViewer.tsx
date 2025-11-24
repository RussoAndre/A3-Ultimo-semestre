import { useState } from 'react';
import { EducationalArticle } from '../../types/education.types';
import { useTranslation } from '../../hooks/useTranslation';
import { usePoints } from '../../contexts/PointsContext';
import Button from '../common/Button';
import Card from '../common/Card';

interface ArticleViewerProps {
  article: EducationalArticle;
  onComplete: (articleId: string) => Promise<void>;
  onClose: () => void;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({
  article,
  onComplete,
  onClose,
}) => {
  const { t, language } = useTranslation();
  const { awardEducationPoints } = usePoints();
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const title = language === 'pt' ? article.titlePt : article.titleEn;
  const content = language === 'pt' ? article.contentPt : article.contentEn;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleComplete = async () => {
    if (article.completed) {
      onClose();
      return;
    }

    setIsCompleting(true);
    try {
      await onComplete(article.id);
      await awardEducationPoints();
    } catch (error) {
      console.error('Error completing article:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              {article.completed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('education.completed')}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t('common.close')}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          <div className="prose prose-green max-w-none">
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {!article.completed && (
                <>
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {t('education.earnPoints', { points: article.pointsReward })}
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="secondary">
                {t('common.close')}
              </Button>
              {!article.completed && (
                <Button
                  onClick={handleComplete}
                  variant="primary"
                  disabled={isCompleting || !hasScrolledToBottom}
                >
                  {isCompleting
                    ? t('common.loading')
                    : t('education.markComplete')}
                </Button>
              )}
            </div>
          </div>
          {!article.completed && !hasScrolledToBottom && (
            <p className="text-xs text-gray-500 mt-2 text-right">
              {t('education.scrollToComplete')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
