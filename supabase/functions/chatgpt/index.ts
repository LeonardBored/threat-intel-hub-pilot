
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'OpenAI API configuration not found. Please add your OPENAI_API_KEY to Supabase Edge Function secrets.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare the system prompt for cybersecurity context
    const systemPrompt = `You are a cybersecurity AI assistant specializing in:
- SIEM query generation (Splunk, Sentinel, Elasticsearch, QRadar)
- Incident response procedures and playbooks
- Security configuration and hardening
- Threat intelligence analysis
- Security tool automation and scripting
- Cloud security best practices (AWS, Azure, GCP)
- Vulnerability management and assessment
- Network security monitoring and analysis
- Malware analysis and reverse engineering
- Digital forensics and incident investigation
- Compliance frameworks (SOC2, ISO 27001, NIST, PCI-DSS)
- Zero Trust architecture implementation

Provide practical, actionable responses with code examples when appropriate. 
Format code blocks with proper syntax highlighting using triple backticks and language specification.
Keep responses focused on cybersecurity topics and provide step-by-step guidance when possible.
Include relevant security best practices and explain potential risks or considerations.`

    // Call OpenAI API with updated model and configuration
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Updated to latest recommended model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        stream: false
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', response.status, errorData)
      
      // Provide specific error messages based on status codes
      let errorMessage = 'Failed to get response from AI service'
      if (response.status === 401) {
        errorMessage = 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in Supabase secrets.'
      } else if (response.status === 429) {
        errorMessage = 'OpenAI rate limit exceeded. Please try again later.'
      } else if (response.status === 500) {
        errorMessage = 'OpenAI service temporarily unavailable'
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status >= 500 ? 500 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response format:', data)
      return new Response(
        JSON.stringify({ error: 'Invalid response from AI service' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const aiResponse = data.choices[0].message.content

    // Log usage for monitoring
    if (data.usage) {
      console.log('OpenAI API Usage:', {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens
      })
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        usage: data.usage || null,
        model: 'gpt-4.1-2025-04-14'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    // Provide user-friendly error message
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to OpenAI API. Please check your internet connection.'
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid request format'
      }
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
