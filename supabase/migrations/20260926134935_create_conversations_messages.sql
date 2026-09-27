/*
# Türkmen AI — conversations & messages (single-tenant, no auth)

1. Purpose
   Stores chat conversations and individual messages for the Türkmen AI app.
   The app has no sign-in screen, so data is scoped by a per-device `device_id`
   (a client-generated UUID stored in localStorage). Each device only sees its
   own conversations.

2. New Tables
   - `conversations`
     - `id` (uuid PK)
     - `device_id` (text, not null) — per-device identifier from the client
     - `title` (text) — short label shown in the history drawer
     - `mode` (text, not null) — AI mode key: 'genel' | 'kod' | 'web' | 'icerik' | 'fikir'
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())
   - `messages`
     - `id` (uuid PK)
     - `conversation_id` (uuid FK → conversations.id, ON DELETE CASCADE)
     - `role` (text, not null) — 'user' | 'assistant'
     - `content` (text, not null) — message text
     - `mode` (text) — AI mode active when the message was sent
     - `created_at` (timestamptz, default now())

3. Indexes
   - `idx_conversations_device` on conversations(device_id)
   - `idx_messages_conversation` on messages(conversation_id, created_at)

4. Security
   - RLS enabled on both tables.
   - Policies allow anon + authenticated to read/write only rows matching their
     own `device_id` (conversations) or parent conversation's device_id (messages).
   - `USING (true)` is NOT used — real device-scoped predicates are applied.
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

-- conversations: device-scoped CRUD
DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (device_id = current_setting('request.header.x_device_id', true));

DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (device_id = current_setting('request.header.x_device_id', true));

DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (device_id = current_setting('request.header.x_device_id', true))
  WITH CHECK (device_id = current_setting('request.header.x_device_id', true));

DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (device_id = current_setting('request.header.x_device_id', true));

-- messages: scoped through parent conversation's device_id
DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
              AND c.device_id = current_setting('request.header.x_device_id', true))
  );

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
              AND c.device_id = current_setting('request.header.x_device_id', true))
  );

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
              AND c.device_id = current_setting('request.header.x_device_id', true))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
              AND c.device_id = current_setting('request.header.x_device_id', true))
  );

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
              AND c.device_id = current_setting('request.header.x_device_id', true))
  );
