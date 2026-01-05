import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Concept from "./pages/Concept";
import NotFound from "./pages/NotFound";
import { 
  UserDashboardPage,
  UserReservationsPage,
  UserFavoritesPage,
  UserImpactPage,
  UserNotificationsPage,
  UserProfilePage,
  UserSettingsPage,
  UserHelpPage,
} from "./pages/user";
import {
  MerchantDashboardPage,
  MerchantProductsPage,
  MerchantOrdersPage,
  MerchantAnalyticsPage,
  MerchantImpactPage,
  MerchantProfilePage,
  MerchantSettingsPage,
} from "./pages/merchant";
import MerchantRegisterPage from "./pages/merchant/MerchantRegisterPage";
import MerchantRegisterSuccessPage from "./pages/merchant/MerchantRegisterSuccessPage";
import {
  AdminDashboardPage,
  AdminMerchantsPage,
  AdminValidationsPage,
  AdminClientsPage,
  AdminProductsPage,
  AdminTransactionsPage,
  AdminAnalyticsPage,
  AdminGeoPage,
  AdminSettingsPage,
} from "./pages/admin";
import { TermsOfService, PrivacyPolicy, HelpCenter } from "./pages/legal";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, MerchantRoute, UserRoute } from "@/components/auth/ProtectedRoute";
import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthRedirectHandler />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<Search />} />
            <Route path="/concept" element={<Concept />} />

            {/* Merchant Registration */}
            <Route path="/merchant/register" element={<MerchantRegisterPage />} />
            <Route path="/merchant/register/success" element={<MerchantRegisterSuccessPage />} />

            {/* Protected User Routes */}
            <Route path="/user/reservations" element={<UserRoute><UserReservationsPage /></UserRoute>} />
            <Route path="/user/favorites" element={<UserRoute><UserFavoritesPage /></UserRoute>} />
            <Route path="/user/impact" element={<UserRoute><UserImpactPage /></UserRoute>} />
            <Route path="/user/profile" element={<UserRoute><UserProfilePage /></UserRoute>} />
            <Route path="/user/notifications" element={<UserRoute><UserNotificationsPage /></UserRoute>} />
            <Route path="/user/settings" element={<UserRoute><UserSettingsPage /></UserRoute>} />
            <Route path="/user/help" element={<UserRoute><UserHelpPage /></UserRoute>} />
            <Route path="/user" element={<UserRoute><UserDashboardPage /></UserRoute>} />

            {/* Protected Merchant Routes */}
            <Route path="/merchant" element={<MerchantRoute><MerchantDashboardPage /></MerchantRoute>} />
            <Route path="/merchant/products" element={<MerchantRoute><MerchantProductsPage /></MerchantRoute>} />
            <Route path="/merchant/orders" element={<MerchantRoute><MerchantOrdersPage /></MerchantRoute>} />
            <Route path="/merchant/analytics" element={<MerchantRoute><MerchantAnalyticsPage /></MerchantRoute>} />
            <Route path="/merchant/impact" element={<MerchantRoute><MerchantImpactPage /></MerchantRoute>} />
            <Route path="/merchant/profile" element={<MerchantRoute><MerchantProfilePage /></MerchantRoute>} />
            <Route path="/merchant/settings" element={<MerchantRoute><MerchantSettingsPage /></MerchantRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/merchants" element={<AdminRoute><AdminMerchantsPage /></AdminRoute>} />
            <Route path="/admin/validations" element={<AdminRoute><AdminValidationsPage /></AdminRoute>} />
            <Route path="/admin/clients" element={<AdminRoute><AdminClientsPage /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
            <Route path="/admin/geo" element={<AdminRoute><AdminGeoPage /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

            {/* Legal Routes */}
            <Route path="/cgu" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
