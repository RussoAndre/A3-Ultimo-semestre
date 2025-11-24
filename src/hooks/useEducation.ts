import { useState, useEffect, useCallback } from 'react';
import educationService from '../services/education.service';
import {
  EducationalArticle,
  ArticleFilters,
  ArticleProgress,
  ArticleCompletionResponse,
} from '../types/education.types';

interface UseEducationReturn {
  articles: EducationalArticle[];
  currentArticle: EducationalArticle | null;
  progress: ArticleProgress[];
  completedCount: number;
  loading: boolean;
  error: string | null;
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchArticleById: (articleId: string) => Promise<void>;
  completeArticle: (articleId: string) => Promise<ArticleCompletionResponse>;
  refreshProgress: () => Promise<void>;
  isArticleCompleted: (articleId: string) => boolean;
}

export const useEducation = (initialFilters?: ArticleFilters): UseEducationReturn => {
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<EducationalArticle | null>(null);
  const [progress, setProgress] = useState<ArticleProgress[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async (filters?: ArticleFilters) => {
    try {
      setLoading(true);
      setError(null);
      const articlesData = await educationService.getArticles(filters);
      setArticles(articlesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArticleById = useCallback(async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const article = await educationService.getArticleById(articleId);
      setCurrentArticle(article);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeArticle = useCallback(
    async (articleId: string): Promise<ArticleCompletionResponse> => {
      try {
        setError(null);
        const response = await educationService.completeArticle(articleId);
        
        // Update the article in the list to mark as completed
        setArticles(prevArticles =>
          prevArticles.map(article =>
            article.id === articleId
              ? { ...article, completed: true, completedAt: new Date() }
              : article
          )
        );

        // Update current article if it's the one being completed
        if (currentArticle?.id === articleId) {
          setCurrentArticle({
            ...currentArticle,
            completed: true,
            completedAt: new Date(),
          });
        }

        // Refresh progress
        await refreshProgress();

        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete article');
        console.error('Error completing article:', err);
        throw err;
      }
    },
    [currentArticle]
  );

  const refreshProgress = useCallback(async () => {
    try {
      const progressData = await educationService.getArticleProgress();
      setProgress(progressData);
      setCompletedCount(progressData.filter(p => p.completed).length);
    } catch (err) {
      console.error('Error refreshing progress:', err);
    }
  }, []);

  const isArticleCompleted = useCallback(
    (articleId: string): boolean => {
      const articleProgress = progress.find(p => p.articleId === articleId);
      return articleProgress?.completed || false;
    },
    [progress]
  );

  useEffect(() => {
    fetchArticles(initialFilters);
    refreshProgress();
  }, [fetchArticles, refreshProgress, initialFilters]);

  return {
    articles,
    currentArticle,
    progress,
    completedCount,
    loading,
    error,
    fetchArticles,
    fetchArticleById,
    completeArticle,
    refreshProgress,
    isArticleCompleted,
  };
};
