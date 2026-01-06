import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import UserSidebar from "./UserSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAuthUser } from "@/services/auth.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const UserLayout = ({ children, title, subtitle }: UserLayoutProps) => {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    avatarUrl: string;
  } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await getAuthUser();
        if (data?.user) {
          const metadata = data.user.user_metadata || {};
          const fullName = metadata.full_name || "";
          const [firstName = "U", lastName = ""] = fullName.split(" ");

          setUser({
            firstName,
            lastName,
            avatarUrl: metadata.avatar_url || "",
          });
        }
      } catch (e) {
        console.error("Failed to load user for layout", e);
      }
    };
    loadUser();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <UserSidebar userName={user ? `${user.firstName} ${user.lastName} ` : undefined} />

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
                <NotificationBell />

                {/* User Avatar */}
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.firstName} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)} ` : "U"}
                    </AvatarFallback>
                  </Avatar>
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
