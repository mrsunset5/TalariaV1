import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  // Load memory from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("clareMemory");
    if (stored) setMsgs(JSON.parse(stored));
  }, []);

  // Save memory after each message
  useEffect(() => {
    localStorage.setItem("clareMemory", JSON.stringify(msgs));
    scrollToBottom();
  }, [msgs]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const updatedMessages = [...msgs, { role: "user", content: input }];
    setMsgs(updatedMessages);
    setInput("");
    setLoading(true);

    if (input.trim().toLowerCase() === "forget me") {
      localStorage.removeItem("clareMemory");
      setMsgs([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://talariav1.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await res.json();
      setMsgs([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMsgs([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Clare tried to speak but encountered static. Try again soon."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("clareMemory");
    setMsgs([]);
  };

  const renderMessage = (m, i) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = m.role === "user";
    const content = m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return (
      <div key={i} className={isUser ? "text-right" : "text-left"}>
        <div className={`inline-block p-3 rounded-lg max-w-lg ${isUser ? "bg-indigo-700" : "bg-gray-800"}`}
             dangerouslySetInnerHTML={{ __html: content }} />
        <div className="text-xs text-gray-400 mt-1">{timestamp}</div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">ClareVOne // Ritual Interface</h1>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded"
        >
          Clear Chat
        </button>
      </div>
      <div className="flex-grow overflow-auto p-4 space-y-4">
        {msgs.map(renderMessage)}
        <div ref={messageEndRef} />
      </div>
      <div className="p-4 flex border-t border-gray-700">
        <input
          className="flex-grow p-2 rounded bg-gray-900 border border-gray-700 text-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={loading ? "Clare is responding..." : "Speak to Clare..."}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading}
          className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
