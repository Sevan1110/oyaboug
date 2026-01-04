// ============================================
// User Layout - Dashboard Layout Wrapper
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import UserSidebar from "./UserSidebar";
import { Bell, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const UserLayout = ({ children, title, subtitle }: UserLayoutProps) => {
  const { toast } = useToast();
  const { signOut, user } = useAuth();

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

  // Obtenir l'URL de l'image de profil
  const getProfileImageUrl = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  // Obtenir le nom d'affichage de l'utilisateur
  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <UserSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger className="-ml-1" />
              
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des offres..."
                    className="pl-9 h-9 bg-muted/50"
                  />
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    2
                  </Badge>
                </Button>

                {/* User Avatar */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  asChild
                  title="Mon profil"
                >
                  <Link to="/user/profile">
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={getProfileImageUrl()} 
                        alt={getDisplayName()}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>

                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Page Title */}
            {title && (
              <div className="px-4 py-3 border-t border-border/50">
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UserLayout;
