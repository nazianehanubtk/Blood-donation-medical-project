import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Lightbulb, MessageCircle } from "lucide-react";
import { sendChatMessage } from "../services/aiService";
import { notify } from "../components/Toast";

function AIPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm your AI Blood Donation Assistant. I can help you find matching donors by blood type and location, or answer any questions about blood donation. What would you like to know?",
      matches: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMessage = { role: "user", text: trimmed, matches: [] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const history = updatedMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, text: m.text }));

    const result = await sendChatMessage(trimmed, history);
    setLoading(false);

    if (!result.success) {
      const errorMsg = result.message || "Something went wrong. Please try again.";
      setError(errorMsg);
      notify.error(errorMsg);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: result.reply || "",
        matches: result.matches || [],
      },
    ]);
  };

  const suggestedQuestions = [
    "Find O+ blood donors in Dhaka",
    "Show me urgent blood requests",
    "What's the rarest blood type?",
  ];

  return (
    <div className="page ai-page">
      <div className="ai-hero">
        <div className="icon-badge">
          <Lightbulb size={32} />
        </div>
        <h1 style={{ fontSize: 28 }}>AI Blood Donor Assistant</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          Chat naturally with AI to find donors matching your blood type and location
        </p>
      </div>

      <div className="ai-card">
        {error && <div className="ai-error-banner">{error}</div>}

        <div className="chat-window">
          {messages.length <= 1 && !error && (
            <div className="ai-suggestions">
              <p className="ai-suggestions-title">
                <MessageCircle size={18} /> Try asking:
              </p>
              <div className="suggestions-list">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => {
                      setInput(question);
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, index) => (
            <div key={index} className={`chat-bubble-row ${m.role}`}>
              <div className={`chat-bubble ${m.role}`}>
                <p>{m.text}</p>

                {m.matches && m.matches.length > 0 && (
                  <div className="chat-matches">
                    {m.matches.map((match, i) => (
                      <div className="ai-result" key={i}>
                        <h4>
                          {match.name} — {match.bloodGroup} ({match.district})
                        </h4>
                        {match.reason && <p>{match.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-row assistant">
              <div className="chat-bubble assistant chat-typing">
                <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />
                <span style={{ marginLeft: "8px" }}>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-row">
          <input
            type="text"
            className="form-control"
            placeholder="Ask me about donors, blood groups, or your needs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-purple"
            disabled={loading || !input.trim()}
            style={{ gap: "6px" }}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIPage;