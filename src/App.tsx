import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Concept from "./pages/Concept";
import UserDashboard from "./pages/UserDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import NotFound from "./pages/NotFound";
import {
  MerchantDashboardPage,
  MerchantProductsPage,
  MerchantOrdersPage,
  MerchantAnalyticsPage,
  MerchantImpactPage,
  MerchantProfilePage,
  MerchantSettingsPage,
} from "./pages/merchant";
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
          
          {/* User Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />} />
          
          {/* Merchant Routes */}
          <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
          <Route path="/merchant/products" element={<MerchantProductsPage />} />
          <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
          <Route path="/merchant/analytics" element={<MerchantAnalyticsPage />} />
          <Route path="/merchant/impact" element={<MerchantImpactPage />} />
          <Route path="/merchant/profile" element={<MerchantProfilePage />} />
          <Route path="/merchant/settings" element={<MerchantSettingsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
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
