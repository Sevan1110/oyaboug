// ============================================
// Admin Service - Super Admin Business Logic
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import type {
  MerchantRegistration,
  AdminKPIs,
  GeoDistribution,
  AdminActivity,
  MerchantValidationAction,
  SalesStats,
  TopMerchant,
  MerchantStatus
} from '@/types/admin.types';

// Mock Data - Will be replaced with Supabase calls
const mockMerchants: MerchantRegistration[] = [
  {
    id: '1',
    businessName: 'Boulangerie Le Pain Doré',
    ownerName: 'Jean Dupont',
    email: 'contact@paindore.ga',
    phone: '+241 01 23 45 67',
    address: '123 Avenue de l\'Indépendance',
    city: 'Libreville',
    postalCode: '00001',
    businessType: 'Boulangerie',
    siret: '12345678901234',
    description: 'Boulangerie artisanale proposant pains et viennoiseries',
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    businessName: 'Restaurant Chez Mama',
    ownerName: 'Marie Koumba',
    email: 'mama@restaurant.ga',
    phone: '+241 01 98 76 54',
    address: '45 Rue du Commerce',
    city: 'Libreville',
    postalCode: '00002',
    businessType: 'Restaurant',
    siret: '98765432109876',
    description: 'Restaurant traditionnel gabonais',
    status: 'validated',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    validatedAt: new Date('2024-01-12'),
    latitude: 0.4162,
    longitude: 9.4673,
  },
  {
    id: '3',
    businessName: 'Supermarché FreshMart',
    ownerName: 'Paul Nguema',
    email: 'contact@freshmart.ga',
    phone: '+241 01 11 22 33',
    address: '78 Boulevard Triomphal',
    city: 'Port-Gentil',
    postalCode: '00100',
    businessType: 'Supermarché',
    siret: '11223344556677',
    description: 'Supermarché avec produits frais et locaux',
    status: 'pending',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '4',
    businessName: 'Pâtisserie Délices',
    ownerName: 'Claire Obiang',
    email: 'delices@patisserie.ga',
    phone: '+241 01 44 55 66',
    address: '12 Avenue Léon Mba',
    city: 'Libreville',
    postalCode: '00003',
    businessType: 'Pâtisserie',
    siret: '44556677889900',
    description: 'Pâtisserie fine et gâteaux sur commande',
    status: 'refused',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-08'),
    refusedAt: new Date('2024-01-08'),
    refusalReason: 'Documents incomplets - Veuillez fournir le registre de commerce',
  },
];

const mockKPIs: AdminKPIs = {
  totalMerchants: 45,
  activeMerchants: 32,
  pendingMerchants: 8,
  refusedMerchants: 5,
  totalClients: 1250,
  activeProducts: 156,
  activeBaskets: 42,
  totalSales: 3420,
  totalRevenue: 15680000,
  conversionRate: 68.5,
  averageOrderValue: 4585,
};

const mockGeoDistribution: GeoDistribution[] = [
  { city: 'Libreville', merchantCount: 28, salesCount: 2100 },
  { city: 'Port-Gentil', merchantCount: 8, salesCount: 650 },
  { city: 'Franceville', merchantCount: 4, salesCount: 320 },
  { city: 'Oyem', merchantCount: 3, salesCount: 200 },
  { city: 'Moanda', merchantCount: 2, salesCount: 150 },
];

const mockActivities: AdminActivity[] = [
  {
    id: '1',
    type: 'merchant_registration',
    description: 'Nouvelle inscription: Boulangerie Le Pain Doré',
    timestamp: new Date('2024-01-18T14:30:00'),
  },
  {
    id: '2',
    type: 'sale_completed',
    description: 'Vente complétée: Restaurant Chez Mama - 15,000 FCFA',
    timestamp: new Date('2024-01-18T12:15:00'),
  },
  {
    id: '3',
    type: 'merchant_validated',
    description: 'Commerce validé: Restaurant Chez Mama',
    timestamp: new Date('2024-01-17T16:45:00'),
  },
  {
    id: '4',
    type: 'product_added',
    description: 'Nouveau produit: Panier surprise du jour',
    timestamp: new Date('2024-01-17T10:00:00'),
  },
  {
    id: '5',
    type: 'merchant_refused',
    description: 'Commerce refusé: Pâtisserie Délices',
    timestamp: new Date('2024-01-16T09:30:00'),
  },
];

const mockSalesStats: SalesStats[] = [
  { period: 'Lun', sales: 45, revenue: 225000, orders: 45 },
  { period: 'Mar', sales: 52, revenue: 260000, orders: 52 },
  { period: 'Mer', sales: 38, revenue: 190000, orders: 38 },
  { period: 'Jeu', sales: 65, revenue: 325000, orders: 65 },
  { period: 'Ven', sales: 78, revenue: 390000, orders: 78 },
  { period: 'Sam', sales: 92, revenue: 460000, orders: 92 },
  { period: 'Dim', sales: 55, revenue: 275000, orders: 55 },
];

const mockTopMerchants: TopMerchant[] = [
  { id: '1', name: 'Restaurant Chez Mama', sales: 450, revenue: 2250000, productsCount: 12 },
  { id: '2', name: 'Boulangerie Centrale', sales: 380, revenue: 1900000, productsCount: 8 },
  { id: '3', name: 'Supermarché Bio', sales: 320, revenue: 1600000, productsCount: 25 },
  { id: '4', name: 'Café du Port', sales: 280, revenue: 1400000, productsCount: 6 },
  { id: '5', name: 'Traiteur Excellence', sales: 250, revenue: 1250000, productsCount: 15 },
];

// Service Functions
export const adminService = {
  // Get all merchants with optional status filter
  getMerchants: async (status?: MerchantStatus): Promise<MerchantRegistration[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (status) {
      return mockMerchants.filter(m => m.status === status);
    }
    return mockMerchants;
  },

  // Get merchant by ID
  getMerchantById: async (id: string): Promise<MerchantRegistration | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockMerchants.find(m => m.id === id) || null;
  },

  // Validate or refuse a merchant
  updateMerchantStatus: async (action: MerchantValidationAction): Promise<MerchantRegistration> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const merchant = mockMerchants.find(m => m.id === action.merchantId);
    if (!merchant) {
      throw new Error('Commerce non trouvé');
    }

    const updatedMerchant = {
      ...merchant,
      status: action.action === 'validate' ? 'validated' as const : 'refused' as const,
      updatedAt: new Date(),
      ...(action.action === 'validate' 
        ? { validatedAt: new Date() } 
        : { refusedAt: new Date(), refusalReason: action.reason }
      ),
    };

    // In real implementation, update database here
    return updatedMerchant;
  },

  // Get Admin KPIs
  getKPIs: async (): Promise<AdminKPIs> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockKPIs;
  },

  // Get Geographic Distribution
  getGeoDistribution: async (): Promise<GeoDistribution[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGeoDistribution;
  },

  // Get Recent Activities
  getRecentActivities: async (limit: number = 10): Promise<AdminActivity[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockActivities.slice(0, limit);
  },

  // Get Sales Statistics
  getSalesStats: async (): Promise<SalesStats[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockSalesStats;
  },

  // Get Top Merchants
  getTopMerchants: async (limit: number = 5): Promise<TopMerchant[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTopMerchants.slice(0, limit);
  },

  // Format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  },

  // Format percentage
  formatPercentage: (value: number): string => {
    return value.toFixed(1) + '%';
  },
};

export default adminService;
