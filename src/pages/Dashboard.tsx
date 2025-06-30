
import { Shield, Search, Book, User, Link, Settings, Database, History, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const moduleCards = [
  {
    title: 'VirusTotal Scanner',
    description: 'Scan URLs, IPs, domains, and file hashes for malware',
    icon: Shield,
    route: '/virustotal',
    status: 'Active',
    color: 'text-green-400'
  },
  {
    title: 'URLScan.io',
    description: 'Analyze suspicious URLs and websites',
    icon: Search,
    route: '/urlscan',
    status: 'Active',
    color: 'text-blue-400'
  },
  {
    title: 'Threat Intelligence',
    description: 'Latest IOCs from ThreatFox and AlienVault OTX',
    icon: Shield,
    route: '/threat-intel',
    status: 'Beta',
    color: 'text-yellow-400'
  },
  {
    title: 'Security News',
    description: 'Latest cybersecurity news and updates',
    icon: Book,
    route: '/news',
    status: 'Active',
    color: 'text-purple-400'
  },
  {
    title: 'Documentation Hub',
    description: 'Security playbooks and cloud documentation',
    icon: Book,
    route: '/docs',
    status: 'Active',
    color: 'text-cyan-400'
  },
  {
    title: 'AI Security Assistant',
    description: 'Generate SIEM queries and security insights',
    icon: User,
    route: '/ai-chat',
    status: 'Premium',
    color: 'text-orange-400'
  }
];

const managementCards = [
  {
    title: 'IOC Management',
    description: 'Create and manage threat indicators (IOCs)',
    icon: Database,
    route: '/threat-intel-management',
    status: 'New',
    color: 'text-green-400'
  },
  {
    title: 'Scan History',
    description: 'View and manage past security scans',
    icon: History,
    route: '/scan-history',
    status: 'New',
    color: 'text-blue-400'
  },
  {
    title: 'Watchlists',
    description: 'Monitor specific threats and indicators',
    icon: Eye,
    route: '/watchlists',
    status: 'New',
    color: 'text-purple-400'
  },
  {
    title: 'Incident Management',
    description: 'Track and manage security incidents',
    icon: AlertTriangle,
    route: '/incidents',
    status: 'New',
    color: 'text-red-400'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    scansToday: 0,
    threatsDetected: 0,
    cleanResults: 0,
    activeFeedCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      // Get today's date for filtering
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      // Fetch real scan history for today
      const { data: scanData, error: scanError } = await supabase
        .from('scan_history')
        .select('*')
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay);

      if (scanError) {
        console.error('Error fetching scan history:', scanError);
      }

      // Fetch threat intelligence count
      const { data: threatData } = await supabase.functions.invoke('threat-intelligence');
      const threatCount = threatData?.threats?.length || 0;

      // Calculate real stats from scan data
      const scans = scanData || [];
      const scansToday = scans.length;
      const threatsDetected = scans.filter(scan => 
        scan.verdict === 'malicious' || scan.verdict === 'suspicious'
      ).length;
      const cleanResults = scans.filter(scan => 
        scan.verdict === 'clean' || scan.verdict === 'undetected'
      ).length;

      setStats({
        scansToday,
        threatsDetected,
        cleanResults,
        activeFeedCount: threatCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to zero stats to show real data unavailable
      setStats({
        scansToday: 0,
        threatsDetected: 0,
        cleanResults: 0,
        activeFeedCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Security Operations Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Unified cybersecurity platform for threat analysis and intelligence
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-green-400">● System Operational</div>
          <div className="text-xs text-muted-foreground">All modules online</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleCards.map((module, index) => (
          <Card 
            key={module.title}
            className="cyber-card cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => navigate(module.route)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <module.icon className={`h-8 w-8 ${module.color}`} />
                <span className={`text-xs px-2 py-1 rounded-full bg-opacity-20 ${
                  module.status === 'Active' ? 'text-green-400 bg-green-400' :
                  module.status === 'Beta' ? 'text-yellow-400 bg-yellow-400' :
                  'text-orange-400 bg-orange-400'
                }`}>
                  {module.status}
                </span>
              </div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription className="text-sm">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full cyber-button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(module.route);
                }}
              >
                Launch Module
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Tools Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Management Tools</h2>
        <p className="text-muted-foreground">CRUD operations for threat intelligence data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {managementCards.map((module, index) => (
          <Card 
            key={index} 
            className="cyber-card hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/50"
            onClick={() => navigate(module.route)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <module.icon className={`h-8 w-8 ${module.color} animate-pulse-glow`} />
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  module.status === 'New' ? 'bg-green-900/30 text-green-400 border border-green-400/30' :
                  module.status === 'Beta' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-400/30' :
                  module.status === 'Premium' ? 'bg-purple-900/30 text-purple-400 border border-purple-400/30' :
                  'bg-emerald-900/30 text-emerald-400 border border-emerald-400/30'
                }`}>
                  {module.status}
                </span>
              </div>
              <CardTitle className="text-lg text-primary">{module.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full cyber-button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(module.route);
                }}
              >
                Launch Tool
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-primary">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>API Services</span>
              <span className="text-green-400">● Online</span>
            </div>
            <div className="flex justify-between">
              <span>Threat Feeds</span>
              <span className="text-green-400">● Active</span>
            </div>
            <div className="flex justify-between">
              <span>AI Assistant</span>
              <span className="text-green-400">● Ready</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-primary">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Scans Today</span>
              <span className="text-cyber-blue">{loading ? '...' : stats.scansToday}</span>
            </div>
            <div className="flex justify-between">
              <span>Threats Detected</span>
              <span className="text-red-400">{loading ? '...' : stats.threatsDetected}</span>
            </div>
            <div className="flex justify-between">
              <span>Clean Results</span>
              <span className="text-green-400">{loading ? '...' : stats.cleanResults}</span>
            </div>
            <div className="flex justify-between">
              <span>Active IOCs</span>
              <span className="text-yellow-400">{loading ? '...' : stats.activeFeedCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-primary">Latest Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-yellow-400">⚠ New IOCs from ThreatFox</div>
            <div className="text-sm text-red-400">🚨 Malicious domain detected</div>
            <div className="text-sm text-blue-400">ℹ Security news updated</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
