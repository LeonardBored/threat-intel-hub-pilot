
import { useState, useEffect } from 'react';
import { Book, ExternalLink, Clock, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

export default function SecurityNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('security-news');
      
      if (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "Error Loading News",
          description: "Failed to fetch security news",
          variant: "destructive"
        });
        return;
      }

      if (data && data.news) {
        setNews(data.news);
        toast({
          title: "News Updated",
          description: `Loaded ${data.news.length} articles`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load security news",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = selectedSource === 'all' 
    ? news 
    : news.filter(item => item.source.toLowerCase().includes(selectedSource));

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
      'Critical Infrastructure': 'bg-pink-900/20 text-pink-400',
      'Security News': 'bg-gray-900/20 text-gray-400',
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Sources</TabsTrigger>
          <TabsTrigger value="hacker">The Hacker News</TabsTrigger>
          <TabsTrigger value="bleeping">Bleeping Computer</TabsTrigger>
          <TabsTrigger value="krebs">Krebs on Security</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedSource} className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing {filteredNews.length} articles
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="cyber-button"
              onClick={fetchNews}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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

      <Card className="cyber-card border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">📡 Live RSS Feed Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Active RSS feeds now providing real-time security news:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>The Hacker News</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Bleeping Computer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Krebs on Security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Live RSS Processing</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              RSS feeds are parsed in real-time through Supabase edge functions with automatic categorization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityNews;
