// ============================================
// Merchant Dashboard Page - Overview
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MerchantLayout from "@/components/merchant/MerchantLayout";
import {
  Package,
  ShoppingBag,
  Wallet,
  Leaf,
  TrendingUp,
  Plus,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  getMerchantItems,
  getMerchantOrders,
  getMerchantImpactStats,
  formatPrice,
  formatOrderForDisplay,
  isExpiringSoon,
} from "@/services";
import type { FoodItem, Order, MerchantImpact } from "@/types";

const MerchantDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [impact, setImpact] = useState<MerchantImpact | null>(null);
  const [alerts, setAlerts] = useState<{ type: string; message: string }[]>([]);

  const merchantId = "mock-merchant-id";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    const [productsResult, ordersResult, impactResult] = await Promise.all([
      getMerchantItems(merchantId, true),
      getMerchantOrders(merchantId, { perPage: 10 }),
      getMerchantImpactStats(merchantId),
    ]);

    if (productsResult.success && productsResult.data) {
      setProducts(productsResult.data);

      const expiringCount = productsResult.data.filter(
        (p) => p.expiry_date && isExpiringSoon(p.expiry_date)
      ).length;

      if (expiringCount > 0) {
        setAlerts((prev) => [
          ...prev,
          {
            type: "warning",
            message: `${expiringCount} produit(s) expire(nt) dans moins de 3h`,
          },
        ]);
      }
    }

    if (ordersResult.success && ordersResult.data) {
      setOrders(ordersResult.data.data);

      const pendingCount = ordersResult.data.data.filter(
        (o) => o.status === "pending" || o.status === "confirmed"
      ).length;

      if (pendingCount > 0) {
        setAlerts((prev) => [
          ...prev,
          {
            type: "info",
            message: `${pendingCount} réservation(s) en attente de récupération`,
          },
        ]);
      }
    }

    if (impactResult.success && impactResult.data) {
      setImpact(impactResult.data);
    }

    setIsLoading(false);
  };

  const stats = [
    {
      icon: Package,
      value: products.filter((p) => p.is_available).length.toString(),
      label: "Produits actifs",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: ShoppingBag,
      value: impact?.orders_fulfilled?.toString() || "0",
      label: "Récupérés ce mois",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Wallet,
      value: impact ? formatPrice(impact.revenue_from_waste_xaf) : "0 XAF",
      label: "Revenus générés",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Leaf,
      value: impact ? `${impact.food_saved_kg.toFixed(1)}kg` : "0kg",
      label: "Gaspillage évité",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  if (isLoading) {
    return (
      <MerchantLayout title="Tableau de bord">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre activité">
      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link to="/merchant/products" state={{ openAddModal: true }}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </Button>
        </Link>
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-6"
        >
          {alerts.map((alert, index) => (
            <Card
              key={index}
              className={`p-4 border-l-4 ${alert.type === "warning" ? "border-l-warning" : "border-l-primary"
                }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle
                  className={`w-5 h-5 ${alert.type === "warning" ? "text-warning" : "text-primary"
                    }`}
                />
                <p className="text-sm text-foreground">{alert.message}</p>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Produits actifs</CardTitle>
              <Link to="/merchant/products">
                <Button variant="ghost" size="sm" className="gap-1">
                  Gérer <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {products
                .filter((p) => p.is_available)
                .slice(0, 3)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{product.quantity_available} disponible(s)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatPrice(product.discounted_price)}
                      </p>
                      {product.expiry_date && isExpiringSoon(product.expiry_date) && (
                        <Badge variant="outline" className="mt-1 text-warning border-warning">
                          <Clock className="w-3 h-3 mr-1" />
                          Expire bientôt
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              {products.filter((p) => p.is_available).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun produit actif</p>
                </div>
              )}
              <Link to="/merchant/products" state={{ openAddModal: true }}>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter un produit
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Réservations du jour</CardTitle>
              <Link to="/merchant/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.slice(0, 4).map((order) => {
                const formatted = formatOrderForDisplay(order);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === "completed"
                          ? "bg-green-100"
                          : "bg-primary/10"
                          }`}
                      >
                        {order.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {formatted.itemName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.quantity} unité(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={formatted.statusColor}>
                        {formatted.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Code: {order.pickup_code}
                      </p>
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune réservation aujourd'hui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Taux de récupération
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {impact?.waste_reduction_rate || 0}%
                  </span>
                </div>
                <Progress value={impact?.waste_reduction_rate || 0} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Satisfaction clients
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {impact?.average_rating?.toFixed(1) || 0}/5
                  </span>
                </div>
                <Progress value={(impact?.average_rating || 0) * 20} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Objectif anti-gaspi
                  </span>
                  <span className="text-sm font-medium text-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MerchantLayout>
  );
};

export default MerchantDashboardPage;
