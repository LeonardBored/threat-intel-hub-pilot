
-- Create profiles table for user data with your specifications
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL CHECK(char_length(email) <= 100),
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id column to existing tables and set up RLS
ALTER TABLE public.iocs ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.scan_history ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.security_incidents ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.watchlists ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on management tables
ALTER TABLE public.iocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for IOCs
CREATE POLICY "Users can view own IOCs" ON public.iocs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own IOCs" ON public.iocs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own IOCs" ON public.iocs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own IOCs" ON public.iocs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scan history
CREATE POLICY "Users can view own scan history" ON public.scan_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history" ON public.scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan history" ON public.scan_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan history" ON public.scan_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for security incidents
CREATE POLICY "Users can view own incidents" ON public.security_incidents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incidents" ON public.security_incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents" ON public.security_incidents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incidents" ON public.security_incidents
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for watchlists
CREATE POLICY "Users can view own watchlists" ON public.watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists" ON public.watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists" ON public.watchlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON public.watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create rate limiting table
CREATE TABLE public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for rate limits (users can only see their own)
CREATE POLICY "Users can view own rate limits" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_limit integer DEFAULT 10,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean AS $$
DECLARE
  current_window timestamp with time zone;
  current_count integer;
BEGIN
  -- Calculate current window start (rounded down to the hour)
  current_window := date_trunc('hour', now());
  
  -- Get current request count for this user/endpoint/window
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = p_user_id 
    AND endpoint = p_endpoint 
    AND window_start = current_window;
  
  -- If no record exists or count is under limit, allow request
  IF current_count IS NULL OR current_count < p_limit THEN
    -- Insert or update the rate limit record
    INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, current_window)
    ON CONFLICT (user_id, endpoint, window_start)
    DO UPDATE SET 
      request_count = public.rate_limits.request_count + 1,
      created_at = now();
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint, window_start);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_iocs_user_id ON public.iocs(user_id);
CREATE INDEX idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX idx_security_incidents_user_id ON public.security_incidents(user_id);
CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
