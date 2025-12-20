// ============================================
// Services Layer - Centralized Exports
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

// Auth Service
export {
  login,
  register,
  logout,
  getAuthSession,
  getAuthUser,
  requestPasswordReset,
  changePassword,
  subscribeToAuthChanges,
  loginWithOtp,
  verifyOtpCode,
  isAuthenticated,
  getUserRole,
} from './auth.service';

// User Service
export {
  getProfile,
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  getImpactStats,
  formatImpactForDisplay,
} from './user.service';

// Merchant Service
export {
  listMerchants,
  getMerchant,
  getMyMerchantProfile,
  registerMerchant,
  updateMerchantProfile,
  findNearbyMerchants,
  search as searchMerchants,
  getMerchantStats,
  formatMerchantImpact,
  isMerchantOpenNow,
  getMerchantTypeName,
} from './merchant.service';

// Inventory Service
export {
  getAvailableItems,
  getItem,
  getMerchantItems,
  createListing,
  updateListing,
  deleteListing,
  search as searchInventory,
  getCategories,
  reserveQuantity,
  restoreQuantity,
  getCategoryName,
  calculateSavings,
  formatPrice,
  isExpiringSoon,
  isPickupPassed,
} from './inventory.service';

// Order Service
export {
  createReservation,
  getOrder,
  getUserOrders,
  getMerchantOrders,
  cancel as cancelOrder,
  confirm as confirmOrder,
  markReady as markOrderReady,
  complete as completeOrder,
  addReview,
  getActive as getActiveOrders,
  getStatusText,
  getStatusColor,
  canCancel,
  canReview,
  formatOrderForDisplay,
  calculateTotalSavings,
} from './order.service';

// Impact Service
export {
  getGlobalStats,
  getUserStats,
  getMerchantStats as getMerchantImpactStats,
  calculateCO2,
  getLeaderboard,
  generateReport,
  formatGlobalImpact,
  calculateEquivalents,
  getImpactTier,
  formatLargeNumber,
} from './impact.service';
