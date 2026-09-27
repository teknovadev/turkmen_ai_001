import { supabase } from './supabase';
import type { AiMode, AppLanguage, Message } from '@/types';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface AiResponse {
  configured: boolean;
  reply?: string;
  error?: string;
}

export async function sendChat(
  messages: { role: string; content: string }[],
  mode: AiMode,
  language: AppLanguage,
  signal?: AbortSignal
): Promise<AiResponse> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ messages, mode, language }),
    signal,
  });

  if (!response.ok) {
    let errorMsg = `Sunucu hatası (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.error) errorMsg = errBody.error;
    } catch {
      // ignore parse error
    }
    return { configured: false, error: errorMsg };
  }

  const data = await response.json();
  return data as AiResponse;
}

export async function checkAiConfigured(): Promise<boolean> {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
        mode: 'genel',
        language: 'tr',
      }),
    });
    if (response.status === 503) return false;
    if (!response.ok) return false;
    const data = await response.json();
    return data?.configured === true;
  } catch {
    return false;
  }
}

export async function loadMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  mode: AiMode
): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    role,
    content,
    mode,
  });
  if (error) throw error;
}

export async function deleteMessagesByConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);
  if (error) throw error;
}
