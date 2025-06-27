
import { useState } from 'react';
import { Book, ExternalLink, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

const mockNews: NewsItem[] = [
  {
    title: "New Critical Vulnerability Discovered in Popular Web Framework",
    description: "Security researchers have identified a critical remote code execution vulnerability affecting millions of websites worldwide...",
    link: "https://example.com/news1",
    pubDate: "2024-06-27T10:30:00Z",
    source: "The Hacker News",
    category: "Vulnerability"
  },
  {
    title: "Ransomware Group Targets Healthcare Infrastructure",
    description: "A sophisticated ransomware campaign has been targeting healthcare organizations across multiple countries...",
    link: "https://example.com/news2",
    pubDate: "2024-06-27T08:15:00Z",
    source: "Bleeping Computer",
    category: "Ransomware"
  },
  {
    title: "Zero-Day Exploit in Enterprise VPN Solutions",
    description: "Multiple enterprise VPN solutions have been found vulnerable to a zero-day exploit that allows attackers to bypass authentication...",
    link: "https://example.com/news3",
    pubDate: "2024-06-26T22:45:00Z",
    source: "The Hacker News",
    category: "Zero-Day"
  },
  {
    title: "AI-Powered Phishing Attacks on the Rise",
    description: "Cybercriminals are increasingly using artificial intelligence to create more convincing phishing emails and websites...",
    link: "https://example.com/news4",
    pubDate: "2024-06-26T16:20:00Z",
    source: "Bleeping Computer",
    category: "Phishing"
  },
  {
    title: "New Supply Chain Attack Methodology Revealed",
    description: "Security researchers have documented a novel supply chain attack technique that has evaded detection for months...",
    link: "https://example.com/news5",
    pubDate: "2024-06-26T14:10:00Z",
    source: "The Hacker News",
    category: "Supply Chain"
  }
];

export default function SecurityNews() {
  const [selectedSource, setSelectedSource] = useState('all');

  const filteredNews = selectedSource === 'all' 
    ? mockNews 
    : mockNews.filter(item => item.source.toLowerCase().includes(selectedSource));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Vulnerability': 'bg-red-900/20 text-red-400',
      'Ransomware': 'bg-orange-900/20 text-orange-400',
      'Zero-Day': 'bg-purple-900/20 text-purple-400',
      'Phishing': 'bg-yellow-900/20 text-yellow-400',
      'Supply Chain': 'bg-blue-900/20 text-blue-400',
    };
    return colors[category] || 'bg-gray-900/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Book className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary">Security News</h1>
          <p className="text-muted-foreground">
            Latest cybersecurity news and threat intelligence updates
          </p>
        </div>
      </div>

      <Tabs value={selectedSource} onValueChange={setSelectedSource} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Sources</TabsTrigger>
          <TabsTrigger value="hacker">The Hacker News</TabsTrigger>
          <TabsTrigger value="bleeping">Bleeping Computer</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedSource} className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing {filteredNews.length} articles
              </span>
            </div>
            <Button variant="outline" size="sm" className="cyber-button">
              Refresh Feed
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredNews.map((item, index) => (
              <Card key={index} className="cyber-card hover:border-primary/40 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {item.title}
                        </a>
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(item.category)}`}
                        >
                          {item.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.pubDate)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.source}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed mb-4">
                    {item.description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cyber-button"
                    onClick={() => window.open(item.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read Full Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-yellow-400">📡 RSS Feed Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This module displays simulated security news. To enable live RSS feeds, 
            connect to Supabase and configure automated news aggregation in the backend.
          </p>
          <p className="text-xs text-muted-foreground">
            Real implementation would fetch and parse RSS feeds from The Hacker News and Bleeping Computer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
