
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";
import { AuthProvider } from "./hooks/useAuth";
import { PrivyProvider } from "@privy-io/react-auth";
import TaskDetail from "./pages/TaskDetail";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

// Privy configuration
const PRIVY_APP_ID = "clummtj9100tml0fh74tfuqt"; // Replace with your actual Privy App ID in production

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        onSuccess={() => console.log("Privy authentication successful")}
        config={{
          loginMethods: ["email", "wallet"],
          appearance: {
            theme: "light",
            accentColor: "#6366F1",
            logo: "https://your-app-logo.png", // Replace with your actual logo
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/task/:id" element={<TaskDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </PrivyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
