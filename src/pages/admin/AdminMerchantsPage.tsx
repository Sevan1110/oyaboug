// ============================================
// Admin Merchants Page - Merchant Management
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import MerchantValidationCard from "@/components/admin/MerchantValidationCard";
import MerchantValidationModal from "@/components/admin/MerchantValidationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Store, CheckCircle, XCircle, Clock } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { MerchantRegistration, MerchantStatus } from "@/types/admin.types";
import { toast } from "sonner";

const AdminMerchantsPage = () => {
  const [merchants, setMerchants] = useState<MerchantRegistration[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<MerchantRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | MerchantStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantRegistration | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'validate' | 'refuse'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    filterMerchants();
  }, [merchants, searchQuery, activeTab]);

  const loadMerchants = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getMerchants();
      setMerchants(data);
    } catch (error) {
      console.error('Error loading merchants:', error);
      toast.error("Erreur lors du chargement des commerces");
    } finally {
      setIsLoading(false);
    }
  };

  const filterMerchants = () => {
    let filtered = merchants;

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(m => m.status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.businessName.toLowerCase().includes(query) ||
        m.ownerName.toLowerCase().includes(query) ||
        m.city.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
      );
    }

    setFilteredMerchants(filtered);
  };

  const getCounts = () => {
    return {
      all: merchants.length,
      pending: merchants.filter(m => m.status === 'pending').length,
      validated: merchants.filter(m => m.status === 'validated').length,
      refused: merchants.filter(m => m.status === 'refused').length,
    };
  };

  const counts = getCounts();

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
        adminId: 'admin-1',
      });

      toast.success(
        modalMode === 'validate' 
          ? 'Commerce validé avec succès' 
          : 'Commerce refusé'
      );

      loadMerchants();
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
      title="Gestion des commerces"
      subtitle="Gérez tous les commerces de la plateforme"
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un commerce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="gap-2">
            <Store className="w-4 h-4" />
            Tous ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            En attente ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="validated" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Validés ({counts.validated})
          </TabsTrigger>
          <TabsTrigger value="refused" className="gap-2">
            <XCircle className="w-4 h-4" />
            Refusés ({counts.refused})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredMerchants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Aucun commerce trouvé' : 'Aucun commerce dans cette catégorie'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMerchants.map((merchant) => (
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
        </TabsContent>
      </Tabs>

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

export default AdminMerchantsPage;
