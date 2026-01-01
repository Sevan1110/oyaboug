// ============================================
// Admin Types - Super Admin Dashboard Types
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

// Merchant Status Enum
export type MerchantStatus = 'pending' | 'validated' | 'refused';

// Merchant Registration
export interface MerchantRegistration {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  businessType: string;
  siret: string;
  description: string;
  status: MerchantStatus;
  createdAt: Date;
  updatedAt: Date;
  validatedAt?: Date;
  refusedAt?: Date;
  refusalReason?: string;
  latitude?: number;
  longitude?: number;
}

// Admin KPIs
export interface AdminKPIs {
  totalMerchants: number;
  activeMerchants: number;
  pendingMerchants: number;
  refusedMerchants: number;
  totalClients: number;
  activeProducts: number;
  activeBaskets: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
}

// Geographic Distribution
export interface GeoDistribution {
  city: string;
  merchantCount: number;
  salesCount: number;
}

// Recent Activity
export interface AdminActivity {
  id: string;
  type: 'merchant_registration' | 'merchant_validated' | 'merchant_refused' | 'sale_completed' | 'product_added';
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Merchant Validation Action
export interface MerchantValidationAction {
  merchantId: string;
  action: 'validate' | 'refuse';
  reason?: string;
  adminId: string;
}

// Admin User
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  createdAt: Date;
}

// Sales Statistics
export interface SalesStats {
  period: string;
  sales: number;
  revenue: number;
  orders: number;
}

// Top Merchant
export interface TopMerchant {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  productsCount: number;
}
