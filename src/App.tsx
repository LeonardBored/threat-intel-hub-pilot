
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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

const App = () => {
  // Global error handler to suppress Cloudflare analytics and other external CORS errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      const errorSource = event.filename || '';
      
      // Suppress Cloudflare analytics errors
      if (errorSource.includes('cloudflareinsights.com') || 
          errorSource.includes('beacon.min.js') ||
          errorMessage.includes('cloudflareinsights') ||
          errorMessage.includes('integrity') ||
          errorMessage.includes('CORS')) {
        console.log('Suppressed external analytics error:', errorMessage);
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason || '';
      
      // Suppress CORS and analytics related promise rejections
      if (typeof reason === 'string' && (
          reason.includes('cloudflareinsights') ||
          reason.includes('beacon.min.js') ||
          reason.includes('CORS') ||
          reason.includes('Cross-Origin') ||
          reason.includes('integrity')
        )) {
        console.log('Suppressed external promise rejection:', reason);
        event.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
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
};

export default App;
