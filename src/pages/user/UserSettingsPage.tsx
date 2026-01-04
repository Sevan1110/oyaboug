// ============================================
// User Settings Page - App Preferences
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { UserLayout } from "@/components/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Globe, 
  Moon, 
  Bell,
  MapPin,
  Lock,
  Trash2,
  Download,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserSettingsPage = () => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    // Display
    language: "fr",
    darkMode: false,
    
    // Location
    locationEnabled: true,
    defaultRadius: "5",
    
    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    
    // Privacy
    profilePublic: false,
    shareStats: true,
  });

  const handleSave = () => {
    toast({
      title: "Paramètres enregistrés",
      description: "Vos préférences ont été mises à jour.",
    });
  };

  return (
    <UserLayout title="Paramètres" subtitle="Personnalisez votre expérience">
      <div className="space-y-6 max-w-3xl">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Affichage
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Langue</Label>
                  <p className="text-xs text-muted-foreground">
                    Choisissez la langue de l'interface
                  </p>
                </div>
              </div>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Mode sombre</Label>
                  <p className="text-xs text-muted-foreground">
                    Activer le thème sombre
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de géolocalisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Activer la géolocalisation</Label>
                <p className="text-xs text-muted-foreground">
                  Pour trouver les offres près de vous
                </p>
              </div>
              <Switch
                checked={settings.locationEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, locationEnabled: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Rayon de recherche par défaut</Label>
                <p className="text-xs text-muted-foreground">
                  Distance maximale pour les recherches
                </p>
              </div>
              <Select
                value={settings.defaultRadius}
                onValueChange={(value) => setSettings({ ...settings, defaultRadius: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 km</SelectItem>
                  <SelectItem value="2">2 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choisissez comment vous souhaitez être notifié
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications push</Label>
                <p className="text-xs text-muted-foreground">
                  Alertes sur votre appareil
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par email</Label>
                <p className="text-xs text-muted-foreground">
                  Résumés et confirmations par email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications SMS</Label>
                <p className="text-xs text-muted-foreground">
                  Rappels par SMS (peut entraîner des frais)
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Confidentialité
            </CardTitle>
            <CardDescription>
              Contrôlez la visibilité de vos informations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Profil public</Label>
                <p className="text-xs text-muted-foreground">
                  Permettre aux autres de voir votre profil
                </p>
              </div>
              <Switch
                checked={settings.profilePublic}
                onCheckedChange={(checked) => setSettings({ ...settings, profilePublic: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Partager mes statistiques</Label>
                <p className="text-xs text-muted-foreground">
                  Contribuer aux statistiques globales de la plateforme
                </p>
              </div>
              <Switch
                checked={settings.shareStats}
                onCheckedChange={(checked) => setSettings({ ...settings, shareStats: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Gérez la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Télécharger mes données
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserSettingsPage;
