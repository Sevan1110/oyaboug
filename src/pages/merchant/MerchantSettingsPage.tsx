// ============================================
// Merchant Settings Page - Account Settings
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import MerchantLayout from "@/components/merchant/MerchantLayout";
import {
  Bell,
  Shield,
  CreditCard,
  Globe,
  Trash2,
  Key,
  Smartphone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

const MerchantSettingsPage = () => {
  const [notifications, setNotifications] = useState({
    newOrder: true,
    orderReady: true,
    orderCancelled: true,
    dailySummary: false,
    marketing: false,
    sms: true,
    email: true,
    push: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
  });

  const handleSave = () => {
    toast.success("Paramètres enregistrés");
  };

  return (
    <MerchantLayout
      title="Paramètres"
      subtitle="Gérez vos préférences et votre compte"
    >
      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configurez comment vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Types de notifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newOrder">Nouvelle réservation</Label>
                    <Switch
                      id="newOrder"
                      checked={notifications.newOrder}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, newOrder: c })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderReady">Commande prête à récupérer</Label>
                    <Switch
                      id="orderReady"
                      checked={notifications.orderReady}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, orderReady: c })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderCancelled">Annulation de commande</Label>
                    <Switch
                      id="orderCancelled"
                      checked={notifications.orderCancelled}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, orderCancelled: c })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dailySummary">Résumé quotidien</Label>
                    <Switch
                      id="dailySummary"
                      checked={notifications.dailySummary}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, dailySummary: c })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Channels */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Canaux de notification
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="sms">SMS</Label>
                    </div>
                    <Switch
                      id="sms"
                      checked={notifications.sms}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, sms: c })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <Switch
                      id="email"
                      checked={notifications.email}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, email: c })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="push">Notifications push</Label>
                    </div>
                    <Switch
                      id="push"
                      checked={notifications.push}
                      onCheckedChange={(c) =>
                        setNotifications({ ...notifications, push: c })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Protégez votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor">Authentification à deux facteurs</Label>
                  <p className="text-xs text-muted-foreground">
                    Ajouter une couche de sécurité supplémentaire
                  </p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={security.twoFactor}
                  onCheckedChange={(c) =>
                    setSecurity({ ...security, twoFactor: c })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Changer le mot de passe</Label>
                <div className="flex gap-2">
                  <Input type="password" placeholder="Nouveau mot de passe" />
                  <Button variant="outline" className="gap-2">
                    <Key className="w-4 h-4" />
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Préférences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Langue</Label>
                <p className="text-sm text-muted-foreground">
                  Français (Gabon)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <p className="text-sm text-muted-foreground">
                  Africa/Libreville (UTC+1)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Devise</Label>
                <p className="text-sm text-muted-foreground">
                  Franc CFA (XAF)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Zone dangereuse
              </CardTitle>
              <CardDescription>
                Actions irréversibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Désactiver le compte
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Votre commerce ne sera plus visible
                  </p>
                </div>
                <Button variant="outline">Désactiver</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">
                    Supprimer le compte
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cette action est irréversible
                  </p>
                </div>
                <Button variant="destructive">Supprimer</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <Button className="w-full" size="lg" onClick={handleSave}>
          Enregistrer les paramètres
        </Button>
      </div>
    </MerchantLayout>
  );
};

export default MerchantSettingsPage;
