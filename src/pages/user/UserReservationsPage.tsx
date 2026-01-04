// ============================================
// User Reservations Page - Order History
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { UserLayout } from "@/components/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  MapPin, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package
} from "lucide-react";

// Mock data for reservations
const reservations = [
  {
    id: "RES-001",
    merchantName: "Boulangerie du Port",
    merchantAddress: "123 Rue du Commerce, Libreville",
    merchantPhone: "+241 77 12 34 56",
    productName: "Panier surprise boulangerie",
    description: "Pain, viennoiseries, pâtisseries du jour",
    price: 2500,
    originalPrice: 7500,
    pickupTime: "18h00 - 19h00",
    pickupDate: "2024-01-15",
    status: "confirmed",
    createdAt: "2024-01-15T10:30:00",
  },
  {
    id: "RES-002",
    merchantName: "Restaurant Le Palmier",
    merchantAddress: "45 Avenue de l'Indépendance, Libreville",
    merchantPhone: "+241 77 98 76 54",
    productName: "Plat du jour",
    description: "Plat complet avec accompagnement",
    price: 3000,
    originalPrice: 8000,
    pickupTime: "12h00 - 14h00",
    pickupDate: "2024-01-16",
    status: "pending",
    createdAt: "2024-01-15T14:00:00",
  },
  {
    id: "RES-003",
    merchantName: "Supermarché Central",
    merchantAddress: "78 Boulevard Triomphal, Libreville",
    merchantPhone: "+241 77 45 67 89",
    productName: "Panier fruits & légumes",
    description: "Fruits et légumes frais de saison",
    price: 1500,
    originalPrice: 5000,
    pickupTime: "17h00 - 18h00",
    pickupDate: "2024-01-14",
    status: "completed",
    createdAt: "2024-01-14T09:00:00",
  },
  {
    id: "RES-004",
    merchantName: "Pâtisserie Élégance",
    merchantAddress: "12 Rue des Fleurs, Libreville",
    merchantPhone: "+241 77 11 22 33",
    productName: "Assortiment pâtisseries",
    description: "Gâteaux et desserts variés",
    price: 2000,
    originalPrice: 6000,
    pickupTime: "16h00 - 17h00",
    pickupDate: "2024-01-13",
    status: "cancelled",
    createdAt: "2024-01-13T11:00:00",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Confirmée</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">En attente</Badge>;
    case "completed":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Récupérée</Badge>;
    case "cancelled":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Annulée</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "cancelled":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const UserReservationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredReservations = reservations.filter((res) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["confirmed", "pending"].includes(res.status);
    if (activeTab === "completed") return res.status === "completed";
    if (activeTab === "cancelled") return res.status === "cancelled";
    return true;
  });

  return (
    <UserLayout title="Mes réservations" subtitle="Historique et suivi de vos commandes">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{reservations.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {reservations.filter(r => ["confirmed", "pending"].includes(r.status)).length}
            </p>
            <p className="text-sm text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {reservations.filter(r => r.status === "completed").length}
            </p>
            <p className="text-sm text-muted-foreground">Récupérées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">
              {reservations.filter(r => r.status === "cancelled").length}
            </p>
            <p className="text-sm text-muted-foreground">Annulées</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="completed">Récupérées</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucune réservation</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore de réservation dans cette catégorie.
                </p>
                <Button asChild>
                  <a href="/search">Explorer les offres</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredReservations.map((reservation) => (
              <Card key={reservation.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left side - Status indicator */}
                    <div className="p-4 flex items-center justify-center bg-muted/30 md:w-16">
                      {getStatusIcon(reservation.status)}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {reservation.productName}
                            </h3>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {reservation.description}
                          </p>

                          {/* Merchant info */}
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-foreground">
                              {reservation.merchantName}
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{reservation.merchantAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{reservation.merchantPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                Récupération: {reservation.pickupDate} • {reservation.pickupTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and actions */}
                        <div className="text-right space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Réf: {reservation.id}
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {reservation.price.toLocaleString()} FCFA
                          </p>
                          <p className="text-sm text-muted-foreground line-through">
                            {reservation.originalPrice.toLocaleString()} FCFA
                          </p>
                          
                          {reservation.status === "confirmed" && (
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              Voir le code
                            </Button>
                          )}
                          {reservation.status === "pending" && (
                            <Button variant="destructive" size="sm" className="w-full mt-2">
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
};

export default UserReservationsPage;
