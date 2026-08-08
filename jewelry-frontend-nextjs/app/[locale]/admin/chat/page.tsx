"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Circle } from "lucide-react";
import { useSocket } from "@/lib/hooks/useSocket";
import { apiFetch } from "@/lib/api";

interface ChatRoom {
  roomId: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unreadCount: number;
  lastMessageAt: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { firstName?: string; lastName?: string; role: string };
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
  const { joinRoom, sendMessage, markRead, on } = useSocket(token);

  useEffect(() => {
    if (!token) return;
    // Trước đây dùng đường dẫn tương đối "/api/chat/rooms", sẽ 404 ở production
    // vì frontend/backend nằm trên 2 domain khác nhau.
    apiFetch<ChatRoom[]>("/api/chat/rooms", { token }).then(setRooms).catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!activeRoom) return;

    joinRoom(activeRoom);
    markRead(activeRoom);

    const unsubHistory = on("message_history", (history: Message[]) => {
      setMessages(history);
    });

    const unsubMessage = on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    const unsubTyping = on("user_typing", (data: { userName: string }) => {
      setTypingUser(data.userName);
      setTimeout(() => setTypingUser(""), 2000);
    });

    const unsubSupport = on("new_support_request", (data: any) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r.roomId === data.roomId);
        if (exists) {
          return prev.map((r) =>
            r.roomId === data.roomId
              ? { ...r, unreadCount: r.unreadCount + 1, lastMessageAt: data.timestamp }
              : r
          );
        }
        return [
          {
            roomId: data.roomId,
            userId: data.userId,
            email: data.userName,
            firstName: "",
            lastName: "",
            unreadCount: 1,
            lastMessageAt: data.timestamp,
          },
          ...prev,
        ];
      });
    });

    return () => {
      unsubHistory?.();
      unsubMessage?.();
      unsubTyping?.();
      unsubSupport?.();
    };
  }, [activeRoom, joinRoom, markRead, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !activeRoom) return;
    sendMessage(activeRoom, input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeRoomData = rooms.find((r) => r.roomId === activeRoom);

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white border border-neutral-200">
      <div className="w-72 border-r border-neutral-200 flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="text-sm font-medium tracking-wider uppercase">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room.roomId}
              onClick={() => {
                setActiveRoom(room.roomId);
                setRooms((prev) =>
                  prev.map((r) => (r.roomId === room.roomId ? { ...r, unreadCount: 0 } : r))
                );
              }}
              className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                activeRoom === room.roomId ? "bg-neutral-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{room.firstName || room.email}</span>
                {room.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-neutral-900 text-white text-[10px] rounded-full flex items-center justify-center">{room.unreadCount}</span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{new Date(room.lastMessageAt).toLocaleDateString()}</p>
            </button>
          ))}
          {rooms.length === 0 && <p className="text-center text-sm text-neutral-400 py-8">No conversations yet</p>}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
              <Circle size={8} className="text-green-500 fill-green-500" />
              <span className="text-sm font-medium">{activeRoomData?.firstName || activeRoomData?.email || "Customer"}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-3 py-2 text-sm ${msg.isAdmin ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"}`}>
                    <p>{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
              {typingUser && <div className="text-xs text-neutral-400 italic">{typingUser} is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-neutral-200 p-3">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your reply..." className="flex-1 px-3 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900" />
                <button onClick={handleSend} disabled={!input.trim()} className="px-3 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-40"><Send size={14} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400"><p>Select a conversation to start chatting</p></div>
        )}
      </div>
    </div>
  );
}
