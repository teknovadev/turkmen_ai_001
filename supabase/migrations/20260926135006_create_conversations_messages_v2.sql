/*
# Türkmen AI — conversations & messages (single-tenant, no auth)

1. Purpose
   Stores chat conversations and individual messages for the Türkmen AI app.
   The app has no sign-in screen (single-tenant). Data is logically partitioned by
   a per-device `device_id` (client-generated UUID in localStorage); the client
   filters queries by device_id. RLS is enabled with open policies (TO anon,
   authenticated) because there is no auth — true per-user isolation will be
   added when authentication is introduced.

2. New Tables
   - `conversations`
     - id, device_id, title, mode, created_at, updated_at
   - `messages`
     - id, conversation_id (FK CASCADE), role, content, mode, created_at

3. Indexes
   - idx_conversations_device on conversations(device_id)
   - idx_messages_conversation on messages(conversation_id, created_at)

4. Security
   - RLS enabled on both tables.
   - Open CRUD policies (TO anon, authenticated, USING true) — intentionally
     shared data for a no-auth single-tenant app. device_id filtering is done
     client-side. When auth is added later, these policies will be replaced
     with ownership-scoped predicates.
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  title text,
  mode text NOT NULL DEFAULT 'genel',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  mode text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_device ON conversations(device_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_conversations" ON conversations;
CREATE POLICY "select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_conversations" ON conversations;
CREATE POLICY "insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_conversations" ON conversations;
CREATE POLICY "update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_conversations" ON conversations;
CREATE POLICY "delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_messages" ON messages;
CREATE POLICY "select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_messages" ON messages;
CREATE POLICY "update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_messages" ON messages;
CREATE POLICY "delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);
