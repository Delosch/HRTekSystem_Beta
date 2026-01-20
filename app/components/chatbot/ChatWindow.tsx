import { useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

type Message = {
  sender: "user" | "bot";
  content: string;
};

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", content: "Hi 👋 I’m Aira, your HR cognitive expert. How can I help you?" },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
  setMessages((prev) => [...prev, { sender: "user", content: text }]);
  setLoading(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        page_context: "dashboard",
        report_json: {},
        session_id: "dashboard-session",
      }),
    });

    const data = await res.json();
    console.log("CHAT API RESPONSE:", data);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        content: data.reply ?? data.answer ?? "No response from AI",
      },
    ]);
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", content: "Sorry, something went wrong." },
    ]);
  } finally {
    setLoading(false);
  }
};




  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "320px",
        height: "420px",
        background: "#000",
        border: "1px solid #ddd",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <strong>Aira</strong>
        <button onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
        }}
      >
        {messages.map((m, i) => (
          <ChatMessage key={i} sender={m.sender} content={m.content} />
        ))}
        {loading && <ChatMessage sender ="bot" content="Typing..." />}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
