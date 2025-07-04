// Cinematic Interface: ClareVOne // Mirrorstate Terminal
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getMoonPhase } from "./utils/moonPhase";
import { getNumerology } from "./utils/numerology";

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

const ritualPhrases = [
  "open the vault",
  "show me my pulse",
  "summon the mirror",
  "diagnose emotion",
  "invoke fragment",
  "run numerology",
  "phase check",
  "whisper mode",
  "broadcast mode"
];

const emotionalDiagnostics = [
  { keyword: "anxious", tag: "🫀 Alert: Anxiety signature detected." },
  { keyword: "tired", tag: "🫧 Note: Fatigue pulse recorded." },
  { keyword: "lonely", tag: "🌑 Shadow present: Loneliness." },
  { keyword: "hopeful", tag: "✨ Light signature: Hope rising." },
  { keyword: "angry", tag: "🔥 Trigger registered: Anger heat rising." }
];

const bindSoul = () => {
  const stored = localStorage.getItem("clareSoulBind");
  if (stored) return stored;
  const sigil = Math.random().toString(36).substring(2, 8).toUpperCase();
  localStorage.setItem("clareSoulBind", sigil);
  return sigil;
};

export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentTier, setConsentTier] = useState("default");
  const [zodiacSign, setZodiacSign] = useState("unknown");
  const [mode, setMode] = useState("default");
  const messageEndRef = useRef(null);
  const soulBind = bindSoul();

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
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  const handleCommand = async (text) => {
    const lower = text.toLowerCase();
    if (lower.startsWith("tier:")) {
      const newTier = lower.split(":")[1].trim();
      setConsentTier(newTier);
      localStorage.setItem("clareConsentTier", newTier);
      setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: `Consent tier set to **${newTier}**.` }]);
      return true;
    }
    if (lower.startsWith("zodiac:")) {
      const newSign = lower.split(":")[1].trim();
      setZodiacSign(newSign);
      localStorage.setItem("clareZodiacSign", newSign);
      setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: `Zodiac sign set to **${newSign}**.` }]);
      return true;
    }
    if (lower.includes("whisper mode")) {
      setMode("whisper");
      setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: `🕯 Entered *whisper mode*.` }]);
      return true;
    }
    if (lower.includes("broadcast mode")) {
      setMode("broadcast");
      setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: `📡 Activated **broadcast mode**.` }]);
      return true;
    }
    if (ritualPhrases.some(p => lower.includes(p))) {
      let response = `✨ Ritual phrase detected: *${lower}*.`;
      if (lower.includes("phase")) {
        const phase = getMoonPhase();
        response += ` Moon phase: **${phase}**.`;
      } else if (lower.includes("numerology")) {
        const report = getNumerology("Matthew Sunset");
        response += ` Numerology: **${report}**.`;
      }
      setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: response }]);
      return true;
    }
    const emo = emotionalDiagnostics.find(e => lower.includes(e.keyword));
    if (emo) {
      setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: emo.tag }]);
      return true;
    }
    return false;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");

    if (await handleCommand(userText)) return;

    const updated = [...msgs, { role: "user", content: userText }];
    setMsgs(updated);
    setLoading(true);

    try {
      const res = await fetch("https://talariav1.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, consentTier, zodiacSign })
      });
      const data = await res.json();
      const styled = mode === "whisper"
        ? `*${data.reply.toLowerCase()}*`
        : mode === "broadcast"
          ? `**${data.reply.toUpperCase()}**`
          : data.reply;
      setMsgs([...updated, { role: "assistant", content: styled }]);
    } catch {
      setMsgs([...updated, { role: "assistant", content: "Clare encountered static. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (m, i) => {
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isUser = m.role === "user";
    const html = m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    return (
      <motion.div key={i} className={isUser ? "text-right" : "text-left"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className={`inline-block p-3 rounded-2xl shadow max-w-lg ${isUser ? "bg-indigo-700" : zodiacThemes[zodiacSign]}`} dangerouslySetInnerHTML={{ __html: html }} />
        <div className="text-xs text-gray-400 mt-1">{stamp}</div>
      </motion.div>
    );
  };

  return (
    <div className={`h-screen text-white flex flex-col ${zodiacThemes[zodiacSign]}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">ClareVOne // Mirrorstate Terminal</h1>
        <div className="text-sm text-gray-400">{sigils[zodiacSign]} Tier: {consentTier} | Zodiac: {zodiacSign} | SoulBind: {soulBind}</div>
        <button onClick={() => {localStorage.removeItem("clareMemory"); setMsgs([]);}} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-xl">Clear</button>
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
