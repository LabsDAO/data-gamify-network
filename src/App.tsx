
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";
import { AuthProvider } from "./hooks/useAuth";
import TaskDetail from "./pages/TaskDetail";
import Dashboard from "./pages/Dashboard";
import Contribute from "./pages/Contribute";
import Request from "./pages/Request";
import { PrivyProvider } from "@privy-io/react-auth";
import Layout from "./components/layout/Layout";
// OORT Storage is now available through our utility files

const queryClient = new QueryClient();

const App = () => (
  <PrivyProvider
    appId="cm7pcunwq006v136f3t2sk6jc"
    config={{
      loginMethods: ["email", "wallet"],
      appearance: {
        theme: "light",
        accentColor: "#6366F1",
        logo: "/lovable-uploads/3c0d4a69-03a7-4f9f-b704-73bcc535ddef.png",
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/task/:id" element={<TaskDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contribute" element={<Contribute />} />
                <Route path="/request" element={<Request />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default App;
