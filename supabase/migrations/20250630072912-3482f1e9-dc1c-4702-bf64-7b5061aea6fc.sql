CREATE TABLE public.iocs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  indicator text NOT NULL CHECK (char_length(indicator) <= 100),
  type text NOT NULL CHECK (type = ANY (ARRAY['ip'::text, 'domain'::text, 'url'::text, 'hash'::text, 'email'::text])),
  threat_level text NOT NULL CHECK (threat_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  description text CHECK (char_length(description) <= 5000),
  source text CHECK (char_length(source) <= 100),
  tags text[] CHECK (array_length(tags, 1) <= 50),
  is_active boolean DEFAULT true,
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  first_seen timestamp with time zone DEFAULT now(),
  last_seen timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT iocs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.scan_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  scan_type text NOT NULL CHECK (scan_type = ANY (ARRAY['virustotal'::text, 'urlscan'::text, 'hybrid_analysis'::text, 'manual'::text])),
  target text NOT NULL CHECK (char_length(target) <= 200),
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['url'::text, 'ip'::text, 'domain'::text, 'hash'::text, 'file'::text])),
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'timeout'::text])),
  result jsonb,
  verdict text CHECK (verdict = ANY (ARRAY['clean'::text, 'suspicious'::text, 'malicious'::text, 'unknown'::text])),
  threat_score integer CHECK (threat_score >= 0 AND threat_score <= 100),
  scan_duration integer,
  error_message text CHECK (char_length(error_message) <= 2000),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT scan_history_pkey PRIMARY KEY (id)
);

CREATE TABLE public.security_incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) <= 200),
  description text CHECK (char_length(description) <= 500),
  severity text NOT NULL CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  status text NOT NULL CHECK (status = ANY (ARRAY['open'::text, 'investigating'::text, 'resolved'::text, 'closed'::text])),
  category text CHECK (category = ANY (ARRAY['malware'::text, 'phishing'::text, 'data_breach'::text, 'unauthorized_access'::text, 'ddos'::text, 'insider_threat'::text, 'other'::text])),
  assignee text CHECK (char_length(assignee) <= 100),
  reporter text CHECK (char_length(reporter) <= 100),
  affected_systems text[] CHECK (array_length(affected_systems, 1) <= 100),
  iocs_related text[] CHECK (array_length(iocs_related, 1) <= 200),
  timeline jsonb DEFAULT '[]'::jsonb,
  resolution_notes text CHECK (char_length(resolution_notes) <= 500),
  lessons_learned text CHECK (char_length(lessons_learned) <= 500),
  tags text[] CHECK (array_length(tags, 1) <= 50),
  priority integer DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  estimated_impact text CHECK (estimated_impact = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  actual_impact text CHECK (actual_impact = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  incident_date timestamp with time zone DEFAULT now(),
  resolved_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT security_incidents_pkey PRIMARY KEY (id)
);

CREATE TABLE public.watchlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) <= 100),
  description text CHECK (char_length(description) <= 500),
  type text NOT NULL CHECK (type = ANY (ARRAY['ip'::text, 'domain'::text, 'url'::text, 'hash'::text, 'keyword'::text])),
  indicators text[] NOT NULL CHECK (array_length(indicators, 1) <= 500),
  is_active boolean DEFAULT true,
  alert_threshold text DEFAULT 'medium'::text CHECK (alert_threshold = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  notification_settings jsonb DEFAULT '{"email": false, "slack": false, "webhook": false}'::jsonb,
  last_match timestamp with time zone,
  match_count integer DEFAULT 0,
  created_by text CHECK (char_length(created_by) <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT watchlists_pkey PRIMARY KEY (id)
);