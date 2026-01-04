// ============================================
// User Dashboard Page - With Sidebar Layout
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserLayout } from "@/components/user";
import FoodCard, { FoodItem as FoodCardItem } from "@/components/FoodCard";
import {
  ShoppingBag,
  Heart,
  Leaf,
  Wallet,
  Clock,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { 
  getActiveOrders, 
  getUserStats, 
  formatOrderForDisplay,
  formatPrice,
  getAvailableItems,
} from "@/services";
import type { Order, FoodItem, UserImpact } from "@/types";

const UserDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FoodItem[]>([]);
  const [userImpact, setUserImpact] = useState<UserImpact | null>(null);
  
  // Mock user ID - in real app, get from auth context
  const userId = "mock-user-id";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    // Load in parallel
    const [ordersResult, impactResult, itemsResult] = await Promise.all([
      getActiveOrders({ userId }),
      getUserStats(userId),
      getAvailableItems({ perPage: 4 }),
    ]);

    if (ordersResult.success && ordersResult.data) {
      setActiveOrders(ordersResult.data);
    }

    if (impactResult.success && impactResult.data) {
      setUserImpact(impactResult.data);
    }

    if (itemsResult.success && itemsResult.data) {
      setFavoriteItems(itemsResult.data.data.slice(0, 4));
    }

    setIsLoading(false);
  };

  const stats = [
    { 
      icon: ShoppingBag, 
      value: userImpact?.orders_count?.toString() || "0", 
      label: "Commandes", 
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    { 
      icon: Wallet, 
      value: userImpact ? formatPrice(userImpact.money_saved_xaf) : "0 XAF", 
      label: "Économisés", 
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    { 
      icon: Leaf, 
      value: userImpact ? `${userImpact.co2_avoided_kg.toFixed(1)}kg` : "0kg", 
      label: "CO₂ évité", 
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    { 
      icon: Heart, 
      value: "5", 
      label: "Favoris", 
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  // Convert FoodItem to FoodCardItem format
  const toFoodCardItem = (item: FoodItem): FoodCardItem => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    originalPrice: item.original_price,
    discountedPrice: item.discounted_price,
    image: item.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    merchant: {
      name: item.merchant?.business_name || "Commerce",
      type: item.merchant?.business_type || "other",
      distance: item.merchant?.quartier || "",
    },
    pickupTime: `${item.pickup_start} - ${item.pickup_end}`,
    quantity: item.quantity_available,
    badges: (item.badges || []) as ("bio" | "free" | "lastItems")[],
  });

  if (isLoading) {
    return (
      <UserLayout title="Tableau de bord" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="Tableau de bord" 
      subtitle="Bienvenue sur votre espace anti-gaspillage"
    >
      <div className="space-y-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    Bonjour, <span className="text-primary">Utilisateur</span> 👋
                  </h2>
                  <p className="text-muted-foreground">
                    Vous avez {activeOrders.length} réservation(s) en cours
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-primary">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">+15% impact ce mois</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Réservations en cours</CardTitle>
                <Link to="/user/reservations">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Voir tout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {activeOrders.length > 0 ? (
                  <div className="space-y-3">
                    {activeOrders.slice(0, 3).map((order) => {
                      const formatted = formatOrderForDisplay(order);
                      return (
                        <div 
                          key={order.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{formatted.merchantName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatted.itemName}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${formatted.statusColor} text-xs`}>
                              {formatted.status}
                            </Badge>
                            <p className="text-sm font-bold text-foreground mt-1">
                              {formatted.totalPrice}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-sm">Aucune réservation en cours</p>
                    <Link to="/search">
                      <Button variant="link" size="sm" className="mt-2">
                        Trouver des invendus
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Impact Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Votre impact écologique</CardTitle>
                <Link to="/user/impact">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Détails <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                      <Leaf className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {userImpact ? userImpact.co2_avoided_kg.toFixed(1) : "0"} kg
                        </p>
                        <p className="text-xs text-muted-foreground">CO₂ évité</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold text-foreground">
                        {userImpact?.orders_count || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Repas sauvés</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold text-foreground">
                        {userImpact ? formatPrice(userImpact.money_saved_xaf) : "0 XAF"}
                      </p>
                      <p className="text-xs text-muted-foreground">Économisés</p>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    🌱 Équivalent à {((userImpact?.co2_avoided_kg || 0) / 21).toFixed(0)} arbres plantés
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Suggested Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Suggestions pour vous</h2>
            <Link to="/search">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteItems.map((item) => (
              <FoodCard key={item.id} item={toFoodCardItem(item)} />
            ))}
          </div>
        </motion.div>
      </div>
    </UserLayout>
  );
};

export default UserDashboardPage;
