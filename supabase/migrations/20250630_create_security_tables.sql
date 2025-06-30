
-- Create IOCs table for threat intelligence indicators
CREATE TABLE IF NOT EXISTS iocs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    indicator TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ip', 'domain', 'url', 'hash', 'email')),
    threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    source TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scan_history table for tracking all security scans
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('virustotal', 'urlscan', 'hybrid_analysis', 'manual')),
    target TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('url', 'ip', 'domain', 'hash', 'file')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'timeout')),
    result JSONB,
    verdict TEXT CHECK (verdict IN ('clean', 'suspicious', 'malicious', 'unknown')),
    threat_score INTEGER CHECK (threat_score >= 0 AND threat_score <= 100),
    scan_duration INTEGER, -- in seconds
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create watchlists table for monitoring specific indicators
CREATE TABLE IF NOT EXISTS watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('ip', 'domain', 'url', 'hash', 'keyword')),
    indicators TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    alert_threshold TEXT DEFAULT 'medium' CHECK (alert_threshold IN ('low', 'medium', 'high', 'critical')),
    notification_settings JSONB DEFAULT '{"email": false, "slack": false, "webhook": false}',
    last_match TIMESTAMP WITH TIME ZONE,
    match_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security_incidents table for incident management
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    category TEXT CHECK (category IN ('malware', 'phishing', 'data_breach', 'unauthorized_access', 'ddos', 'insider_threat', 'other')),
    assignee TEXT,
    reporter TEXT,
    affected_systems TEXT[],
    iocs_related UUID[] REFERENCES iocs(id),
    timeline JSONB DEFAULT '[]',
    resolution_notes TEXT,
    lessons_learned TEXT,
    tags TEXT[],
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    estimated_impact TEXT CHECK (estimated_impact IN ('low', 'medium', 'high', 'critical')),
    actual_impact TEXT CHECK (actual_impact IN ('low', 'medium', 'high', 'critical')),
    incident_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_iocs_type ON iocs(type);
CREATE INDEX IF NOT EXISTS idx_iocs_threat_level ON iocs(threat_level);
CREATE INDEX IF NOT EXISTS idx_iocs_created_at ON iocs(created_at);
CREATE INDEX IF NOT EXISTS idx_scan_history_scan_type ON scan_history(scan_type);
CREATE INDEX IF NOT EXISTS idx_scan_history_status ON scan_history(status);
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON scan_history(created_at);
CREATE INDEX IF NOT EXISTS idx_watchlists_type ON watchlists(type);
CREATE INDEX IF NOT EXISTS idx_watchlists_is_active ON watchlists(is_active);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_created_at ON security_incidents(created_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_iocs_updated_at BEFORE UPDATE ON iocs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scan_history_updated_at BEFORE UPDATE ON scan_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE iocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all for now, can be restricted later)
CREATE POLICY "Allow all operations on iocs" ON iocs FOR ALL USING (true);
CREATE POLICY "Allow all operations on scan_history" ON scan_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on watchlists" ON watchlists FOR ALL USING (true);
CREATE POLICY "Allow all operations on security_incidents" ON security_incidents FOR ALL USING (true);
