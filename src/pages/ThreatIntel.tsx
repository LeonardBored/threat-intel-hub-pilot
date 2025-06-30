import { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertTriangle, Clock, Filter, ExternalLink, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ThreatItem {
  id: string;
  indicator: string;
  type: 'ip' | 'domain' | 'url' | 'hash';
  threat_type: string;
  malware_family?: string;
  confidence: number;
  first_seen: string;
  last_seen: string;
  source: 'threatfox' | 'otx';
  description: string;
  tags: string[];
  source_url: string;
}

export default function ThreatIntel() {
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  const fetchThreats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('threat-intelligence');
      
      if (error) {
        console.error('Error fetching threats:', error);
        toast({
          title: "Error Loading Threats",
          description: "Failed to fetch threat intelligence data",
          variant: "destructive"
        });
        return;
      }

      if (data && data.threats) {
        setThreats(data.threats);
        toast({
          title: "Threats Updated",
          description: `Loaded ${data.threats.length} threat indicators`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load threat intelligence",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, []);

  const filteredThreats = threats.filter(threat => {
    const matchesSource = selectedSource === 'all' || threat.source === selectedSource;
    const matchesType = selectedType === 'all' || threat.type === selectedType;
    return matchesSource && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip':
        return '🌐';
      case 'domain':
        return '';
      case 'url':
        return '🔗';
      case 'hash':
        return '🔐';
      default:
        return '❓';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-red-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'threatfox':
        return 'bg-red-900/20 text-red-400';
      case 'otx':
        return 'bg-blue-900/20 text-blue-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `Indicator "${text}" has been copied to your clipboard.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary">Threat Intelligence Feeds</h1>
          <p className="text-muted-foreground">
            Latest Indicators of Compromise (IOCs) from ThreatFox and AlienVault OTX
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="cyber-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Threat Intelligence
            </CardTitle>
            <Button 
              onClick={fetchThreats} 
              disabled={loading}
              className="cyber-button"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feeds
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            
            <Tabs value={selectedSource} onValueChange={setSelectedSource}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs">All Sources</TabsTrigger>
                <TabsTrigger value="threatfox" className="text-xs">ThreatFox</TabsTrigger>
                <TabsTrigger value="otx" className="text-xs">AlienVault OTX</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedType} onValueChange={setSelectedType}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs">All Types</TabsTrigger>
                <TabsTrigger value="ip" className="text-xs">IPs</TabsTrigger>
                <TabsTrigger value="domain" className="text-xs">Domains</TabsTrigger>
                <TabsTrigger value="url" className="text-xs">URLs</TabsTrigger>
                <TabsTrigger value="hash" className="text-xs">Hashes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Threat Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredThreats.length} active threats
          </div>
          <div className="text-xs text-green-400">
            ● Live feed active
          </div>
        </div>

        <div className="grid gap-4">
          {filteredThreats.map((threat) => (
            <Card key={threat.id} className="cyber-card hover:border-primary/40 transition-all duration-300 cursor-pointer"
                  onClick={() => window.open(threat.source_url, '_blank')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight flex items-center gap-2">
                      <span className="text-xl">{getTypeIcon(threat.type)}</span>
                      <span className="font-mono text-primary break-all">{threat.indicator}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(threat.indicator);
                        }}
                        className="h-6 w-6 p-0 hover:bg-primary/20"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={getSourceColor(threat.source)}
                      >
                        {threat.source.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-red-400">
                        {threat.threat_type}
                      </Badge>
                      {threat.malware_family && (
                        <Badge variant="outline" className="text-purple-400">
                          {threat.malware_family}
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={getConfidenceColor(threat.confidence)}
                      >
                        {threat.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed mb-3">
                  {threat.description}
                </CardDescription>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    First seen: {formatDate(threat.first_seen)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last seen: {formatDate(threat.last_seen)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {threat.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-muted/20"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card's onClick from firing
                      window.open(threat.source_url, '_blank');
                    }}
                    className="text-xs flex items-center gap-1"
                  >
                    View on {threat.source === 'threatfox' ? 'ThreatFox' : 'OTX'}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="cyber-card border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">🔗 Live Feed Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This module displays real-time threat intelligence data from ThreatFox and AlienVault OTX.
            Each IOC links directly to its detailed analysis page on the respective platform.
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            • ThreatFox IOCs link to: https://threatfox.abuse.ch/ioc/{'{id}'}/
          </p>
          <p className="text-xs text-muted-foreground">
            • AlienVault OTX indicators link to: https://otx.alienvault.com/indicator/{'{type}'}/{'{indicator}'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
