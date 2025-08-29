-- Simple votes table (current implementation)
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  voter_ip INET,
  voter_fingerprint TEXT, -- For anonymous voting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate votes per user per poll
  UNIQUE(poll_id, voter_id),
  -- Prevent duplicate votes per IP per poll (for anonymous voting)
  UNIQUE(poll_id, voter_ip),
  -- Prevent duplicate votes per fingerprint per poll (for anonymous voting)
  UNIQUE(poll_id, voter_fingerprint)
);

-- Basic indexes
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_votes_option_id ON public.votes(option_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

