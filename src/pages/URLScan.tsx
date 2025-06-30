
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Search, ExternalLink, Image, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const URLScan = () => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('urlscan-analysis', {
        body: { url: url.trim() }
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Scan Complete",
        description: "URLScan.io analysis completed successfully.",
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to complete URLScan.io analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getThreatScore = (score: number) => {
    if (score >= 70) return { level: 'High Risk', color: 'bg-red-500' };
    if (score >= 40) return { level: 'Medium Risk', color: 'bg-yellow-500' };
    return { level: 'Low Risk', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">URLScan.io Analysis</h1>
        <p className="text-muted-foreground">
          Comprehensive website security scanning and analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Scanner
          </CardTitle>
          <CardDescription>
            Enter a URL to perform detailed security analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="url"
            placeholder="Enter URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={handleScan} disabled={loading} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Scanning...' : 'Scan Website'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scan Overview</span>
                {results.result && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={results.result} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Report
                    </a>
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-semibold">Security Score</div>
                  <div className="text-2xl font-bold">
                    {results.verdicts?.overall?.score || 'N/A'}
                  </div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-semibold">Status</div>
                  <Badge className="mt-1">
                    {results.page?.status || 'Completed'}
                  </Badge>
                </div>
                <div className="text-center p-4 border rounded">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="font-semibold">Malicious</div>
                  <div className="text-2xl font-bold text-red-600">
                    {results.verdicts?.overall?.malicious ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              {results.task?.screenshotURL && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Website Screenshot
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={results.task.screenshotURL} 
                      alt="Website screenshot"
                      className="w-full max-h-96 object-contain bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {results.verdicts && (
            <Card>
              <CardHeader>
                <CardTitle>Security Verdicts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(results.verdicts).map(([engine, verdict]: [string, any]) => (
                    <div key={engine} className="flex justify-between items-center p-3 border rounded">
                      <span className="font-medium capitalize">{engine.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex gap-2 items-center">
                        <Badge 
                          variant={verdict.malicious ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {verdict.malicious ? 'Malicious' : 'Clean'}
                        </Badge>
                        {verdict.score && (
                          <span className="text-sm text-muted-foreground">
                            Score: {verdict.score}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default URLScan;
