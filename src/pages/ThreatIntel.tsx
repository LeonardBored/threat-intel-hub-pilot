
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, Globe, Hash, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ThreatIntel = () => {
  const [threatData, setThreatData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchThreatIntel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('threat-intelligence');

      if (error) throw error;

      setThreatData(data);
      toast({
        title: "Data Updated",
        description: "Latest threat intelligence data fetched successfully.",
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to fetch latest threat intelligence data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatIntel();
  }, []);

  const getThreatTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'url':
      case 'domain':
        return Globe;
      case 'hash':
      case 'md5':
      case 'sha1':
      case 'sha256':
        return Hash;
      default:
        return AlertTriangle;
    }
  };

  const getThreatTypeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-red-500';
    if (confidence >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence</h1>
          <p className="text-muted-foreground">
            Latest indicators of compromise (IOCs) and threat data
          </p>
        </div>
        <Button onClick={fetchThreatIntel} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {threatData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {threatData.threatfox?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">ThreatFox IOCs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Globe className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {threatData.alienvault?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">AlienVault OTX</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {(threatData.threatfox?.length || 0) + (threatData.alienvault?.length || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total IOCs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {threatData?.threatfox && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              ThreatFox Latest IOCs
            </CardTitle>
            <CardDescription>
              Recent indicators of compromise from ThreatFox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {threatData.threatfox.map((ioc: any, index: number) => {
                const ThreatIcon = getThreatTypeIcon(ioc.ioc_type);
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      <ThreatIcon className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-mono text-sm">{ioc.ioc_value}</div>
                        <div className="text-xs text-muted-foreground">
                          {ioc.malware_printable} • {new Date(ioc.first_seen).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getThreatTypeColor(ioc.confidence_level)}>
                        {ioc.confidence_level}% confidence
                      </Badge>
                      <Badge variant="outline">{ioc.ioc_type?.toUpperCase()}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {threatData?.alienvault && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              AlienVault OTX Pulses
            </CardTitle>
            <CardDescription>
              Latest threat intelligence from AlienVault OTX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {threatData.alienvault.map((pulse: any, index: number) => (
                <div key={index} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{pulse.name}</h4>
                    <Badge variant="secondary">
                      {pulse.indicator_count || 0} indicators
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pulse.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {pulse.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(pulse.created).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ThreatIntel;
