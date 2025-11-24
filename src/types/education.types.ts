export interface EducationalArticle {
  id: string;
  titleEn: string;
  titlePt: string;
  contentEn: string;
  contentPt: string;
  category: ArticleCategory;
  sdgRelated?: SDGType;
  pointsReward: number;
  createdAt: Date;
  completed?: boolean;
  completedAt?: Date;
}

export enum ArticleCategory {
  GREEN_COMPUTING = 'green_computing',
  ENERGY_SAVING = 'energy_saving',
  SUSTAINABILITY = 'sustainability',
  SDG = 'sdg',
  BEST_PRACTICES = 'best_practices',
}

export enum SDGType {
  SDG_12 = 'sdg_12', // Responsible Consumption and Production
  SDG_13 = 'sdg_13', // Climate Action
}

export interface ArticleProgress {
  userId: string;
  articleId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface ArticleFilters {
  category?: ArticleCategory;
  sdg?: SDGType;
  completed?: boolean;
  search?: string;
}

export interface ArticleCompletionResponse {
  success: boolean;
  pointsAwarded: number;
  totalPoints: number;
}
