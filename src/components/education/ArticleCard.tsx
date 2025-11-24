import { EducationalArticle, ArticleCategory, SDGType } from '../../types/education.types';
import { useTranslation } from '../../hooks/useTranslation';
import Card from '../common/Card';
import Button from '../common/Button';

interface ArticleCardProps {
  article: EducationalArticle;
  onRead: (articleId: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onRead }) => {
  const { t, language } = useTranslation();

  const title = language === 'pt' ? article.titlePt : article.titleEn;
  const preview = language === 'pt' 
    ? article.contentPt.substring(0, 150) + '...'
    : article.contentEn.substring(0, 150) + '...';

  const getCategoryLabel = (category: ArticleCategory): string => {
    return t(`education.categories.${category}`);
  };

  const getSDGLabel = (sdg: SDGType): string => {
    return t(`education.sdg.${sdg}`);
  };

  const getCategoryColor = (category: ArticleCategory): string => {
    switch (category) {
      case ArticleCategory.GREEN_COMPUTING:
        return 'bg-green-100 text-green-800 border-green-200';
      case ArticleCategory.ENERGY_SAVING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ArticleCategory.SUSTAINABILITY:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case ArticleCategory.SDG:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ArticleCategory.BEST_PRACTICES:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <div className="flex flex-col gap-3 flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(
              article.category
            )}`}
          >
            {getCategoryLabel(article.category)}
          </span>
          {article.sdgRelated && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {getSDGLabel(article.sdgRelated)}
            </span>
          )}
          {article.completed && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
              ✓ {t('education.completed')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {title}
        </h3>

        {/* Preview */}
        <p className="text-sm text-gray-600 leading-relaxed flex-1 line-clamp-3">
          {preview}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-yellow-600">
              +{article.pointsReward} {t('rewards.points')}
            </span>
          </div>
          <Button
            onClick={() => onRead(article.id)}
            variant={article.completed ? 'secondary' : 'primary'}
            className="text-sm px-4 py-2"
          >
            {article.completed ? t('education.readAgain') : t('education.read')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
