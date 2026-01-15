"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
    Clock,
    ArrowRight,
    DollarSign,
    Loader2,
} from "lucide-react";
import {
    getMerchantProfile,
    getMerchantStats,
    getActiveOrders, // We might need a specialized getMerchantOrders
    getAvailableItems, // Might need getMerchantItems
} from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/services";
import type { Order, MerchantStats } from "@/types";

export default function MerchantDashboardPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<MerchantStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    // These are placeholders until we have specific merchant service methods
    // For now, we'll rely on what's available or mock some data if service is missing

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                // Fetch merchant stats
                // Note: You'll likely need to implement getMerchantStats properly if not already done
                // For now, we simulate fetching

                // Fetch recent orders for this merchant
                // const orders = await getMerchantOrders(user.id);
                // setRecentOrders(orders);

                // Using placeholder logic for now as services might need updates
                setStats({
                    total_orders: 12,
                    revenue_xaf: 45000,
                    co2_saved_kg: 24.5,
                    items_saved: 15
                });

            } catch (e) {
                console.error("Error loading merchant dashboard", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const dashboardStats = [
        {
            title: "Chiffre d'affaires",
            value: formatPrice(stats?.revenue_xaf || 0),
            label: "+12% ce mois",
            icon: DollarSign,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Commandes",
            value: (stats?.total_orders || 0).toString(),
            label: "3 en attente",
            icon: ShoppingBag,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Impact CO₂",
            value: `${(stats?.co2_saved_kg || 0).toFixed(1)}kg`,
            label: "Très bon score !",
            icon: Leaf,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Impression",
            value: "1.2k",
            label: "Vues du profil",
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
                <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
            </div>

            {/* Alerts / Notifications */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex items-start gap-3"
            >
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Action requise : 3 paniers à valider
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Des clients ont réservé des paniers. Veuillez confirmer leur disponibilité avant 18h00.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 bg-white dark:bg-black/20 border-yellow-300 hover:bg-yellow-100">
                        Gérer les commandes
                    </Button>
                </div>
            </motion.div>

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
                                    {index === 0 && <Badge className="bg-green-500 hover:bg-green-600">Top</Badge>}
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
                                {/* Placeholder for orders list */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                JD
                                            </div>
                                            <div>
                                                <p className="font-medium">Jean Dupont</p>
                                                <p className="text-sm text-muted-foreground">Panier Surprise x1 • 2000 XAF</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="mb-1">En attente</Badge>
                                            <p className="text-xs text-muted-foreground">Il y a 5 min</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stock Status */}
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
                                <div>
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span className="font-medium">Paniers Surprises</span>
                                        <span className="text-muted-foreground">8/20 restants</span>
                                    </div>
                                    <Progress value={40} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span className="font-medium">Pain de la veille</span>
                                        <span className="text-muted-foreground">2/15 restants</span>
                                    </div>
                                    <Progress value={13} className="h-2 bg-secondary/20" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span className="font-medium">Viennoiseries</span>
                                        <span className="text-muted-foreground">0/10 restants</span>
                                    </div>
                                    <Progress value={0} className="h-2 bg-muted" />
                                </div>

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
