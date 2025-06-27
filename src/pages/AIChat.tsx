
import { useState, useRef, useEffect } from 'react';
import { User, Send, Copy, Code, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
}

const sampleQueries = [
  "Generate a Splunk query for failed login attempts",
  "Create a secure S3 bucket CloudFormation template",
  "Show incident response steps for data breach",
  "Write Elasticsearch query for network anomalies"
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Security Assistant. I can help you with:\n\n• Generating SIEM queries for Splunk, Sentinel, and Elasticsearch\n• Creating security-focused Infrastructure-as-Code\n• Incident response guidance\n• Threat analysis and remediation steps\n\nWhat would you like help with today?",
      timestamp: new Date(),
      hasCode: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let assistantContent = '';
      let hasCode = false;

      if (input.toLowerCase().includes('splunk')) {
        assistantContent = `Here's a Splunk query to search for failed login attempts:

\`\`\`splunk
index=security sourcetype=auth
| search "failed" OR "failure" OR "invalid"
| eval src_ip=if(isnull(src_ip),src,src_ip)
| stats count by src_ip, user, _time
| where count > 5
| sort -count
\`\`\`

This query will:
- Search the security index for authentication events
- Filter for failed login indicators
- Group by source IP and user
- Show IPs with more than 5 failed attempts
- Sort by frequency`;
        hasCode = true;
      } else if (input.toLowerCase().includes('cloudformation') || input.toLowerCase().includes('s3')) {
        assistantContent = `Here's a secure S3 bucket CloudFormation template:

\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Secure S3 bucket with logging and encryption'

Resources:
  SecureS3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '\${AWS::StackName}-secure-bucket'
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      VersioningConfiguration:
        Status: Enabled
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      LoggingConfiguration:
        DestinationBucketName: !Ref LoggingBucket
        LogFilePrefix: access-logs/
      
  LoggingBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '\${AWS::StackName}-access-logs'
\`\`\`

This template creates a secure S3 bucket with:
- Public access blocked
- Versioning enabled
- Server-side encryption
- Access logging configured`;
        hasCode = true;
      } else if (input.toLowerCase().includes('elasticsearch')) {
        assistantContent = `Here's an Elasticsearch query to detect unusual network activity:

\`\`\`json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-24h",
              "lte": "now"
            }
          }
        },
        {
          "terms": {
            "event.category": ["network", "intrusion_detection"]
          }
        }
      ],
      "should": [
        {
          "range": {
            "network.bytes": {
              "gte": 1000000
            }
          }
        },
        {
          "range": {
            "source.port": {
              "gte": 1024,
              "lte": 65535
            }
          }
        }
      ]
    }
  },
  "aggs": {
    "top_sources": {
      "terms": {
        "field": "source.ip",
        "size": 10
      }
    },
    "unusual_ports": {
      "terms": {
        "field": "destination.port",
        "size": 20
      }
    }
  }
}
\`\`\`

This query identifies:
- Network events from the last 24 hours
- High-bandwidth transfers (>1MB)
- Connections to unusual ports
- Top source IPs and destination ports`;
        hasCode = true;
      } else if (input.toLowerCase().includes('incident') || input.toLowerCase().includes('breach')) {
        assistantContent = `**Incident Response for Potential Data Breach:**

**Phase 1: Immediate Response (0-1 hour)**
1. **Isolate affected systems** - Disconnect from network if necessary
2. **Preserve evidence** - Take memory dumps, disk images
3. **Alert incident response team** - Notify security team and management
4. **Document everything** - Start incident timeline and evidence log

**Phase 2: Investigation (1-24 hours)**
1. **Scope assessment** - Determine what data may be affected
2. **Root cause analysis** - Identify attack vector and timeline
3. **Threat hunting** - Search for additional indicators of compromise
4. **Impact assessment** - Evaluate potential business and customer impact

**Phase 3: Containment & Recovery (24-72 hours)**
1. **Patch vulnerabilities** - Address security gaps that enabled breach
2. **Reset credentials** - Change compromised passwords and API keys
3. **Restore from clean backups** - If necessary, restore affected systems
4. **Enhanced monitoring** - Implement additional security controls

**Phase 4: Communication & Legal (Ongoing)**
1. **Legal notification** - Report to authorities if required (GDPR, CCPA, etc.)
2. **Customer communication** - Notify affected customers if personal data involved
3. **Post-incident review** - Conduct lessons learned session
4. **Update procedures** - Improve incident response based on findings`;
        hasCode = false;
      } else {
        assistantContent = `I can help you with various cybersecurity tasks! Here are some things I can assist with:

**SIEM Queries:**
- Splunk searches for threat hunting
- Microsoft Sentinel KQL queries
- Elasticsearch queries for log analysis

**Infrastructure as Code:**
- CloudFormation templates for AWS security
- Terraform configurations for secure cloud resources
- Azure ARM templates with security best practices

**Incident Response:**
- Step-by-step response procedures
- Threat analysis and remediation
- Forensics and evidence collection guidance

Try asking me something like: "Generate a Splunk query for detecting brute force attacks" or "Create a secure AWS VPC configuration"`;
        hasCode = false;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        hasCode
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1500);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard."
    });
  };

  const formatMessage = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary">AI Security Assistant</h1>
          <p className="text-muted-foreground">
            Generate SIEM queries, security configurations, and incident response guidance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sample Queries */}
        <Card className="cyber-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Quick Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left h-auto p-3 text-xs hover:bg-primary/10 whitespace-normal leading-relaxed"
                onClick={() => setInput(query)}
              >
                <span className="break-words text-left w-full">{query}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="cyber-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Security AI Chat
            </CardTitle>
            <CardDescription>
              Ask questions about SIEM queries, security configurations, and incident response
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-md">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-card border border-primary/20'
                    }`}
                  >
                    <div className="space-y-2">
                      {formatMessage(message.content).map((part, index) => (
                        <div key={index}>
                          {part.type === 'text' ? (
                            <div className="whitespace-pre-wrap text-sm">{part.content}</div>
                          ) : (
                            <div className="relative">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Code className="h-3 w-3 mr-1" />
                                  {part.language}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2"
                                  onClick={() => copyToClipboard(part.content)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto">
                                <code>{part.content}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-primary/20 p-3 rounded-lg">
                    <div className="scan-indicator w-16 h-4 bg-primary/20 rounded">
                      <div className="text-xs text-center">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                className="cyber-input flex-1 min-h-[60px]"
                placeholder="Ask about SIEM queries, security configurations, or incident response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="cyber-button px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-yellow-400">🤖 AI Integration Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            To enable live AI assistance, connect to Supabase and configure your OpenAI API key 
            or preferred LLM provider in the backend edge functions.
          </p>
          <p className="text-xs text-muted-foreground">
            The interface above shows simulated AI responses. Real integration requires secure API key management 
            and proper LLM configuration for production use.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
