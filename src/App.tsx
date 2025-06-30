
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
import ThreatIntelManagement from "./pages/ThreatIntelManagement";
import ScanHistory from "./pages/ScanHistory";
import Watchlists from "./pages/Watchlists";
import IncidentManagement from "./pages/IncidentManagement";

const queryClient = new QueryClient();

const App = () => {
  // Global error handler to suppress Cloudflare analytics and other external CORS errors
  useEffect(() => {
    // Store original console.error to avoid infinite loops
    const originalConsoleError = console.error;
    
    // Override console.error to suppress specific errors
    console.error = (...args) => {
      const errorString = args.join(' ');
      
      // Suppress Cloudflare and integrity related console errors
      if (errorString.includes('cloudflareinsights') ||
          errorString.includes('beacon.min.js') ||
          errorString.includes('integrity') ||
          errorString.includes('Failed to find a valid digest') ||
          errorString.includes('sha384') ||
          errorString.includes('CORS') ||
          errorString.includes('Cross-Origin')) {
        // Silently ignore these errors
        return;
      }
      
      // For all other errors, use the original console.error
      originalConsoleError.apply(console, args);
    };

    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      const errorSource = event.filename || '';
      
      // Suppress Cloudflare analytics errors, integrity errors, and CORS errors
      if (errorSource.includes('cloudflareinsights.com') || 
          errorSource.includes('beacon.min.js') ||
          errorMessage.includes('cloudflareinsights') ||
          errorMessage.includes('integrity') ||
          errorMessage.includes('CORS') ||
          errorMessage.includes('Failed to find a valid digest') ||
          errorMessage.includes('sha384') ||
          errorMessage.includes('crossorigin')) {
        console.log('Suppressed external analytics/integrity error:', errorMessage);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason || '';
      
      // Suppress CORS, integrity, and analytics related promise rejections
      if (typeof reason === 'string' && (
          reason.includes('cloudflareinsights') ||
          reason.includes('beacon.min.js') ||
          reason.includes('CORS') ||
          reason.includes('Cross-Origin') ||
          reason.includes('integrity') ||
          reason.includes('Failed to find a valid digest') ||
          reason.includes('sha384')
        )) {
        console.log('Suppressed external promise rejection:', reason);
        event.preventDefault();
      }
    };

    // Handle SecurityError specifically (for CORS and integrity issues)
    const handleSecurityError = (event: ErrorEvent) => {
      if (event.error && event.error.name === 'SecurityError') {
        console.log('Suppressed SecurityError:', event.error.message);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('error', handleSecurityError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('error', handleSecurityError);
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
              <Route path="/threat-intel-management" element={<ThreatIntelManagement />} />
              <Route path="/scan-history" element={<ScanHistory />} />
              <Route path="/watchlists" element={<Watchlists />} />
              <Route path="/incidents" element={<IncidentManagement />} />
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
