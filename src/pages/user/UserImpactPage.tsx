// ============================================
// User Impact Page - Environmental Impact
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

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
  Calendar
} from "lucide-react";

// Mock impact data
const impactData = {
  mealsRescued: 24,
  co2Saved: 48, // kg
  waterSaved: 12000, // liters
  energySaved: 96, // kWh
  moneySaved: 90000, // FCFA
  treesEquivalent: 2.4,
};

const monthlyImpact = [
  { month: "Jan", meals: 4, co2: 8 },
  { month: "Fév", meals: 6, co2: 12 },
  { month: "Mar", meals: 5, co2: 10 },
  { month: "Avr", meals: 9, co2: 18 },
];

const badges = [
  {
    id: "1",
    name: "Premier pas",
    description: "Première réservation effectuée",
    icon: ShoppingBag,
    earned: true,
    earnedDate: "2024-01-05",
  },
  {
    id: "2",
    name: "Éco-warrior",
    description: "10 repas sauvés",
    icon: Leaf,
    earned: true,
    earnedDate: "2024-02-15",
  },
  {
    id: "3",
    name: "Super saver",
    description: "50 000 FCFA économisés",
    icon: TrendingUp,
    earned: true,
    earnedDate: "2024-03-01",
  },
  {
    id: "4",
    name: "Champion vert",
    description: "50 kg de CO₂ évités",
    icon: TreePine,
    earned: false,
    progress: 96, // 48/50 * 100
  },
  {
    id: "5",
    name: "Fidèle",
    description: "30 jours consécutifs d'activité",
    icon: Calendar,
    earned: false,
    progress: 60,
  },
  {
    id: "6",
    name: "Ambassadeur",
    description: "Parrainez 5 amis",
    icon: Award,
    earned: false,
    progress: 20,
  },
];

const UserImpactPage = () => {
  return (
    <UserLayout title="Mon impact" subtitle="Votre contribution à la planète">
      {/* Main Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">{impactData.mealsRescued}</p>
            <p className="text-xs text-muted-foreground">Repas sauvés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <Leaf className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-500">{impactData.co2Saved} kg</p>
            <p className="text-xs text-muted-foreground">CO₂ évités</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-500">{(impactData.waterSaved / 1000).toFixed(1)}k L</p>
            <p className="text-xs text-muted-foreground">Eau économisée</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-500">{impactData.energySaved} kWh</p>
            <p className="text-xs text-muted-foreground">Énergie économisée</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/20">
          <CardContent className="p-4 text-center">
            <TreePine className="h-8 w-8 text-teal-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-teal-500">{impactData.treesEquivalent}</p>
            <p className="text-xs text-muted-foreground">Arbres équivalents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{(impactData.moneySaved / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground">FCFA économisés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progression mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyImpact.map((month) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-muted-foreground">
                      {month.meals} repas • {month.co2} kg CO₂
                    </span>
                  </div>
                  <Progress value={(month.meals / 10) * 100} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">🎯 Objectif du mois</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Sauvez 10 repas ce mois-ci pour débloquer le badge "Champion vert"
              </p>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progression</span>
                <span className="font-medium">9/10 repas</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Badges & Récompenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border transition-all ${
                    badge.earned
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/30 border-border opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-full ${
                        badge.earned ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <badge.icon
                        className={`h-5 w-5 ${
                          badge.earned ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                  {badge.earned ? (
                    <p className="text-xs text-primary">
                      Obtenu le {new Date(badge.earnedDate!).toLocaleDateString("fr-FR")}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <Progress value={badge.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{badge.progress}%</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Equivalents */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Votre impact en perspective</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-3xl mb-2">🚗</p>
              <p className="text-xl font-bold text-foreground">192 km</p>
              <p className="text-sm text-muted-foreground">
                de trajet en voiture évités
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-3xl mb-2">💡</p>
              <p className="text-xl font-bold text-foreground">480 heures</p>
              <p className="text-sm text-muted-foreground">
                d'éclairage LED économisées
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-3xl mb-2">🌳</p>
              <p className="text-xl font-bold text-foreground">2.4 arbres</p>
              <p className="text-sm text-muted-foreground">
                plantés en équivalent CO₂
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </UserLayout>
  );
};

export default UserImpactPage;
