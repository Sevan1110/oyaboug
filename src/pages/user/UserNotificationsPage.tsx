// ============================================
// User Notifications Page - Alerts & Updates
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { UserLayout } from "@/components/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Check,
  Trash2,
  ShoppingBag,
  Percent,
  Star,
  Info,
  CheckCircle
} from "lucide-react";

// Mock notifications
const notifications = [
  {
    id: "1",
    type: "reservation",
    title: "Réservation confirmée",
    message: "Votre réservation chez Boulangerie du Port a été confirmée. Récupération entre 18h00 et 19h00.",
    read: false,
    createdAt: "2024-01-15T10:30:00",
    icon: ShoppingBag,
  },
  {
    id: "2",
    type: "promo",
    title: "Nouvelle offre disponible",
    message: "Restaurant Le Palmier vient d'ajouter une nouvelle offre ! -60% sur le plat du jour.",
    read: false,
    createdAt: "2024-01-15T09:00:00",
    icon: Percent,
  },
  {
    id: "3",
    type: "system",
    title: "Badge débloqué !",
    message: "Félicitations ! Vous avez obtenu le badge 'Éco-warrior' pour avoir sauvé 10 repas.",
    read: true,
    createdAt: "2024-01-14T15:30:00",
    icon: Star,
  },
  {
    id: "4",
    type: "reservation",
    title: "Rappel de récupération",
    message: "N'oubliez pas de récupérer votre commande chez Supermarché Central aujourd'hui entre 17h00 et 18h00.",
    read: true,
    createdAt: "2024-01-14T12:00:00",
    icon: ShoppingBag,
  },
  {
    id: "5",
    type: "system",
    title: "Mise à jour de l'application",
    message: "De nouvelles fonctionnalités sont disponibles ! Découvrez la carte interactive des commerces.",
    read: true,
    createdAt: "2024-01-13T10:00:00",
    icon: Info,
  },
];

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays} jours`;
};

const UserNotificationsPage = () => {
  const [notificationsList, setNotificationsList] = useState(notifications);
  const [activeTab, setActiveTab] = useState("all");

  // Notification settings
  const [settings, setSettings] = useState({
    reservations: true,
    promotions: true,
    reminders: true,
    badges: true,
    newsletter: false,
  });

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotificationsList(notificationsList.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotificationsList(notificationsList.filter(n => n.id !== id));
  };

  const filteredNotifications = notificationsList.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  return (
    <UserLayout title="Notifications" subtitle="Restez informé de vos activités">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Mes notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Tout marquer comme lu
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="unread">Non lues</TabsTrigger>
                  <TabsTrigger value="reservation">Réservations</TabsTrigger>
                  <TabsTrigger value="promo">Promos</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Aucune notification</h3>
                      <p className="text-sm text-muted-foreground">
                        Vous n'avez pas de notification dans cette catégorie.
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all ${
                          notification.read
                            ? "bg-background border-border"
                            : "bg-primary/5 border-primary/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              notification.read
                                ? "bg-muted"
                                : "bg-primary/10"
                            }`}
                          >
                            <notification.icon
                              className={`h-5 w-5 ${
                                notification.read
                                  ? "text-muted-foreground"
                                  : "text-primary"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Marquer comme lu
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Réservations</Label>
                  <p className="text-xs text-muted-foreground">
                    Confirmations et rappels
                  </p>
                </div>
                <Switch
                  checked={settings.reservations}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, reservations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Promotions</Label>
                  <p className="text-xs text-muted-foreground">
                    Nouvelles offres disponibles
                  </p>
                </div>
                <Switch
                  checked={settings.promotions}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, promotions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels</Label>
                  <p className="text-xs text-muted-foreground">
                    Rappels de récupération
                  </p>
                </div>
                <Switch
                  checked={settings.reminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, reminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Badges</Label>
                  <p className="text-xs text-muted-foreground">
                    Récompenses et succès
                  </p>
                </div>
                <Switch
                  checked={settings.badges}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, badges: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <p className="text-xs text-muted-foreground">
                    Actualités et conseils
                  </p>
                </div>
                <Switch
                  checked={settings.newsletter}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, newsletter: checked })
                  }
                />
              </div>

              <Button variant="outline" className="w-full">
                Sauvegarder les préférences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserNotificationsPage;
