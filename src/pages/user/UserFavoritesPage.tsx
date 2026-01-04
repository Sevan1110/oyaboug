// ============================================
// User Favorites Page - Saved Merchants
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { UserLayout } from "@/components/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MapPin, 
  Star, 
  Clock,
  Trash2
} from "lucide-react";

// Mock data for favorites
const favorites = [
  {
    id: "1",
    merchantName: "Boulangerie du Port",
    category: "Boulangerie",
    address: "123 Rue du Commerce, Libreville",
    rating: 4.8,
    reviewCount: 124,
    distance: "0.5 km",
    image: "/placeholder.svg",
    hasActiveOffer: true,
    currentOffer: {
      name: "Panier surprise",
      price: 2500,
      originalPrice: 7500,
      pickupTime: "18h00 - 19h00",
    },
  },
  {
    id: "2",
    merchantName: "Restaurant Le Palmier",
    category: "Restaurant",
    address: "45 Avenue de l'Indépendance, Libreville",
    rating: 4.6,
    reviewCount: 89,
    distance: "1.2 km",
    image: "/placeholder.svg",
    hasActiveOffer: true,
    currentOffer: {
      name: "Plat du jour",
      price: 3000,
      originalPrice: 8000,
      pickupTime: "12h00 - 14h00",
    },
  },
  {
    id: "3",
    merchantName: "Supermarché Central",
    category: "Supermarché",
    address: "78 Boulevard Triomphal, Libreville",
    rating: 4.5,
    reviewCount: 256,
    distance: "0.8 km",
    image: "/placeholder.svg",
    hasActiveOffer: false,
    currentOffer: null,
  },
  {
    id: "4",
    merchantName: "Pâtisserie Élégance",
    category: "Pâtisserie",
    address: "12 Rue des Fleurs, Libreville",
    rating: 4.9,
    reviewCount: 178,
    distance: "2.1 km",
    image: "/placeholder.svg",
    hasActiveOffer: true,
    currentOffer: {
      name: "Assortiment pâtisseries",
      price: 2000,
      originalPrice: 6000,
      pickupTime: "16h00 - 17h00",
    },
  },
];

const UserFavoritesPage = () => {
  const [favoritesList, setFavoritesList] = useState(favorites);

  const removeFavorite = (id: string) => {
    setFavoritesList(favoritesList.filter(fav => fav.id !== id));
  };

  return (
    <UserLayout title="Mes favoris" subtitle="Commerces que vous avez sauvegardés">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{favoritesList.length}</p>
            <p className="text-sm text-muted-foreground">Favoris</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {favoritesList.filter(f => f.hasActiveOffer).length}
            </p>
            <p className="text-sm text-muted-foreground">Avec offres actives</p>
          </CardContent>
        </Card>
      </div>

      {/* Favorites List */}
      {favoritesList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Aucun favori</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore ajouté de commerce à vos favoris.
            </p>
            <Button asChild>
              <a href="/search">Explorer les commerces</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoritesList.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                  <Badge className="absolute top-2 left-2">{favorite.category}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background text-destructive"
                    onClick={() => removeFavorite(favorite.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {favorite.hasActiveOffer && (
                    <Badge className="absolute bottom-2 left-2 bg-green-500 text-white">
                      Offre disponible
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{favorite.merchantName}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{favorite.rating}</span>
                      <span className="text-xs text-muted-foreground">({favorite.reviewCount})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{favorite.address}</span>
                    <span className="text-primary font-medium ml-auto">{favorite.distance}</span>
                  </div>

                  {favorite.hasActiveOffer && favorite.currentOffer && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{favorite.currentOffer.name}</span>
                        <span className="text-primary font-bold">
                          {favorite.currentOffer.price.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{favorite.currentOffer.pickupTime}</span>
                        </div>
                        <span className="line-through">
                          {favorite.currentOffer.originalPrice.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  )}

                  <Button className="w-full mt-4" variant={favorite.hasActiveOffer ? "default" : "outline"}>
                    {favorite.hasActiveOffer ? "Réserver" : "Voir le commerce"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </UserLayout>
  );
};

export default UserFavoritesPage;
