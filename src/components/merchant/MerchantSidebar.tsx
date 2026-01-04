// ============================================
// Merchant Sidebar - Navigation Component
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Leaf,
  Plus,
  Store,
  Bell,
  LogOut,
  HelpCircle,
} from "lucide-react";

const mainMenuItems = [
  {
    title: "Tableau de bord",
    url: "/merchant",
    icon: LayoutDashboard,
  },
  {
    title: "Mes produits",
    url: "/merchant/products",
    icon: Package,
    badge: 5,
  },
  {
    title: "Réservations",
    url: "/merchant/orders",
    icon: ShoppingBag,
    badge: 3,
  },
  {
    title: "Statistiques",
    url: "/merchant/analytics",
    icon: BarChart3,
  },
  {
    title: "Impact environnemental",
    url: "/merchant/impact",
    icon: Leaf,
  },
];

const settingsMenuItems = [
  {
    title: "Mon commerce",
    url: "/merchant/profile",
    icon: Store,
  },
  {
    title: "Notifications",
    url: "/merchant/notifications",
    icon: Bell,
  },
  {
    title: "Paramètres",
    url: "/merchant/settings",
    icon: Settings,
  },
  {
    title: "Aide",
    url: "/merchant/help",
    icon: HelpCircle,
  },
];

interface MerchantSidebarProps {
  merchantName?: string;
  merchantType?: string;
}

const MerchantSidebar = ({
  merchantName = "Mon Commerce",
  merchantType = "Restaurant",
}: MerchantSidebarProps) => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/merchant") {
      return location.pathname === "/merchant";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">
                {merchantName}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {merchantType}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Action */}
        {!isCollapsed && (
          <div className="px-4 mb-4">
            <Link to="/merchant/products/new">
              <Button className="w-full gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Nouveau produit
              </Button>
            </Link>
          </div>
        )}

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

export default MerchantSidebar;
