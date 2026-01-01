// ============================================
// Merchant Profile Page - Business Settings
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import MerchantLayout from "@/components/merchant/MerchantLayout";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Camera,
  Save,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { MerchantType, GabonCity } from "@/types";

const MERCHANT_TYPES: { value: MerchantType; label: string }[] = [
  { value: "bakery", label: "Boulangerie" },
  { value: "restaurant", label: "Restaurant" },
  { value: "grocery", label: "Épicerie" },
  { value: "supermarket", label: "Supermarché" },
  { value: "hotel", label: "Hôtel" },
  { value: "caterer", label: "Traiteur" },
];

const GABON_CITIES: GabonCity[] = [
  "Libreville",
  "Port-Gentil",
  "Franceville",
  "Oyem",
  "Moanda",
  "Mouila",
  "Lambaréné",
  "Tchibanga",
  "Koulamoutou",
  "Makokou",
];

const MerchantProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    business_name: "Boulangerie du Quartier",
    business_type: "bakery" as MerchantType,
    description: "Boulangerie artisanale proposant pains frais et viennoiseries chaque jour.",
    city: "Libreville" as GabonCity,
    quartier: "Akanda",
    address: "Avenue de la Paix, près du marché",
    phone: "+241 77 12 34 56",
    email: "contact@boulangerie-quartier.ga",
    is_active: true,
  });

  const [hours, setHours] = useState({
    monday: { open: "06:00", close: "19:00", closed: false },
    tuesday: { open: "06:00", close: "19:00", closed: false },
    wednesday: { open: "06:00", close: "19:00", closed: false },
    thursday: { open: "06:00", close: "19:00", closed: false },
    friday: { open: "06:00", close: "19:00", closed: false },
    saturday: { open: "06:00", close: "14:00", closed: false },
    sunday: { open: "07:00", close: "12:00", closed: true },
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Profil mis à jour avec succès");
    setIsLoading(false);
  };

  const dayLabels: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  return (
    <MerchantLayout
      title="Mon commerce"
      subtitle="Gérez les informations de votre établissement"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nom du commerce</Label>
                  <Input
                    id="business_name"
                    value={profile.business_name}
                    onChange={(e) =>
                      setProfile({ ...profile, business_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Type de commerce</Label>
                  <Select
                    value={profile.business_type}
                    onValueChange={(v) =>
                      setProfile({ ...profile, business_type: v as MerchantType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MERCHANT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) =>
                    setProfile({ ...profile, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Select
                    value={profile.city}
                    onValueChange={(v) =>
                      setProfile({ ...profile, city: v as GabonCity })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GABON_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quartier">Quartier</Label>
                  <Input
                    id="quartier"
                    value={profile.quartier}
                    onChange={(e) =>
                      setProfile({ ...profile, quartier: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horaires d'ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(hours).map(([day, time]) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="w-24 font-medium text-foreground">
                      {dayLabels[day]}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={time.open}
                        onChange={(e) =>
                          setHours({
                            ...hours,
                            [day]: { ...time, open: e.target.value },
                          })
                        }
                        disabled={time.closed}
                        className="w-28"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={time.close}
                        onChange={(e) =>
                          setHours({
                            ...hours,
                            [day]: { ...time, close: e.target.value },
                          })
                        }
                        disabled={time.closed}
                        className="w-28"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`closed-${day}`} className="text-sm">
                        Fermé
                      </Label>
                      <Switch
                        id={`closed-${day}`}
                        checked={time.closed}
                        onCheckedChange={(checked) =>
                          setHours({
                            ...hours,
                            [day]: { ...time, closed: checked },
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photo de profil</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-32 h-32 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Store className="w-16 h-16 text-primary" />
              </div>
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                Changer la photo
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Commerce actif</span>
                <Switch
                  checked={profile.is_active}
                  onCheckedChange={(checked) =>
                    setProfile({ ...profile, is_active: checked })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Vérifié
                </Badge>
                <Badge variant="secondary">Depuis 2023</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </motion.div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantProfilePage;
