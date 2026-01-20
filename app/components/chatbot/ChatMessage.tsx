export default function ChatMessage({
  sender,
  content,
}: {
  sender: "user" | "bot";
  content: string;
}) {
  const isUser = sender === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "8px 10px",
          borderRadius: "8px",
          background: isUser ? "#000" : "#f2f2f2",
          color: isUser ? "#fff" : "#000",
          fontSize: "14px",
        }}
      >
        {content}
      </div>
    </div>
  );
}
