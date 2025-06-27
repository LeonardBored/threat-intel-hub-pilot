
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import VirusTotal from "./pages/VirusTotal";
import URLScan from "./pages/URLScan";
import ThreatIntel from "./pages/ThreatIntel";
import SecurityNews from "./pages/SecurityNews";
import Documentation from "./pages/Documentation";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/virustotal" element={<VirusTotal />} />
            <Route path="/urlscan" element={<URLScan />} />
            <Route path="/threat-intel" element={<ThreatIntel />} />
            <Route path="/news" element={<SecurityNews />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
