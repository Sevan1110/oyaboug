import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  Users,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

const mockProducts = [
  {
    id: "1",
    name: "Panier Boulangerie",
    quantity: 3,
    price: 5.99,
    expiresIn: "2h",
    reserved: 1,
  },
  {
    id: "2",
    name: "Viennoiseries du jour",
    quantity: 5,
    price: 4.99,
    expiresIn: "4h",
    reserved: 2,
  },
];

const mockReservations = [
  {
    id: "1",
    user: "Marie L.",
    product: "Panier Boulangerie",
    time: "18h - 19h",
    status: "pending",
    code: "AB12CD",
  },
  {
    id: "2",
    user: "Thomas B.",
    product: "Viennoiseries du jour",
    time: "18h30 - 19h30",
    status: "pending",
    code: "XY34ZW",
  },
  {
    id: "3",
    user: "Sophie M.",
    product: "Viennoiseries du jour",
    time: "18h30 - 19h30",
    status: "completed",
    code: "PQ56RS",
  },
];

const MerchantDashboard = () => {
  const stats = [
    { icon: Package, value: "8", label: "Produits publiés", color: "text-primary", bgColor: "bg-primary/10" },
    { icon: ShoppingBag, value: "23", label: "Récupérés ce mois", color: "text-success", bgColor: "bg-success/10" },
    { icon: Wallet, value: "156€", label: "Revenus générés", color: "text-secondary", bgColor: "bg-secondary/10" },
    { icon: Leaf, value: "12kg", label: "Gaspillage évité", color: "text-primary", bgColor: "bg-primary/10" },
  ];

  const alerts = [
    { type: "warning", message: "2 produits expirent dans moins de 3h" },
    { type: "info", message: "3 réservations en attente de récupération" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Tableau de bord <span className="text-gradient">commerçant</span>
              </h1>
              <p className="text-muted-foreground">Boulangerie Martin • Paris 11e</p>
            </div>
            <Link to="/merchant/products/new" className="mt-4 md:mt-0">
              <Button variant="hero" className="gap-2">
                <Plus className="w-5 h-5" />
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
              className="space-y-3 mb-8"
            >
              {alerts.map((alert, index) => (
                <Card key={index} className={`p-4 border-l-4 ${alert.type === "warning" ? "border-l-warning" : "border-l-primary"}`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${alert.type === "warning" ? "text-warning" : "text-primary"}`} />
                    <p className="text-sm text-foreground">{alert.message}</p>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
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
                  {mockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{product.quantity} disponible(s)</span>
                          <span>•</span>
                          <span>{product.reserved} réservé(s)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{product.price}€</p>
                        <Badge variant="warning" className="mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {product.expiresIn}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Link to="/merchant/products/new">
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
                  <Link to="/merchant/reservations">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Voir tout <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          reservation.status === "completed" ? "bg-success/10" : "bg-primary/10"
                        }`}>
                          {reservation.status === "completed" ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <Clock className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{reservation.user}</p>
                          <p className="text-xs text-muted-foreground">{reservation.product}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{reservation.time}</p>
                        <p className="text-xs text-muted-foreground">Code: {reservation.code}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
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
                      <span className="text-sm text-muted-foreground">Taux de récupération</span>
                      <span className="text-sm font-medium text-foreground">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Satisfaction clients</span>
                      <span className="text-sm font-medium text-foreground">4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Objectif anti-gaspi</span>
                      <span className="text-sm font-medium text-foreground">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MerchantDashboard;
