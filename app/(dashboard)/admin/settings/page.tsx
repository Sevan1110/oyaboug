"use client";

// ============================================
// Admin Settings Page - Platform Settings
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Bell,
  Shield,
  Mail,
  Globe,
  Database,
  Save,
} from "lucide-react";
import { toast } from "sonner";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    platformName: 'ouyaboung Gabon',
    supportEmail: 'support@ouyaboung.ga',
    autoApprove: false,
    emailNotifications: true,
    maintenanceMode: false,
    registrationOpen: true,
  });

  const handleSave = () => {
    toast.success("Paramètres enregistrés");
  };

  return (
    <AdminLayout
      title="Paramètres"
      subtitle="Configuration de la plateforme"
    >
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            {/* Platform Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Informations de la plateforme
                </CardTitle>
                <CardDescription>
                  Paramètres généraux de la plateforme ouyaboung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="platformName">Nom de la plateforme</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supportEmail">Email de support</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Registration Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Inscriptions
                </CardTitle>
                <CardDescription>
                  Gérez les paramètres d'inscription des commerces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inscriptions ouvertes</Label>
                    <p className="text-sm text-muted-foreground">
                      Autoriser les nouveaux commerces à s'inscrire
                    </p>
                  </div>
                  <Switch
                    checked={settings.registrationOpen}
                    onCheckedChange={(checked) => setSettings({ ...settings, registrationOpen: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Validation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Approuver automatiquement les nouveaux commerces (non recommandé)
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoApprove}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoApprove: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Notifications email
              </CardTitle>
              <CardDescription>
                Configurez les notifications par email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications par email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Types de notifications</Label>
                <div className="space-y-2">
                  {[
                    'Nouvelle inscription commerce',
                    'Nouvelle vente',
                    'Commerce validé',
                    'Commerce refusé',
                    'Alertes système',
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2">
                      <span className="text-sm">{item}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sécurité et maintenance
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le mode maintenance (plateforme inaccessible aux utilisateurs)
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
