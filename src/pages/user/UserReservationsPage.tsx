// ============================================
// User Reservations Page - Order History
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
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
  Package,
  Loader2
} from "lucide-react";
import { 
  getUserOrders, 
  getCurrentUser,
  getStatusText,
  getStatusColor,
  canCancel,
  cancelOrder,
  formatOrderForDisplay
} from "@/services";
import type { Order } from "@/types";

const UserReservationsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadUserAndOrders();
  }, []);

  const loadUserAndOrders = async () => {
    setIsLoading(true);
    
    try {
      // Get current user
      const userResult = await getCurrentUser();
      if (!userResult.data?.user) {
        window.location.href = '/auth';
        return;
      }
      
      const user = userResult.data.user;
      setCurrentUser(user);
      const userId = user.id;

      // Load orders
      const ordersResult = await getUserOrders(userId);
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }

    setIsLoading(false);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    
    const result = await cancelOrder(orderId);
    if (result.success) {
      // Reload orders
      loadUserAndOrders();
    } else {
      alert('Erreur lors de l\'annulation: ' + result.error?.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["confirmed", "pending", "ready"].includes(order.status);
    if (activeTab === "completed") return ["completed", "picked_up"].includes(order.status);
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: string) => {
    const colorClass = getStatusColor(status as any);
    const text = getStatusText(status as any);
    return <Badge className={colorClass}>{text}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "completed":
      case "picked_up":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "ready":
        return <Package className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <UserLayout title="Mes réservations" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Mes réservations" subtitle="Historique de vos commandes">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {orders.filter(o => ["confirmed", "pending", "ready"].includes(o.status)).length}
              </p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">
                {orders.filter(o => ["completed", "picked_up"].includes(o.status)).length}
              </p>
              <p className="text-sm text-muted-foreground">Récupérées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">
                {orders.filter(o => o.status === "cancelled").length}
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
          {filteredOrders.length === 0 ? (
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
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left side - Status indicator */}
                    <div className="p-4 flex items-center justify-center bg-muted/30 md:w-16">
                      {getStatusIcon(order.status)}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {order.food_item?.name || 'Article'}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {order.food_item?.description || ''}
                          </p>

                          {/* Merchant info */}
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-foreground">
                              {order.merchant?.business_name || 'Commerce'}
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{order.merchant?.address || ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{order.merchant?.phone || ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                Récupération: {order.food_item?.pickup_start} - {order.food_item?.pickup_end}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and actions */}
                        <div className="text-right space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Réf: {order.id}
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {order.total_price?.toLocaleString() || 0} FCFA
                          </p>
                          <p className="text-sm text-muted-foreground line-through">
                            {order.original_total?.toLocaleString() || 0} FCFA
                          </p>
                          
                          {order.status === "ready" && (
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              Code: {order.pickup_code}
                            </Button>
                          )}
                          {canCancel(order) && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleCancelOrder(order.id)}
                            >
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
      </div>
    </UserLayout>
  );
};

export default UserReservationsPage;
