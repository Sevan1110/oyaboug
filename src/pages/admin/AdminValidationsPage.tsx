// ============================================
// Admin Validations Page - Pending Merchants
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import MerchantValidationCard from "@/components/admin/MerchantValidationCard";
import MerchantValidationModal from "@/components/admin/MerchantValidationModal";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { MerchantRegistration } from "@/types/admin.types";
import { toast } from "sonner";

const AdminValidationsPage = () => {
  const [pendingMerchants, setPendingMerchants] = useState<MerchantRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantRegistration | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'validate' | 'refuse'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingMerchants();
  }, []);

  const loadPendingMerchants = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getMerchants('pending');
      setPendingMerchants(data);
    } catch (error) {
      console.error('Error loading pending merchants:', error);
      toast.error("Erreur lors du chargement");
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
        adminId: 'admin-1',
      });

      toast.success(
        modalMode === 'validate' 
          ? 'Commerce validé avec succès' 
          : 'Commerce refusé'
      );

      loadPendingMerchants();
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
      title="Validations en attente"
      subtitle="Commerces nécessitant une validation"
    >
      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingMerchants.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Demande{pendingMerchants.length > 1 ? 's' : ''} en attente de validation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending List */}
      {pendingMerchants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Toutes les demandes sont traitées
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Aucune demande d'inscription de commerce en attente de validation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingMerchants.map((merchant) => (
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

export default AdminValidationsPage;
