
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Scanning URL:', url);

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('URLSCAN_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'URLScan API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Submit URL for scanning
    const submitResponse = await fetch('https://urlscan.io/api/v1/scan/', {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        visibility: 'public'
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('URLScan submit error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to submit URL for scanning' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const submitData = await submitResponse.json();
    console.log('URLScan submit response:', submitData);

    // Wait a moment for the scan to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get scan results
    const uuid = submitData.uuid;
    const resultResponse = await fetch(`https://urlscan.io/api/v1/result/${uuid}/`);

    if (!resultResponse.ok) {
      // Scan might still be processing
      return new Response(
        JSON.stringify({
          url: url,
          verdict: 'scanning',
          screenshotUrl: null,
          reportUrl: `https://urlscan.io/result/${uuid}/`,
          score: 0,
          analysis: {
            requests: 0,
            domains: 0,
            ips: 0,
            countries: []
          },
          message: 'Scan in progress. Check the report URL for updates.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resultData = await resultResponse.json();
    console.log('URLScan result:', resultData);

    // Format the response
    const formattedResult = {
      url: url,
      verdict: determineVerdict(resultData),
      screenshotUrl: resultData.task?.screenshotURL || resultData.screenshotURL,
      reportUrl: `https://urlscan.io/result/${uuid}/`,
      score: calculateRiskScore(resultData),
      analysis: {
        requests: resultData.stats?.uniqIPs || 0,
        domains: resultData.stats?.uniqCountries || 0,
        ips: resultData.stats?.uniqIPs || 0,
        countries: resultData.stats?.uniqCountries ? ['Multiple'] : []
      }
    };

    return new Response(
      JSON.stringify(formattedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in urlscan-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function determineVerdict(data: any): 'safe' | 'malicious' | 'suspicious' {
  if (!data.verdicts) return 'safe';
  
  const overall = data.verdicts.overall;
  if (overall?.malicious > 0) return 'malicious';
  if (overall?.suspicious > 0) return 'suspicious';
  return 'safe';
}

function calculateRiskScore(data: any): number {
  if (!data.verdicts?.overall) return 0;
  
  const { malicious = 0, suspicious = 0 } = data.verdicts.overall;
  return Math.min((malicious * 50) + (suspicious * 25), 100);
}
