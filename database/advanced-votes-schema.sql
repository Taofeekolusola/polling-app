-- Advanced votes table supporting multiple votes per user
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  
  -- Voter identification
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  voter_ip INET,
  voter_fingerprint TEXT,
  
  -- Vote details
  vote_count INTEGER DEFAULT 1, -- For multiple votes on same option
  vote_rank INTEGER, -- For ranked voting (1st choice, 2nd choice, etc.)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(poll_id, voter_id, option_id), -- One vote per option per user
  UNIQUE(poll_id, voter_ip, option_id) WHERE voter_ip IS NOT NULL,
  UNIQUE(poll_id, voter_fingerprint, option_id) WHERE voter_fingerprint IS NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_votes_option_id ON public.votes(option_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX idx_votes_poll_voter_option ON public.votes(poll_id, voter_id, option_id);

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

-- Function to get vote counts with multiple vote support
CREATE OR REPLACE FUNCTION get_vote_counts_with_weights(poll_id UUID)
RETURNS TABLE (
  option_id UUID,
  option_label TEXT,
  total_votes BIGINT,
  unique_voters BIGINT,
  weighted_total DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    po.id as option_id,
    po.label as option_label,
    COALESCE(SUM(v.vote_count), 0) as total_votes,
    COUNT(DISTINCT v.voter_id) as unique_voters,
    COALESCE(SUM(v.vote_count), 0) as weighted_total
  FROM public.poll_options po
  LEFT JOIN public.votes v ON po.id = v.option_id AND v.poll_id = $1
  WHERE po.poll_id = $1
  GROUP BY po.id, po.label
  ORDER BY total_votes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check vote limits
CREATE OR REPLACE FUNCTION check_vote_limits(
  poll_id UUID,
  user_id UUID DEFAULT NULL,
  user_ip INET DEFAULT NULL,
  user_fingerprint TEXT DEFAULT NULL
)
RETURNS TABLE (
  can_vote BOOLEAN,
  reason TEXT,
  current_votes INTEGER,
  max_votes INTEGER
) AS $$
DECLARE
  poll_record RECORD;
  current_vote_count INTEGER;
  max_votes_per_user INTEGER := 1; -- Default limit
BEGIN
  -- Get poll details
  SELECT * INTO poll_record FROM public.polls WHERE id = $1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Poll not found'::TEXT, 0, 0;
    RETURN;
  END IF;
  
  -- Check if poll is expired
  IF poll_record.expires_at IS NOT NULL AND poll_record.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, 'Poll has expired'::TEXT, 0, 0;
    RETURN;
  END IF;
  
  -- Get current vote count for this user
  SELECT COUNT(*) INTO current_vote_count
  FROM public.votes 
  WHERE poll_id = $1 
  AND (
    (user_id IS NOT NULL AND voter_id = user_id) OR
    (user_ip IS NOT NULL AND voter_ip = user_ip) OR
    (user_fingerprint IS NOT NULL AND voter_fingerprint = user_fingerprint)
  );
  
  -- Set max votes based on poll settings
  IF poll_record.allow_multiple_votes THEN
    max_votes_per_user := 10; -- Allow up to 10 votes for multiple vote polls
  END IF;
  
  -- Check if user can vote more
  IF current_vote_count >= max_votes_per_user THEN
    RETURN QUERY SELECT FALSE, 'Vote limit reached'::TEXT, current_vote_count, max_votes_per_user;
  ELSE
    RETURN QUERY SELECT TRUE, 'Can vote'::TEXT, current_vote_count, max_votes_per_user;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

