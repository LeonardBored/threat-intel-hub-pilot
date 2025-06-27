
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching security news...');

    const rssFeedUrls = [
      { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News' },
      { url: 'https://www.bleepingcomputer.com/feed/', source: 'Bleeping Computer' },
      { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security' }
    ];

    const allNews: NewsItem[] = [];

    for (const feed of rssFeedUrls) {
      try {
        const response = await fetch(feed.url);
        if (response.ok) {
          const xmlText = await response.text();
          const news = parseRSSFeed(xmlText, feed.source);
          allNews.push(...news);
        }
      } catch (error) {
        console.error(`Error fetching ${feed.source}:`, error);
      }
    }

    // Sort by publication date (newest first)
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return new Response(
      JSON.stringify({ news: allNews.slice(0, 20) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in security-news function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseRSSFeed(xmlText: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  // Simple regex-based RSS parsing
  const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  
  for (const item of itemMatches.slice(0, 5)) {
    try {
      const title = extractXMLContent(item, 'title');
      const description = extractXMLContent(item, 'description');
      const link = extractXMLContent(item, 'link');
      const pubDate = extractXMLContent(item, 'pubDate');
      
      if (title && description && link) {
        items.push({
          title: cleanHTMLTags(title),
          description: cleanHTMLTags(description).substring(0, 200) + '...',
          link,
          pubDate: pubDate || new Date().toISOString(),
          source,
          category: categorizeNews(title, description)
        });
      }
    } catch (error) {
      console.error('Error parsing RSS item:', error);
    }
  }
  
  return items;
}

function extractXMLContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanHTMLTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

function categorizeNews(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('ransomware')) return 'Ransomware';
  if (text.includes('vulnerability') || text.includes('cve')) return 'Vulnerability';
  if (text.includes('zero-day') || text.includes('zero day')) return 'Zero-Day';
  if (text.includes('phishing')) return 'Phishing';
  if (text.includes('supply chain')) return 'Supply Chain';
  if (text.includes('infrastructure')) return 'Critical Infrastructure';
  
  return 'Security News';
}
