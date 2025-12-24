// ============================================
// Merchant Validation Card - Pending Merchant Display
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { MerchantRegistration } from "@/types/admin.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Phone, Mail, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MerchantValidationCardProps {
  merchant: MerchantRegistration;
  onView: (merchant: MerchantRegistration) => void;
  onValidate: (merchant: MerchantRegistration) => void;
  onRefuse: (merchant: MerchantRegistration) => void;
}

const statusStyles = {
  pending: { label: 'En attente', variant: 'secondary' as const },
  validated: { label: 'Validé', variant: 'default' as const },
  refused: { label: 'Refusé', variant: 'destructive' as const },
};

const MerchantValidationCard = ({
  merchant,
  onView,
  onValidate,
  onRefuse,
}: MerchantValidationCardProps) => {
  const status = statusStyles[merchant.status];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Merchant Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {merchant.businessName}
                  </h3>
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {merchant.businessType} • {merchant.ownerName}
                </p>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{merchant.city}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{merchant.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{merchant.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {format(merchant.createdAt, "d MMM yyyy", { locale: fr })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(merchant)}
              className="gap-1"
            >
              <Eye className="w-4 h-4" />
              Voir
            </Button>
            {merchant.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => onValidate(merchant)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Valider
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRefuse(merchant)}
                >
                  Refuser
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Refusal Reason */}
        {merchant.status === 'refused' && merchant.refusalReason && (
          <div className="mt-3 p-2 rounded-lg bg-destructive/10 text-sm text-destructive">
            <strong>Motif :</strong> {merchant.refusalReason}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MerchantValidationCard;
