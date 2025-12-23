import { Link, useLocation, useSearchParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Heart,
  Bell,
  Search,
  LogOut,
} from "lucide-react";

const mainMenuItems = [
  {
    title: "Aperçu",
    url: "/user/dashboard?tab=overview",
    icon: LayoutDashboard,
  },
  {
    title: "Réservations",
    url: "/user/dashboard?tab=active",
    icon: ShoppingBag,
  },
  {
    title: "Historique",
    url: "/user/dashboard?tab=history",
    icon: Wallet,
  },
  {
    title: "Favoris",
    url: "/user/dashboard?tab=favorites",
    icon: Heart,
  },
  {
    title: "Préférences",
    url: "/user/dashboard?tab=preferences",
    icon: Bell,
  },
];

interface UserSidebarProps {
  userName?: string;
  userEmail?: string;
}

const UserSidebar = ({ userName = "Utilisateur", userEmail = "" }: UserSidebarProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const currentTab = searchParams.get("tab") || "overview";
  const isActive = (url: string) => {
    const urlObj = new URL(url, window.location.origin);
    const tab = urlObj.searchParams.get("tab") || "overview";
    return location.pathname === "/user/dashboard" && currentTab === tab;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">SF</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">{userName}</h2>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!isCollapsed && (
          <div className="px-4 mb-4">
            <Link to="/search">
              <Button className="w-full gap-2" size="sm">
                <Search className="w-4 h-4" />
                Rechercher
              </Button>
            </Link>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
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
          asChild
          tooltip="Déconnexion"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Link to="/auth">
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default UserSidebar;
