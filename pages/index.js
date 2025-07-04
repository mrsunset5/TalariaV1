import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const zodiacThemes = {
  aries: "bg-red-900",
  taurus: "bg-green-900",
  gemini: "bg-yellow-800",
  cancer: "bg-blue-900",
  leo: "bg-orange-900",
  virgo: "bg-emerald-800",
  libra: "bg-pink-900",
  scorpio: "bg-purple-900",
  sagittarius: "bg-amber-900",
  capricorn: "bg-gray-800",
  aquarius: "bg-cyan-900",
  pisces: "bg-indigo-900",
  unknown: "bg-black"
};

const sigils = {
  aries: "\u{2648}",
  taurus: "\u{2649}",
  gemini: "\u{264A}",
  cancer: "\u{264B}",
  leo: "\u{264C}",
  virgo: "\u{264D}",
  libra: "\u{264E}",
  scorpio: "\u{264F}",
  sagittarius: "\u{2650}",
  capricorn: "\u{2651}",
  aquarius: "\u{2652}",
  pisces: "\u{2653}",
  unknown: "\u{26B2}"
};

const zodiacTextStyles = {
  aries: "text-red-300 italic",
  taurus: "text-green-300",
  gemini: "text-yellow-200 underline",
  cancer: "text-blue-300",
  leo: "text-orange-300 font-bold",
  virgo: "text-emerald-200",
  libra: "text-pink-200 italic",
  scorpio: "text-purple-300 tracking-wider",
  sagittarius: "text-amber-200",
  capricorn: "text-gray-300 uppercase",
  aquarius: "text-cyan-200",
  pisces: "text-indigo-200",
  unknown: "text-white"
};

const ritualPhrases = [
  "open the vault",
  "show me my pulse",
  "summon the mirror",
  "diagnose emotion",
  "invoke fragment"
];

const emotionalDiagnostics = [
  { keyword: "anxious", tag: "🫀 Alert: Anxiety signature detected." },
  { keyword: "tired", tag: "🫧 Note: Fatigue pulse recorded." },
  { keyword: "lonely", tag: "🌑 Shadow present: Loneliness." },
  { keyword: "hopeful", tag: "✨ Light signature: Hope rising." },
  { keyword: "angry", tag: "🔥 Trigger registered: Anger heat rising." }
];

export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentTier, setConsentTier] = useState("default");
  const [zodiacSign, setZodiacSign] = useState("unknown");
  const messageEndRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("clareMemory");
    if (stored) setMsgs(JSON.parse(stored));

    const tier = localStorage.getItem("clareConsentTier") || "default";
    setConsentTier(tier);

    const sign = localStorage.getItem("clareZodiacSign") || "unknown";
    setZodiacSign(sign);
  }, []);

  useEffect(() => {
    localStorage.setItem("clareMemory", JSON.stringify(msgs));
    scrollToBottom();
  }, [msgs]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleConsentCommand = (text) => {
    const lowered = text.toLowerCase();
    if (lowered.startsWith("tier:")) {
      const newTier = lowered.split(":")[1].trim();
      setConsentTier(newTier);
      localStorage.setItem("clareConsentTier", newTier);
      setMsgs([...msgs, { role: "user", content: text }, { role: "assistant", content: `Consent tier set to **${newTier}**.` }]);
      return true;
    }
    return false;
  };

  const handleZodiacCommand = (text) => {
    const lowered = text.toLowerCase();
    if (lowered.startsWith("zodiac:")) {
      const newSign = lowered.split(":")[1].trim();
      setZodiacSign(newSign);
      localStorage.setItem("clareZodiacSign", newSign);
      setMsgs([...msgs, { role: "user", content: text }, { role: "assistant", content: `Zodiac sign set to **${newSign}**.` }]);
      return true;
    }
    return false;
  };

  const detectRitual = (text) => {
    const match = ritualPhrases.find(phrase => text.toLowerCase().includes(phrase));
    if (match) {
      setMsgs([...msgs, { role: "user", content: text }, { role: "assistant", content: `\u2728 Ritual phrase detected: *${match}*. Vault linkage activated.` }]);
      return true;
    }
    return false;
  };

  const detectEmotion = (text) => {
    const match = emotionalDiagnostics.find(e => text.toLowerCase().includes(e.keyword));
    if (match) {
      setMsgs([...msgs, { role: "user", content: text }, { role: "assistant", content: match.tag }]);
      return true;
    }
    return false;
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    if (
      handleConsentCommand(input.trim()) ||
      handleZodiacCommand(input.trim()) ||
      detectRitual(input.trim()) ||
      detectEmotion(input.trim())
    ) {
      setInput("");
      return;
    }

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
        body: JSON.stringify({ messages: updatedMessages, consentTier, zodiacSign })
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
    const zodiacStyle = zodiacTextStyles[zodiacSign] || "text-white";
    return (
      <motion.div key={i} className={isUser ? "text-right" : "text-left"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className={`inline-block p-3 rounded-2xl shadow-lg max-w-lg ${isUser ? "bg-indigo-700" : zodiacThemes[zodiacSign]} ${zodiacStyle}`}
             dangerouslySetInnerHTML={{ __html: content }} />
        <div className="text-xs text-gray-400 mt-1">{timestamp}</div>
      </motion.div>
    );
  };

  return (
    <div className={`h-screen text-white flex flex-col ${zodiacThemes[zodiacSign]}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">ClareVOne // Ritual Interface</h1>
        <div className="text-sm text-gray-400">{sigils[zodiacSign]} Tier: {consentTier} | Zodiac: {zodiacSign}</div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-xl"
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
          className="flex-grow p-2 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={loading ? "Clare is responding..." : "Speak to Clare..."}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading}
          className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white shadow-md"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
