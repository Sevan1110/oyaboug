"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    ShoppingBag,
    Package,
    Leaf,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    DollarSign,
    Loader2,
} from "lucide-react";
import {
    getMyMerchantProfile,
    getMerchantStats,
    getMerchantOrders,
    getMerchantItems,
} from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/services";
import type { Order, MerchantImpact, FoodItem } from "@/types";

export default function MerchantDashboardPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [merchantId, setMerchantId] = useState<string | null>(null);
    const [stats, setStats] = useState<MerchantImpact | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [items, setItems] = useState<FoodItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            setIsLoading(true);
            setError(null);

            try {
                // 1. Get Merchant Profile First
                const profileRes = await getMyMerchantProfile(user.id);

                if (!profileRes.success || !profileRes.data) {
                    setError("Commerçant non trouvé. Veuillez compléter votre profil.");
                    setIsLoading(false);
                    return;
                }

                const mId = profileRes.data.id;
                setMerchantId(mId);

                // 2. Fetch all dashboard data in parallel
                const [statsRes, ordersRes, itemsRes] = await Promise.all([
                    getMerchantStats(mId),
                    getMerchantOrders(mId, { perPage: 5, status: 'pending' }), // Get pending orders first
                    getMerchantItems(mId)
                ]);

                if (statsRes.success && statsRes.data) {
                    setStats(statsRes.data);
                }

                if (ordersRes.success && ordersRes.data) {
                    setRecentOrders(ordersRes.data.data); // Paginated response
                }

                if (itemsRes.success && itemsRes.data) {
                    setItems(itemsRes.data);
                }

            } catch (e) {
                console.error("Error loading merchant dashboard", e);
                setError("Une erreur est survenue lors du chargement du tableau de bord.");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

    const dashboardStats = [
        {
            title: "Chiffre d'affaires",
            value: formatPrice(stats?.revenue_from_waste_xaf || 0),
            label: "Total généré",
            icon: DollarSign,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Commandes",
            value: (stats?.orders_fulfilled || 0).toString(),
            label: "Commandes traitées",
            icon: ShoppingBag,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Impact CO₂",
            value: `${(stats?.co2_avoided_kg || 0).toFixed(1)}kg`,
            label: "CO₂ évité",
            icon: Leaf,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Note Moyenne",
            value: (stats?.average_rating || 0).toFixed(1),
            label: "Avis clients",
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    // Calculate pending orders count
    const pendingOrdersCount = recentOrders.filter(o => o.status === 'pending').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Chargement du tableau de bord...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="p-4 rounded-full bg-destructive/10">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">{error}</h2>
                <Link href="/merchant/settings">
                    <Button>Accéder aux paramètres</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
                <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
            </div>

            {/* Alerts / Notifications for Pending Orders */}
            {pendingOrdersCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                            Action requise : {pendingOrdersCount} commande{pendingOrdersCount > 1 ? 's' : ''} à valider
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Des clients ont réservé des paniers. Veuillez confirmer leur disponibilité.
                        </p>
                        <Link href="/merchant/orders?status=pending">
                            <Button variant="outline" size="sm" className="mt-3 bg-white dark:bg-black/20 border-yellow-300 hover:bg-yellow-100 text-yellow-800">
                                Gérer les commandes
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                                    <p className="text-sm font-medium text-foreground/80">{stat.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Commandes récentes</CardTitle>
                            <Link href="/merchant/orders">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    Tout voir <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Aucune commande récente
                                    </div>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase">
                                                    {order.user?.full_name?.substring(0, 2) || "CL"}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{order.user?.full_name || "Client"}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.food_item?.name} x{order.quantity} • {formatPrice(order.total_price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant="outline"
                                                    className={`mb-1 ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                                order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                                                    ''
                                                        }`}
                                                >
                                                    {order.status === 'pending' ? 'En attente' :
                                                        order.status === 'confirmed' ? 'Confirmée' :
                                                            order.status === 'picked_up' ? 'Récupérée' :
                                                                order.status}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stock Status (simplified view) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>État du stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {items.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground text-sm">
                                        Aucun produit en stock
                                    </div>
                                ) : (
                                    items.slice(0, 3).map(item => (
                                        <div key={item.id}>
                                            <div className="flex justify-between mb-2 text-sm">
                                                <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                                                <span className="text-muted-foreground">
                                                    {item.quantity_available} dispo
                                                </span>
                                            </div>
                                            <Progress
                                                value={(item.quantity_available / (item.quantity_initial || item.quantity_available + 10)) * 100}
                                                className="h-2"
                                            />
                                        </div>
                                    ))
                                )}

                                <div className="pt-4">
                                    <Link href="/merchant/products?action=add">
                                        <Button className="w-full gap-2">
                                            <Package className="w-4 h-4" />
                                            Ajouter du stock
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
