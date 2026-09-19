import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Copy,
  FileDown,
  FlaskConical,
  Gem,
  Mic,
  MicOff,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navbar } from "@/components/Navbar";
import { Markdown } from "@/components/Markdown";
import { CitationCard } from "@/components/CitationCard";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useI18n } from "@/lib/i18n";
import { generateAnswer, quickActionPrompts, type AnswerPayload, type Confidence } from "@/lib/mock-ai";
import { askBis, saveFeedback } from "@/lib/bis.functions";
import {
  loadLocalConversations,
  loadRemoteConversations,
  saveLocalConversations,
  saveRemoteConversation,
} from "@/lib/conversations";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/chat")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Ask BISmart — AI chat for Indian Standards and BIS services" },
      {
        name: "description",
        content:
          "Chat with BISmart in English, Hindi or Telugu about Indian Standards, ISI marking, CRS, hallmarking and testing labs. Every answer carries citations.",
      },
      { property: "og:title", content: "Ask BISmart — chat with citations" },
      {
        property: "og:description",
        content: "Source-backed answers on Indian Standards and BIS certification, in three languages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: AnswerPayload["citations"];
  confidence?: Confidence;
  followups?: string[];
  retrievedCount?: number;
  rating?: "up" | "down";
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const uid = () => crypto.randomUUID();

const quickActions = [
  { key: "recommend", labelKey: "qa.recommend", icon: Sparkles },
  { key: "certification", labelKey: "qa.certification", icon: BadgeCheck },
  { key: "hallmark", labelKey: "qa.hallmark", icon: Gem },
  { key: "lab", labelKey: "qa.lab", icon: FlaskConical },
  { key: "consumer", labelKey: "qa.consumer", icon: Users },
] as const;

const confidenceStyles: Record<Confidence, string> = {
  High: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/20 text-warning-foreground border-warning/40",
  Low: "bg-destructive/10 text-destructive border-destructive/30",
};

function ChatPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { q } = Route.useSearch();

  const [conversations, setConversations] = useState<Conversation[]>(() => [
    { id: uid(), title: "New chat", messages: [] },
  ]);
  const [activeId, setActiveId] = useState(() => conversations[0]!.id);
  const [userId, setUserId] = useState<string | null>(null);
  const [convSearch, setConvSearch] = useState("");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [listening, setListening] = useState(false);
  const threadEnd = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const filteredConvs = useMemo(
    () =>
      conversations.filter((c) =>
        convSearch.trim() ? c.title.toLowerCase().includes(convSearch.toLowerCase()) : true,
      ),
    [conversations, convSearch],
  );

  const updateActive = useCallback(
    (fn: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === activeId ? fn(c) : c)));
    },
    [activeId],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;

      const userMsg: Message = { id: uid(), role: "user", content: text };
      updateActive((c) => ({
        ...c,
        title: c.messages.length === 0 ? text.slice(0, 44) : c.title,
        messages: [...c.messages, userMsg],
      }));
      setInput("");
      setPending(true);

      const history = (active?.messages ?? [])
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      void (async () => {
        let payload: AnswerPayload;
        try {
          payload = await askBis({ data: { query: text, lang, history } });
        } catch {
          toast.error(t("chat.liveUnavailable"));
          payload = generateAnswer(text, lang);
        }

        const assistantId = uid();

        // Simulated streaming: reveal the answer progressively.
        updateActive((c) => ({
          ...c,
          messages: [...c.messages, { id: assistantId, role: "assistant", content: "" }],
        }));

        const words = payload.answer.split(" ");
        let i = 0;
        const tick = window.setInterval(() => {
          i = Math.min(words.length, i + 6);
          const partial = words.slice(0, i).join(" ");
          setConversations((prev) =>
            prev.map((c) =>
              c.id !== activeId
                ? c
                : {
                    ...c,
                    messages: c.messages.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
                  },
            ),
          );
          if (i >= words.length) {
            window.clearInterval(tick);
            setConversations((prev) =>
              prev.map((c) =>
                c.id !== activeId
                  ? c
                  : {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantId
                          ? {
                              ...m,
                              content: payload.answer,
                              citations: payload.citations,
                              confidence: payload.confidence,
                              followups: payload.followups,
                              retrievedCount: payload.retrievedCount,
                            }
                          : m,
                      ),
                    },
              ),
            );
            setPending(false);
          }
        }, 45);
      })();
    },
    [activeId, active?.messages, lang, pending, updateActive, t],
  );

  // Seed the thread from ?q= (landing page chips, recommender handoff).
  useEffect(() => {
    if (q && !seeded.current) {
      seeded.current = true;
      send(q);
      navigate({ to: "/chat", search: {}, replace: true });
    }
  }, [q, send, navigate]);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.messages, pending]);

  const newChat = () => {
    const id = uid();
    setConversations((prev) => [{ id, title: "New chat", messages: [] }, ...prev]);
    setActiveId(id);
  };

  const renameChat = (id: string) => {
    const current = conversations.find((c) => c.id === id);
    const next = window.prompt(t("chat.rename"), current?.title ?? "");
    if (next && next.trim()) {
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: next.trim() } : c)));
    }
  };

  const deleteChat = (id: string) => {
    setConversations((prev) => {
      const rest = prev.filter((c) => c.id !== id);
      if (rest.length === 0) {
        const fresh = { id: uid(), title: "New chat", messages: [] };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(rest[0]!.id);
      return rest;
    });
  };

  const startVoice = () => {
    type SpeechCtor = new () => {
      lang: string;
      interimResults: boolean;
      start: () => void;
      stop: () => void;
      onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
    };
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    const rec = new Ctor();
    rec.lang = lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      toast.error("Could not capture audio.");
    };
    setListening(true);
    rec.start();
  };

  const copyAnswer = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(t("common.copied"));
  };

  const shareConversation = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Conversation link copied");
  };

  const rate = (messageId: string, rating: "up" | "down") => {
    updateActive((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === messageId ? { ...m, rating } : m)),
    }));
    const msgs = active?.messages ?? [];
    const idx = msgs.findIndex((m) => m.id === messageId);
    const question = idx > 0 ? [...msgs.slice(0, idx)].reverse().find((m) => m.role === "user")?.content : undefined;
    const answer = msgs[idx]?.content ?? "";
    if (question) {
      void saveFeedback({ data: { question, answer, rating, lang } }).catch(() => undefined);
    }
    toast.success("Thanks for the feedback");
  };

  const messages = active?.messages ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-0 lg:px-6">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border py-6 pr-4 lg:flex">
          <Button onClick={newChat} className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            {t("chat.newChat")}
          </Button>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder={t("chat.searchChats")}
              className="pl-9"
              aria-label={t("chat.searchChats")}
            />
          </div>
          <ScrollArea className="mt-4 flex-1">
            <ul className="space-y-1 pr-2">
              {filteredConvs.map((c) => (
                <li key={c.id} className="group flex items-center gap-1">
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`flex-1 truncate rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      c.id === activeId
                        ? "bg-secondary font-medium text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {c.title}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Conversation options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => renameChat(c.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> {t("chat.rename")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteChat(c.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> {t("chat.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </aside>

        {/* Thread */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
            <h1 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
              {t("chat.title")}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={shareConversation} className="gap-1.5">
                <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">{t("chat.share")}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.print()} className="gap-1.5">
                <FileDown className="h-4 w-4" /> <span className="hidden sm:inline">{t("chat.pdf")}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={newChat} className="lg:hidden">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 && !pending && (
              <div className="mx-auto max-w-2xl py-12 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <Sparkles className="h-6 w-6 text-accent" aria-hidden />
                </span>
                <h2 className="mt-5 text-xl font-semibold">{t("chat.empty.title")}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("chat.empty.body")}</p>
              </div>
            )}

            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {m.content}
                    </p>
                  </div>
                ) : (
                  <article key={m.id} className="space-y-4">
                    <div className="card-surface p-4 sm:p-5">
                      <Markdown content={m.content} />

                      {m.confidence && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                          <Badge variant="outline" className={confidenceStyles[m.confidence]}>
                            {t("chat.confidence")}: {m.confidence}
                          </Badge>
                          {typeof m.retrievedCount === "number" && (
                            <span className="text-xs text-muted-foreground">
                              Retrieved from {m.retrievedCount} sources
                            </span>
                          )}
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Copy answer"
                              onClick={() => copyAnswer(m.content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={m.rating === "up" ? "secondary" : "ghost"}
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Helpful"
                              onClick={() => rate(m.id, "up")}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={m.rating === "down" ? "secondary" : "ghost"}
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Not helpful"
                              onClick={() => rate(m.id, "down")}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {m.citations && m.citations.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("chat.sources")}
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {m.citations.map((c, i) => (
                            <CitationCard key={`${c.standardNumber}-${c.clauseRef}-${i}`} citation={c} />
                          ))}
                        </div>
                      </div>
                    )}

                    {m.citations && m.citations.length === 0 && m.confidence === "Low" && (
                      <p className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                        {t("chat.noSource")}
                      </p>
                    )}

                    {m.followups && m.followups.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("chat.followups")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {m.followups.map((f) => (
                            <button
                              key={f}
                              onClick={() => send(f)}
                              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs transition-colors hover:border-accent hover:bg-secondary"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ),
              )}

              {pending && (
                <div className="card-surface space-y-2 p-4">
                  <p className="text-xs text-muted-foreground">{t("chat.thinking")}</p>
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              )}
              <div ref={threadEnd} />
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-card px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((qa) => (
                  <button
                    key={qa.key}
                    onClick={() => send(quickActionPrompts[qa.key]?.[lang] ?? "")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:bg-secondary"
                  >
                    <qa.icon className="h-3.5 w-3.5 text-accent" aria-hidden />
                    {t(qa.labelKey)}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={t("chat.placeholder")}
                  aria-label={t("chat.placeholder")}
                  className="min-h-[46px] resize-none bg-background"
                />
                <Button
                  variant={listening ? "secondary" : "outline"}
                  size="icon"
                  onClick={startVoice}
                  aria-label={t("chat.mic")}
                  className="h-[46px] w-[46px] shrink-0"
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <LanguageSelect className="hidden h-[46px] w-[124px] shrink-0 sm:flex" />
                <Button
                  onClick={() => send(input)}
                  disabled={pending || !input.trim()}
                  aria-label={t("chat.send")}
                  className="h-[46px] w-[46px] shrink-0 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{t("chat.note")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
