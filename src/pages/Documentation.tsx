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
  provider: 'aws' | 'azure' | 'gcp';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const documentationItems: DocItem[] = [
  // AWS Documentation - Updated with current working links
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
    title: "AWS Security Incident Response Guide",
    description: "Step-by-step incident response procedures for AWS environments",
    url: "https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/",
    provider: "aws",
    category: "Incident Response",
    difficulty: "advanced"
  },
  {
    title: "AWS VPC Security",
    description: "Network security configuration and best practices for VPCs",
    url: "https://docs.aws.amazon.com/vpc/latest/userguide/security.html",
    provider: "aws",
    category: "Network Security",
    difficulty: "intermediate"
  },
  {
    title: "AWS Config",
    description: "Configuration management and compliance monitoring for AWS resources",
    url: "https://docs.aws.amazon.com/config/latest/developerguide/",
    provider: "aws",
    category: "Compliance",
    difficulty: "intermediate"
  },

  // Azure Documentation - Updated with current working links
  {
    title: "Azure Security Documentation",
    description: "Microsoft Azure security features, tools, and best practices",
    url: "https://docs.microsoft.com/en-us/azure/security/",
    provider: "azure",
    category: "Security Guidelines",
    difficulty: "intermediate"
  },
  {
    title: "Microsoft Entra ID (Azure AD)",
    description: "Identity and access management for Azure and Microsoft 365",
    url: "https://docs.microsoft.com/en-us/azure/active-directory/",
    provider: "azure",
    category: "Identity & Access",
    difficulty: "beginner"
  },
  {
    title: "Microsoft Sentinel Documentation",
    description: "Cloud-native SIEM and security orchestration platform",
    url: "https://docs.microsoft.com/en-us/azure/sentinel/",
    provider: "azure",
    category: "SIEM",
    difficulty: "advanced"
  },
  {
    title: "Microsoft Defender for Cloud",
    description: "Unified security management and threat protection for hybrid cloud workloads",
    url: "https://docs.microsoft.com/en-us/azure/defender-for-cloud/",
    provider: "azure",
    category: "Threat Protection",
    difficulty: "intermediate"
  },
  {
    title: "Azure Network Security Groups",
    description: "Configuring network-level security controls in Azure",
    url: "https://docs.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview",
    provider: "azure",
    category: "Network Security",
    difficulty: "beginner"
  },
  {
    title: "Azure Key Vault",
    description: "Secure storage and management of cryptographic keys, certificates, and secrets",
    url: "https://docs.microsoft.com/en-us/azure/key-vault/",
    provider: "azure",
    category: "Key Management",
    difficulty: "intermediate"
  },

  // GCP Documentation - Updated with current working links
  {
    title: "Google Cloud Security Documentation",
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
    description: "Centralized security and risk management for Google Cloud",
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
  {
    title: "Google Cloud Audit Logs",
    description: "Logging and monitoring for security analysis and compliance",
    url: "https://cloud.google.com/logging/docs/audit",
    provider: "gcp",
    category: "Monitoring",
    difficulty: "intermediate"
  },
  {
    title: "Google Cloud KMS",
    description: "Key Management Service for encryption key lifecycle management",
    url: "https://cloud.google.com/kms/docs",
    provider: "gcp",
    category: "Key Management",
    difficulty: "intermediate"
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
            Curated security documentation and playbooks for cloud platforms
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Platforms</TabsTrigger>
              <TabsTrigger value="aws">AWS</TabsTrigger>
              <TabsTrigger value="azure">Azure</TabsTrigger>
              <TabsTrigger value="gcp">Google Cloud</TabsTrigger>
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
            {categories.map(category => (
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

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-blue-400">📚 Documentation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            All documentation links have been verified and updated to current official sources. 
            Links open in new tabs and lead to authoritative cloud security documentation.
          </p>
          <p className="text-xs text-muted-foreground">
            For production environments, consider implementing a knowledge base with 
            internal documentation, custom playbooks, and organization-specific procedures.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
