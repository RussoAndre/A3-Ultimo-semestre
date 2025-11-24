import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { energyService } from '../services/energy.service'
import {
  EnergyConsumption,
  ConsumptionSummary,
  ConsumptionQueryParams,
  ConsumptionTrend,
  DailyConsumption,
  TopConsumingDevice,
  ConsumptionByType,
  ConsumptionByDevice,
} from '../types/energy.types'
import { useAppSelector } from './useAppSelector'

/**
 * Hook to fetch energy consumption data
 */
export function useEnergyConsumption(
  params?: ConsumptionQueryParams
): UseQueryResult<EnergyConsumption[], Error> {
  return useQuery({
    queryKey: ['energy', 'consumption', params],
    queryFn: () => energyService.getConsumption(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch consumption summary
 */
export function useConsumptionSummary(
  params?: ConsumptionQueryParams
): UseQueryResult<ConsumptionSummary, Error> {
  return useQuery({
    queryKey: ['energy', 'summary', params],
    queryFn: () => energyService.getConsumptionSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch consumption trends
 */
export function useConsumptionTrends(
  params?: ConsumptionQueryParams
): UseQueryResult<ConsumptionTrend, Error> {
  return useQuery({
    queryKey: ['energy', 'trends', params],
    queryFn: () => energyService.getConsumptionTrends(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch daily consumption data for charting
 */
export function useDailyConsumption(
  days: number = 30
): UseQueryResult<DailyConsumption[], Error> {
  return useQuery({
    queryKey: ['energy', 'daily', days],
    queryFn: () => energyService.getDailyConsumption(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch top consuming devices
 */
export function useTopConsumingDevices(
  limit: number = 5,
  params?: ConsumptionQueryParams
): UseQueryResult<TopConsumingDevice[], Error> {
  const devices = useAppSelector((state) => state.devices?.devices || [])

  return useQuery({
    queryKey: ['energy', 'top-devices', limit, params],
    queryFn: () => energyService.getTopConsumingDevices(devices, limit, params),
    enabled: devices.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch consumption breakdown by device type
 */
export function useConsumptionByType(
  params?: ConsumptionQueryParams
): UseQueryResult<ConsumptionByType[], Error> {
  const devices = useAppSelector((state) => state.devices?.devices || [])

  return useQuery({
    queryKey: ['energy', 'by-type', params],
    queryFn: () => energyService.getConsumptionByType(devices, params),
    enabled: devices.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch consumption breakdown by device
 */
export function useConsumptionByDevice(
  params?: ConsumptionQueryParams
): UseQueryResult<ConsumptionByDevice[], Error> {
  const devices = useAppSelector((state) => state.devices?.devices || [])

  return useQuery({
    queryKey: ['energy', 'by-device', params],
    queryFn: () => energyService.getConsumptionByDevice(devices, params),
    enabled: devices.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
