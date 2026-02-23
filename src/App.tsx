import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AppShell from "@/components/AppShell";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Journey from "@/pages/Journey";
import Community from "@/pages/Community";
import Prayers from "@/pages/Prayers";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";
import Messages from "@/pages/Messages";
import PublicProfile from "@/pages/PublicProfile";
import FollowList from "@/pages/FollowList";
import NotFound from "@/pages/NotFound";
import Pricing from "@/pages/Pricing";
import SubscriptionGate from "@/components/SubscriptionGate";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/journey" replace />;
  return <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/pricing" element={<ProtectedRoute><AppShell><Pricing /></AppShell></ProtectedRoute>} />
              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route index element={<Index />} />
                <Route path="journey" element={<SubscriptionGate><Journey /></SubscriptionGate>} />
                <Route path="community" element={<Community />} />
                <Route path="prayers" element={<Prayers />} />
                <Route path="search" element={<Search />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<Profile />} />
                <Route path="user/:username" element={<PublicProfile />} />
                <Route path="user/:username/:type" element={<FollowList />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
