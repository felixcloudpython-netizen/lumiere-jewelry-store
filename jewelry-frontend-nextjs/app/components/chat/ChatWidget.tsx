"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { useSocket } from "@/lib/hooks/useSocket";
import { useAuthStore } from "@/lib/store/authStore";
import AuthGate from "@/app/components/auth/AuthGate";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { firstName?: string; lastName?: string; role: string };
  isAdmin: boolean;
  createdAt: string;
}

export default function ChatWidget() {
  const t = useTranslations("chat");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);

  // Quy ước phòng chat của khách hàng là `user_<userId>` (khớp với backend —
  // xem chat.routes.ts và socket.ts `canAccessRoom`). Trước đây roomId bị
  // hardcode là "support", một phòng chung không khớp với ID của bất kỳ khách
  // nào, nên `canAccessRoom` luôn từ chối — khách không join được phòng, cũng
  // không gửi được tin nhắn, dù giao diện không báo lỗi gì rõ ràng.
  const roomId = user ? `user_${user.id}` : null;

  const { joinRoom, sendMessage, markRead, on } = useSocket(token ?? undefined);

  useEffect(() => {
    if (!token || !roomId || !isOpen) return;

    joinRoom(roomId);

    const unsubHistory = on("message_history", (history: Message[]) => {
      setMessages(history);
      markRead(roomId);
    });

    const unsubMessage = on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    const unsubTyping = on("user_typing", (data: { userName: string }) => {
      setTypingUser(data.userName);
      setTimeout(() => setTypingUser(""), 2000);
    });

    const unsubError = on("error", (err: { message: string }) => {
      console.error("Chat error:", err.message);
    });

    setIsConnected(true);

    return () => {
      unsubHistory?.();
      unsubMessage?.();
      unsubTyping?.();
      unsubError?.();
    };
  }, [token, roomId, isOpen, joinRoom, on, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !roomId) return;
    sendMessage(roomId, input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-neutral-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-800 transition-colors z-50"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white border border-neutral-200 shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white">
            <div>
              <h3 className="text-sm font-medium">{t("supportTitle")}</h3>
              {!!roomId && (
                <p className="text-[10px] text-neutral-400">
                  {isConnected ? t("online") : t("connecting")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded">
                <Minimize2 size={14} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body: chưa đăng nhập -> cho đăng nhập ngay tại đây; đã đăng nhập -> khung chat thật */}
          {!isAuthHydrated ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full" />
            </div>
          ) : !roomId ? (
            <div className="flex-1 overflow-y-auto p-4">
              <AuthGate context="chat" />
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-neutral-400 text-sm py-8">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                    <p>{t("welcomeMessage")}</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 text-sm ${
                        msg.isAdmin
                          ? "bg-neutral-100 text-neutral-900"
                          : "bg-neutral-900 text-white"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-60">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                {typingUser && (
                  <div className="text-xs text-neutral-400 italic">
                    {t("isTyping", { name: typingUser })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-neutral-200 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("placeholder")}
                    className="flex-1 px-3 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-3 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
