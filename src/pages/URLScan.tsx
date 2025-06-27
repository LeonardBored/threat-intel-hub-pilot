
import { useState } from 'react';
import { Search, ExternalLink, Camera, Shield, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface URLScanResult {
  url: string;
  verdict: 'safe' | 'malicious' | 'suspicious';
  screenshotUrl: string;
  reportUrl: string;
  score: number;
  analysis: {
    requests: number;
    domains: number;
    ips: number;
    countries: string[];
  };
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

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockResult: URLScanResult = {
        url: url,
        verdict: url.includes('malicious') ? 'malicious' : 'safe',
        screenshotUrl: '/placeholder.svg',
        reportUrl: `https://urlscan.io/result/mock-id-${Date.now()}`,
        score: url.includes('malicious') ? 85 : 15,
        analysis: {
          requests: 24,
          domains: 3,
          ips: 2,
          countries: ['US', 'GB']
        }
      };
      
      setResult(mockResult);
      setLoading(false);
      
      toast({
        title: "Scan Complete",
        description: `URL analysis finished for: ${url}`,
      });
    }, 3000);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'safe':
        return 'text-green-400';
      case 'malicious':
        return 'text-red-400';
      case 'suspicious':
        return 'text-yellow-400';
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
            Submit a URL for comprehensive security analysis and screenshot capture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-input">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="url-input"
                className="cyber-input flex-1"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
              <Button 
                onClick={handleScan} 
                disabled={loading}
                className="cyber-button min-w-[100px]"
              >
                {loading ? (
                  <div className="scan-indicator w-full h-full flex items-center justify-center">
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
                          <span className="text-primary">{result.analysis.countries.join(', ')}</span>
                        </div>
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
                        <img
                          src={result.screenshotUrl}
                          alt="Website screenshot"
                          className="w-full h-64 object-cover rounded-md border border-primary/20"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Screenshot captured
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Screenshot taken during automated browsing session
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-yellow-400">⚠ API Integration Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            To enable live URLScan.io analysis, connect this platform to Supabase 
            and configure your URLScan.io API key in the backend.
          </p>
          <p className="text-xs text-muted-foreground">
            The interface above shows simulated results. Real integration requires proper API key management 
            and backend processing for security compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
