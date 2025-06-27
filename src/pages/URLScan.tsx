import { useState } from 'react';
import { Search, ExternalLink, Camera, Shield, Copy, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface URLScanResult {
  url: string;
  verdict: 'safe' | 'malicious' | 'suspicious' | 'scanning';
  screenshotUrl: string | null;
  reportUrl: string;
  score: number;
  analysis: {
    requests: number;
    domains: number;
    ips: number;
    countries: string[];
  };
  message?: string;
}

export default function URLScan() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLScanResult | null>(null);

  const handleScan = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scan.",
        variant: "destructive"
      });
      return;
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
    
    try {
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
        return;
      }

      if (data.error) {
        toast({
          title: "Scan Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      setResult(data);
      
      toast({
        title: "Scan Complete",
        description: `URL analysis finished for: ${processedUrl}`,
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
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
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="cyber-card border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">✅ Live URLScan.io Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This scanner is now connected to the real URLScan.io API and will provide live scan results 
            with real screenshots and comprehensive analysis data.
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Your API key is securely stored in Supabase and accessed through encrypted edge functions.
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
