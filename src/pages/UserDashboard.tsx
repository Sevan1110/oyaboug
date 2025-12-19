import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FoodCard, { FoodItem } from "@/components/FoodCard";
import {
  ShoppingBag,
  Heart,
  Leaf,
  Wallet,
  Bell,
  Search,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const mockReservations = [
  {
    id: "1",
    merchant: "Boulangerie Martin",
    status: "active" as const,
    pickupTime: "18h - 19h",
    price: 5.99,
    code: "AB12CD",
  },
  {
    id: "2",
    merchant: "Sushi Express",
    status: "completed" as const,
    pickupTime: "Hier 21h",
    price: 9.99,
  },
];

const mockFavorites: FoodItem[] = [
  {
    id: "1",
    name: "Panier Boulangerie",
    description: "Assortiment de pains et viennoiseries",
    originalPrice: 15.00,
    discountedPrice: 5.99,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    merchant: { name: "Boulangerie Martin", type: "Boulangerie", distance: "500m" },
    pickupTime: "18h - 19h",
    quantity: 3,
    badges: ["bio"],
  },
  {
    id: "2",
    name: "Panier Fruits & Légumes",
    description: "Fruits et légumes frais de saison",
    originalPrice: 20.00,
    discountedPrice: 6.99,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop",
    merchant: { name: "Primeur du Marché", type: "Primeur", distance: "800m" },
    pickupTime: "17h - 18h30",
    quantity: 5,
    badges: ["bio", "lastItems"],
  },
];

const UserDashboard = () => {
  const stats = [
    { icon: ShoppingBag, value: "12", label: "Commandes", color: "text-primary" },
    { icon: Wallet, value: "47€", label: "Économisés", color: "text-secondary" },
    { icon: Leaf, value: "8.5kg", label: "CO₂ évité", color: "text-success" },
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
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bonjour, <span className="text-gradient">Marie</span> 👋
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
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
              <Card hover className="p-4 h-full">
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
              <Card hover className="p-4 h-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Réservations</p>
                    <p className="text-xs text-muted-foreground">1 en cours</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link to="/user/favorites">
              <Card hover className="p-4 h-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Favoris</p>
                    <p className="text-xs text-muted-foreground">2 commerces</p>
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

            <div className="space-y-4">
              {mockReservations.filter(r => r.status === "active").map((reservation) => (
                <Card key={reservation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{reservation.merchant}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {reservation.pickupTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">À récupérer</Badge>
                      <p className="text-lg font-bold text-foreground mt-1">{reservation.price}€</p>
                      {reservation.code && (
                        <p className="text-xs text-muted-foreground">Code: {reservation.code}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Favorites */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Vos favoris disponibles</h2>
              <Link to="/user/favorites">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {mockFavorites.map((item) => (
                <FoodCard key={item.id} item={item} />
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
