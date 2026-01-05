// ============================================
// User Impact Page - Environmental Impact
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
import { UserLayout } from "@/components/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, 
  Droplets, 
  Zap,
  TreePine,
  Award,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Loader2
} from "lucide-react";
import { getCurrentUser, getUserStats } from "@/services";
import type { UserImpact } from "@/types";

const UserImpactPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userImpact, setUserImpact] = useState<UserImpact | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserAndImpact();
  }, []);

  const loadUserAndImpact = async () => {
    setIsLoading(true);
    
    try {
      // Get current user
      const userResult = await getCurrentUser();
      if (!userResult.data?.user) {
        window.location.href = '/auth';
        return;
      }
      
      const user = userResult.data.user;
      setCurrentUser(user);
      const userId = user.id;

      // Load impact data
      const impactResult = await getUserStats(userId);
      if (impactResult.success && impactResult.data) {
        setUserImpact(impactResult.data);
      }
    } catch (error) {
      console.error('Error loading impact data:', error);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <UserLayout title="Mon impact" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (!userImpact) {
    return (
      <UserLayout title="Mon impact" subtitle="Votre contribution à la planète">
        <Card>
          <CardContent className="p-8 text-center">
            <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Aucun impact enregistré</h3>
            <p className="text-muted-foreground mb-4">
              Commencez à faire des réservations pour voir votre impact environnemental.
            </p>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Mon impact" subtitle="Votre contribution à la planète">
      {/* Main Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">{userImpact.orders_count}</p>
            <p className="text-xs text-muted-foreground">Commandes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <Leaf className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-500">{userImpact.co2_avoided_kg.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">CO₂ évités</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-500">{userImpact.food_saved_kg.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">Nourriture sauvée</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{(userImpact.money_saved_xaf / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground">FCFA économisés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Résumé de votre impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6">
                <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Excellent travail !</h3>
                <p className="text-muted-foreground text-sm">
                  Vous avez contribué à réduire le gaspillage alimentaire et à préserver l'environnement.
                  Continuez vos bonnes actions !
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{userImpact.orders_count}</p>
                  <p className="text-xs text-muted-foreground">Commandes totales</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-500">{userImpact.co2_avoided_kg.toFixed(1)}kg</p>
                  <p className="text-xs text-muted-foreground">CO₂ évité</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Prochaines fonctionnalités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🏆 Système de badges</h4>
                <p className="text-sm text-muted-foreground">
                  Gagnez des badges en atteignant des objectifs environnementaux.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">📊 Statistiques mensuelles</h4>
                <p className="text-sm text-muted-foreground">
                  Suivez votre progression mois par mois.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🌍 Classement communautaire</h4>
                <p className="text-sm text-muted-foreground">
                  Comparez-vous avec d'autres utilisateurs engagés.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Équivalents environnementaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Les équivalents environnementaux détaillés seront bientôt disponibles.
              Votre impact positif sur l'environnement est déjà remarquable !
            </p>
          </div>
        </CardContent>
      </Card>
    </UserLayout>
  );
};

export default UserImpactPage;
