
import { Shield, Search, Book, User, Link, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export default function Dashboard() {
  const navigate = useNavigate();

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
              <span className="text-cyber-blue">247</span>
            </div>
            <div className="flex justify-between">
              <span>Threats Detected</span>
              <span className="text-red-400">12</span>
            </div>
            <div className="flex justify-between">
              <span>Clean Results</span>
              <span className="text-green-400">235</span>
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
