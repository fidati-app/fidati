import { safeSelect } from '@/lib/safeSupabase';
import { supabase } from '@/lib/supabase';
import type { ConversationRow, MessageRow } from '@/types';

export async function fetchConversations(search = ''): Promise<ConversationRow[]> {
  const rows = await safeSelect<ConversationRow>(
    'conversations',
    'id, last_message, last_message_at, unread_customer, unread_professional, customers(name, email), professionals(name, category_label)',
    { limit: 100, order: { column: 'last_message_at', ascending: false } },
  );
  if (!search.trim()) return rows;
  const q = search.toLowerCase();
  return rows.filter((row) => {
    const c = row.customers;
    const p = row.professionals;
    return (
      c?.name?.toLowerCase().includes(q) ||
      c?.email?.toLowerCase().includes(q) ||
      p?.name?.toLowerCase().includes(q) ||
      row.last_message?.toLowerCase().includes(q)
    );
  });
}

export async function fetchConversationMessages(conversationId: string): Promise<MessageRow[]> {
  return safeSelect<MessageRow>(
    'messages',
    'id, body, sender, kind, created_at, read_at',
    {
      filters: [{ column: 'conversation_id', value: conversationId }],
      order: { column: 'created_at', ascending: true },
      limit: 500,
    },
  );
}

export async function fetchProfessionalConversations(professionalId: string): Promise<ConversationRow[]> {
  return safeSelect<ConversationRow>(
    'conversations',
    'id, last_message, last_message_at, customers(name)',
    {
      filters: [{ column: 'professional_id', value: professionalId }],
      order: { column: 'last_message_at', ascending: false },
      limit: 50,
    },
  );
}

export async function searchMessages(query: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, body, conversation_id, created_at')
      .ilike('body', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
