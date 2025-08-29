-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  allow_multiple_votes BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  voter_ip INET,
  voter_fingerprint TEXT, -- For anonymous voting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate votes per user per poll (not per option)
  UNIQUE(poll_id, voter_id),
  -- Prevent duplicate votes per IP per poll (for anonymous voting)
  UNIQUE(poll_id, voter_ip),
  -- Prevent duplicate votes per fingerprint per poll (for anonymous voting)
  UNIQUE(poll_id, voter_fingerprint)
);

-- Create QR codes table
CREATE TABLE public.qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_polls_created_by ON public.polls(created_by);
CREATE INDEX idx_polls_public ON public.polls(is_public) WHERE is_public = true;
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_votes_option_id ON public.votes(option_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX idx_qr_codes_poll_id ON public.qr_codes(poll_id);
CREATE INDEX idx_qr_codes_code ON public.qr_codes(code);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for polls
CREATE POLICY "Anyone can view public polls" ON public.polls
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own polls" ON public.polls
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own polls" ON public.polls
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" ON public.polls
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for poll_options
CREATE POLICY "Anyone can view poll options for public polls" ON public.poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view options for their own polls" ON public.poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create options for their own polls" ON public.poll_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update options for their own polls" ON public.poll_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes for public polls" ON public.votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = votes.poll_id 
      AND polls.is_public = true
    )
  );

CREATE POLICY "Anyone can vote on public polls" ON public.votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = votes.poll_id 
      AND polls.is_public = true
    )
  );

-- RLS Policies for qr_codes
CREATE POLICY "Anyone can view active QR codes" ON public.qr_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create QR codes for their own polls" ON public.qr_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = qr_codes.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get poll with vote counts
CREATE OR REPLACE FUNCTION get_poll_with_votes(poll_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  created_by UUID,
  is_public BOOLEAN,
  allow_multiple_votes BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_votes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.created_by,
    p.is_public,
    p.allow_multiple_votes,
    p.expires_at,
    p.created_at,
    p.updated_at,
    COALESCE(vote_counts.total, 0) as total_votes
  FROM public.polls p
  LEFT JOIN (
    SELECT poll_id, COUNT(*) as total
    FROM public.votes
    WHERE poll_id = $1
    GROUP BY poll_id
  ) vote_counts ON p.id = vote_counts.poll_id
  WHERE p.id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has voted on a poll
CREATE OR REPLACE FUNCTION has_user_voted(poll_id UUID, user_id UUID DEFAULT NULL, user_ip INET DEFAULT NULL, user_fingerprint TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.votes 
    WHERE votes.poll_id = $1 
    AND (
      (user_id IS NOT NULL AND votes.voter_id = user_id) OR
      (user_ip IS NOT NULL AND votes.voter_ip = user_ip) OR
      (user_fingerprint IS NOT NULL AND votes.voter_fingerprint = user_fingerprint)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's vote for a poll
CREATE OR REPLACE FUNCTION get_user_vote(poll_id UUID, user_id UUID DEFAULT NULL, user_ip INET DEFAULT NULL, user_fingerprint TEXT DEFAULT NULL)
RETURNS TABLE (
  option_id UUID,
  option_label TEXT,
  voted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.option_id,
    po.label as option_label,
    v.created_at as voted_at
  FROM public.votes v
  JOIN public.poll_options po ON v.option_id = po.id
  WHERE v.poll_id = $1 
  AND (
    (user_id IS NOT NULL AND v.voter_id = user_id) OR
    (user_ip IS NOT NULL AND v.voter_ip = user_ip) OR
    (user_fingerprint IS NOT NULL AND v.voter_fingerprint = user_fingerprint)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
