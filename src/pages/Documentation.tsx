
import { useState } from 'react';
import { Book, ExternalLink, Search, Filter, Cloud, Shield, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocItem {
  title: string;
  description: string;
  url: string;
  provider: 'aws' | 'azure' | 'gcp' | 'general' | 'tools';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const documentationItems: DocItem[] = [
  // AWS Documentation
  {
    title: "AWS Security Best Practices",
    description: "Comprehensive guide to implementing security controls in AWS environments",
    url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html",
    provider: "aws",
    category: "Security Guidelines",
    difficulty: "intermediate"
  },
  {
    title: "AWS IAM User Guide",
    description: "Complete documentation for AWS Identity and Access Management",
    url: "https://docs.aws.amazon.com/iam/latest/userguide/",
    provider: "aws",
    category: "Identity & Access",
    difficulty: "beginner"
  },
  {
    title: "AWS CloudTrail Documentation",
    description: "Logging and monitoring AWS API calls for security analysis",
    url: "https://docs.aws.amazon.com/cloudtrail/latest/userguide/",
    provider: "aws",
    category: "Monitoring",
    difficulty: "intermediate"
  },
  {
    title: "AWS Security Hub",
    description: "Centralized security findings and compliance monitoring",
    url: "https://docs.aws.amazon.com/securityhub/latest/userguide/",
    provider: "aws",
    category: "Security Management",
    difficulty: "advanced"
  },
  {
    title: "AWS GuardDuty",
    description: "Threat detection service using machine learning",
    url: "https://docs.aws.amazon.com/guardduty/latest/ug/",
    provider: "aws",
    category: "Threat Detection",
    difficulty: "intermediate"
  },
  {
    title: "AWS Inspector",
    description: "Automated security assessment service",
    url: "https://docs.aws.amazon.com/inspector/latest/user/",
    provider: "aws",
    category: "Vulnerability Assessment",
    difficulty: "intermediate"
  },

  // Azure Documentation
  {
    title: "Azure Security Documentation",
    description: "Microsoft Azure security features, tools, and best practices",
    url: "https://learn.microsoft.com/en-us/azure/security/",
    provider: "azure",
    category: "Security Guidelines",
    difficulty: "intermediate"
  },
  {
    title: "Microsoft Entra ID",
    description: "Identity and access management for Azure and Microsoft 365",
    url: "https://learn.microsoft.com/en-us/entra/fundamentals/",
    provider: "azure",
    category: "Identity & Access",
    difficulty: "beginner"
  },
  {
    title: "Microsoft Sentinel",
    description: "Cloud-native SIEM and security orchestration platform",
    url: "https://learn.microsoft.com/en-us/azure/sentinel/",
    provider: "azure",
    category: "SIEM",
    difficulty: "advanced"
  },
  {
    title: "Microsoft Defender for Cloud",
    description: "Unified security management and threat protection",
    url: "https://learn.microsoft.com/en-us/azure/defender-for-cloud/",
    provider: "azure",
    category: "Threat Protection",
    difficulty: "intermediate"
  },
  {
    title: "Azure Key Vault",
    description: "Secure storage and management of cryptographic keys and secrets",
    url: "https://learn.microsoft.com/en-us/azure/key-vault/",
    provider: "azure",
    category: "Key Management",
    difficulty: "intermediate"
  },

  // Google Cloud Documentation
  {
    title: "Google Cloud Security",
    description: "Security features and best practices for Google Cloud Platform",
    url: "https://cloud.google.com/docs/security",
    provider: "gcp",
    category: "Security Guidelines",
    difficulty: "intermediate"
  },
  {
    title: "Google Cloud IAM",
    description: "Identity and Access Management for Google Cloud resources",
    url: "https://cloud.google.com/iam/docs",
    provider: "gcp",
    category: "Identity & Access",
    difficulty: "beginner"
  },
  {
    title: "Google Cloud Security Command Center",
    description: "Centralized security and risk management platform",
    url: "https://cloud.google.com/security-command-center/docs",
    provider: "gcp",
    category: "Security Management",
    difficulty: "advanced"
  },
  {
    title: "Google Cloud VPC Security",
    description: "Virtual Private Cloud security configuration and monitoring",
    url: "https://cloud.google.com/vpc/docs/vpc",
    provider: "gcp",
    category: "Network Security",
    difficulty: "intermediate"
  },

  // General Security Documentation
  {
    title: "OWASP Top 10",
    description: "Most critical web application security risks",
    url: "https://owasp.org/www-project-top-ten/",
    provider: "general",
    category: "Web Security",
    difficulty: "beginner"
  },
  {
    title: "NIST Cybersecurity Framework",
    description: "Framework for managing cybersecurity risk",
    url: "https://www.nist.gov/cyberframework",
    provider: "general",
    category: "Frameworks",
    difficulty: "intermediate"
  },
  {
    title: "CIS Controls",
    description: "Prioritized set of actions for cyber defense",
    url: "https://www.cisecurity.org/controls",
    provider: "general",
    category: "Security Controls",
    difficulty: "intermediate"
  },
  {
    title: "MITRE ATT&CK Framework",
    description: "Knowledge base of adversary tactics and techniques",
    url: "https://attack.mitre.org/",
    provider: "general",
    category: "Threat Intelligence",
    difficulty: "advanced"
  },

  // Security Tools Documentation
  {
    title: "Wireshark User Guide",
    description: "Network protocol analyzer documentation",
    url: "https://www.wireshark.org/docs/wsug_html_chunked/",
    provider: "tools",
    category: "Network Analysis",
    difficulty: "intermediate"
  },
  {
    title: "Nmap Reference Guide",
    description: "Network discovery and security auditing tool",
    url: "https://nmap.org/book/",
    provider: "tools",
    category: "Network Scanning",
    difficulty: "intermediate"
  },
  {
    title: "Metasploit Documentation",
    description: "Penetration testing framework documentation",
    url: "https://docs.metasploit.com/",
    provider: "tools",
    category: "Penetration Testing",
    difficulty: "advanced"
  },
  {
    title: "Burp Suite Documentation",
    description: "Web application security testing platform",
    url: "https://portswigger.net/burp/documentation",
    provider: "tools",
    category: "Web Security Testing",
    difficulty: "intermediate"
  },
  {
    title: "Splunk Security Documentation",
    description: "Security information and event management platform",
    url: "https://docs.splunk.com/Documentation/Splunk/latest/Security",
    provider: "tools",
    category: "SIEM",
    difficulty: "advanced"
  }
];

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDocs = documentationItems.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || doc.provider === selectedProvider;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesProvider && matchesCategory;
  });

  const categories = [...new Set(documentationItems.map(doc => doc.category))];

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws':
        return '☁️';
      case 'azure':
        return '🔷';
      case 'gcp':
        return '🟡';
      case 'general':
        return '📋';
      case 'tools':
        return '🛠️';
      default:
        return '📄';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws':
        return 'text-orange-400';
      case 'azure':
        return 'text-blue-400';
      case 'gcp':
        return 'text-green-400';
      case 'general':
        return 'text-purple-400';
      case 'tools':
        return 'text-cyan-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-900/20 text-green-400';
      case 'intermediate':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'advanced':
        return 'bg-red-900/20 text-red-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Book className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary">Security Documentation Hub</h1>
          <p className="text-muted-foreground">
            Comprehensive security documentation and playbooks for all platforms
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                className="cyber-input"
                placeholder="Search documentation by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="cyber-button">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <Tabs value={selectedProvider} onValueChange={setSelectedProvider} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="aws">AWS</TabsTrigger>
              <TabsTrigger value="azure">Azure</TabsTrigger>
              <TabsTrigger value="gcp">GCP</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="text-xs"
            >
              All Categories
            </Button>
            {categories.slice(0, 8).map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredDocs.length} documentation items
          </div>
        </div>

        <div className="grid gap-4">
          {filteredDocs.map((doc, index) => (
            <Card key={index} className="cyber-card hover:border-primary/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight hover:text-primary transition-colors flex items-center gap-2">
                      <span className="text-2xl">{getProviderIcon(doc.provider)}</span>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {doc.title}
                      </a>
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getProviderColor(doc.provider)}`}
                      >
                        {doc.provider.toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs text-primary"
                      >
                        {doc.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(doc.difficulty)}`}
                      >
                        {doc.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed mb-4">
                  {doc.description}
                </CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="cyber-button"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <Card className="cyber-card text-center py-12">
            <CardContent>
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documentation found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find relevant documentation.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="cyber-card border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">📚 Enhanced Documentation Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            All documentation links have been verified and updated. The hub now includes comprehensive
            resources for cloud platforms, security frameworks, and security tools.
          </p>
          <p className="text-xs text-muted-foreground">
            New categories include OWASP, NIST, CIS Controls, MITRE ATT&CK, and popular security tools
            like Wireshark, Nmap, Metasploit, and Burp Suite.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
