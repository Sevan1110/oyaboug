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
import { TermsOfService, PrivacyPolicy, HelpCenter } from "./pages/legal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/search" element={<Search />} />
          <Route path="/concept" element={<Concept />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
          <Route path="/merchant/products" element={<MerchantProductsPage />} />
          <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
          <Route path="/merchant/analytics" element={<MerchantAnalyticsPage />} />
          <Route path="/merchant/impact" element={<MerchantImpactPage />} />
          <Route path="/merchant/profile" element={<MerchantProfilePage />} />
          <Route path="/merchant/settings" element={<MerchantSettingsPage />} />
          <Route path="/cgu" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
