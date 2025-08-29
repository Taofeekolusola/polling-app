-- Enhanced votes table with additional metadata
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  
  -- Voter identification (multiple options for flexibility)
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  voter_ip INET,
  voter_fingerprint TEXT,
  session_id TEXT, -- For tracking session-based voting
  
  -- Vote metadata
  vote_weight DECIMAL(5,2) DEFAULT 1.00, -- For weighted voting
  vote_reason TEXT, -- Optional reason for vote
  vote_confidence INTEGER CHECK (vote_confidence >= 1 AND vote_confidence <= 5), -- 1-5 scale
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Audit fields
  created_by_ip INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Constraints
  UNIQUE(poll_id, voter_id) WHERE voter_id IS NOT NULL,
  UNIQUE(poll_id, voter_ip) WHERE voter_ip IS NOT NULL,
  UNIQUE(poll_id, voter_fingerprint) WHERE voter_fingerprint IS NOT NULL,
  UNIQUE(poll_id, session_id) WHERE session_id IS NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_votes_option_id ON public.votes(option_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX idx_votes_created_at ON public.votes(created_at);
CREATE INDEX idx_votes_poll_voter ON public.votes(poll_id, voter_id) WHERE voter_id IS NOT NULL;
CREATE INDEX idx_votes_poll_ip ON public.votes(poll_id, voter_ip) WHERE voter_ip IS NOT NULL;

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

-- Function to get vote statistics
CREATE OR REPLACE FUNCTION get_vote_statistics(poll_id UUID)
RETURNS TABLE (
  option_id UUID,
  option_label TEXT,
  vote_count BIGINT,
  vote_percentage DECIMAL(5,2),
  total_votes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    po.id as option_id,
    po.label as option_label,
    COUNT(v.id) as vote_count,
    ROUND(
      (COUNT(v.id)::DECIMAL / (SELECT COUNT(*) FROM public.votes WHERE poll_id = $1)) * 100, 
      2
    ) as vote_percentage,
    (SELECT COUNT(*) FROM public.votes WHERE poll_id = $1) as total_votes
  FROM public.poll_options po
  LEFT JOIN public.votes v ON po.id = v.option_id AND v.poll_id = $1
  WHERE po.poll_id = $1
  GROUP BY po.id, po.label
  ORDER BY vote_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can vote (respects poll settings)
CREATE OR REPLACE FUNCTION can_user_vote(
  poll_id UUID, 
  user_id UUID DEFAULT NULL, 
  user_ip INET DEFAULT NULL, 
  user_fingerprint TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  poll_record RECORD;
  existing_vote_count INTEGER;
BEGIN
  -- Get poll details
  SELECT * INTO poll_record FROM public.polls WHERE id = $1;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if poll is expired
  IF poll_record.expires_at IS NOT NULL AND poll_record.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has already voted
  SELECT COUNT(*) INTO existing_vote_count
  FROM public.votes 
  WHERE poll_id = $1 
  AND (
    (user_id IS NOT NULL AND voter_id = user_id) OR
    (user_ip IS NOT NULL AND voter_ip = user_ip) OR
    (user_fingerprint IS NOT NULL AND voter_fingerprint = user_fingerprint)
  );
  
  -- If multiple votes are not allowed and user has already voted
  IF NOT poll_record.allow_multiple_votes AND existing_vote_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  -- If multiple votes are allowed, check for reasonable limits
  IF poll_record.allow_multiple_votes AND existing_vote_count >= 10 THEN
    RETURN FALSE; -- Limit to 10 votes per user for multiple vote polls
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

