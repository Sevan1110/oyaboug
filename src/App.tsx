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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/search" element={<Search />} />
          <Route path="/concept" element={<Concept />} />
          
          {/* Merchant Registration */}
          <Route path="/merchant/register" element={<MerchantRegisterPage />} />
          <Route path="/merchant/register/success" element={<MerchantRegisterSuccessPage />} />
          
          {/* User Routes */}
          <Route path="/user" element={<UserDashboardPage />} />
          <Route path="/user/reservations" element={<UserReservationsPage />} />
          <Route path="/user/favorites" element={<UserFavoritesPage />} />
          <Route path="/user/impact" element={<UserImpactPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="/user/notifications" element={<UserNotificationsPage />} />
          <Route path="/user/settings" element={<UserSettingsPage />} />
          <Route path="/user/help" element={<UserHelpPage />} />
          
          {/* Merchant Routes */}
          <Route path="/merchant" element={<MerchantDashboardPage />} />
          <Route path="/merchant/products" element={<MerchantProductsPage />} />
          <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
          <Route path="/merchant/analytics" element={<MerchantAnalyticsPage />} />
          <Route path="/merchant/impact" element={<MerchantImpactPage />} />
          <Route path="/merchant/profile" element={<MerchantProfilePage />} />
          <Route path="/merchant/settings" element={<MerchantSettingsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/merchants" element={<AdminMerchantsPage />} />
          <Route path="/admin/validations" element={<AdminValidationsPage />} />
          <Route path="/admin/clients" element={<AdminClientsPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/geo" element={<AdminGeoPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          
          {/* Legal Routes */}
          <Route path="/cgu" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/help" element={<HelpCenter />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
