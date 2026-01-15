import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Link from "next/link"; // Ensure this isn't used here, actually App.tsx is Vite.
// Vite App.tsx
import Index from "./screens/Index";
import Auth from "./screens/Auth";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import Search from "./screens/Search";
import Concept from "./screens/Concept";
import NotFound from "./screens/NotFound";
// User pages migrated to App Router
import {
  MerchantDashboardPage,
  MerchantOrdersPage,
  MerchantAnalyticsPage,
  MerchantImpactPage,
  MerchantProfilePage,
  MerchantSettingsPage,
  MerchantHelpPage,
  MerchantNotificationsPage,
} from "./screens/merchant";
import MerchantProductsPage from "./screens/merchant/MerchantProductsPage";
import MerchantRegisterPage from "./screens/merchant/MerchantRegisterPage";
import MerchantRegisterSuccessPage from "./screens/merchant/MerchantRegisterSuccessPage";
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
} from "./screens/admin";
import { TermsOfService, PrivacyPolicy, HelpCenter } from "./screens/legal";
import MerchantPublicPage from "./screens/MerchantPublicPage";
import ProductDetailPage from "./screens/ProductDetailPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, MerchantRoute, UserRoute } from "@/components/auth/ProtectedRoute";
import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthRedirectHandler />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/search" element={<Search />} />
            <Route path="/concept" element={<Concept />} />
            <Route path="/m/:slug" element={<MerchantPublicPage />} />
            <Route path="/p/:slug" element={<ProductDetailPage />} />

            {/* Merchant Registration */}
            <Route path="/merchant/register" element={<MerchantRegisterPage />} />
            <Route path="/merchant/register/success" element={<MerchantRegisterSuccessPage />} />

            {/* User Routes */}
            {/* User Routes - Migrated to Next.js App Router */}
            {/* Routes are now handled by app/(dashboard)/user/... */}

            {/* Merchant Routes */}
            <Route path="/merchant" element={<MerchantRoute><MerchantDashboardPage /></MerchantRoute>} />
            <Route path="/merchant/products" element={<MerchantRoute><MerchantProductsPage /></MerchantRoute>} />
            <Route path="/merchant/orders" element={<MerchantRoute><MerchantOrdersPage /></MerchantRoute>} />
            <Route path="/merchant/analytics" element={<MerchantRoute><MerchantAnalyticsPage /></MerchantRoute>} />
            <Route path="/merchant/impact" element={<MerchantRoute><MerchantImpactPage /></MerchantRoute>} />
            <Route path="/merchant/profile" element={<MerchantRoute><MerchantProfilePage /></MerchantRoute>} />
            <Route path="/merchant/settings" element={<MerchantRoute><MerchantSettingsPage /></MerchantRoute>} />
            <Route path="/merchant/help" element={<MerchantRoute><MerchantHelpPage /></MerchantRoute>} />
            <Route path="/merchant/notifications" element={<MerchantRoute><MerchantNotificationsPage /></MerchantRoute>} />

            {/* Admin Routes */}
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
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
