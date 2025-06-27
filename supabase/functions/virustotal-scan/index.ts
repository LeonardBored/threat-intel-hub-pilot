
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
    const { input } = await req.json();
    console.log('Scanning input:', input);

    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'VirusTotal API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the type of input and scan accordingly
    let scanResult;
    
    if (input.startsWith('http://') || input.startsWith('https://')) {
      // URL scan
      scanResult = await scanUrl(input, apiKey);
    } else if (input.match(/^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/)) {
      // Hash scan (MD5, SHA1, SHA256)
      scanResult = await scanHash(input, apiKey);
    } else if (input.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      // IP scan
      scanResult = await scanIp(input, apiKey);
    } else {
      // Domain scan
      scanResult = await scanDomain(input, apiKey);
    }

    return new Response(
      JSON.stringify(scanResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in virustotal-scan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scanUrl(url: string, apiKey: string) {
  // First submit URL for analysis (v3 API)
  const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
    method: 'POST',
    headers: {
      'x-apikey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `url=${encodeURIComponent(url)}`,
  });

  if (!submitResponse.ok) {
    throw new Error('Failed to submit URL for analysis');
  }

  const submitData = await submitResponse.json();
  const analysisId = submitData.data.id;

  // Get analysis results
  const reportResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });

  const reportData = await reportResponse.json();
  return formatScanResultV3(reportData, url);
}

async function scanHash(hash: string, apiKey: string) {
  const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });
  
  const data = await response.json();
  return formatScanResultV3(data, hash);
}

async function scanIp(ip: string, apiKey: string) {
  const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });
  
  const data = await response.json();
  return formatScanResultV3(data, ip);
}

async function scanDomain(domain: string, apiKey: string) {
  const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });
  
  const data = await response.json();
  return formatScanResultV3(data, domain);
}

function formatScanResultV3(data: any, input: string) {
  console.log('VirusTotal v3 response:', data);

  if (!data.data) {
    return {
      summary: 'No results found',
      detectionRatio: '0/0',
      verdict: 'unknown',
      vendors: [],
      rawData: data
    };
  }

  const attributes = data.data.attributes;
  if (!attributes) {
    return {
      summary: 'Analysis in progress',
      detectionRatio: 'Scanning...',
      verdict: 'scanning',
      vendors: [],
      rawData: data
    };
  }

  const stats = attributes.last_analysis_stats || {};
  const positives = stats.malicious || 0;
  const total = (stats.malicious || 0) + (stats.clean || 0) + (stats.suspicious || 0) + (stats.undetected || 0);
  const detectionRatio = `${positives}/${total}`;

  let verdict = 'clean';
  let summary = 'No threats detected';

  if (positives > 0) {
    if (positives > total * 0.1) {
      verdict = 'malicious';
      summary = 'Malicious content detected';
    } else {
      verdict = 'suspicious';
      summary = 'Suspicious content detected';
    }
  }

  const vendors: Array<{name: string, result: string, category: string}> = [];
  if (attributes.last_analysis_results) {
    for (const [vendorName, scanResult] of Object.entries(attributes.last_analysis_results as Record<string, any>)) {
      vendors.push({
        name: vendorName,
        result: scanResult.result || 'Clean',
        category: scanResult.category || 'antivirus'
      });
    }
  }

  return {
    summary,
    detectionRatio,
    verdict,
    vendors: vendors.slice(0, 10), // Limit to first 10 vendors for UI
    rawData: data
  };
}

function formatScanResult(data: any, input: string) {
  console.log('VirusTotal response:', data);

  if (data.response_code === 0) {
    return {
      summary: 'No results found',
      detectionRatio: '0/0',
      verdict: 'unknown',
      vendors: [],
      rawData: data
    };
  }

  if (data.response_code === -2) {
    return {
      summary: 'Analysis in progress',
      detectionRatio: 'Scanning...',
      verdict: 'scanning',
      vendors: [],
      rawData: data
    };
  }

  const positives = data.positives || 0;
  const total = data.total || 0;
  const detectionRatio = `${positives}/${total}`;

  let verdict = 'clean';
  let summary = 'No threats detected';

  if (positives > 0) {
    if (positives > total * 0.1) {
      verdict = 'malicious';
      summary = 'Malicious content detected';
    } else {
      verdict = 'suspicious';
      summary = 'Suspicious content detected';
    }
  }

  const vendors: Array<{name: string, result: string, category: string}> = [];
  if (data.scans) {
    for (const [vendorName, scanResult] of Object.entries(data.scans as Record<string, any>)) {
      vendors.push({
        name: vendorName,
        result: scanResult.result || 'Clean',
        category: 'antivirus'
      });
    }
  }

  return {
    summary,
    detectionRatio,
    verdict,
    vendors: vendors.slice(0, 10), // Limit to first 10 vendors for UI
    rawData: data
  };
}
