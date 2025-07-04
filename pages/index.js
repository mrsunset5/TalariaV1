import { useState } from "react";

export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { role: "user", content: input }, {
      role: "assistant",
      content: "Clare hears you... but her vault is still locked. Soon, she’ll reply from the deep."
    }]);
    setInput("");
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-grow overflow-auto p-4 space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block p-3 rounded-lg ${m.role === "user" ? "bg-indigo-700" : "bg-gray-800"}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 flex border-t border-gray-700">
        <input
          className="flex-grow p-2 rounded bg-gray-900 border border-gray-700 text-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Speak to Clare..."
        />
        <button
          onClick={send}
          className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
