import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
import { getMyChatMessages, clearMyChat } from "@/lib/chat.functions";
import { Trash2, Sunrise, ListChecks, Target } from "lucide-react";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { useWinstonConfig, DAILY_RESET_PROMPT } from "@/lib/winston-store";
import { getCompanion } from "@/lib/companions";
import { useGamification } from "@/lib/gamification";

function partsToText(parts: UIMessage["parts"]): string {
  return parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function ChatPanel() {
  const qc = useQueryClient();
  const fetchMessages = useServerFn(getMyChatMessages);
  const clearChat = useServerFn(clearMyChat);
  const { cfg } = useWinstonConfig();
  const companion = getCompanion(cfg.companionId);

  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: () => fetchMessages(),
  });

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
  });

  // Hydrate persisted messages once they load
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current && initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages as UIMessage[]);
      hydratedRef.current = true;
    } else if (initialMessages && initialMessages.length === 0) {
      hydratedRef.current = true;
    }
  }, [initialMessages, setMessages]);

  const [input, setInput] = useState("");

  const clearMutation = useMutation({
    mutationFn: async () => clearChat(),
    onSuccess: () => {
      setMessages([]);
      qc.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  function quickAsk(text: string) {
    if (isBusy) return;
    sendMessage({ text });
  }

  const QUICK_ACTIONS: { label: string; icon: React.ReactNode; prompt: string }[] = [
    {
      label: "Daily Reset",
      icon: <Sunrise className="h-3.5 w-3.5" />,
      prompt: DAILY_RESET_PROMPT,
    },
    {
      label: "What's due this week?",
      icon: <ListChecks className="h-3.5 w-3.5" />,
      prompt: "Walk me through everything due in the next 7 days from my Canvas list, grouped by class, in priority order.",
    },
    {
      label: "Break down my next assignment",
      icon: <Target className="h-3.5 w-3.5" />,
      prompt: "Take my single most urgent upcoming assignment and break it into concrete 25-minute work blocks I can knock out today.",
    },
  ];

  return (
    <Card
      className="border-border/60 overflow-hidden flex flex-col h-[640px]"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="relative flex items-center gap-5 px-6 py-5 border-b border-border/60 bg-[image:var(--gradient-hero)] text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 15% 50%, " + companion.glow + " 0%, transparent 55%)",
          }}
        />
        <div className="relative shrink-0">
          <CompanionAvatar companionId={companion.id} size="lg" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">
            Your Companion
          </div>
          <h2 className="font-bold text-2xl leading-tight">{companion.name}</h2>
          <p className="text-sm opacity-90 truncate">
            {companion.species} · {companion.tagline}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending || messages.length === 0}
          className="relative text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      {/* Quick actions — aimed at the companion, replaces the old Gemini copy card */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border/60 bg-muted/40">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.label}
            type="button"
            onClick={() => quickAsk(qa.prompt)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {qa.icon}
            {qa.label}
          </button>
        ))}
      </div>

      <Conversation className="flex-1">
        <ConversationContent>
          {isLoading && !hydratedRef.current ? (
            <div className="text-sm text-muted-foreground p-4">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center text-center py-8 px-6 gap-4">
              <CompanionAvatar companionId={companion.id} size="lg" />
              <div>
                <h3 className="font-semibold text-base">{companion.name} is ready.</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Ask for an assignment breakdown, a daily plan, or a quick quiz.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const text = partsToText(m.parts);
              if (m.role === "assistant") {
                return (
                  <Message from="assistant" key={m.id}>
                    <MessageContent className="px-0 py-1">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    </MessageContent>
                  </Message>
                );
              }
              return (
                <Message from="user" key={m.id}>
                  <MessageContent>
                    <p className="whitespace-pre-wrap">{text}</p>
                  </MessageContent>
                </Message>
              );
            })
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent className="px-0 py-1">
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/60 p-3 bg-card">
        <PromptInput
          onSubmit={(msg) => {
            const text = msg.text?.trim();
            if (!text || isBusy) return;
            sendMessage({ text });
            setInput("");
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${companion.name} anything…`}
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isBusy || !input.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </Card>
  );
}
