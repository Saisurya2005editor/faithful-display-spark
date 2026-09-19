-- 1. Controlled analytics logging function (validation + burst guard)
CREATE OR REPLACE FUNCTION public.log_analytics_event(
  _question text,
  _lang text,
  _confidence text DEFAULT NULL,
  _retrieved_count integer DEFAULT 0,
  _top_standard text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _question IS NULL OR char_length(_question) < 1 OR char_length(_question) > 1000 THEN
    RAISE EXCEPTION 'invalid question';
  END IF;
  IF _lang NOT IN ('en', 'hi', 'te') THEN
    RAISE EXCEPTION 'invalid language';
  END IF;
  IF _confidence IS NOT NULL AND _confidence NOT IN ('High', 'Medium', 'Low') THEN
    RAISE EXCEPTION 'invalid confidence';
  END IF;
  IF _retrieved_count IS NULL OR _retrieved_count < 0 OR _retrieved_count > 1000 THEN
    RAISE EXCEPTION 'invalid retrieved_count';
  END IF;
  IF _top_standard IS NOT NULL AND char_length(_top_standard) > 100 THEN
    RAISE EXCEPTION 'invalid top_standard';
  END IF;
  IF (SELECT count(*) FROM public.analytics_events WHERE created_at > now() - interval '1 minute') >= 300 THEN
    RAISE EXCEPTION 'rate limit exceeded';
  END IF;
  INSERT INTO public.analytics_events (question, lang, confidence, retrieved_count, top_standard)
  VALUES (_question, _lang, _confidence, _retrieved_count, _top_standard);
END;
$$;

-- 2. Controlled feedback submission function (validation + ownership + burst guard)
CREATE OR REPLACE FUNCTION public.submit_feedback(
  _rating integer,
  _comment text DEFAULT NULL,
  _message_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _rating IS NULL OR _rating NOT BETWEEN -1 AND 5 THEN
    RAISE EXCEPTION 'invalid rating';
  END IF;
  IF _comment IS NOT NULL AND char_length(_comment) > 6000 THEN
    RAISE EXCEPTION 'comment too long';
  END IF;
  -- A linked message must exist and belong to the caller's own conversation.
  IF _message_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE m.id = _message_id
      AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'invalid message reference';
  END IF;
  IF (SELECT count(*) FROM public.feedback WHERE created_at > now() - interval '1 minute') >= 60 THEN
    RAISE EXCEPTION 'rate limit exceeded';
  END IF;
  INSERT INTO public.feedback (rating, comment, message_id)
  VALUES (_rating, _comment, _message_id);
END;
$$;

-- 3. Remove direct public insert access; writes now only flow through the functions
DROP POLICY IF EXISTS "Anyone can log a question event" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can leave feedback" ON public.feedback;
REVOKE INSERT ON public.analytics_events FROM anon, authenticated;
REVOKE INSERT ON public.feedback FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.log_analytics_event(text, text, text, integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_feedback(integer, text, uuid) TO anon, authenticated;