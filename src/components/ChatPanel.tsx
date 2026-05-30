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
import { Sparkles, Trash2 } from "lucide-react";

function partsToText(parts: UIMessage["parts"]): string {
  return parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function ChatPanel() {
  const qc = useQueryClient();
  const fetchMessages = useServerFn(getMyChatMessages);
  const clearChat = useServerFn(clearMyChat);

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

  return (
    <Card
      className="border-border/60 overflow-hidden flex flex-col h-[560px]"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[image:var(--gradient-hero)] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight">Winston</h2>
            <p className="text-xs text-muted-foreground">Your alchemist study companion</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending || messages.length === 0}
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      <Conversation className="flex-1">
        <ConversationContent>
          {isLoading && !hydratedRef.current ? (
            <div className="text-sm text-muted-foreground p-4">Loading…</div>
          ) : messages.length === 0 ? (
            <ConversationEmptyState
              title="Equivalent exchange."
              description="Ask Winston to break down an assignment, plan your day, or quiz you on a concept."
            />
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
                <Shimmer>Transmuting…</Shimmer>
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
            placeholder="Ask Winston anything…"
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
