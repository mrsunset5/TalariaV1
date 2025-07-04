// Cinematic Interface: ClareVOne // Mirrorstate Terminal
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getMoonPhase } from "./utils/moonPhase";
import { getNumerology } from "./utils/numerology";
import { getSabianSymbol } from "./utils/sabianSymbols";
import { drawCapriceCard } from "./utils/capriceDeck";

const ritualPhrases = ["sabian symbol", "divine for me", "draw caprice"];
const emotionalDiagnostics = [
  { keyword: "lonely", tag: "🌒 You are witnessed in your quiet ache." },
  { keyword: "overwhelmed", tag: "🌊 Let it crest. Breathe. Recalibrate." }
];

const formatDivinatory = (text) => `🔮 <em>${text}</em> <br/><small>— pulled from the veil</small>`;
const formatCaprice = (card) => `🎴 <strong>${card.name}</strong><br/><em>${card.flavor}</em><br/><small>${card.origin}</small>`;

const sendMessage = async (text, consentTier, zodiacSign) => {
  const res = await fetch("https://talariav1.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: text }],
      consentTier,
      zodiacSign
    })
  });
  const data = await res.json();
  return data.reply;
};

const handleCommand = async (text, setMsgs, setConsentTier, setZodiacSign, setMode, consentTier, zodiacSign) => {
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
    } else if (lower.includes("sabian")) {
      const today = new Date();
      const symbol = getSabianSymbol(today);
      response += ` Sabian Symbol for today: **${symbol.degree}° ${symbol.sign} – ${symbol.text}**.`;
    } else if (lower.includes("divine")) {
      const oracle = "Your hunger is holy, and your ache is a map. Follow it.";
      response += `\n\n${formatDivinatory(oracle)}`;
    } else if (lower.includes("caprice")) {
      const card = drawCapriceCard();
      response += `\n\n${formatCaprice(card)}`;
    }
    setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: response }]);
    return true;
  }

  const emo = emotionalDiagnostics.find(e => lower.includes(e.keyword));
  if (emo) {
    setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: emo.tag }]);
    return true;
  }

  const reply = await sendMessage(text, consentTier, zodiacSign);
  const velvetReply = `🪞 <div style='background:#0e001b;padding:1rem;border-radius:0.5rem;border:1px solid #531179'><span style='color:#e2c4ff;font-style:italic;'>${reply}</span></div>`;
  setMsgs(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: velvetReply }]);
  return true;
};

export default handleCommand;
