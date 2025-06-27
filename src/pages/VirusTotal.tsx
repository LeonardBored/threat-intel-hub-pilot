
import { useState } from 'react';
import { Shield, Search, Copy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface ScanResult {
  summary: string;
  detectionRatio: string;
  verdict: 'clean' | 'malicious' | 'suspicious';
  vendors: Array<{
    name: string;
    result: string;
    category: string;
  }>;
}

export default function VirusTotal() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async () => {
    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a URL, IP, domain, or file hash to scan.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockResult: ScanResult = {
        summary: input.includes('malware') ? 'Malicious content detected' : 'No threats detected',
        detectionRatio: input.includes('malware') ? '15/68' : '0/68',
        verdict: input.includes('malware') ? 'malicious' : 'clean',
        vendors: [
          { name: 'Microsoft', result: input.includes('malware') ? 'Trojan:Win32/Malware' : 'Clean', category: 'antivirus' },
          { name: 'Kaspersky', result: input.includes('malware') ? 'HEUR:Trojan.Generic' : 'Clean', category: 'antivirus' },
          { name: 'Symantec', result: 'Clean', category: 'antivirus' },
          { name: 'McAfee', result: 'Clean', category: 'antivirus' },
          { name: 'Avast', result: input.includes('malware') ? 'Malware-gen' : 'Clean', category: 'antivirus' },
        ]
      };
      
      setResult(mockResult);
      setLoading(false);
      
      toast({
        title: "Scan Complete",
        description: `Analysis finished for: ${input}`,
      });
    }, 2000);
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'clean':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'malicious':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'suspicious':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
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
      default:
        return 'text-gray-400';
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
            Enter a URL, IP address, domain, or file hash (MD5, SHA1, SHA256) to analyze
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
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
              <Button 
                onClick={handleScan} 
                disabled={loading}
                className="cyber-button min-w-[100px]"
              >
                {loading ? (
                  <div className="scan-indicator w-full h-full flex items-center justify-center">
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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 mt-1"
                        onClick={() => {
                          navigator.clipboard.writeText(input);
                          toast({ title: "Copied to clipboard" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

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
                              variant={vendor.result === 'Clean' ? 'secondary' : 'destructive'}
                              className="font-mono"
                            >
                              {vendor.result}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
            To enable live VirusTotal scanning, you'll need to connect this platform to Supabase 
            and configure your VirusTotal API key in the backend.
          </p>
          <p className="text-xs text-muted-foreground">
            The interface above shows simulated results. Real integration requires proper API key management 
            for security compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
