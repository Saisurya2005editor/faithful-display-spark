-- Analytics events: validated open insert
DROP POLICY IF EXISTS "Anyone can log a question event" ON public.analytics_events;
CREATE POLICY "Anyone can log a question event"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(question) BETWEEN 1 AND 1000
  AND lang IN ('en', 'hi', 'te')
  AND (confidence IS NULL OR confidence IN ('High', 'Medium', 'Low'))
  AND (retrieved_count IS NULL OR retrieved_count BETWEEN 0 AND 1000)
  AND (top_standard IS NULL OR char_length(top_standard) <= 100)
);

-- Feedback: rating bounds + message ownership validation
DROP POLICY IF EXISTS "Anyone can leave feedback" ON public.feedback;
CREATE POLICY "Anyone can leave feedback"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  rating BETWEEN -1 AND 5
  AND (comment IS NULL OR char_length(comment) <= 6000)
  AND (
    message_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE m.id = message_id AND c.user_id = auth.uid()
    )
  )
);