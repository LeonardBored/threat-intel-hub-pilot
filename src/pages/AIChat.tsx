
import { useState, useRef, useEffect } from 'react';
import { User, Send, Copy, Code, Zap, Brain, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
}

const sampleQueries = [
  "Generate a Splunk query for failed login attempts",
  "How do I respond to a phishing incident?",
  "Create a PowerShell script for security monitoring",
  "What are the key steps in vulnerability management?",
  "Help me with network security best practices",
  "Write a Python script for threat intelligence",
  "Explain incident response procedures",
  "Create secure AWS CloudFormation templates"
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Security Assistant powered by ChatGPT! 🔐\n\nI can help you with:\n\n• Generating SIEM queries for Splunk, Sentinel, and Elasticsearch\n• Creating security-focused Infrastructure-as-Code\n• Incident response guidance\n• Threat analysis and remediation steps\n• Custom security configurations and scripts\n\nUse the quick examples for instant responses, or ask me anything for AI-powered assistance!\n\nWhat would you like help with today?",
      timestamp: new Date(),
      hasCode: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to check if input matches a quick example
  const isQuickExample = (userInput: string) => {
    return sampleQueries.some(query => 
      userInput.toLowerCase().trim() === query.toLowerCase().trim()
    );
  };

  // Function to call ChatGPT API
  const callChatGPT = async (userInput: string) => {
    try {
      setApiError(false);
      
      const { data, error } = await supabase.functions.invoke('chatgpt', {
        body: {
          message: userInput
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('API call failed');
      }

      return data.response;
    } catch (error) {
      console.error('ChatGPT API Error:', error);
      setApiError(true);
      
      // Fallback to generic response
      return `I apologize, but I'm currently unable to connect to the AI service. Here's some general security guidance for "${userInput}":

**Security Best Practices:**
- Implement defense in depth with multiple security layers
- Follow the principle of least privilege
- Keep systems and software updated
- Monitor for suspicious activities
- Have an incident response plan ready

For specific technical guidance, please try one of the quick examples on the left, or check back later when the AI service is available.

**Available Quick Examples:**
${sampleQueries.slice(0, 3).map(q => `• ${q}`).join('\n')}`;
    }
  };

  // Helper functions for generating responses
  const generateSplunkResponse = (userInput: string) => {
    if (userInput.includes('brute force') || userInput.includes('failed login')) {
      return `Here's a Splunk query to detect brute force attacks:

\`\`\`splunk
index=security sourcetype=auth
| search "failed" OR "failure" OR "invalid"
| eval src_ip=if(isnull(src_ip),src,src_ip)
| stats count by src_ip, user, _time
| where count > 5
| sort -count
| eval threat_level=case(count>20,"Critical",count>10,"High",count>5,"Medium")
\`\`\`

This query will identify potential brute force attacks by:
- Searching authentication logs for failed attempts
- Grouping by source IP and user
- Flagging IPs with more than 5 failed attempts
- Assigning threat levels based on frequency`;
    } else if (userInput.includes('network') || userInput.includes('connection')) {
      return `Here's a Splunk query for network anomaly detection:

\`\`\`splunk
index=network sourcetype=firewall
| stats count, avg(bytes_out), max(bytes_out) by src_ip, dest_ip, dest_port
| where count > 100 OR avg(bytes_out) > 1000000
| eval anomaly_score=case(count>500,10,count>200,7,count>100,5,1)
| sort -anomaly_score
\`\`\`

This detects unusual network patterns by analyzing:
- Connection frequency between hosts
- Data transfer volumes
- Unusual port usage
- Anomaly scoring for prioritization`;
    } else {
      return `Here's a general Splunk security search template:

\`\`\`splunk
index=security earliest=-24h@h latest=now
| search [your_search_terms_here]
| stats count by source, sourcetype, host
| sort -count
| head 20
\`\`\`

This template provides a foundation for security investigations with:
- 24-hour time window
- Flexible search terms
- Source analysis
- Top results prioritization`;
    }
  };

  const generateCloudFormationResponse = (userInput: string) => {
    if (userInput.includes('vpc') || userInput.includes('network')) {
      return `Here's a secure VPC CloudFormation template:

\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Secure VPC with proper network segmentation'

Resources:
  SecureVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      
  PrivateSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref SecureVPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      
  NACLPrivate:
    Type: AWS::EC2::NetworkAcl
    Properties:
      VpcId: !Ref SecureVPC
      
  NACLEntryInbound:
    Type: AWS::EC2::NetworkAclEntry
    Properties:
      NetworkAclId: !Ref NACLPrivate
      RuleNumber: 100
      Protocol: -1
      RuleAction: deny
      CidrBlock: 0.0.0.0/0
\`\`\`

This creates a secure VPC with:
- Private subnet isolation
- Restrictive NACLs
- DNS resolution enabled
- Multi-AZ capability`;
    } else {
      return `Here's a secure S3 bucket CloudFormation template:

\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Secure S3 bucket with comprehensive security controls'

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
      NotificationConfiguration:
        CloudWatchConfigurations:
          - Event: 's3:ObjectCreated:*'
            CloudWatchConfiguration:
              LogGroupName: !Ref LogGroup
              
  LogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/s3/\${AWS::StackName}'
      RetentionInDays: 30
\`\`\`

Security features include:
- Complete public access blocking
- Server-side encryption
- Versioning for data protection
- CloudWatch logging integration`;
    }
  };

  const generateElasticsearchResponse = (userInput: string) => {
    return `Here's an Elasticsearch query for security monitoring:

\`\`\`json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-1h",
              "lte": "now"
            }
          }
        },
        {
          "terms": {
            "event.category": ["network", "authentication", "process"]
          }
        }
      ],
      "should": [
        {
          "match": {
            "event.outcome": "failure"
          }
        },
        {
          "range": {
            "network.bytes": {
              "gte": 1000000
            }
          }
        }
      ]
    }
  },
  "aggs": {
    "event_types": {
      "terms": {
        "field": "event.action",
        "size": 10
      }
    },
    "top_sources": {
      "terms": {
        "field": "source.ip",
        "size": 15
      }
    }
  }
}
\`\`\`

This query provides comprehensive security monitoring by:
- Analyzing recent events (last hour)
- Focusing on security-relevant categories
- Highlighting failures and anomalies
- Aggregating by event types and sources`;
  };

  const generateIncidentResponse = (userInput: string) => {
    return `**Incident Response Framework:**

**🚨 Phase 1: Detection & Analysis (0-30 minutes)**
1. **Initial Triage**
   - Verify the incident is legitimate
   - Determine scope and severity
   - Activate incident response team

2. **Evidence Collection**
   - Preserve system state
   - Collect logs and memory dumps
   - Document all actions taken

**🔍 Phase 2: Containment (30 minutes - 2 hours)**
1. **Short-term Containment**
   - Isolate affected systems
   - Block malicious IPs/domains
   - Disable compromised accounts

2. **Long-term Containment**
   - Apply security patches
   - Implement additional monitoring
   - Prepare for recovery phase

**🔧 Phase 3: Eradication & Recovery (2-24 hours)**
1. **Remove Threats**
   - Delete malware and artifacts
   - Close security vulnerabilities
   - Update security controls

2. **System Recovery**
   - Restore from clean backups
   - Rebuild compromised systems
   - Validate system integrity

**📋 Phase 4: Post-Incident Activities**
1. **Documentation**
   - Complete incident report
   - Update playbooks
   - Conduct lessons learned session

2. **Monitoring**
   - Enhanced security monitoring
   - Threat hunting activities
   - Follow-up assessments`;
  };

  const generatePowerShellResponse = (userInput: string) => {
    return `Here's a PowerShell script for security monitoring:

\`\`\`powershell
# Security Event Monitoring Script
param(
    [int]$Hours = 24,
    [string]$ComputerName = $env:COMPUTERNAME
)

# Monitor failed login attempts
$FailedLogins = Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    ID = 4625
    StartTime = (Get-Date).AddHours(-$Hours)
} -ComputerName $ComputerName | 
ForEach-Object {
    [PSCustomObject]@{
        TimeCreated = $_.TimeCreated
        SourceIP = ($_.Properties[19].Value)
        Username = ($_.Properties[5].Value)
        WorkstationName = ($_.Properties[13].Value)
    }
} | Group-Object SourceIP | 
Where-Object { $_.Count -gt 5 } |
Sort-Object Count -Descending

# Check for suspicious processes
$SuspiciousProcesses = Get-Process | 
Where-Object {
    $_.ProcessName -match "(powershell|cmd|wscript|cscript)" -and
    $_.CPU -gt 10
} | Select-Object Name, Id, CPU, StartTime

# Output results
Write-Host "=== Failed Login Analysis ===" -ForegroundColor Red
$FailedLogins | Format-Table -AutoSize

Write-Host "=== Suspicious Processes ===" -ForegroundColor Yellow
$SuspiciousProcesses | Format-Table -AutoSize
\`\`\`

This script provides:
- Failed login attempt analysis
- Suspicious process detection
- Customizable time windows
- Remote computer support`;
  };

  const generatePythonResponse = (userInput: string) => {
    return `Here's a Python script for security automation:

\`\`\`python
import requests
import json
import hashlib
from datetime import datetime, timedelta

class SecurityAutomation:
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.session = requests.Session()
    
    def check_ip_reputation(self, ip_address):
        """Check IP reputation using multiple sources"""
        results = {
            'ip': ip_address,
            'reputation': 'unknown',
            'sources': []
        }
        
        # Example: AbuseIPDB API check
        if self.api_key:
            headers = {
                'Key': self.api_key,
                'Accept': 'application/json'
            }
            
            params = {
                'ipAddress': ip_address,
                'maxAgeInDays': 90,
                'verbose': ''
            }
            
            try:
                response = self.session.get(
                    'https://api.abuseipdb.com/api/v2/check',
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results['reputation'] = 'malicious' if data.get('abuseConfidencePercentage', 0) > 50 else 'clean'
                    results['sources'].append('AbuseIPDB')
                    
            except Exception as e:
                print(f"Error checking IP reputation: {e}")
        
        return results
    
    def generate_ioc_hash(self, content):
        """Generate hash for IOC tracking"""
        return hashlib.sha256(content.encode()).hexdigest()
    
    def log_security_event(self, event_type, details):
        """Log security events with timestamp"""
        event = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'details': details,
            'hash': self.generate_ioc_hash(json.dumps(details))
        }
        
        print(f"Security Event: {json.dumps(event, indent=2)}")
        return event

# Usage example
security = SecurityAutomation(api_key="your_api_key_here")
result = security.check_ip_reputation("8.8.8.8")
security.log_security_event("ip_check", result)
\`\`\`

This Python framework provides:
- IP reputation checking
- IOC hash generation
- Security event logging
- Extensible API integration`;
  };

  const generateNetworkSecurityResponse = (userInput: string) => {
    return `Here are network security configurations and commands:

**Firewall Rules (iptables):**
\`\`\`bash
# Block suspicious IP ranges
iptables -A INPUT -s 192.168.100.0/24 -j DROP
iptables -A INPUT -s 10.0.0.0/8 -j DROP

# Rate limiting for SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# Log and drop invalid packets
iptables -A INPUT -m state --state INVALID -j LOG --log-prefix "INVALID-PKT: "
iptables -A INPUT -m state --state INVALID -j DROP
\`\`\`

**Network Monitoring Commands:**
\`\`\`bash
# Monitor active connections
netstat -tuln | grep LISTEN

# Check for unusual network activity
ss -tuln | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr

# Monitor bandwidth usage
iftop -i eth0 -n -N -P

# Capture suspicious traffic
tcpdump -i any -w suspicious_traffic.pcap 'host 192.168.1.100'
\`\`\`

These configurations provide:
- Traffic filtering and rate limiting
- Connection monitoring
- Bandwidth analysis
- Packet capture capabilities`;
  };

  const generateThreatIntelResponse = (userInput: string) => {
    return `**Threat Intelligence Analysis Framework:**

**🎯 IOC Collection & Analysis**
- **File Hashes**: SHA256, MD5, SHA1 for malware identification
- **IP Addresses**: Command & control servers, compromised hosts
- **Domains**: Malicious domains, DGA patterns
- **URLs**: Phishing sites, malware distribution points

**📊 Threat Actor Profiling**
- **TTPs**: Tactics, Techniques, and Procedures mapping
- **Attribution**: APT groups, cybercriminal organizations
- **Motivations**: Financial, espionage, disruption
- **Target Analysis**: Industry, geography, organization size

**🔍 Intelligence Sources**
- **Commercial Feeds**: Paid threat intelligence platforms
- **Open Source**: OSINT, public repositories
- **Internal Telemetry**: Security tools, logs, incidents
- **Sharing Communities**: ISACs, government feeds

**⚡ Actionable Intelligence Process**
1. **Collection**: Gather raw threat data
2. **Processing**: Normalize and enrich data
3. **Analysis**: Identify patterns and trends
4. **Dissemination**: Share with stakeholders
5. **Feedback**: Validate intelligence effectiveness

**🛡️ Defensive Applications**
- **Preventive Controls**: Blocking known bad IOCs
- **Detective Controls**: Hunting for TTPs
- **Response**: Incident attribution and scoping
- **Strategic Planning**: Risk assessment and budgeting`;
  };

  const generateMalwareResponse = (userInput: string) => {
    return `**Malware Analysis & Detection Guide:**

**🔬 Static Analysis Techniques**
- **File Metadata**: Creation dates, compiler information
- **String Analysis**: Embedded URLs, IPs, file paths
- **PE Analysis**: Import tables, sections, resources
- **Hash Analysis**: Known malware family identification

**🏃 Dynamic Analysis Setup**
- **Sandbox Environment**: Isolated VM with monitoring
- **Network Simulation**: Fake DNS, web servers
- **Behavioral Monitoring**: Process, file, registry changes
- **Traffic Analysis**: Network communications, protocols

**🚨 Detection Indicators**
- **File System**: Unusual file locations, extensions
- **Registry**: Persistence mechanisms, configuration
- **Network**: C2 communications, data exfiltration
- **Process**: Code injection, privilege escalation

**🛡️ Mitigation Strategies**
1. **Endpoint Protection**: Next-gen AV, EDR solutions
2. **Network Segmentation**: Limit lateral movement
3. **User Education**: Phishing awareness, safe practices
4. **Backup Strategy**: Regular, tested backups
5. **Incident Response**: Rapid containment procedures

**📋 Analysis Tools**
- **Static**: PEiD, Strings, Hex editors
- **Dynamic**: Process Monitor, Wireshark, sandboxes
- **Reverse Engineering**: IDA Pro, Ghidra, x64dbg
- **Online**: VirusTotal, Hybrid Analysis, Joe Sandbox`;
  };

  const generatePhishingResponse = (userInput: string) => {
    return `**Anti-Phishing Defense Strategy:**

**🎣 Phishing Attack Vectors**
- **Email Phishing**: Fake emails mimicking legitimate sources
- **Spear Phishing**: Targeted attacks on specific individuals
- **Whaling**: Executive-level targeted attacks
- **Smishing**: SMS-based phishing attempts
- **Vishing**: Voice/phone-based social engineering

**🔍 Detection Techniques**
- **Email Analysis**: Header inspection, domain verification
- **URL Analysis**: Suspicious domains, URL shorteners
- **Content Analysis**: Grammar, urgency indicators
- **Sender Verification**: SPF, DKIM, DMARC validation

**🛡️ Technical Controls**
1. **Email Security Gateways**: Advanced threat protection
2. **DNS Filtering**: Block known malicious domains
3. **Web Proxies**: URL reputation checking
4. **Endpoint Protection**: Real-time URL scanning
5. **Browser Security**: Safe browsing extensions

**👥 User Education Program**
- **Awareness Training**: Regular security awareness sessions
- **Phishing Simulations**: Controlled testing exercises
- **Reporting Mechanisms**: Easy-to-use reporting tools
- **Incident Response**: Clear escalation procedures

**📧 Email Security Best Practices**
- Verify sender through independent channels
- Check URLs before clicking (hover inspection)
- Be suspicious of urgent requests
- Never provide credentials via email
- Report suspicious emails immediately`;
  };

  const generateComplianceResponse = (userInput: string) => {
    return `**Cybersecurity Compliance Framework:**

**📋 Major Regulations & Standards**
- **GDPR**: EU data protection regulation
- **CCPA**: California Consumer Privacy Act
- **SOX**: Sarbanes-Oxley financial controls
- **HIPAA**: Healthcare data protection
- **PCI DSS**: Payment card industry standards

**🔒 Technical Requirements**
1. **Data Encryption**: In transit and at rest
2. **Access Controls**: Role-based permissions
3. **Audit Logging**: Comprehensive activity tracking
4. **Vulnerability Management**: Regular assessments
5. **Incident Response**: Documented procedures

**📊 Compliance Monitoring**
- **Continuous Assessment**: Automated compliance checking
- **Risk Assessment**: Regular risk evaluations
- **Gap Analysis**: Identify compliance shortfalls
- **Remediation Tracking**: Fix verification process

**📝 Documentation Requirements**
- **Policies & Procedures**: Written security policies
- **Risk Assessments**: Documented risk analysis
- **Training Records**: Security awareness documentation
- **Incident Reports**: Breach notification records
- **Audit Trails**: System access and change logs

**⚖️ Legal Considerations**
- **Data Breach Notification**: Timing requirements
- **International Transfers**: Cross-border data flow
- **Right to Erasure**: Data deletion capabilities
- **Consent Management**: User permission tracking
- **Third-party Assessments**: Vendor security reviews`;
  };

  const generateVulnerabilityResponse = (userInput: string) => {
    return `**Vulnerability Management Program:**

**🔍 Discovery & Assessment**
- **Network Scanning**: Automated vulnerability scans
- **Application Testing**: SAST, DAST, IAST analysis
- **Configuration Review**: Security baseline checks
- **Penetration Testing**: Manual security testing
- **Threat Modeling**: Design-level security analysis

**📊 Risk Prioritization**
1. **CVSS Scoring**: Common Vulnerability Scoring System
2. **Exploit Availability**: Public exploit code existence
3. **Asset Criticality**: Business importance ranking
4. **Threat Intelligence**: Active exploitation indicators
5. **Compensating Controls**: Existing mitigations

**🔧 Remediation Strategies**
- **Patching**: Operating system and application updates
- **Configuration Changes**: Security setting adjustments
- **Compensating Controls**: Alternative security measures
- **Risk Acceptance**: Documented risk decisions
- **System Retirement**: End-of-life replacements

**📈 Metrics & Reporting**
- **Mean Time to Patch**: Remediation speed tracking
- **Vulnerability Density**: Issues per system/application
- **Risk Exposure**: Business impact measurements
- **Trend Analysis**: Vulnerability pattern identification
- **Compliance Status**: Regulatory requirement adherence

**🛠️ Tools & Technologies**
- **Scanners**: Nessus, OpenVAS, Qualys
- **SIEM Integration**: Vulnerability data correlation
- **Patch Management**: Automated update systems
- **Asset Management**: Inventory and tracking
- **Workflow Tools**: Ticketing and remediation tracking`;
  };

  const generateGreetingResponse = () => {
    return `Hello! I'm your AI Security Assistant, ready to help with all your cybersecurity needs! 🔐

I can assist you with:

**🔍 SIEM & Log Analysis**
- Splunk queries for threat hunting
- Elasticsearch security searches
- Microsoft Sentinel KQL queries
- Log correlation and analysis

**☁️ Cloud Security**
- AWS CloudFormation templates
- Azure ARM templates
- Security group configurations
- IAM policy creation

**🚨 Incident Response**
- Response playbooks and procedures
- Forensics and investigation guidance
- Threat hunting methodologies
- Recovery and remediation steps

**🛡️ Security Operations**
- Vulnerability management
- Threat intelligence analysis
- Compliance frameworks
- Security automation scripts

**💻 Security Scripting**
- PowerShell security scripts
- Python automation tools
- Bash security commands
- Network security configurations

Just ask me anything! For example:
- "Create a Splunk query for detecting lateral movement"
- "Generate a secure AWS S3 bucket template"
- "Help me respond to a phishing incident"
- "Write a PowerShell script to check for suspicious processes"

What would you like help with today?`;
  };

  const generateGenericSecurityResponse = (userInput: string) => {
    const responses = [
      `I understand you're asking about "${userInput}". Let me provide some relevant security guidance:

**General Security Best Practices:**
- **Defense in Depth**: Multiple layers of security controls
- **Principle of Least Privilege**: Minimal necessary access
- **Zero Trust Architecture**: Never trust, always verify
- **Regular Updates**: Keep systems and software current
- **Security Monitoring**: Continuous threat detection

**Key Security Areas to Consider:**
1. **Identity & Access Management**: Strong authentication, authorization
2. **Network Security**: Firewalls, segmentation, monitoring
3. **Endpoint Protection**: Antivirus, EDR, device management
4. **Data Protection**: Encryption, backup, classification
5. **Incident Response**: Preparation, detection, response, recovery

Could you provide more specific details about what you'd like help with? I can generate:
- Specific security configurations
- Custom scripts and queries
- Incident response procedures
- Compliance guidance
- Threat analysis`,

      `Based on your query about "${userInput}", here are some security considerations:

**Security Assessment Questions:**
- What assets need protection?
- What are the potential threats?
- What security controls are in place?
- How is security effectiveness measured?
- What compliance requirements apply?

**Common Security Solutions:**
- **Preventive**: Firewalls, access controls, encryption
- **Detective**: SIEM, IDS/IPS, vulnerability scanners
- **Corrective**: Incident response, backup/recovery
- **Administrative**: Policies, training, awareness

I can help you dive deeper into any of these areas. Would you like me to:
- Generate specific security configurations?
- Create custom scripts or queries?
- Provide incident response guidance?
- Explain compliance requirements?`,

      `Great question about "${userInput}"! Let me share some relevant security insights:

**Security Framework Approach:**
1. **Identify**: Asset inventory and risk assessment
2. **Protect**: Implement security controls and policies
3. **Detect**: Continuous monitoring and threat detection
4. **Respond**: Incident response and containment
5. **Recover**: Business continuity and lessons learned

**Technology Stack Considerations:**
- **SIEM/SOAR**: Centralized security monitoring
- **Cloud Security**: Secure configuration and monitoring
- **Endpoint Security**: Comprehensive endpoint protection
- **Network Security**: Perimeter and internal controls
- **Identity Security**: Authentication and access management

For more specific help, I can provide:
- Custom security scripts and configurations
- SIEM queries for threat detection
- Cloud security templates
- Incident response playbooks
- Compliance assessment guidance

What specific aspect would you like me to focus on?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

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
    const userInput = input;
    setCurrentInput(userInput);
    setInput('');
    setLoading(true);

    try {
      let assistantContent = '';
      let hasCode = false;
      
      // Check if this is a quick example
      if (isQuickExample(userInput)) {
        // Use stored responses for quick examples
        setTimeout(() => {
          const lowerInput = userInput.toLowerCase();
          
          if (lowerInput.includes('splunk') || lowerInput.includes('failed login')) {
            assistantContent = generateSplunkResponse(lowerInput);
            hasCode = true;
          } else if (lowerInput.includes('phishing') || lowerInput.includes('incident')) {
            assistantContent = generateIncidentResponse(lowerInput);
            hasCode = false;
          } else if (lowerInput.includes('powershell') || lowerInput.includes('monitoring')) {
            assistantContent = generatePowerShellResponse(lowerInput);
            hasCode = true;
          } else if (lowerInput.includes('vulnerability') || lowerInput.includes('management')) {
            assistantContent = generateVulnerabilityResponse(lowerInput);
            hasCode = false;
          } else if (lowerInput.includes('network') || lowerInput.includes('security')) {
            assistantContent = generateNetworkSecurityResponse(lowerInput);
            hasCode = true;
          } else if (lowerInput.includes('python') || lowerInput.includes('threat intelligence')) {
            assistantContent = generatePythonResponse(lowerInput);
            hasCode = true;
          } else if (lowerInput.includes('response') || lowerInput.includes('procedures')) {
            assistantContent = generateIncidentResponse(lowerInput);
            hasCode = false;
          } else if (lowerInput.includes('cloudformation') || lowerInput.includes('aws')) {
            assistantContent = generateCloudFormationResponse(lowerInput);
            hasCode = true;
          } else {
            assistantContent = generateGreetingResponse();
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
        }, 800);
      } else {
        // Use ChatGPT API for custom queries
        assistantContent = await callChatGPT(userInput);
        hasCode = assistantContent.includes('```');

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          hasCode
        };

        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    }
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
    <div className="space-y-6 h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="bg-gradient-to-r from-primary/20 to-blue-600/20 p-3 rounded-lg">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">AI Security Assistant</h1>
          <p className="text-muted-foreground">
            Generate SIEM queries, security configurations, and incident response guidance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Sample Queries */}
        <Card className="cyber-card lg:col-span-1 h-full overflow-hidden flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Quick Examples
            </CardTitle>
            <CardDescription className="text-xs">
              Click any example for instant responses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-6 pt-0">
            <div className="space-y-3 overflow-y-auto h-full">
              {sampleQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left h-auto p-4 text-sm hover:bg-primary/10 whitespace-normal leading-relaxed border-gray-600 hover:border-primary/50 transition-all duration-200 group"
                  onClick={() => setInput(query)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Zap className="h-4 w-4 text-yellow-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="break-words text-left flex-1 font-normal">{query}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="cyber-card lg:col-span-3 h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              Security AI Chat
              {apiError && (
                <Badge variant="destructive" className="text-xs">
                  API Offline
                </Badge>
              )}
              {!apiError && (
                <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-400">
                  ChatGPT Powered
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Ask questions about SIEM queries, security configurations, and incident response
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-md mb-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-lg shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30'
                        : 'bg-gradient-to-r from-card to-card/80 border border-primary/20 shadow-md'
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
                  <div className="bg-gradient-to-r from-card to-card/80 border border-primary/20 p-4 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-400 animate-pulse" />
                      <div className="text-sm font-medium">
                        {isQuickExample(currentInput) ? 'Processing example...' : 'Thinking with ChatGPT...'}
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="flex gap-3 items-end flex-shrink-0">
              <Textarea
                className="cyber-input flex-1 min-h-[60px] max-h-[120px] resize-none border-2 border-primary/20 focus:border-primary/50 transition-colors"
                placeholder="Ask about SIEM queries, security configurations, incident response, or anything cybersecurity related..."
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
                className="cyber-button px-6 py-3 self-end bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200 shadow-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
