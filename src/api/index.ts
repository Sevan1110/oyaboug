// ============================================
// API Layer - Centralized Exports
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

// Supabase Client
export { 
  supabaseClient, 
  getSupabaseClient, 
  isSupabaseConfigured,
  requireSupabaseClient 
} from './supabaseClient';

// Routes & Tables
export { API_ROUTES, DB_TABLES } from './routes';
export type { TableName } from './routes';

// Auth API
export {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  onAuthStateChange,
  signInWithOtp,
  verifyOtp,
} from './auth.api';

// Users API
export {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getUserImpact as getUserImpactApi,
} from './users.api';

// Merchants API
export {
  getMerchants,
  getMerchantById,
  getMerchantByUserId,
  createMerchant,
  updateMerchant,
  getNearbyMerchants,
  getMerchantImpact as getMerchantImpactApi,
  searchMerchants,
} from './merchants.api';

// Inventory API
export {
  getAvailableFoodItems,
  getFoodItemById,
  getFoodItemsByMerchant,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  searchFoodItems,
  getFoodCategories,
  updateFoodItemQuantity,
} from './inventory.api';

// Orders API
export {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrdersByMerchant,
  updateOrderStatus,
  cancelOrder,
  confirmOrder,
  markOrderReady,
  completeOrder,
  addOrderReview,
  getActiveOrders,
} from './orders.api';

// Pricing API
export {
  getPricingRecommendation,
  calculateTimeBasedDiscount,
  getPricingHistory,
  savePricingRecommendation,
  getAverageDiscountByCategory,
} from './pricing.api';

// Impact API
export {
  getGlobalImpact,
  getUserImpact,
  getMerchantImpact,
  calculateCO2Impact,
  getImpactLeaderboard,
  logImpact,
  generateImpactReport,
} from './impact.api';
