// ============================================
// Impact Service - Environmental Impact Business Logic
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import {
  getGlobalImpact,
  getUserImpact,
  getMerchantImpact,
  calculateCO2Impact,
  getImpactLeaderboard,
  generateImpactReport,
} from '@/api';
import type { ApiResponse, ImpactStats, UserImpact, MerchantImpact } from '@/types';

/**
 * Get global platform impact statistics
 */
export const getGlobalStats = async (): Promise<ApiResponse<ImpactStats>> => {
  return getGlobalImpact();
};

/**
 * Get user's personal impact
 */
export const getUserStats = async (userId: string): Promise<ApiResponse<UserImpact>> => {
  return getUserImpact(userId);
};

/**
 * Get merchant's impact statistics
 */
export const getMerchantStats = async (
  merchantId: string
): Promise<ApiResponse<MerchantImpact>> => {
  return getMerchantImpact(merchantId);
};

/**
 * Calculate CO2 impact for an order
 */
export const calculateCO2 = async (
  quantity: number,
  weightKg?: number
): Promise<ApiResponse<{ co2_avoided_kg: number; trees_equivalent: number }>> => {
  return calculateCO2Impact({ quantity, weight_kg: weightKg });
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (
  type: 'users' | 'merchants',
  limit: number = 10
): Promise<ApiResponse<Array<{ id: string; name: string; impact_score: number }>>> => {
  return getImpactLeaderboard(type, limit);
};

/**
 * Generate impact report
 */
export const generateReport = async (
  startDate: string,
  endDate: string,
  merchantId?: string
) => {
  return generateImpactReport({ start_date: startDate, end_date: endDate, merchant_id: merchantId });
};

/**
 * Format impact stats for display
 */
export const formatGlobalImpact = (stats: ImpactStats) => {
  return {
    foodSaved: {
      value: stats.total_food_saved_kg.toLocaleString(),
      unit: 'kg',
      label: 'Nourriture sauvée',
    },
    moneySaved: {
      value: stats.total_money_saved_xaf.toLocaleString(),
      unit: 'XAF',
      label: 'Économies réalisées',
    },
    co2Avoided: {
      value: stats.total_co2_avoided_kg.toLocaleString(),
      unit: 'kg',
      label: 'CO₂ évité',
    },
    mealsSaved: {
      value: stats.total_meals_saved.toLocaleString(),
      unit: 'repas',
      label: 'Repas sauvés',
    },
    merchants: {
      value: stats.total_merchants.toLocaleString(),
      unit: '',
      label: 'Commerçants partenaires',
    },
    users: {
      value: stats.total_users.toLocaleString(),
      unit: '',
      label: 'Utilisateurs actifs',
    },
  };
};

/**
 * Calculate environmental equivalents
 */
export const calculateEquivalents = (co2Kg: number) => {
  return {
    treesPlanted: Math.round(co2Kg / 22), // 22 kg CO2 absorbed per tree per year
    carKmAvoided: Math.round(co2Kg / 0.12), // 0.12 kg CO2 per km
    showersSaved: Math.round(co2Kg / 0.5), // 0.5 kg CO2 per 5-min shower
    phonesCharged: Math.round(co2Kg / 0.008), // 8g CO2 per charge
  };
};

/**
 * Get impact tier based on user's contribution
 */
export const getImpactTier = (foodSavedKg: number): {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  nextTier?: number;
} => {
  if (foodSavedKg >= 100) {
    return { tier: 'platinum', name: 'Héros Anti-Gaspi' };
  }
  if (foodSavedKg >= 50) {
    return { tier: 'gold', name: 'Champion', nextTier: 100 };
  }
  if (foodSavedKg >= 20) {
    return { tier: 'silver', name: 'Engagé', nextTier: 50 };
  }
  return { tier: 'bronze', name: 'Débutant', nextTier: 20 };
};

/**
 * Format large numbers for display
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};
