DROP POLICY IF EXISTS "Authenticated users can only subscribe to their own channels" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can only broadcast on their own channels" ON realtime.messages;
ALTER TABLE realtime.messages DISABLE ROW LEVEL SECURITY;