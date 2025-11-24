import { apiService } from './api';
import {
  EducationalArticle,
  ArticleFilters,
  ArticleCompletionResponse,
  ArticleProgress,
} from '../types/education.types';

class EducationService {
  private readonly BASE_URL = '/education';

  /**
   * Fetch all educational articles with optional filters
   */
  async getArticles(filters?: ArticleFilters): Promise<EducationalArticle[]> {
    const params = new URLSearchParams();
    
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.sdg) {
      params.append('sdg', filters.sdg);
    }
    if (filters?.completed !== undefined) {
      params.append('completed', filters.completed.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = `${this.BASE_URL}/articles${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<EducationalArticle[]>(url);
  }

  /**
   * Fetch a single article by ID
   */
  async getArticleById(articleId: string): Promise<EducationalArticle> {
    return apiService.get<EducationalArticle>(
      `${this.BASE_URL}/articles/${articleId}`
    );
  }

  /**
   * Mark an article as completed and award points
   */
  async completeArticle(articleId: string): Promise<ArticleCompletionResponse> {
    return apiService.post<ArticleCompletionResponse>(
      `${this.BASE_URL}/articles/${articleId}/complete`
    );
  }

  /**
   * Get user's article progress
   */
  async getArticleProgress(): Promise<ArticleProgress[]> {
    return apiService.get<ArticleProgress[]>(
      `${this.BASE_URL}/progress`
    );
  }

  /**
   * Get completed articles count
   */
  async getCompletedCount(): Promise<number> {
    const progress = await this.getArticleProgress();
    return progress.filter(p => p.completed).length;
  }

  /**
   * Check if a specific article is completed
   */
  async isArticleCompleted(articleId: string): Promise<boolean> {
    const progress = await this.getArticleProgress();
    const articleProgress = progress.find(p => p.articleId === articleId);
    return articleProgress?.completed || false;
  }
}

export default new EducationService();
