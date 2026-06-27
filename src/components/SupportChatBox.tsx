import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Trash2, Minus, BadgeHelp } from "lucide-react";
import { Product } from "../types";

interface SupportChatBoxProps {
  currentProduct?: Product | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "How do I return an item?",
  "What is the shipping policy?",
  "Can I use coupon SAVE10?",
  "Do you provide GST invoices?",
];

export default function SupportChatBox({ currentProduct }: SupportChatBoxProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("novamart_support_chat_history");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing chat history:", e);
        }
      }
    }
    return [
      {
        id: "welcome",
        sender: "ai",
        text: "Hi there! 👋 I am your NovaMart AI Copilot. Ask me anything about products, return policies, delivery times, or how to get extra coupon discounts!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages with sessionStorage
  useEffect(() => {
    sessionStorage.setItem("novamart_support_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Handle auto-scroll to the latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Show a pulsing notification badge after 5 seconds if the chatbot hasn't been opened
  useEffect(() => {
    const hasBeenOpened = sessionStorage.getItem("novamart_support_chat_opened");
    if (!hasBeenOpened) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowNotification(false);
    sessionStorage.setItem("novamart_support_chat_opened", "true");
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Send chat history and optionally the viewed product to the Gemini AI API proxy endpoint
      const payloadMessages = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch("/api/ai/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: payloadMessages,
          currentProduct: currentProduct || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to contact the customer support server.");
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: data.reply || "I am here to guide you with any queries about orders, payments, or seller reviews!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Error getting chatbot response:", err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "ai",
        text: "I'm having trouble connecting to the live server right now. But don't worry, NovaMart features 30-day returns, 2-day priority delivery, and buyer protections! Feel free to checkout securely.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const initialWelcome: ChatMessage = {
        id: "welcome",
        sender: "ai",
        text: "Hi! How can I assist you with your shopping experience at NovaMart today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([initialWelcome]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="support-chatbot-widget">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-bubble"
            id="chatbot-trigger-bubble"
            onClick={handleOpenChat}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-2xl hover:from-amber-600 hover:to-amber-700 cursor-pointer relative"
          >
            <MessageSquare size={24} />
            
            {showNotification && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white font-extrabold items-center justify-center">1</span>
              </span>
            )}
            
            {/* Hover tooltip */}
            <div className="absolute right-16 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md border border-neutral-800">
              NovaMart Copilot Chatbot
            </div>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="chat-window"
            id="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col w-[380px] sm:w-[400px] h-[550px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-neutral-900 to-neutral-850 dark:from-neutral-950 dark:to-neutral-900 text-white border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500 text-neutral-950">
                    <Sparkles size={18} />
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-neutral-900"></span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold tracking-tight">NovaMart Copilot</h4>
                  <p className="text-[10px] text-neutral-400 font-medium">Enterprise Support Bot • Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  title="Clear conversation history"
                  className="p-1.5 hover:bg-neutral-850 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize support chat"
                  className="p-1.5 hover:bg-neutral-850 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* View Context Warning / Banner if active product exists */}
            {currentProduct && (
              <div className="bg-amber-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-amber-200 text-xs px-3.5 py-2 flex items-center gap-2 border-b border-amber-100 dark:border-neutral-800">
                <BadgeHelp size={14} className="text-amber-500 flex-shrink-0" />
                <span className="truncate">
                  Viewing: <strong>{currentProduct.name}</strong> (${currentProduct.price})
                </span>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50 dark:bg-neutral-950/40">
              {messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-1.5`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex-shrink-0">
                        N
                      </div>
                    )}
                    <div className="flex flex-col max-w-[80%]">
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? "bg-amber-500 text-neutral-950 rounded-br-none font-medium"
                            : "bg-white dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-800/80 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-1 px-1 self-end">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start items-end gap-1.5">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex-shrink-0">
                    N
                  </div>
                  <div className="bg-white dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length < 5 && (
              <div className="px-4 py-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800/60">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-400 mb-1.5">Suggested Questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      disabled={isLoading}
                      className="text-xs px-2.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500 bg-neutral-50 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-amber-400 transition-all cursor-pointer text-left whitespace-nowrap max-w-full truncate disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2 p-3.5 border-t border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask NovaMart Copilot..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-neutral-50 dark:bg-neutral-850 text-sm text-neutral-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="flex items-center justify-center p-2.5 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-600 transition-all disabled:opacity-50 disabled:hover:bg-amber-500 cursor-pointer"
                title="Send Message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
