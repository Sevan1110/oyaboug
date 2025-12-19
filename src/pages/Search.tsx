import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FoodCard, { FoodItem } from "@/components/FoodCard";
import { Search as SearchIcon, MapPin, Filter, Grid, Map, Clock, Store, SlidersHorizontal } from "lucide-react";

const mockItems: FoodItem[] = [
  {
    id: "1",
    name: "Panier Boulangerie",
    description: "Assortiment de pains, viennoiseries et pâtisseries du jour",
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
    description: "Fruits et légumes frais de saison, idéal pour une famille",
    originalPrice: 20.00,
    discountedPrice: 6.99,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop",
    merchant: { name: "Primeur du Marché", type: "Primeur", distance: "800m" },
    pickupTime: "17h - 18h30",
    quantity: 5,
    badges: ["bio", "lastItems"],
  },
  {
    id: "3",
    name: "Panier Sushi",
    description: "Assortiment de sushis, makis et california rolls",
    originalPrice: 25.00,
    discountedPrice: 9.99,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    merchant: { name: "Sushi Express", type: "Restaurant", distance: "1.2km" },
    pickupTime: "21h - 22h",
    quantity: 2,
    badges: ["lastItems"],
  },
  {
    id: "4",
    name: "Panier Pâtisserie",
    description: "Éclairs, tartes et macarons du jour",
    originalPrice: 18.00,
    discountedPrice: 0,
    image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400&h=300&fit=crop",
    merchant: { name: "Douceurs de Marie", type: "Pâtisserie", distance: "350m" },
    pickupTime: "19h - 20h",
    quantity: 1,
    badges: ["free", "lastItems"],
  },
  {
    id: "5",
    name: "Panier Traiteur",
    description: "Plats cuisinés, salades composées et accompagnements",
    originalPrice: 22.00,
    discountedPrice: 7.99,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    merchant: { name: "Le Petit Chef", type: "Traiteur", distance: "600m" },
    pickupTime: "18h30 - 19h30",
    quantity: 4,
    badges: [],
  },
  {
    id: "6",
    name: "Panier Bio",
    description: "Produits bio variés : pain, fruits, yaourts",
    originalPrice: 16.00,
    discountedPrice: 5.49,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    merchant: { name: "Bio & Local", type: "Épicerie", distance: "900m" },
    pickupTime: "17h - 18h",
    quantity: 6,
    badges: ["bio"],
  },
];

const SearchPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 20]);

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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Trouver des <span className="text-gradient">invendus</span>
            </h1>
            <p className="text-muted-foreground">
              Découvrez les offres disponibles près de chez vous
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Entrez votre adresse ou ville..."
                    className="pl-10 h-12"
                  />
                </div>
                <Button size="lg" className="gap-2 h-12">
                  <SearchIcon className="w-5 h-5" />
                  Rechercher
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Filters & View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 mb-6"
          >
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </Button>

            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent px-3 py-1.5">
                <Store className="w-3 h-3 mr-1" /> Boulangerie
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent px-3 py-1.5">
                <Store className="w-3 h-3 mr-1" /> Restaurant
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent px-3 py-1.5">
                <Store className="w-3 h-3 mr-1" /> Primeur
              </Badge>
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("map")}
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Extended Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Type de commerce
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="bakery">Boulangerie</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="grocery">Épicerie</SelectItem>
                        <SelectItem value="supermarket">Supermarché</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Heure de retrait
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les heures" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les heures</SelectItem>
                        <SelectItem value="morning">Matin (8h-12h)</SelectItem>
                        <SelectItem value="afternoon">Après-midi (12h-18h)</SelectItem>
                        <SelectItem value="evening">Soir (18h-22h)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-4 block">
                      Prix max: {priceRange[1]}€
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Distance
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="5 km" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 km</SelectItem>
                        <SelectItem value="2">2 km</SelectItem>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{mockItems.length}</span> résultats trouvés
            </p>
            <Select defaultValue="distance">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="price">Prix croissant</SelectItem>
                <SelectItem value="discount">Réduction</SelectItem>
                <SelectItem value="time">Heure de retrait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FoodCard item={item} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="h-[500px] flex items-center justify-center bg-muted/50">
              <div className="text-center text-muted-foreground">
                <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>La carte interactive sera disponible après connexion</p>
                <Button variant="link" className="mt-2">
                  Se connecter pour voir la carte
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
