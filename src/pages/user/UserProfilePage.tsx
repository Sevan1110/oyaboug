// ============================================
// User Profile Page - Account Information
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { UserLayout } from "@/components/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Camera,
  Edit,
  Save,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const userData = {
  id: "user-123",
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean.dupont@email.com",
  phone: "+241 77 12 34 56",
  address: "123 Rue de l'Exemple, Libreville",
  bio: "Passionné par l'écologie et la lutte contre le gaspillage alimentaire.",
  avatar: "",
  createdAt: "2024-01-01",
  stats: {
    mealsRescued: 24,
    moneySaved: 90000,
    co2Saved: 48,
    badgesEarned: 3,
  },
};

const UserProfilePage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    address: userData.address,
    bio: userData.bio,
  });

  const handleSave = () => {
    // TODO: Save to backend
    setIsEditing(false);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été enregistrées avec succès.",
    });
  };

  return (
    <UserLayout title="Mon profil" subtitle="Gérez vos informations personnelles">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={userData.avatar} alt={userData.firstName} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-xl font-bold text-foreground">
                {userData.firstName} {userData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Membre depuis {new Date(userData.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  {userData.stats.badgesEarned} badges
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {userData.stats.mealsRescued}
                  </p>
                  <p className="text-xs text-muted-foreground">Repas sauvés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {userData.stats.co2Saved} kg
                  </p>
                  <p className="text-xs text-muted-foreground">CO₂ évités</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
                placeholder="Parlez-nous de vous..."
              />
            </div>

            {/* Member since */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
              <Calendar className="h-4 w-4" />
              <span>
                Membre depuis le {new Date(userData.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default UserProfilePage;
