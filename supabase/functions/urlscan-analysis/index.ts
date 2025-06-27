
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

async function getScanStatus(scanUuid: string) {
  try {
    const resultResponse = await fetch(`https://urlscan.io/api/v1/result/${scanUuid}/`);
    
    if (!resultResponse.ok) {
      if (resultResponse.status === 404) {
        return new Response(
          JSON.stringify({
            status: 'processing',
            progress: 50,
            message: 'Scan in progress...',
            uuid: scanUuid
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`HTTP ${resultResponse.status}: ${resultResponse.statusText}`);
    }

    const resultData = await resultResponse.json();
    
    // Check if scan is complete by verifying essential data exists
    if (!resultData.task || !resultData.task.url) {
      return new Response(
        JSON.stringify({
          status: 'processing',
          progress: 75,
          message: 'Generating report and screenshot...',
          uuid: scanUuid
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scan is complete, return full results
    let screenshotUrl = resultData.task?.screenshotURL || 
                       resultData.screenshotURL || 
                       `https://urlscan.io/screenshots/${scanUuid}.png`;
    
    // Extract detailed scan results
    const httpRequests = resultData.data?.requests?.map((req: any) => ({
      url: req.request?.url || '',
      method: req.request?.method || 'GET',
      status: req.response?.status || 0,
      type: req.request?.type || 'unknown',
      size: req.response?.dataLength || 0
    })) || [];

    const redirects = resultData.data?.requests?.filter((req: any) => 
      req.response?.status >= 300 && req.response?.status < 400
    ).map((req: any) => ({
      from: req.request?.url || '',
      to: req.response?.location || '',
      status: req.response?.status || 0
    })) || [];

    const behaviors = [
      ...(resultData.lists?.ips?.map((ip: string) => `Connected to IP: ${ip}`) || []),
      ...(resultData.lists?.domains?.map((domain: string) => `Accessed domain: ${domain}`) || []),
      ...(resultData.lists?.urls?.filter((url: string) => url !== resultData.task.url).slice(0, 5).map((url: string) => `Made request to: ${url}`) || [])
    ];

    const formattedResult = {
      status: 'complete',
      progress: 100,
      url: resultData.task.url,
      verdict: determineVerdict(resultData),
      screenshotUrl: screenshotUrl,
      reportUrl: `https://urlscan.io/result/${scanUuid}/`,
      score: calculateRiskScore(resultData),
      uuid: scanUuid,
      analysis: {
        requests: resultData.stats?.uniqRequests || httpRequests.length,
        domains: resultData.stats?.uniqDomains || 0,
        ips: resultData.stats?.uniqIPs || 0,
        countries: Array.from(new Set(resultData.lists?.countries || [])).slice(0, 3)
      },
      httpRequests: httpRequests.slice(0, 10), // Limit to first 10 for display
      redirects: redirects.slice(0, 5),
      behaviors: behaviors.slice(0, 8)
    };

    return new Response(
      JSON.stringify(formattedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting scan status:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get scan status',
        status: 'error',
        uuid: scanUuid
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, uuid } = await req.json();
    console.log('Request params:', { url, uuid });

    // If UUID is provided, get status of existing scan
    if (uuid) {
      return await getScanStatus(uuid);
    }

    // Otherwise, submit new scan
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

    // Return the UUID for polling
    return new Response(
      JSON.stringify({
        status: 'submitted',
        progress: 10,
        message: 'URL submitted for scanning...',
        uuid: submitData.uuid,
        reportUrl: `https://urlscan.io/result/${submitData.uuid}/`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in urlscan-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message, status: 'error' }),
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
