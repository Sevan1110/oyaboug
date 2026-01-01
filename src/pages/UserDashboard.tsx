// ============================================
// User Dashboard - User Account Page
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FoodCard, { FoodItem as FoodCardItem } from "@/components/FoodCard";
import {
  ShoppingBag,
  Heart,
  Leaf,
  Wallet,
  Search,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { 
  getUserOrders, 
  getActiveOrders, 
  getUserStats, 
  formatOrderForDisplay,
  formatPrice,
  getAvailableItems,
} from "@/services";
import type { Order, FoodItem, UserImpact } from "@/types";

const UserDashboard = () => {
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
      setFavoriteItems(itemsResult.data.data.slice(0, 2));
    }

    setIsLoading(false);
  };

  const stats = [
    { 
      icon: ShoppingBag, 
      value: userImpact?.orders_count?.toString() || "0", 
      label: "Commandes", 
      color: "text-primary" 
    },
    { 
      icon: Wallet, 
      value: userImpact ? formatPrice(userImpact.money_saved_xaf) : "0 XAF", 
      label: "Économisés", 
      color: "text-secondary" 
    },
    { 
      icon: Leaf, 
      value: userImpact ? `${userImpact.co2_avoided_kg.toFixed(1)}kg` : "0kg", 
      label: "CO₂ évité", 
      color: "text-success" 
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
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bonjour, <span className="text-gradient">Utilisateur</span> 👋
            </h1>
            <p className="text-muted-foreground">
              Voici le résumé de votre activité anti-gaspillage
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center p-4">
                  <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid sm:grid-cols-3 gap-4 mb-8"
          >
            <Link to="/search">
              <Card className="p-4 h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Rechercher</p>
                    <p className="text-xs text-muted-foreground">Trouver des invendus</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link to="/user/reservations">
              <Card className="p-4 h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Réservations</p>
                    <p className="text-xs text-muted-foreground">{activeOrders.length} en cours</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link to="/user/favorites">
              <Card className="p-4 h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Favoris</p>
                    <p className="text-xs text-muted-foreground">Vos commerces préférés</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Active Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Réservations en cours</h2>
              <Link to="/user/reservations">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {activeOrders.length > 0 ? (
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const formatted = formatOrderForDisplay(order);
                  return (
                    <Card key={order.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{formatted.merchantName}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatted.itemName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={formatted.statusColor}>
                            {formatted.status}
                          </Badge>
                          <p className="text-lg font-bold text-foreground mt-1">{formatted.totalPrice}</p>
                          {order.pickup_code && (
                            <p className="text-xs text-muted-foreground">Code: {order.pickup_code}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Aucune réservation en cours</p>
                <Link to="/search">
                  <Button variant="link" className="mt-2">
                    Trouver des invendus
                  </Button>
                </Link>
              </Card>
            )}
          </motion.div>

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

            <div className="grid sm:grid-cols-2 gap-4">
              {favoriteItems.map((item) => (
                <FoodCard key={item.id} item={toFoodCardItem(item)} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
