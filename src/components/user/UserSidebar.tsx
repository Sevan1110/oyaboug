// ============================================
// User Sidebar - Navigation Component
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Leaf,
  Settings,
  Bell,
  LogOut,
  HelpCircle,
  User,
  Search,
} from "lucide-react";

const mainMenuItems = [
  {
    title: "Tableau de bord",
    url: "/user",
    icon: LayoutDashboard,
  },
  {
    title: "Rechercher",
    url: "/search",
    icon: Search,
  },
  {
    title: "Mes réservations",
    url: "/user/reservations",
    icon: ShoppingBag,
    badge: 2,
  },
  {
    title: "Mes favoris",
    url: "/user/favorites",
    icon: Heart,
  },
  {
    title: "Mon impact",
    url: "/user/impact",
    icon: Leaf,
  },
];

const settingsMenuItems = [
  {
    title: "Mon profil",
    url: "/user/profile",
    icon: User,
  },
  {
    title: "Notifications",
    url: "/user/notifications",
    icon: Bell,
  },
  {
    title: "Paramètres",
    url: "/user/settings",
    icon: Settings,
  },
  {
    title: "Aide",
    url: "/user/help",
    icon: HelpCircle,
  },
];

interface UserSidebarProps {
  userName?: string;
}

const UserSidebar = ({ userName = "Utilisateur" }: UserSidebarProps) => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/user") {
      return location.pathname === "/user";
    }
    return location.pathname.startsWith(path);
  };

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Obtenir le nom d'affichage de l'utilisateur
  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  };

  // Obtenir l'URL de l'image de profil
  const getProfileImageUrl = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      // La redirection vers la page d'accueil sera gérée par AuthRedirectHandler
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <SidebarMenuButton 
          asChild 
          className="w-full justify-start p-2 h-auto hover:bg-accent/50"
        >
          <Link to="/user/profile">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={getProfileImageUrl()} 
                  alt={getDisplayName()}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground truncate">
                    {getDisplayName()}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    Client ouyaboung
                  </p>
                </div>
              )}
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      to={item.url}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && !isCollapsed && (
                        <Badge
                          variant="secondary"
                          className="ml-auto h-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default UserSidebar;
