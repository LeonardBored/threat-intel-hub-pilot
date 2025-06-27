import { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertTriangle, Clock, Filter, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const mockThreats: ThreatItem[] = [
  {
    id: '1',
    indicator: '185.234.72.45',
    type: 'ip',
    threat_type: 'C2',
    malware_family: 'Emotet',
    confidence: 95,
    first_seen: '2024-06-27T08:00:00Z',
    last_seen: '2024-06-27T10:30:00Z',
    source: 'threatfox',
    description: 'Command and Control server hosting Emotet malware infrastructure',
    tags: ['botnet', 'banking-trojan', 'active'],
    source_url: 'https://threatfox.abuse.ch/'
  },
  {
    id: '2',
    indicator: 'malware-distribution.evil-domain.com',
    type: 'domain',
    threat_type: 'Malware Distribution',
    malware_family: 'RedLine Stealer',
    confidence: 88,
    first_seen: '2024-06-26T22:15:00Z',
    last_seen: '2024-06-27T09:45:00Z',
    source: 'otx',
    description: 'Domain serving RedLine Stealer payloads targeting credential theft',
    tags: ['stealer', 'credential-theft', 'active'],
    source_url: 'https://otx.alienvault.com/'
  },
  {
    id: '3',
    indicator: 'https://phishing-site.suspiciousdomain.net/login',
    type: 'url',
    threat_type: 'Phishing',
    confidence: 92,
    first_seen: '2024-06-27T06:30:00Z',
    last_seen: '2024-06-27T11:00:00Z',
    source: 'threatfox',
    description: 'Phishing page mimicking legitimate banking website to steal credentials',
    tags: ['phishing', 'banking', 'credential-theft'],
    source_url: 'https://threatfox.abuse.ch/'
  },
  {
    id: '4',
    indicator: 'a1b2c3d4e5f6789012345678901234567890abcd',
    type: 'hash',
    threat_type: 'Malware Sample',
    malware_family: 'TrickBot',
    confidence: 97,
    first_seen: '2024-06-26T18:20:00Z',
    last_seen: '2024-06-27T07:15:00Z',
    source: 'otx',
    description: 'TrickBot malware sample with advanced evasion techniques',
    tags: ['banking-trojan', 'modular', 'evasive'],
    source_url: 'https://otx.alienvault.com/'
  },
  {
    id: '5',
    indicator: '203.147.89.12',
    type: 'ip',
    threat_type: 'Scanning Activity',
    confidence: 76,
    first_seen: '2024-06-27T05:00:00Z',
    last_seen: '2024-06-27T10:45:00Z',
    source: 'threatfox',
    description: 'IP address conducting automated vulnerability scanning against web applications',
    tags: ['scanning', 'reconnaissance', 'active'],
    source_url: 'https://threatfox.abuse.ch/'
  }
];

export default function ThreatIntel() {
  const [threats, setThreats] = useState<ThreatItem[]>(mockThreats);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const refreshFeeds = async () => {
    setLoading(true);
    // Simulate API refresh
    setTimeout(() => {
      setLoading(false);
      // In real implementation, this would fetch new data
    }, 2000);
  };

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
        return '🏠';
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
              onClick={refreshFeeds} 
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
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-yellow-400">🔗 Feed Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This module displays simulated threat intelligence data. To enable live feeds from 
            ThreatFox and AlienVault OTX, connect to Supabase and configure the APIs in edge functions.
          </p>
          <p className="text-xs text-muted-foreground">
            Real implementation would automatically fetch and update IOCs from both sources with 
            proper rate limiting and data persistence.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
