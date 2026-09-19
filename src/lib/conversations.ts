/**
 * Conversation persistence: localStorage for guests, Lovable Cloud tables
 * (conversations/messages) for signed-in users. Citation and follow-up
 * metadata rides inside the messages.citations jsonb column.
 */
import { supabase } from "@/integrations/supabase/client";
import type { AnswerPayload } from "@/lib/mock-ai";

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: AnswerPayload["citations"];
  confidence?: string;
  followups?: string[];
  retrievedCount?: number;
  rating?: "up" | "down";
}

export interface StoredConversation {
  id: string;
  title: string;
  messages: StoredMessage[];
}

const LS_KEY = "bismart.conversations.v1";
const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export function loadLocalConversations(): StoredConversation[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredConversation[]) : null;
  } catch {
    return null;
  }
}

export function saveLocalConversations(convs: StoredConversation[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(convs.slice(0, 20)));
  } catch {
    // storage full or unavailable — ignore
  }
}

interface ConvRow {
  id: string;
  title: string;
}
interface MsgRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  citations: {
    citations?: StoredMessage["citations"];
    followups?: string[];
    retrievedCount?: number;
    rating?: "up" | "down";
  } | null;
  confidence: string | null;
}

export async function loadRemoteConversations(): Promise<{
  userId: string;
  conversations: StoredConversation[];
} | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: convs } = await supabase
    .from("conversations")
    .select("id,title")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const rows = (convs ?? []) as unknown as ConvRow[];
  if (rows.length === 0) return { userId: user.id, conversations: [] };

  const { data: msgs } = await supabase
    .from("messages")
    .select("id,conversation_id,role,content,citations,confidence")
    .in("conversation_id", rows.map((c) => c.id))
    .order("created_at");

  const byConv = new Map<string, StoredMessage[]>();
  for (const m of (msgs ?? []) as unknown as MsgRow[]) {
    const list = byConv.get(m.conversation_id) ?? [];
    const msg: StoredMessage = {
      id: m.id,
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    };
    if (m.citations?.citations) msg.citations = m.citations.citations;
    if (m.confidence) msg.confidence = m.confidence;
    if (m.citations?.followups) msg.followups = m.citations.followups;
    if (typeof m.citations?.retrievedCount === "number") msg.retrievedCount = m.citations.retrievedCount;
    if (m.citations?.rating) msg.rating = m.citations.rating;
    list.push(msg);
    byConv.set(m.conversation_id, list);
  }

  return {
    userId: user.id,
    conversations: rows.map((c) => ({ id: c.id, title: c.title, messages: byConv.get(c.id) ?? [] })),
  };
}

export async function saveRemoteConversation(
  userId: string,
  conv: StoredConversation,
  lang: string,
): Promise<void> {
  if (!isUuid(conv.id) || conv.messages.length === 0) return;
  try {
    await supabase.from("conversations").upsert({
      id: conv.id,
      user_id: userId,
      title: conv.title.slice(0, 120),
      language: lang,
    });
    await supabase.from("messages").delete().eq("conversation_id", conv.id);
    await supabase.from("messages").insert(
      conv.messages.map((m) => ({
        conversation_id: conv.id,
        role: m.role,
        content: m.content,
        confidence: m.confidence ?? null,
        citations: JSON.parse(
          JSON.stringify({
            citations: m.citations ?? [],
            followups: m.followups ?? [],
            retrievedCount: m.retrievedCount ?? null,
            rating: m.rating ?? null,
          }),
        ),
      })),
    );
  } catch {
    // Keep the local copy; remote sync is best-effort.
  }
}
