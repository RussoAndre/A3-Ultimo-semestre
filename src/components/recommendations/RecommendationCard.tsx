import { useState } from 'react'
import { Recommendation, RecommendationPriority } from '../../types/recommendation.types'
import { useTranslation } from '../../hooks/useTranslation'
import { usePoints } from '../../contexts/PointsContext'
import Button from '../common/Button'
import Card from '../common/Card'

interface RecommendationCardProps {
  recommendation: Recommendation
  onComplete: (id: string) => Promise<void>
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onComplete,
}) => {
  const { t } = useTranslation()
  const { awardRecommendationPoints } = usePoints()
  const [isCompleting, setIsCompleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const getPriorityColor = (priority: RecommendationPriority): string => {
    switch (priority) {
      case RecommendationPriority.HIGH:
        return 'bg-red-100 text-red-800 border-red-200'
      case RecommendationPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case RecommendationPriority.LOW:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: RecommendationPriority): string => {
    switch (priority) {
      case RecommendationPriority.HIGH:
        return t('recommendations.high')
      case RecommendationPriority.MEDIUM:
        return t('recommendations.medium')
      case RecommendationPriority.LOW:
        return t('recommendations.low')
      default:
        return priority
    }
  }

  const handleComplete = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true)
      return
    }

    setIsCompleting(true)
    try {
      await onComplete(recommendation.id)
      // Award points for completing recommendation
      await awardRecommendationPoints(recommendation.potentialSavingsKwh)
      setShowConfirmation(false)
    } catch (error) {
      console.error('Error completing recommendation:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  if (recommendation.completed) {
    return (
      <Card className="opacity-60">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-through">
                {recommendation.title}
              </h3>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                {t('recommendations.completed')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col gap-4">
        {/* Header with title and priority */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {recommendation.title}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
              recommendation.priority
            )}`}
          >
            {getPriorityLabel(recommendation.priority)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{recommendation.description}</p>

        {/* Savings Information */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('recommendations.potentialSavings')}</p>
            <p className="text-lg font-bold text-green-700">
              {recommendation.potentialSavingsKwh.toFixed(1)} kWh
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {recommendation.potentialSavingsCO2.toFixed(1)} kg CO₂
            </p>
          </div>
          <div className="flex flex-col items-end justify-center">
            <p className="text-xs text-gray-600 mb-1">{t('rewards.points')}</p>
            <div className="flex items-center gap-1">
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xl font-bold text-yellow-600">
                +{recommendation.pointsReward}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!showConfirmation ? (
          <Button
            onClick={handleComplete}
            variant="primary"
            disabled={isCompleting}
            className="w-full"
          >
            {t('recommendations.markComplete')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleComplete}
              variant="primary"
              disabled={isCompleting}
              className="flex-1"
            >
              {isCompleting ? t('common.loading') : t('common.confirm')}
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={isCompleting}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
