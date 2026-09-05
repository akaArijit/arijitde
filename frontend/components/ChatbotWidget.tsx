'use client';

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import AIOrbFace from "@/components/smoothui/ai-orb-face";
import { AIMessage } from "@/components/smoothui/ai-message";
import { type AIState, useSimulatedAmplitude } from "@/components/smoothui/ai-core";

interface Message {
  id: number;
  sender: "bot" | "user";
  text: string;
  options?: string[];
  timestamp?: string;
}

interface ChatbotWidgetProps {
  isFooterIntersecting?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatMessageText(text: string) {
  if (!text) return "";
  
  // Split by bold (**text** or __text__)
  const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-extrabold text-primary">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__")) {
      return <strong key={index} className="font-extrabold text-primary">{part.slice(2, -2)}</strong>;
    }
    
    // Split the remaining parts by italics (*text* or _text_)
    const subParts = part.split(/(\*.*?\*|_.*?_)/g);
    return subParts.map((subPart, subIndex) => {
      if (subPart.startsWith("*") && subPart.endsWith("*")) {
        return <em key={`${index}-${subIndex}`} className="italic">{subPart.slice(1, -1)}</em>;
      }
      if (subPart.startsWith("_") && subPart.endsWith("_")) {
        return <em key={`${index}-${subIndex}`} className="italic">{subPart.slice(1, -1)}</em>;
      }
      return subPart;
    });
  });
}

export default function ChatbotWidget({
  isFooterIntersecting = false,
  isOpen,
  onOpenChange
}: ChatbotWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [aiState, setAiState] = useState<AIState>("idle");
  const stateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const simulatedAmplitude = useSimulatedAmplitude(aiState);

  const isChatOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const setIsChatOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: "bot", 
      text: "Hello! I'm Virtual Arijit, your personal AI assistant. Before we begin, are you a New User or an Existing Client? Select an option below to get started, or ask a question:",
      options: ["New User", "Existing Client"]
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
 
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
 
  useEffect(() => {
    setMounted(true);
    setMessages(prev => prev.map(m => m.timestamp ? m : {
      ...m,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }));
    return () => {
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    };
  }, []);
 
  // Auto scroll to bottom only on new messages or typing
  useEffect(() => {
    if (!isChatOpen) return;
    const id = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages.length, isTyping]);
 
  if (!mounted) return null;

  const sendUserMessage = async (userMessageText: string, currentMessagesState = messages) => {
    if (isTyping) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now(), sender: "user", text: userMessageText, timestamp: nowTime };
    const updatedMessages = [...currentMessagesState, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);
    setAiState("thinking");
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Format messages history for the API (exclude layout-only options attribute)
      const history = updatedMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const res = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: history })
      });

      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (data.success) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: data.text, timestamp: botTime }]);
        setAiState("done");
        stateTimerRef.current = setTimeout(() => {
          setAiState("idle");
        }, 2600);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: data.error || "Failed to get response. Please try again.", timestamp: botTime }]);
        setAiState("error");
        stateTimerRef.current = setTimeout(() => {
          setAiState("idle");
        }, 3200);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: "Network error. Please check your connection and try again.", timestamp: botTime }]);
      setAiState("error");
      stateTimerRef.current = setTimeout(() => {
        setAiState("idle");
      }, 3200);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (isTyping) return;
    const lastUserMessage = [...messages].reverse().find(m => m.sender === "user");
    if (lastUserMessage) {
      sendUserMessage(lastUserMessage.text);
    }
  };

  const handleOptionClick = (opt: string, messageId: number) => {
    // 1. Clear the option pills from the message in state
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, options: undefined } : m));
    
    // 2. Submit the message using the updated state to avoid closure lag
    const clearedMessages = messages.map(m => m.id === messageId ? { ...m, options: undefined } : m);
    sendUserMessage(opt, clearedMessages);
  };
 
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;
 
    const userMessageText = inputVal.trim();
    setInputVal("");
    await sendUserMessage(userMessageText);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    if (!isTyping) {
      if (val.trim().length > 0) {
        setAiState("listening");
      } else {
        setAiState("idle");
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 flex flex-col items-end transition-all duration-500 ease-out",
        isFooterIntersecting
          ? "opacity-0 translate-y-10 scale-90 pointer-events-none"
          : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
      )}
    >
      {/* Chatbot Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="chatbot-modal"
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 340,
              mass: 0.8,
            }}
            style={{ transformOrigin: "bottom right" }}
            className="w-80 md:w-96 h-[450px] md:h-[500px] mb-3.5 rounded-3xl border border-neutral-200/80 bg-white/85 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col will-change-transform"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-white/50 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0 w-10 h-10 rounded-2xl bg-neutral-100/90 border border-neutral-200/90 flex items-center justify-center shadow-xs overflow-visible">
                  <AIOrbFace
                    size={36}
                    state={aiState}
                    amplitude={simulatedAmplitude}
                    gaze={true}
                    aria-label={`Virtual Arijit is ${aiState}`}
                  />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-xs",
                      aiState === "error"
                        ? "bg-rose-500"
                        : aiState === "thinking"
                        ? "bg-amber-400 animate-ping"
                        : "bg-emerald-500"
                    )}
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-primary tracking-wide font-clash flex items-center gap-1.5">
                    Virtual Arijit
                    {aiState === "done" && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                        READY
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5">
                    <span className="uppercase font-medium tracking-wider">
                      {aiState === "thinking"
                        ? "Thinking..."
                        : aiState === "listening"
                        ? "Listening..."
                        : aiState === "done"
                        ? "Response ready"
                        : aiState === "error"
                        ? "Connection issue"
                        : "AI AGENT • ONLINE"}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-neutral-400 hover:text-primary transition duration-150 p-1.5 rounded-full hover:bg-neutral-100/80 cursor-pointer"
                aria-label="Close Chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message List */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-border select-text"
            >
              {messages.map((msg, index) => {
                const isAssistant = msg.sender === "bot";
                const isLastBotMessage = isAssistant && index === messages.length - 1;

                return (
                  <AIMessage
                    key={msg.id}
                    from={isAssistant ? "assistant" : "user"}
                    avatar={
                      isAssistant ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white border border-neutral-200/90 shadow-2xs">
                          <AIOrbFace
                            size={20}
                            state={isLastBotMessage ? aiState : "idle"}
                            amplitude={isLastBotMessage ? simulatedAmplitude : 0}
                            gaze={false}
                            aria-label="Virtual Arijit"
                          />
                        </div>
                      ) : undefined
                    }
                    timestamp={msg.timestamp}
                    copyText={msg.text}
                    onRetry={isAssistant ? handleRetry : undefined}
                    onVote={isAssistant ? () => {} : undefined}
                  >
                    <div className="font-clash text-xs leading-relaxed whitespace-pre-line">
                      {formatMessageText(msg.text)}
                    </div>
                    {msg.options && (
                      <div className="flex flex-wrap gap-1.5 mt-2 justify-start">
                        {msg.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleOptionClick(opt, msg.id)}
                            className="px-2.5 py-1 bg-[#3A8293]/10 border border-[#3A8293]/20 hover:bg-[#3A8293] hover:text-white text-[#3A8293] rounded-full text-[11px] font-semibold font-clash transition duration-150 cursor-pointer select-none"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </AIMessage>
                );
              })}
              {isTyping && (
                <AIMessage
                  from="assistant"
                  avatar={
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white border border-neutral-200/90 shadow-2xs">
                      <AIOrbFace
                        size={20}
                        state="thinking"
                        gaze={false}
                        aria-label="Virtual Arijit is thinking"
                      />
                    </div>
                  }
                >
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[100ms]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[200ms]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[300ms]" />
                  </div>
                </AIMessage>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 bg-transparent flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                onFocus={() => {
                  if (!isTyping && aiState === "idle") setAiState("listening");
                }}
                onBlur={() => {
                  if (!isTyping && aiState === "listening" && !inputVal.trim()) setAiState("idle");
                }}
                placeholder="Ask about portfolio optimization, mutual funds, or LIC policies..."
                className="flex-1 px-4 py-2 text-xs rounded-xl bg-white/40 border border-neutral-200 text-neutral-800 focus:outline-none focus:border-primary placeholder-neutral-400 font-clash"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping}
                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition duration-200 cursor-pointer disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Toggle Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label={isChatOpen ? "Close Virtual Arijit assistant" : "Chat with Virtual Arijit AI Assistant"}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer select-none transition-colors duration-200 shadow-[0_12px_32px_rgba(58,130,147,0.25)]",
          isChatOpen
            ? "bg-neutral-900 text-white"
            : "bg-white/85 backdrop-blur-xl border border-white/70"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isChatOpen ? (
            <motion.div
              key="chat-close-icon"
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-orb-icon"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center p-1"
            >
              <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#3A8293]/15 via-transparent to-primary/10 pointer-events-none" />
              <AIOrbFace
                size={52}
                state={aiState}
                amplitude={simulatedAmplitude}
                gaze={true}
                aria-label="Virtual Arijit Assistant"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
