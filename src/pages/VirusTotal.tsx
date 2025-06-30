
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Search, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VirusTotal = () => {
  const [input, setInput] = useState('');
  const [scanType, setScanType] = useState<'url' | 'file' | 'hash'>('url');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a URL, file hash, or upload a file to scan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('virustotal-scan', {
        body: { 
          input: input.trim(),
          type: scanType 
        }
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Scan Complete",
        description: "VirusTotal scan completed successfully.",
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to complete VirusTotal scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevel = (positives: number, total: number) => {
    if (positives === 0) return { level: 'Clean', color: 'bg-green-500', icon: CheckCircle };
    if (positives / total < 0.1) return { level: 'Low Risk', color: 'bg-yellow-500', icon: AlertTriangle };
    return { level: 'High Risk', color: 'bg-red-500', icon: AlertTriangle };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">VirusTotal Scanner</h1>
        <p className="text-muted-foreground">
          Scan URLs, files, and hashes with VirusTotal's comprehensive security analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Scan
          </CardTitle>
          <CardDescription>
            Enter a URL, file hash, or upload a file for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={scanType === 'url' ? 'default' : 'outline'}
              onClick={() => setScanType('url')}
              size="sm"
            >
              URL
            </Button>
            <Button
              variant={scanType === 'hash' ? 'default' : 'outline'}
              onClick={() => setScanType('hash')}
              size="sm"
            >
              Hash
            </Button>
            <Button
              variant={scanType === 'file' ? 'default' : 'outline'}
              onClick={() => setScanType('file')}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              File
            </Button>
          </div>

          {scanType === 'file' ? (
            <Textarea
              placeholder="File upload functionality will be implemented with file handling..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <Input
              type="text"
              placeholder={
                scanType === 'url' 
                  ? "Enter URL (e.g., https://example.com)" 
                  : "Enter file hash (MD5, SHA1, SHA256)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono text-sm"
            />
          )}

          <Button onClick={handleScan} disabled={loading} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Scanning...' : 'Scan with VirusTotal'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Scan Results</span>
              {results.permalink && (
                <Button variant="outline" size="sm" asChild>
                  <a href={results.permalink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Report
                  </a>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.positives !== undefined && results.total !== undefined && (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.positives}
                  </div>
                  <div className="text-sm text-muted-foreground">Detections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {results.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Engines</div>
                </div>
                <div className="flex-1">
                  {(() => {
                    const threat = getThreatLevel(results.positives, results.total);
                    const ThreatIcon = threat.icon;
                    return (
                      <Badge className={`${threat.color} text-white`}>
                        <ThreatIcon className="h-4 w-4 mr-1" />
                        {threat.level}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            )}

            <Separator />

            {results.scans && (
              <div>
                <h3 className="font-semibold mb-3">Detection Details</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(results.scans).map(([engine, result]: [string, any]) => (
                    <div key={engine} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium text-sm">{engine}</span>
                      <div className="flex gap-2 items-center">
                        {result.detected ? (
                          <>
                            <Badge variant="destructive" className="text-xs">
                              {result.result || 'Detected'}
                            </Badge>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary" className="text-xs">Clean</Badge>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.scan_date && (
              <div className="text-sm text-muted-foreground">
                Scan Date: {new Date(results.scan_date).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VirusTotal;
