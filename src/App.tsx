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
import AIAgents from "./pages/AIAgents";
import AgentDetail from "./pages/AgentDetail";
import MyAgents from "./pages/MyAgents";
import IPManagement from "./pages/IPManagement";
import DatasetMarketplace from "./pages/DatasetMarketplace";
import Upload from "./pages/Upload";
import Preprocess from "./pages/Preprocess";
import { PrivyProvider } from "@privy-io/react-auth";
import Layout from "./components/layout/Layout";
// OORT Storage is now available through our utility files
// OORT Storage is now available through our utility files

const queryClient = new QueryClient();

const App = () => (
  <PrivyProvider
    appId={import.meta.env.VITE_PRIVY_APP_ID}
    config={{
      loginMethods: ["email", "wallet"],
      appearance: {
        theme: "light",
        accentColor: "#6366F1",
        logo: "/lovable-uploads/3c0d4a69-03a7-4f9f-b704-73bcc535ddef.png",
      },
      // Enable wallet connections with minimal configuration
      walletConnectCloudProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
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
                <Route path="/agents" element={<AIAgents />} />
                <Route path="/agents/:id" element={<AgentDetail />} />
                <Route path="/my-agents" element={<MyAgents />} />
                <Route path="/ip-management" element={<IPManagement />} />
                <Route path="/dataset-marketplace" element={<DatasetMarketplace />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/preprocess" element={<Preprocess />} />

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
