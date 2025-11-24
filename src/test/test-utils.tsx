import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import deviceReducer from '../store/deviceSlice';
import i18n from '../i18n';

// Create a custom render function that includes all providers
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        devices: deviceReducer,
      },
      preloadedState,
    }),
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  }: {
    preloadedState?: any;
    store?: any;
    queryClient?: QueryClient;
  } & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <BrowserRouter>{children}</BrowserRouter>
          </I18nextProvider>
        </QueryClientProvider>
      </Provider>
    );
  }

  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock API responses
export const mockApiResponses = {
  auth: {
    register: {
      user: {
        id: '1',
        email: 'test@example.com',
        preferredLanguage: 'en',
      },
      token: 'mock-token',
    },
    login: {
      user: {
        id: '1',
        email: 'test@example.com',
        preferredLanguage: 'en',
      },
      token: 'mock-token',
    },
  },
  devices: {
    list: [
      {
        id: '1',
        name: 'Laptop',
        type: 'computer',
        wattage: 65,
        dailyUsageHours: 8,
        estimatedDailyConsumption: 0.52,
        status: 'active',
      },
    ],
    create: {
      id: '2',
      name: 'Monitor',
      type: 'monitor',
      wattage: 30,
      dailyUsageHours: 8,
      estimatedDailyConsumption: 0.24,
      status: 'active',
    },
  },
  energy: {
    consumption: [
      {
        id: '1',
        deviceId: '1',
        date: '2024-01-01',
        consumptionKwh: 0.52,
      },
    ],
    summary: {
      totalKwh: 15.6,
      averageDailyKwh: 0.52,
      comparisonToPreviousPeriod: -10,
    },
  },
  recommendations: {
    list: [
      {
        id: '1',
        title: 'Enable power saving mode',
        description: 'Reduce energy consumption by enabling power saving',
        potentialSavingsKwh: 2.5,
        potentialSavingsCO2: 1.2,
        priority: 'high',
        category: 'device',
        completed: false,
        pointsReward: 50,
      },
    ],
  },
  rewards: {
    points: {
      totalPoints: 100,
      currentTier: 'bronze',
    },
  },
  impact: {
    report: {
      energySavedKwh: 50,
      co2ReductionKg: 25,
      treesEquivalent: 2,
      waterSavedLiters: 100,
      devicesRecycled: 1,
      sustainabilityScore: 75,
    },
  },
  education: {
    articles: [
      {
        id: '1',
        title: 'Green Computing Basics',
        category: 'green-computing',
        sdgRelated: 'SDG 13',
        pointsReward: 10,
        completed: false,
      },
    ],
  },
};

export * from '@testing-library/react';
