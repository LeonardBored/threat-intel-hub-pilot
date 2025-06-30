
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SecurityNews = () => {
  const [newsData, setNewsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSecurityNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('security-news');

      if (error) throw error;

      setNewsData(data);
      toast({
        title: "News Updated",
        description: "Latest security news fetched successfully.",
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to fetch latest security news.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityNews();
  }, []);

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'KrebsOnSecurity': 'bg-blue-500',
      'Threatpost': 'bg-green-500',
      'Bleeping Computer': 'bg-purple-500',
      'The Hacker News': 'bg-red-500',
      'Dark Reading': 'bg-orange-500'
    };
    return colors[source] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security News</h1>
          <p className="text-muted-foreground">
            Latest cybersecurity news and updates from trusted sources
          </p>
        </div>
        <Button onClick={fetchSecurityNews} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh News
        </Button>
      </div>

      {newsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(newsData).map(([source, articles]: [string, any]) => (
            <Card key={source}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getSourceColor(source)}`} />
                  <div>
                    <div className="text-2xl font-bold">{articles?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">{source}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {newsData && Object.entries(newsData).map(([source, articles]: [string, any]) => (
        <Card key={source}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getSourceColor(source)}`} />
              {source}
            </CardTitle>
            <CardDescription>
              Latest articles from {source}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {articles?.map((article: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg leading-tight pr-4">
                      {article.title}
                    </h4>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  
                  {article.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {article.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {article.pubDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.pubDate).toLocaleDateString()}
                      </div>
                    )}
                    {article.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Badge className={`${getSourceColor(source)} text-white text-xs`}>
                      {source}
                    </Badge>
                    {article.category && (
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SecurityNews;
