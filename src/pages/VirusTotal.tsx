
import { useState } from 'react';
import { Shield, Search, Copy, AlertTriangle, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScanResult {
  summary: string;
  detectionRatio: string;
  verdict: 'clean' | 'malicious' | 'suspicious' | 'unknown' | 'scanning';
  vendors: Array<{
    name: string;
    result: string;
    category: string;
  }>;
  rawData?: any;
}

export default function VirusTotal() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Helper function to detect if input is likely a URL
  const isLikelyURL = (str: string) => {
    // Check if it looks like a domain/URL (contains dots, no spaces, not an IP, not a hash)
    return str.includes('.') && 
           !str.includes(' ') && 
           !str.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) && // Not an IP
           !str.match(/^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/); // Not a hash
  };

  const handleScan = async () => {
    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a URL, IP, domain, or file hash to scan.",
        variant: "destructive"
      });
      return;
    }

    let processedInput = input.trim();
    
    // Auto-add https:// for URLs that don't have a protocol
    if (isLikelyURL(processedInput) && !processedInput.startsWith('http://') && !processedInput.startsWith('https://')) {
      processedInput = 'https://' + processedInput;
      setInput(processedInput); // Update the input field to show the full URL
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('virustotal-scan', {
        body: { input: processedInput }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Scan Failed",
          description: error.message || "Failed to scan the target. Please try again.",
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
        description: `Analysis finished for: ${processedInput}`,
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

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'clean':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'malicious':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'suspicious':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'scanning':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'clean':
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

  const getVirusTotalReportUrl = (inputValue: string) => {
    // Generate the appropriate VirusTotal report URL based on input type
    if (inputValue.startsWith('http://') || inputValue.startsWith('https://')) {
      // URL scan
      const encodedUrl = btoa(inputValue).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      return `https://www.virustotal.com/gui/url/${encodedUrl}`;
    } else if (inputValue.match(/^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/)) {
      // Hash scan
      return `https://www.virustotal.com/gui/file/${inputValue}`;
    } else if (inputValue.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      // IP scan
      return `https://www.virustotal.com/gui/ip-address/${inputValue}`;
    } else {
      // Domain scan
      return `https://www.virustotal.com/gui/domain/${inputValue}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary">VirusTotal Scanner</h1>
          <p className="text-muted-foreground">
            Scan URLs, IPs, domains, and file hashes for malware detection
          </p>
        </div>
      </div>

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Malware Analysis
          </CardTitle>
          <CardDescription>
            Enter a URL, IP address, domain, or file hash (MD5, SHA1, SHA256) to analyze. HTTPS prefix will be added automatically for URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scan-input">Target to Scan</Label>
            <div className="flex gap-2">
              <Input
                id="scan-input"
                className="cyber-input flex-1"
                placeholder="e.g., google.com, 8.8.8.8, or file hash..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
                    Scanning...
                  </div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan
                  </>
                )}
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-4 mt-6">
              <div className="border-t border-primary/20 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        {getVerdictIcon(result.verdict)}
                        <div>
                          <div className="font-semibold">Verdict</div>
                          <div className={`text-sm ${getVerdictColor(result.verdict)}`}>
                            {result.summary}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="font-semibold">Detection Ratio</div>
                      <div className="text-2xl font-mono text-primary">
                        {result.detectionRatio}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        vendors flagged this
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="font-semibold">Scanned Target</div>
                      <div className="text-sm font-mono break-all text-primary">
                        {input}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(input);
                            toast({ title: "Copied to clipboard" });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => window.open(getVirusTotalReportUrl(input), '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {result.vendors.length > 0 && (
                  <Card className="cyber-card">
                    <CardHeader>
                      <CardTitle>Vendor Analysis Results</CardTitle>
                      <CardDescription>
                        Detailed detection results from security vendors
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.vendors.map((vendor, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                          >
                            <div className="font-medium">{vendor.name}</div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={vendor.result === 'Clean' || !vendor.result ? 'secondary' : 'destructive'}
                                className="font-mono"
                              >
                                {vendor.result || 'Clean'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="cyber-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-primary">View Full VirusTotal Report</div>
                        <p className="text-sm text-muted-foreground">
                          Access detailed analysis and additional information on VirusTotal's platform
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="cyber-button"
                        onClick={() => window.open(getVirusTotalReportUrl(input), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {result.verdict === 'unknown' && (
                  <Card className="cyber-card border-yellow-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">No Analysis Available</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        This target hasn't been analyzed by VirusTotal yet. Try submitting it for analysis first.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="cyber-card border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">✅ Live VirusTotal Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This scanner is now connected to the real VirusTotal API and will provide live scan results 
            from over 70 antivirus engines and security vendors.
          </p>
          <p className="text-xs text-muted-foreground">
            Your API key is securely stored in Supabase and accessed through encrypted edge functions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
