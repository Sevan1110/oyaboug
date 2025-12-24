// ============================================
// Admin Dashboard Page - Main Overview
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import KPICard from "@/components/admin/KPICard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import MerchantValidationCard from "@/components/admin/MerchantValidationCard";
import MerchantValidationModal from "@/components/admin/MerchantValidationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import type { AdminKPIs, MerchantRegistration, AdminActivity } from "@/types/admin.types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const AdminDashboardPage = () => {
  const [kpis, setKPIs] = useState<AdminKPIs | null>(null);
  const [pendingMerchants, setPendingMerchants] = useState<MerchantRegistration[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [salesStats, setSalesStats] = useState<{ period: string; sales: number; revenue: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantRegistration | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'validate' | 'refuse'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [kpisData, merchantsData, activitiesData, statsData] = await Promise.all([
        adminService.getKPIs(),
        adminService.getMerchants('pending'),
        adminService.getRecentActivities(5),
        adminService.getSalesStats(),
      ]);
      setKPIs(kpisData);
      setPendingMerchants(merchantsData);
      setActivities(activitiesData);
      setSalesStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMerchant = (merchant: MerchantRegistration) => {
    setSelectedMerchant(merchant);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleValidateMerchant = (merchant: MerchantRegistration) => {
    setSelectedMerchant(merchant);
    setModalMode('validate');
    setIsModalOpen(true);
  };

  const handleRefuseMerchant = (merchant: MerchantRegistration) => {
    setSelectedMerchant(merchant);
    setModalMode('refuse');
    setIsModalOpen(true);
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedMerchant) return;

    setIsProcessing(true);
    try {
      await adminService.updateMerchantStatus({
        merchantId: selectedMerchant.id,
        action: modalMode === 'validate' ? 'validate' : 'refuse',
        reason,
        adminId: 'admin-1', // Will be replaced with actual admin ID
      });

      toast.success(
        modalMode === 'validate' 
          ? 'Commerce validé avec succès' 
          : 'Commerce refusé'
      );

      // Refresh data
      loadDashboardData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error processing merchant:', error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout
      title="Tableau de bord"
      subtitle="Vue d'ensemble de la plateforme SaveFood"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Commerces actifs"
          value={kpis?.activeMerchants ?? '-'}
          icon={Store}
          trend={{ value: 12, isPositive: true }}
          variant="success"
        />
        <KPICard
          title="Clients inscrits"
          value={kpis?.totalClients?.toLocaleString() ?? '-'}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          variant="info"
        />
        <KPICard
          title="Produits actifs"
          value={kpis?.activeProducts ?? '-'}
          icon={Package}
          trend={{ value: 5, isPositive: true }}
          variant="warning"
        />
        <KPICard
          title="Ventes totales"
          value={kpis?.totalSales?.toLocaleString() ?? '-'}
          icon={ShoppingBag}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Chiffre d'affaires"
          value={kpis ? adminService.formatCurrency(kpis.totalRevenue) : '-'}
          icon={DollarSign}
          variant="success"
        />
        <KPICard
          title="Taux de conversion"
          value={kpis ? adminService.formatPercentage(kpis.conversionRate) : '-'}
          icon={TrendingUp}
          variant="info"
        />
        <KPICard
          title="En attente"
          value={kpis?.pendingMerchants ?? '-'}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Refusés"
          value={kpis?.refusedMerchants ?? '-'}
          icon={XCircle}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Ventes cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="period" 
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </div>

      {/* Pending Validations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Commerces en attente de validation
          </CardTitle>
          <Link to="/admin/validations">
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingMerchants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="text-muted-foreground">
                Aucune demande en attente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMerchants.slice(0, 3).map((merchant) => (
                <MerchantValidationCard
                  key={merchant.id}
                  merchant={merchant}
                  onView={handleViewMerchant}
                  onValidate={handleValidateMerchant}
                  onRefuse={handleRefuseMerchant}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Modal */}
      <MerchantValidationModal
        merchant={selectedMerchant}
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isProcessing}
      />
    </AdminLayout>
  );
};

export default AdminDashboardPage;
