import { useState, useEffect } from 'react';
import { Search, ExternalLink, Camera, Shield, Copy, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HTTPRequest {
  url: string;
  method: string;
  status: number;
  type: string;
  size: number;
}

interface Redirect {
  from: string;
  to: string;
  status: number;
}

interface URLScanResult {
  url: string;
  verdict: 'safe' | 'malicious' | 'suspicious' | 'scanning';
  screenshotUrl: string | null;
  reportUrl: string;
  score: number;
  uuid?: string;
  status?: 'submitted' | 'processing' | 'complete' | 'error';
  progress?: number;
  analysis: {
    requests: number;
    domains: number;
    ips: number;
    countries: string[];
  };
  httpRequests?: HTTPRequest[];
  redirects?: Redirect[];
  behaviors?: string[];
  message?: string;
}

export default function URLScan() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [scanUuid, setScanUuid] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const pollScanStatus = async (uuid: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('urlscan-analysis', {
        body: { uuid }
      });

      if (error) {
        console.error('Polling error:', error);
        return;
      }

      if (data.status === 'complete') {
        // Scan is complete
        setResult(data);
        setScanProgress(100);
        setScanStatus('Scan complete!');
        setLoading(false);
        setScanUuid(null);
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        toast({
          title: "Scan Complete",
          description: `URL analysis finished for: ${data.url}`,
        });
      } else if (data.status === 'processing') {
        // Update progress
        setScanProgress(data.progress || 50);
        setScanStatus(data.message || 'Scan in progress...');
      } else if (data.status === 'error') {
        // Handle error
        setLoading(false);
        setScanUuid(null);
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        toast({
          title: "Scan Failed",
          description: data.error || "An error occurred during scanning",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const handleScan = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scan.",
        variant: "destructive"
      });
      return;
    }

    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    let processedUrl = url.trim();
    
    // Auto-add https:// if no protocol is specified
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
      setUrl(processedUrl); // Update the input field to show the full URL
      toast({
        title: "Protocol Added",
        description: "Added https:// to the URL for security.",
      });
    }

    setLoading(true);
    setScanProgress(0);
    setScanStatus('Submitting URL for analysis...');
    setResult(null);
    
    try {
      // Submit URL for scanning
      const { data, error } = await supabase.functions.invoke('urlscan-analysis', {
        body: { url: processedUrl }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Scan Failed",
          description: error.message || "Failed to scan the URL. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (data.error) {
        toast({
          title: "Scan Error",
          description: data.error,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Scan submitted successfully, start polling
      setScanUuid(data.uuid);
      setScanProgress(data.progress || 10);
      setScanStatus(data.message || 'URL submitted for scanning...');

      // Start polling for updates every 3 seconds
      const interval = setInterval(() => {
        pollScanStatus(data.uuid);
      }, 3000);
      
      setPollingInterval(interval);

      // Also set initial result with basic info
      setResult({
        url: processedUrl,
        verdict: 'scanning',
        screenshotUrl: null,
        reportUrl: data.reportUrl || '',
        score: 0,
        uuid: data.uuid,
        status: data.status,
        progress: data.progress,
        analysis: {
          requests: 0,
          domains: 0,
          ips: 0,
          countries: []
        }
      });

    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'safe':
        return 'text-green-400';
      case 'malicious':
        return 'text-red-400';
      case 'suspicious':
        return 'text-yellow-400';
      case 'scanning':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Cleanup polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary">URLScan.io Analysis</h1>
          <p className="text-muted-foreground">
            Analyze suspicious URLs and websites for security threats
          </p>
        </div>
      </div>

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Website Security Scan
          </CardTitle>
          <CardDescription>
            Submit a URL for comprehensive security analysis and screenshot capture. HTTPS prefix will be added automatically if not specified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-input">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="url-input"
                className="cyber-input flex-1"
                placeholder="example.com or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleScan()}
                disabled={loading}
              />
              <Button 
                onClick={handleScan} 
                disabled={loading}
                className="cyber-button min-w-[100px]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan URL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress bar when loading */}
          {loading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{scanStatus}</span>
                <span className="text-primary">{Math.round(scanProgress)}%</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                URLScan.io is analyzing the website and capturing a screenshot...
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 mt-6">
              <div className="border-t border-primary/20 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Results Summary */}
                  <div className="space-y-4">
                    <Card className="bg-muted/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Scan Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Verdict:</span>
                          <Badge 
                            variant={result.verdict === 'safe' ? 'secondary' : 'destructive'}
                            className={`${getVerdictColor(result.verdict)} capitalize`}
                          >
                            {result.verdict}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Risk Score:</span>
                          <span className={`font-mono text-lg ${getScoreColor(result.score)}`}>
                            {result.score}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>HTTP Requests:</span>
                          <span className="text-primary">{result.analysis.requests}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Domains:</span>
                          <span className="text-primary">{result.analysis.domains}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>IP Addresses:</span>
                          <span className="text-primary">{result.analysis.ips}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Countries:</span>
                          <span className="text-primary">{result.analysis.countries.join(', ') || 'N/A'}</span>
                        </div>
                        {result.message && (
                          <div className="text-sm text-yellow-400 mt-2">
                            {result.message}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Scanned URL</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono break-all text-primary">
                            {result.url}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => {
                              navigator.clipboard.writeText(result.url);
                              toast({ title: "URL copied to clipboard" });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 cyber-button"
                          onClick={() => window.open(result.reportUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Full Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Screenshot */}
                  <Card className="bg-muted/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Website Screenshot
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {result.screenshotUrl ? (
                          <img
                            src={result.screenshotUrl}
                            alt="Website screenshot"
                            className="w-full h-64 object-cover rounded-md border border-primary/20"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                              target.onerror = null;
                            }}
                          />
                        ) : (
                          <div className="w-full h-64 bg-muted/40 rounded-md border border-primary/20 flex items-center justify-center">
                            <div className="text-center">
                              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {result.verdict === 'scanning' ? 'Screenshot processing...' : 'Screenshot not available'}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          URLScan.io capture
                        </div>
                        {result.screenshotUrl && (
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs"
                              onClick={() => window.open(result.screenshotUrl, '_blank')}
                            >
                              Open in New Tab
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Screenshot captured during automated browsing session
                        {result.screenshotUrl && (
                          <span className="block mt-1 text-green-400">
                            ✓ Screenshot available - click "Open in New Tab" if not displaying properly
                          </span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Additional Details - Only show when scan is complete */}
              {result.status === 'complete' && (result.httpRequests || result.redirects || result.behaviors) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2">
                    Detailed Analysis
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* HTTP Requests */}
                    {result.httpRequests && result.httpRequests.length > 0 && (
                      <Card className="bg-muted/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">HTTP Requests ({result.httpRequests.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                          {result.httpRequests.map((req, index) => (
                            <div key={index} className="text-xs space-y-1 p-2 bg-muted/30 rounded">
                              <div className="flex justify-between items-start">
                                <span className="font-mono text-primary truncate flex-1 mr-2">
                                  {req.method} {req.url.length > 50 ? req.url.substring(0, 50) + '...' : req.url}
                                </span>
                                <span className={`px-1 rounded text-xs ${
                                  req.status >= 200 && req.status < 300 ? 'bg-green-500/20 text-green-400' :
                                  req.status >= 300 && req.status < 400 ? 'bg-yellow-500/20 text-yellow-400' :
                                  req.status >= 400 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                Type: {req.type} | Size: {(req.size / 1024).toFixed(1)}KB
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Redirects */}
                    {result.redirects && result.redirects.length > 0 && (
                      <Card className="bg-muted/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Redirects ({result.redirects.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                          {result.redirects.map((redirect, index) => (
                            <div key={index} className="text-xs space-y-1 p-2 bg-muted/30 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-yellow-400 font-semibold">{redirect.status}</span>
                              </div>
                              <div className="text-muted-foreground">
                                From: <span className="text-primary font-mono text-xs">
                                  {redirect.from.length > 40 ? redirect.from.substring(0, 40) + '...' : redirect.from}
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                To: <span className="text-primary font-mono text-xs">
                                  {redirect.to.length > 40 ? redirect.to.substring(0, 40) + '...' : redirect.to}
                                </span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Behaviors */}
                    {result.behaviors && result.behaviors.length > 0 && (
                      <Card className="bg-muted/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Observed Behaviors ({result.behaviors.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                          {result.behaviors.map((behavior, index) => (
                            <div key={index} className="text-xs p-2 bg-muted/30 rounded">
                              <span className="text-primary">{behavior}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="cyber-card border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">✅ Real-Time URLScan.io Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This scanner provides real-time URLScan.io analysis with live progress updates, comprehensive 
            scan results including HTTP requests, redirects, and behavioral analysis.
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            • Real-time progress tracking during scan execution<br/>
            • Live screenshot updates as they become available<br/>
            • Detailed HTTP request and redirect analysis<br/>
            • Behavioral pattern detection and reporting
          </p>
          <p className="text-xs text-yellow-400">
            Note: Screenshots are loaded from URLScan.io's CDN. If images don't display due to CORS restrictions, 
            use the "Open in New Tab" button to view them directly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
