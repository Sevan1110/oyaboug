// ============================================
// User Dashboard - User Account Page
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CheckCircle2,
  Bell,
  Store,
} from "lucide-react";
import { 
  getUserOrders, 
  getActiveOrders, 
  getUserStats, 
  formatOrderForDisplay,
  formatPrice,
  getAvailableItems,
  getFavorites,
  toggleFavorite,
  getNotificationPreferences,
  updateNotificationPreferences,
  getMerchant,
  getCategories,
} from "@/services";
import type { Order, FoodItem, UserImpact, Merchant, UserPreferences } from "@/types";

const UserDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<Order[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FoodItem[]>([]);
  const [userImpact, setUserImpact] = useState<UserImpact | null>(null);
  const [consumedOrderIds, setConsumedOrderIds] = useState<Set<string>>(new Set());
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState<Set<string>>(new Set());
  const [favoriteMerchants, setFavoriteMerchants] = useState<Merchant[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(new Set());
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ category: string; count: number }[]>([]);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isUpdatingFavorites, setIsUpdatingFavorites] = useState(false);
  
  // Mock user ID - in real app, get from auth context
  const userId = "mock-user-id";

  const storageKey = `savefood:user:${userId}:consumedOrders`;
  const favoriteProductsStorageKey = `savefood:user:${userId}:favoriteProducts`;

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as string[];
        setConsumedOrderIds(new Set(parsed));
      } catch {
        setConsumedOrderIds(new Set());
      }
    }

    const rawFavProducts = localStorage.getItem(favoriteProductsStorageKey);
    if (rawFavProducts) {
      try {
        const parsed = JSON.parse(rawFavProducts) as string[];
        setFavoriteProductIds(new Set(parsed));
      } catch {
        setFavoriteProductIds(new Set());
      }
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    // Load in parallel
    const [ordersResult, purchasesResult, impactResult, itemsResult, favoritesResult, prefsResult, categoriesResult] = await Promise.all([
      getActiveOrders({ userId }),
      getUserOrders(userId, { perPage: 50, page: 1 }),
      getUserStats(userId),
      getAvailableItems({ perPage: 4 }),
      getFavorites(userId),
      getNotificationPreferences(userId),
      getCategories(),
    ]);

    if (ordersResult.success && ordersResult.data) {
      setActiveOrders(ordersResult.data);
    }

    if (purchasesResult.success && purchasesResult.data) {
      const orders = purchasesResult.data.data;
      const purchased = orders.filter((o) => o.status === "picked_up" || o.status === "completed");
      setPurchaseHistory(purchased);
    }

    if (impactResult.success && impactResult.data) {
      setUserImpact(impactResult.data);
    }

    if (itemsResult.success && itemsResult.data) {
      setFavoriteItems(itemsResult.data.data.slice(0, 2));
    }

    if (categoriesResult.success && categoriesResult.data) {
      setCategoryOptions(categoriesResult.data.map((c) => ({ category: String(c.category), count: c.count })));
    }

    if (prefsResult.success && prefsResult.data) {
      setPreferences(prefsResult.data);
    }

    if (favoritesResult.success && favoritesResult.data) {
      const ids = favoritesResult.data;
      const idsSet = new Set(ids);
      setFavoriteMerchantIds(idsSet);

      const merchantsResults = await Promise.all(ids.map((id) => getMerchant(id)));
      const merchants = merchantsResults
        .filter((r) => r.success && r.data)
        .map((r) => r.data as Merchant);
      setFavoriteMerchants(merchants);
    }

    setIsLoading(false);
  };

  const persistConsumedOrders = (next: Set<string>) => {
    setConsumedOrderIds(next);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
  };

  const toggleConsumed = (orderId: string) => {
    const next = new Set(consumedOrderIds);
    if (next.has(orderId)) {
      next.delete(orderId);
    } else {
      next.add(orderId);
    }
    persistConsumedOrders(next);
  };

  const persistFavoriteProducts = (next: Set<string>) => {
    setFavoriteProductIds(next);
    localStorage.setItem(favoriteProductsStorageKey, JSON.stringify(Array.from(next)));
  };

  const toggleFavoriteProduct = (productId: string) => {
    const next = new Set(favoriteProductIds);
    if (next.has(productId)) {
      next.delete(productId);
    } else {
      next.add(productId);
    }
    persistFavoriteProducts(next);
  };

  const handleToggleFavoriteMerchant = async (merchantId: string) => {
    const isFav = favoriteMerchantIds.has(merchantId);
    setIsUpdatingFavorites(true);
    const res = await toggleFavorite(userId, merchantId, isFav);
    setIsUpdatingFavorites(false);
    if (!res.success) return;

    const next = new Set(favoriteMerchantIds);
    if (isFav) {
      next.delete(merchantId);
      setFavoriteMerchants((prev) => prev.filter((m) => m.id !== merchantId));
    } else {
      next.add(merchantId);
      const merchantRes = await getMerchant(merchantId);
      if (merchantRes.success && merchantRes.data) {
        setFavoriteMerchants((prev) => [merchantRes.data, ...prev]);
      }
    }
    setFavoriteMerchantIds(next);
  };

  const updatePrefs = (patch: Partial<UserPreferences>) => {
    if (!preferences) return;
    setPreferences({ ...preferences, ...patch });
  };

  const togglePrefCategory = (category: string) => {
    if (!preferences) return;
    const set = new Set(preferences.favorite_categories || []);
    if (set.has(category)) set.delete(category);
    else set.add(category);
    updatePrefs({ favorite_categories: Array.from(set) });
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setIsSavingPreferences(true);
    await updateNotificationPreferences(userId, {
      notificationsEnabled: preferences.notifications_enabled,
      emailNotifications: preferences.email_notifications,
      smsNotifications: preferences.sms_notifications,
      maxDistanceKm: preferences.max_distance_km,
      favoriteCategories: preferences.favorite_categories,
    });
    setIsSavingPreferences(false);
  };

  const totalSpentXaf = purchaseHistory.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const consumedBasketsCount = purchaseHistory.reduce(
    (sum, o) => sum + (consumedOrderIds.has(o.id) ? 1 : 0),
    0
  );
  const consumedProductsCount = purchaseHistory.reduce(
    (sum, o) => sum + (consumedOrderIds.has(o.id) ? o.quantity : 0),
    0
  );

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

          {/* Purchase History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Historique d'achats</h2>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Montant dépensé</p>
                <p className="text-sm font-semibold text-foreground">{formatPrice(totalSpentXaf)}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Achats</p>
                    <p className="text-lg font-bold text-foreground">{purchaseHistory.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paniers consommés</p>
                    <p className="text-lg font-bold text-foreground">{consumedBasketsCount}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Produits consommés</p>
                    <p className="text-lg font-bold text-foreground">{consumedProductsCount}</p>
                  </div>
                </div>
              </Card>
            </div>

            {purchaseHistory.length > 0 ? (
              <div className="space-y-4">
                {purchaseHistory.slice(0, 6).map((order) => {
                  const formatted = formatOrderForDisplay(order);
                  const isConsumed = consumedOrderIds.has(order.id);

                  return (
                    <Card key={order.id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{formatted.merchantName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatted.itemName} • x{formatted.quantity} • {formatted.createdAt}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={formatted.statusColor}>{formatted.status}</Badge>
                          <p className="text-lg font-bold text-foreground mt-1">{formatted.totalPrice}</p>
                          <Button
                            type="button"
                            variant={isConsumed ? "secondary" : "outline"}
                            size="sm"
                            className="mt-2"
                            onClick={() => toggleConsumed(order.id)}
                          >
                            {isConsumed ? "Consommé" : "Marquer consommé"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Aucun achat pour le moment</p>
                <Link to="/search">
                  <Button variant="link" className="mt-2">
                    Découvrir des invendus
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
              {favoriteItems.map((item) => {
                const isFavProduct = favoriteProductIds.has(item.id);
                return (
                  <div key={item.id} className="relative">
                    <div className="absolute right-3 top-3 z-10">
                      <Button
                        type="button"
                        size="icon"
                        variant={isFavProduct ? "secondary" : "outline"}
                        onClick={() => toggleFavoriteProduct(item.id)}
                      >
                        <Heart className={isFavProduct ? "w-4 h-4 text-destructive" : "w-4 h-4"} />
                      </Button>
                    </div>
                    <FoodCard item={toFoodCardItem(item)} />
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-8"
          >
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Restaurants favoris</h2>
                  </div>
                  <Badge className="bg-primary/10 text-primary">{favoriteMerchantIds.size}</Badge>
                </div>

                {favoriteMerchants.length > 0 ? (
                  <div className="space-y-3">
                    {favoriteMerchants.slice(0, 6).map((m) => {
                      const isFav = favoriteMerchantIds.has(m.id);
                      return (
                        <div key={m.id} className="flex items-center justify-between gap-3 border rounded-xl p-3">
                          <div>
                            <p className="font-medium text-foreground">{m.business_name}</p>
                            <p className="text-xs text-muted-foreground">{m.city} • {m.quartier}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={isFav ? "secondary" : "outline"}
                            disabled={isUpdatingFavorites}
                            onClick={() => handleToggleFavoriteMerchant(m.id)}
                          >
                            {isFav ? "Retirer" : "Ajouter"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Aucun restaurant favori</p>
                    <Link to="/search">
                      <Button variant="link" className="mt-2">Trouver des commerces</Button>
                    </Link>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-secondary" />
                    <h2 className="text-xl font-semibold text-foreground">Préférences d'alertes</h2>
                  </div>
                </div>

                {preferences ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-foreground">Notifications</Label>
                      <Switch
                        checked={preferences.notifications_enabled}
                        onCheckedChange={(checked) => updatePrefs({ notifications_enabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-foreground">Email</Label>
                      <Switch
                        checked={preferences.email_notifications}
                        onCheckedChange={(checked) => updatePrefs({ email_notifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-foreground">SMS</Label>
                      <Switch
                        checked={preferences.sms_notifications}
                        onCheckedChange={(checked) => updatePrefs({ sms_notifications: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-distance" className="text-sm text-foreground">Distance max (km)</Label>
                      <Input
                        id="max-distance"
                        type="number"
                        min={1}
                        value={preferences.max_distance_km}
                        onChange={(e) => updatePrefs({ max_distance_km: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-foreground">Types/catégories favoris</Label>
                      <div className="max-h-44 overflow-auto space-y-2 pr-1">
                        {categoryOptions.map((c) => {
                          const checked = (preferences.favorite_categories || []).includes(c.category);
                          return (
                            <div key={c.category} className="flex items-center justify-between gap-3 border rounded-xl p-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(v) => {
                                    if (v === true) togglePrefCategory(c.category);
                                    else togglePrefCategory(c.category);
                                  }}
                                />
                                <span className="text-sm text-foreground">{c.category}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{c.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="w-full"
                      disabled={isSavingPreferences}
                      onClick={savePreferences}
                    >
                      {isSavingPreferences ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
