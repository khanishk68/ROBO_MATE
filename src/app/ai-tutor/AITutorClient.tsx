// src/app/ai-tutor/AITutorClient.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Send, Trash2, Bot, User, Copy, Check,
  MessageSquare, RefreshCw, Lightbulb, Code2,
  BookOpen, Bug, ClipboardList, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface AITutorClientProps {
  userId: string;
  persona: "boy" | "girl";
  displayName: string;
  initialConversations: Conversation[];
}

const BOY_SUGGESTIONS = [
  "Explain how PID controllers work in robotics",
  "Help me understand ROS 2 topics and publishers",
  "What's the difference between Arduino and ESP32?",
  "Quiz me on Python data structures",
  "How does SLAM work for autonomous navigation?",
  "Debug this motor control code",
];

const GIRL_SUGGESTIONS = [
  "Explain Design for Manufacturing (DFM) principles",
  "Help me understand ergonomics in robot design",
  "What makes a good robot enclosure design?",
  "Quiz me on Fusion 360 features",
  "Explain the difference between DFM and DFA",
  "Review my robot concept sketch approach",
];

const QUICK_ACTIONS = [
  { icon: <Lightbulb className="w-3.5 h-3.5" />, label: "Explain concept", prompt: "Please explain the following concept in detail: " },
  { icon: <Code2 className="w-3.5 h-3.5" />,     label: "Review code",    prompt: "Please review and explain this code: " },
  { icon: <Bug className="w-3.5 h-3.5" />,        label: "Debug help",    prompt: "I'm having a bug in my code. Please help debug: " },
  { icon: <BookOpen className="w-3.5 h-3.5" />,   label: "Teach today",   prompt: "Teach me today's lesson from my study plan" },
  { icon: <ClipboardList className="w-3.5 h-3.5" />, label: "Quiz me",    prompt: "Generate a 5-question quiz on what I've been studying" },
];

export function AITutorClient({ userId, persona: initialPersona, displayName: initialName, initialConversations }: AITutorClientProps) {
  const { activeProfile } = useAuth();
  const { isDark, isBoyMode } = useTheme();
  const { success, error: showError } = useToast();

  const effectiveProfileId = activeProfile?.id || userId;
  const currentPersona = isBoyMode ? "boy" : "girl";
  const studentName = activeProfile?.display_name || initialName;

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = isBoyMode ? BOY_SUGGESTIONS : GIRL_SUGGESTIONS;

  // Reload conversations when switching profiles
  useEffect(() => {
    async function fetchProfileConvs() {
      try {
        const res = await fetch(`/api/ai/conversations?profileId=${effectiveProfileId}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          setActiveConvId(null);
          setMessages([]);
        }
      } catch {
        // preserve existing
      }
    }
    fetchProfileConvs();
  }, [effectiveProfileId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/ai/messages?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      showError("Failed to load messages");
    }
    setLoadingMessages(false);
  }, [showError]);

  useEffect(() => {
    if (activeConvId) loadMessages(activeConvId);
    else setMessages([]);
  }, [activeConvId, loadMessages]);

  async function sendMessage(text?: string) {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    setInput("");
    setLoading(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          message: messageText,
          profileId: effectiveProfileId,
          persona: currentPersona,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError("AI Error", data.error || "Failed to get response");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        // If new conversation was created, update the list
        if (!activeConvId && data.conversationId) {
          setActiveConvId(data.conversationId);
          const convRes = await fetch(`/api/ai/conversations?profileId=${effectiveProfileId}`);
          if (convRes.ok) setConversations(await convRes.json());
        }

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          userMsg,
          aiMsg,
        ]);
      }
    } catch (err) {
      showError("Network error", "Please check your connection.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }

    setLoading(false);
  }

  async function deleteConversation(convId: string) {
    const res = await fetch(`/api/ai/conversations?id=${convId}`, { method: "DELETE" });
    if (res.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
        setMessages([]);
      }
      success("Conversation deleted");
    }
  }

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function newConversation() {
    setActiveConvId(null);
    setMessages([]);
    setInput("");
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar: Conversation List */}
      <aside
        className="hidden md:flex flex-col w-64 border-r overflow-hidden"
        style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}
      >
        <div className="p-3 border-b" style={{ borderColor: "var(--border-color)" }}>
          <Button onClick={newConversation} size="sm" className="w-full">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No conversations yet
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-sm",
                  activeConvId === conv.id ? "font-medium" : "hover:opacity-80"
                )}
                style={{
                  background: activeConvId === conv.id ? "var(--primary)15" : "transparent",
                  borderLeft: activeConvId === conv.id ? `2px solid var(--primary)` : "2px solid transparent",
                  color: activeConvId === conv.id ? "var(--primary)" : "var(--text-secondary)",
                }}
                onClick={() => setActiveConvId(conv.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-xs">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:opacity-70 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg"
                style={{ background: "var(--gradient-accent)" }}
              >
                {isBoyMode ? "🤖" : "🎨"}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {isBoyMode ? "Robotics Engineering Tutor" : "Design & Product Tutor"}
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Powered by Gemini AI • Personalized for your journey
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:opacity-80"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              <div className="w-full max-w-lg">
                <p className="text-xs text-center mb-3" style={{ color: "var(--text-muted)" }}>
                  Suggested questions:
                </p>
                <div className="grid gap-2">
                  {suggestions.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left px-4 py-3 rounded-xl border text-sm transition-all hover:opacity-80"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isDark={isDark}
                isBoyMode={isBoyMode}
                onCopy={() => copyMessage(msg.content, msg.id)}
                copied={copiedId === msg.id}
              />
            ))
          )}

          {loading && (
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--gradient-accent)" }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: "var(--primary)",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className="border-t p-4"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className="flex gap-3 items-end rounded-2xl border p-3"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask your ${isBoyMode ? "Robotics" : "Design"} tutor anything...`}
                rows={2}
                className="border-0 bg-transparent resize-none focus:ring-0 focus:border-0 p-0 text-sm"
                style={{ minHeight: "2.5rem", maxHeight: "8rem" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl transition-all disabled:opacity-40"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
              Enter to send • Shift+Enter for new line • Gemini AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  isDark,
  isBoyMode,
  onCopy,
  copied,
}: {
  msg: Message;
  isDark: boolean;
  isBoyMode: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  const isUser = msg.role === "user";

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isUser ? "var(--border-color)" : "var(--gradient-accent)",
        }}
      >
        {isUser ? (
          <User className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={cn("group max-w-2xl relative", isUser && "items-end")}>
        <div
          className="px-4 py-3 rounded-2xl text-sm"
          style={{
            background: isUser ? "var(--primary)" : "var(--bg-card)",
            color: isUser ? "white" : "var(--text-primary)",
            border: isUser ? "none" : "1px solid var(--border-color)",
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    return isInline ? (
                      <code
                        className="px-1.5 py-0.5 rounded text-xs font-mono"
                        style={{ background: "var(--bg-secondary)", color: "var(--neon)" }}
                      >
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        style={isDark ? oneDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          borderRadius: "0.5rem",
                          fontSize: "0.8rem",
                          margin: "0.75rem 0",
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    );
                  },
                  p: ({ children }) => (
                    <p style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h1 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem" }}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 600 }}>{children}</h3>
                  ),
                  li: ({ children }) => (
                    <li style={{ color: "var(--text-secondary)" }}>{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: "var(--text-primary)" }}>{children}</strong>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} style={{ color: "var(--primary)" }} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button */}
        {!isUser && (
          <button
            onClick={onCopy}
            className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs transition-all px-2 py-1 rounded-lg"
            style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}
          >
            {copied ? (
              <><Check className="w-3 h-3 text-green-400" /> Copied</>
            ) : (
              <><Copy className="w-3 h-3" /> Copy</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

