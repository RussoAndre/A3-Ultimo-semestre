export enum RewardTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'energy' | 'recycling' | 'education' | 'milestone';
  pointsRequired: number;
}

export interface UserBadge extends Badge {
  earnedAt: Date;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  points: number;
  actionType: string;
  description: string;
  createdAt: Date;
}

export interface UserRewards {
  userId: string;
  totalPoints: number;
  currentTier: RewardTier;
  badges: UserBadge[];
  pointsHistory: PointsTransaction[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface PointsAward {
  points: number;
  actionType: string;
  description: string;
}
