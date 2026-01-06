
// ============================================
// User Notifications Page - Alerts & Updates
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
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
  CheckCircle,
  Package,
  QrCode,
  TrendingUp,
  Sparkles,
  Info,
  Save,
  Loader2
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { AppNotification, NotificationPreferences } from "@/types/notification.types";
import { useToast } from "@/hooks/use-toast";

const getNotificationIcon = (type: AppNotification["type"]) => {
  switch (type) {
    case "order_confirmed":
    case "order_ready":
    case "order_completed":
      return Package;
    case "qr_generated":
    case "qr_scanned":
      return QrCode;
    case "impact_milestone":
      return TrendingUp;
    case "new_food_nearby":
    case "promotion":
    case "flash_sale":
      return Sparkles;
    case "system_update":
      return Info;
    default:
      return Bell;
  }
};

const UserNotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
    preferences,
    updatePreferences
  } = useNotifications();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local preferences with server preferences on load
  useEffect(() => {
    if (preferences && !localPreferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences, localPreferences]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    if (activeTab === "reservation") return n.category === "order";
    if (activeTab === "promo") return n.category === "promotion";
    return true;
  });

  const handleCategoryToggle = (category: keyof NotificationPreferences['categories']) => {
    if (!localPreferences) return;
    setLocalPreferences({
      ...localPreferences,
      categories: {
        ...localPreferences.categories,
        [category]: !localPreferences.categories[category]
      }
    });
    setHasChanges(true);
  };

  const handleGlobalToggle = (key: 'push_enabled' | 'email_enabled') => {
    if (!localPreferences) return;
    setLocalPreferences({
      ...localPreferences,
      [key]: !localPreferences[key]
    });
    setHasChanges(true);
  };

  const handleSavePreferences = async () => {
    if (!localPreferences) return;
    setIsSaving(true);
    await updatePreferences(localPreferences);
    setIsSaving(false);
    setHasChanges(false);
    toast({
      title: "Préférences sauvegardées",
      description: "Vos préférences de notification ont été mises à jour.",
    });
  };

  if (!localPreferences) {
    return (
      <UserLayout title="Notifications" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

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
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Aucune notification</h3>
                      <p className="text-sm text-muted-foreground">
                        Vous n'avez pas de notification dans cette catégorie.
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border transition-all ${notification.is_read
                              ? "bg-background border-border"
                              : "bg-primary/5 border-primary/20"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full ${notification.is_read
                                  ? "bg-muted"
                                  : "bg-primary/10"
                                }`}
                            >
                              <Icon
                                className={`h-5 w-5 ${notification.is_read
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
                                  {formatDistanceToNow(parseISO(notification.created_at), {
                                    addSuffix: true,
                                    locale: fr,
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {!notification.is_read && (
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
                      );
                    })
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
                  checked={localPreferences.categories.order}
                  onCheckedChange={() => handleCategoryToggle('order')}
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
                  checked={localPreferences.categories.promotion}
                  onCheckedChange={() => handleCategoryToggle('promotion')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Système</Label>
                  <p className="text-xs text-muted-foreground">
                    Mises à jour de l'application
                  </p>
                </div>
                <Switch
                  checked={localPreferences.categories.system}
                  onCheckedChange={() => handleCategoryToggle('system')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Badges & Impact</Label>
                  <p className="text-xs text-muted-foreground">
                    Récompenses et succès
                  </p>
                </div>
                <Switch
                  checked={localPreferences.categories.impact}
                  onCheckedChange={() => handleCategoryToggle('impact')}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Notifications Push</Label>
                  <p className="text-xs text-muted-foreground">
                    Sur votre appareil
                  </p>
                </div>
                <Switch
                  checked={localPreferences.push_enabled}
                  onCheckedChange={() => handleGlobalToggle('push_enabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails</Label>
                  <p className="text-xs text-muted-foreground">
                    Recevoir par email
                  </p>
                </div>
                <Switch
                  checked={localPreferences.email_enabled}
                  onCheckedChange={() => handleGlobalToggle('email_enabled')}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSavePreferences}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder les préférences
                  </>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserNotificationsPage;
