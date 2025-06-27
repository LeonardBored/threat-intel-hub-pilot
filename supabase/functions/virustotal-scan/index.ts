
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
  // Try to get existing analysis first
  const urlId = btoa(url).replace(/=/g, '');
  
  const existingResponse = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });

  if (existingResponse.ok) {
    const existingData = await existingResponse.json();
    return formatScanResultV3(existingData, url, 'url');
  }

  // If no existing analysis, submit for new analysis
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

  // Wait for analysis to complete
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const reportResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: {
        'x-apikey': apiKey,
      },
    });

    const reportData = await reportResponse.json();
    
    if (reportData.data?.attributes?.status === 'completed') {
      return formatScanResultV3(reportData, url, 'url');
    }
    
    attempts++;
  }

  // If analysis is still not complete, return scanning status
  return {
    summary: 'Analysis in progress',
    detectionRatio: 'Scanning...',
    verdict: 'scanning',
    vendors: [],
    rawData: { status: 'scanning' }
  };
}

async function scanHash(hash: string, apiKey: string) {
  const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });
  
  const data = await response.json();
  return formatScanResultV3(data, hash, 'file');
}

async function scanIp(ip: string, apiKey: string) {
  const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });
  
  const data = await response.json();
  return formatScanResultV3(data, ip, 'ip');
}

async function scanDomain(domain: string, apiKey: string) {
  const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
    headers: {
      'x-apikey': apiKey,
    },
  });
  
  const data = await response.json();
  return formatScanResultV3(data, domain, 'domain');
}

function formatScanResultV3(data: any, input: string, type: string = 'unknown') {
  console.log('VirusTotal v3 response:', data);

  if (!data.data) {
    return {
      summary: 'No results found',
      detectionRatio: '0/0',
      verdict: 'unknown',
      vendors: [],
      rawData: data,
      virusTotalUrl: getVirusTotalUrl(input, type)
    };
  }

  const attributes = data.data.attributes;
  if (!attributes) {
    return {
      summary: 'Analysis in progress',
      detectionRatio: 'Scanning...',
      verdict: 'scanning',
      vendors: [],
      rawData: data,
      virusTotalUrl: getVirusTotalUrl(input, type)
    };
  }

  // Get analysis stats - VirusTotal's actual categories
  const stats = attributes.last_analysis_stats || {};
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const clean = stats.clean || stats.harmless || 0;
  const undetected = stats.undetected || 0;
  const timeout = stats.timeout || 0;
  const failure = stats.failure || 0;
  
  const total = malicious + suspicious + clean + undetected + timeout + failure;
  const detectionRatio = `${malicious + suspicious}/${total}`;

  // Determine verdict based on VirusTotal's actual logic
  let verdict = 'clean';
  let summary = 'No threats detected';

  if (malicious > 0) {
    verdict = 'malicious';
    summary = `Detected as malicious by ${malicious} engine(s)`;
  } else if (suspicious > 0) {
    verdict = 'suspicious';
    summary = `Flagged as suspicious by ${suspicious} engine(s)`;
  } else if (clean > 0) {
    verdict = 'clean';
    summary = `Verified as clean by ${clean} engine(s)`;
  } else if (undetected > 0) {
    verdict = 'clean';
    summary = `Undetected by ${undetected} engine(s) - likely clean`;
  } else {
    verdict = 'unknown';
    summary = 'Unable to determine status';
  }

  // Process vendor results with accurate VirusTotal categories
  const vendors: Array<{name: string, result: string, category: string}> = [];
  if (attributes.last_analysis_results) {
    for (const [vendorName, scanResult] of Object.entries(attributes.last_analysis_results as Record<string, any>)) {
      const result = scanResult.result || 'Clean';
      const category = scanResult.category || 'undetected';
      
      vendors.push({
        name: vendorName,
        result: result === 'null' ? 'Clean' : result,
        category: mapVirusTotalCategory(category)
      });
    }
  }

  // Filter vendors to show only meaningful results
  // Priority: malicious, suspicious, clean/harmless first
  const maliciousVendors = vendors.filter(v => v.category === 'malicious');
  const suspiciousVendors = vendors.filter(v => v.category === 'suspicious');
  const cleanVendors = vendors.filter(v => v.category === 'clean' || v.category === 'harmless');
  const undetectedVendors = vendors.filter(v => v.category === 'undetected');
  
  let filteredVendors: Array<{name: string, result: string, category: string}> = [];
  
  // Show meaningful results first
  filteredVendors = [
    ...maliciousVendors,
    ...suspiciousVendors,
    ...cleanVendors.slice(0, 5) // Limit clean results to 5
  ];
  
  // Only show undetected if no meaningful results exist
  if (filteredVendors.length === 0) {
    filteredVendors = undetectedVendors.slice(0, 10);
  }

  // Sort by category priority (malicious first, then suspicious, etc.)
  filteredVendors.sort((a, b) => {
    const categoryOrder = { 
      'malicious': 0, 
      'suspicious': 1, 
      'harmless': 2,
      'clean': 2, 
      'undetected': 3, 
      'timeout': 4, 
      'failure': 5 
    };
    return (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
  });

  return {
    summary,
    detectionRatio,
    verdict,
    vendors: filteredVendors, // Use filtered vendors instead of all vendors
    stats: {
      malicious,
      suspicious,
      clean,
      undetected,
      timeout,
      failure,
      total
    },
    rawData: data,
    virusTotalUrl: getVirusTotalUrl(input, type)
  };
}

function mapVirusTotalCategory(category: string): string {
  // Map VirusTotal's actual categories exactly
  switch (category?.toLowerCase()) {
    case 'malicious':
      return 'malicious';
    case 'suspicious':
      return 'suspicious';
    case 'undetected':
      return 'undetected';
    case 'harmless':
      return 'harmless';
    case 'clean':
      return 'clean';
    case 'timeout':
      return 'timeout';
    case 'failure':
    case 'error':
      return 'failure';
    default:
      return 'undetected';
  }
}

function getVirusTotalUrl(input: string, type: string): string {
  // Generate the correct VirusTotal URL based on input type
  switch (type) {
    case 'url':
      // For URLs, encode them properly for VirusTotal
      const urlId = btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      return `https://www.virustotal.com/gui/url/${urlId}`;
    case 'file':
      return `https://www.virustotal.com/gui/file/${input}`;
    case 'ip':
      return `https://www.virustotal.com/gui/ip-address/${input}`;
    case 'domain':
      return `https://www.virustotal.com/gui/domain/${input}`;
    default:
      return `https://www.virustotal.com/gui/search/${encodeURIComponent(input)}`;
  }
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
