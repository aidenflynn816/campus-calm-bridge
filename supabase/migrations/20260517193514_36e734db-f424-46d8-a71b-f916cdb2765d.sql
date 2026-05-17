-- Restrict Realtime channel subscriptions to topics that include the user's own id.
-- Channels in this app are named like "messages-{userA}-{userB}" and "typing-{userA}-{userB}".
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can only subscribe to their own channels" ON realtime.messages;
CREATE POLICY "Authenticated users can only subscribe to their own channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);

DROP POLICY IF EXISTS "Authenticated users can only broadcast on their own channels" ON realtime.messages;
CREATE POLICY "Authenticated users can only broadcast on their own channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);