// ============================================
// Impact API - Environmental & Social Impact
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { supabaseClient, requireSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { DB_TABLES, API_ROUTES } from './routes';
import type { 
  ApiResponse, 
  ImpactStats, 
  UserImpact, 
  MerchantImpact 
} from '@/types';

// Constants for impact calculations
const CO2_PER_KG_FOOD = 2.5; // kg CO2 equivalent per kg of food waste avoided
const AVG_MEAL_WEIGHT_KG = 0.5; // Average weight of a meal in kg

/**
 * Get global platform impact statistics
 */
export const getGlobalImpact = async (): Promise<ApiResponse<ImpactStats>> => {
  if (!isSupabaseConfigured()) {
    // Return mock data for development
    return {
      data: {
        total_food_saved_kg: 12500,
        total_money_saved_xaf: 8750000,
        total_co2_avoided_kg: 31250,
        total_meals_saved: 25000,
        total_orders: 18500,
        total_merchants: 245,
        total_users: 12800,
      },
      error: null,
      success: true,
    };
  }

  const client = requireSupabaseClient();

  try {
    // Get aggregated impact from completed orders
    const { data: orders, error: ordersError } = await client
      .from(DB_TABLES.ORDERS)
      .select('quantity, savings, food_items(original_price)')
      .eq('status', 'completed');

    if (ordersError) throw ordersError;

    // Get counts
    const { count: merchantCount } = await client
      .from(DB_TABLES.MERCHANTS)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: userCount } = await client
      .from(DB_TABLES.PROFILES)
      .select('*', { count: 'exact', head: true });

    // Calculate totals
    const totalMeals = orders?.reduce((sum, o) => sum + (o.quantity || 0), 0) || 0;
    const totalSavings = orders?.reduce((sum, o) => sum + (o.savings || 0), 0) || 0;
    const totalFoodKg = totalMeals * AVG_MEAL_WEIGHT_KG;
    const totalCO2 = totalFoodKg * CO2_PER_KG_FOOD;

    return {
      data: {
        total_food_saved_kg: Math.round(totalFoodKg),
        total_money_saved_xaf: totalSavings,
        total_co2_avoided_kg: Math.round(totalCO2),
        total_meals_saved: totalMeals,
        total_orders: orders?.length || 0,
        total_merchants: merchantCount || 0,
        total_users: userCount || 0,
      },
      error: null,
      success: true,
    };
  } catch (error: any) {
    return {
      data: null,
      error: { code: 'FETCH_ERROR', message: error.message },
      success: false,
    };
  }
};

/**
 * Get user impact statistics
 */
export const getUserImpact = async (
  userId: string
): Promise<ApiResponse<UserImpact>> => {
  if (!isSupabaseConfigured()) {
    // Return mock data
    return {
      data: {
        user_id: userId,
        food_saved_kg: 25,
        money_saved_xaf: 17500,
        co2_avoided_kg: 62.5,
        orders_count: 50,
        favorite_merchants: [],
      },
      error: null,
      success: true,
    };
  }

  const client = requireSupabaseClient();

  try {
    // Get user's completed orders
    const { data: orders, error: ordersError } = await client
      .from(DB_TABLES.ORDERS)
      .select('quantity, savings, merchant_id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (ordersError) throw ordersError;

    // Calculate impact
    const totalMeals = orders?.reduce((sum, o) => sum + (o.quantity || 0), 0) || 0;
    const totalSavings = orders?.reduce((sum, o) => sum + (o.savings || 0), 0) || 0;
    const totalFoodKg = totalMeals * AVG_MEAL_WEIGHT_KG;
    const totalCO2 = totalFoodKg * CO2_PER_KG_FOOD;

    // Get most frequented merchants
    const merchantCounts = orders?.reduce((acc, o) => {
      acc[o.merchant_id] = (acc[o.merchant_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topMerchants = Object.entries(merchantCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([id]) => id);

    return {
      data: {
        user_id: userId,
        food_saved_kg: Math.round(totalFoodKg * 10) / 10,
        money_saved_xaf: totalSavings,
        co2_avoided_kg: Math.round(totalCO2 * 10) / 10,
        orders_count: orders?.length || 0,
        favorite_merchants: topMerchants,
      },
      error: null,
      success: true,
    };
  } catch (error: any) {
    return {
      data: null,
      error: { code: 'FETCH_ERROR', message: error.message },
      success: false,
    };
  }
};

/**
 * Get merchant impact statistics
 */
export const getMerchantImpact = async (
  merchantId: string
): Promise<ApiResponse<MerchantImpact>> => {
  if (!isSupabaseConfigured()) {
    // Return mock data
    return {
      data: {
        merchant_id: merchantId,
        food_saved_kg: 150,
        revenue_from_waste_xaf: 525000,
        co2_avoided_kg: 375,
        orders_fulfilled: 300,
        average_rating: 4.5,
        waste_reduction_rate: 78,
      },
      error: null,
      success: true,
    };
  }

  const client = requireSupabaseClient();

  try {
    // Get merchant's completed orders
    const { data: orders, error: ordersError } = await client
      .from(DB_TABLES.ORDERS)
      .select('quantity, total_price')
      .eq('merchant_id', merchantId)
      .eq('status', 'completed');

    if (ordersError) throw ordersError;

    // Get merchant rating
    const { data: merchant, error: merchantError } = await client
      .from(DB_TABLES.MERCHANTS)
      .select('rating')
      .eq('id', merchantId)
      .maybeSingle();

    if (merchantError) throw merchantError;

    // Calculate impact
    const totalMeals = orders?.reduce((sum, o) => sum + (o.quantity || 0), 0) || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
    const totalFoodKg = totalMeals * AVG_MEAL_WEIGHT_KG;
    const totalCO2 = totalFoodKg * CO2_PER_KG_FOOD;

    return {
      data: {
        merchant_id: merchantId,
        food_saved_kg: Math.round(totalFoodKg * 10) / 10,
        revenue_from_waste_xaf: totalRevenue,
        co2_avoided_kg: Math.round(totalCO2 * 10) / 10,
        orders_fulfilled: orders?.length || 0,
        average_rating: merchant?.rating || 0,
        waste_reduction_rate: 75, // Would need more data to calculate properly
      },
      error: null,
      success: true,
    };
  } catch (error: any) {
    return {
      data: null,
      error: { code: 'FETCH_ERROR', message: error.message },
      success: false,
    };
  }
};

/**
 * Calculate CO2 impact for a specific order/item
 */
export const calculateCO2Impact = async (params: {
  quantity: number;
  weight_kg?: number;
}): Promise<ApiResponse<{ co2_avoided_kg: number; trees_equivalent: number }>> => {
  const weightKg = params.weight_kg || params.quantity * AVG_MEAL_WEIGHT_KG;
  const co2Avoided = weightKg * CO2_PER_KG_FOOD;
  
  // One tree absorbs about 22 kg of CO2 per year
  const treesEquivalent = co2Avoided / 22;

  return {
    data: {
      co2_avoided_kg: Math.round(co2Avoided * 100) / 100,
      trees_equivalent: Math.round(treesEquivalent * 100) / 100,
    },
    error: null,
    success: true,
  };
};

/**
 * Get impact leaderboard
 */
export const getImpactLeaderboard = async (
  type: 'users' | 'merchants',
  limit: number = 10
): Promise<ApiResponse<Array<{ id: string; name: string; impact_score: number }>>> => {
  if (!isSupabaseConfigured()) {
    // Return mock data
    const mockData = type === 'users'
      ? [
          { id: '1', name: 'Marie K.', impact_score: 125 },
          { id: '2', name: 'Jean P.', impact_score: 98 },
          { id: '3', name: 'Sophie M.', impact_score: 87 },
        ]
      : [
          { id: '1', name: 'Boulangerie du Quartier', impact_score: 450 },
          { id: '2', name: 'Restaurant Le Baobab', impact_score: 380 },
          { id: '3', name: 'Pâtisserie Libreville', impact_score: 320 },
        ];

    return {
      data: mockData,
      error: null,
      success: true,
    };
  }

  const client = requireSupabaseClient();

  try {
    if (type === 'users') {
      // Get top users by order count
      const { data, error } = await client
        .from(DB_TABLES.ORDERS)
        .select('user_id, profiles(full_name)')
        .eq('status', 'completed');

      if (error) throw error;

      // Aggregate by user
      const userScores = data?.reduce((acc, order: any) => {
        const userId = order.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            id: userId,
            name: order.profiles?.full_name || 'Utilisateur',
            count: 0,
          };
        }
        acc[userId].count += 1;
        return acc;
      }, {} as Record<string, { id: string; name: string; count: number }>) || {};

      const leaderboard = Object.values(userScores)
        .map((u: any) => ({ id: u.id, name: u.name, impact_score: u.count * AVG_MEAL_WEIGHT_KG }))
        .sort((a, b) => b.impact_score - a.impact_score)
        .slice(0, limit);

      return { data: leaderboard, error: null, success: true };
    } else {
      // Get top merchants by order count
      const { data, error } = await client
        .from(DB_TABLES.ORDERS)
        .select('merchant_id, quantity, merchants(business_name)')
        .eq('status', 'completed');

      if (error) throw error;

      // Aggregate by merchant
      const merchantScores = data?.reduce((acc, order: any) => {
        const merchantId = order.merchant_id;
        if (!acc[merchantId]) {
          acc[merchantId] = {
            id: merchantId,
            name: order.merchants?.business_name || 'Commerçant',
            total: 0,
          };
        }
        acc[merchantId].total += order.quantity || 0;
        return acc;
      }, {} as Record<string, { id: string; name: string; total: number }>) || {};

      const leaderboard = Object.values(merchantScores)
        .map((m: any) => ({ id: m.id, name: m.name, impact_score: m.total * AVG_MEAL_WEIGHT_KG }))
        .sort((a, b) => b.impact_score - a.impact_score)
        .slice(0, limit);

      return { data: leaderboard, error: null, success: true };
    }
  } catch (error: any) {
    return {
      data: null,
      error: { code: 'FETCH_ERROR', message: error.message },
      success: false,
    };
  }
};

/**
 * Log impact for analytics
 */
export const logImpact = async (impactData: {
  user_id?: string;
  merchant_id: string;
  order_id: string;
  food_saved_kg: number;
  money_saved_xaf: number;
  co2_avoided_kg: number;
}): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null, success: true };
  }

  const client = requireSupabaseClient();
  const { error } = await client
    .from(DB_TABLES.IMPACT_LOGS)
    .insert({
      ...impactData,
      created_at: new Date().toISOString(),
    });

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return { data: null, error: null, success: true };
};

/**
 * Generate impact report for a period
 */
export const generateImpactReport = async (params: {
  start_date: string;
  end_date: string;
  merchant_id?: string;
}): Promise<ApiResponse<{
  period: { start: string; end: string };
  stats: ImpactStats;
  daily_breakdown: Array<{ date: string; meals_saved: number; co2_avoided: number }>;
}>> => {
  if (!isSupabaseConfigured()) {
    // Return mock report
    return {
      data: {
        period: { start: params.start_date, end: params.end_date },
        stats: {
          total_food_saved_kg: 500,
          total_money_saved_xaf: 350000,
          total_co2_avoided_kg: 1250,
          total_meals_saved: 1000,
          total_orders: 850,
          total_merchants: 15,
          total_users: 450,
        },
        daily_breakdown: [
          { date: '2024-01-01', meals_saved: 45, co2_avoided: 56.25 },
          { date: '2024-01-02', meals_saved: 52, co2_avoided: 65 },
          { date: '2024-01-03', meals_saved: 38, co2_avoided: 47.5 },
        ],
      },
      error: null,
      success: true,
    };
  }

  const client = requireSupabaseClient();

  try {
    let query = client
      .from(DB_TABLES.ORDERS)
      .select('quantity, savings, created_at')
      .eq('status', 'completed')
      .gte('created_at', params.start_date)
      .lte('created_at', params.end_date);

    if (params.merchant_id) {
      query = query.eq('merchant_id', params.merchant_id);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Calculate totals
    const totalMeals = orders?.reduce((sum, o) => sum + (o.quantity || 0), 0) || 0;
    const totalSavings = orders?.reduce((sum, o) => sum + (o.savings || 0), 0) || 0;
    const totalFoodKg = totalMeals * AVG_MEAL_WEIGHT_KG;
    const totalCO2 = totalFoodKg * CO2_PER_KG_FOOD;

    // Group by day
    const dailyData = orders?.reduce((acc, order: any) => {
      const date = order.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { meals: 0 };
      }
      acc[date].meals += order.quantity || 0;
      return acc;
    }, {} as Record<string, { meals: number }>) || {};

    const dailyBreakdown = Object.entries(dailyData).map(([date, data]: [string, any]) => ({
      date,
      meals_saved: data.meals,
      co2_avoided: data.meals * AVG_MEAL_WEIGHT_KG * CO2_PER_KG_FOOD,
    }));

    return {
      data: {
        period: { start: params.start_date, end: params.end_date },
        stats: {
          total_food_saved_kg: Math.round(totalFoodKg),
          total_money_saved_xaf: totalSavings,
          total_co2_avoided_kg: Math.round(totalCO2),
          total_meals_saved: totalMeals,
          total_orders: orders?.length || 0,
          total_merchants: 0,
          total_users: 0,
        },
        daily_breakdown: dailyBreakdown,
      },
      error: null,
      success: true,
    };
  } catch (error: any) {
    return {
      data: null,
      error: { code: 'FETCH_ERROR', message: error.message },
      success: false,
    };
  }
};
