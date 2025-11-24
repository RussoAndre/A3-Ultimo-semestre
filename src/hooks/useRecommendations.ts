import { useState, useEffect, useCallback } from 'react'
import { recommendationService } from '../services/recommendation.service'
import { Recommendation } from '../types/recommendation.types'
import { Device } from '../types/device.types'

interface UseRecommendationsReturn {
  recommendations: Recommendation[]
  loading: boolean
  error: string | null
  completeRecommendation: (recommendationId: string) => Promise<void>
  refreshRecommendations: () => Promise<void>
  generateLocalRecommendations: (devices: Device[]) => void
}

export const useRecommendations = (): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await recommendationService.getRecommendations()
      setRecommendations(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations'
      setError(errorMessage)
      console.error('Error fetching recommendations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const completeRecommendation = useCallback(async (recommendationId: string) => {
    setLoading(true)
    setError(null)
    try {
      const completedRecommendation = await recommendationService.completeRecommendation(
        recommendationId
      )
      
      // Update the local state to mark the recommendation as completed
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendationId
            ? { ...rec, completed: true, completedAt: completedRecommendation.completedAt }
            : rec
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete recommendation'
      setError(errorMessage)
      console.error('Error completing recommendation:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshRecommendations = useCallback(async () => {
    await fetchRecommendations()
  }, [fetchRecommendations])

  const generateLocalRecommendations = useCallback((devices: Device[]) => {
    try {
      const generated = recommendationService.generateRecommendations(devices)
      setRecommendations(generated)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations'
      setError(errorMessage)
      console.error('Error generating recommendations:', err)
    }
  }, [])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    completeRecommendation,
    refreshRecommendations,
    generateLocalRecommendations,
  }
}
