// Cinematic Interface: ClareVOne // Mirrorstate Terminal
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getMoonPhase } from "./utils/moonPhase";
import { getNumerology } from "./utils/numerology";
import { getSabianSymbol } from "./utils/sabianSymbols";
import { drawCapriceCard } from "./utils/capriceDeck";

// ...existing zodiacThemes, sigils, ritualPhrases, emotionalDiagnostics...

// Add command keyword
ritualPhrases.push("sabian symbol");
ritualPhrases.push("divine for me");
ritualPhrases.push("draw caprice");

const formatDivinatory = (text) => {
  return `🔮 <em>${text}</em> \n <small>— pulled from the veil</small>`;
};

const formatCaprice = (card) => {
  return `🎴 <strong>${card.name}</strong><br/><em>${card.flavor}</em><br/><small>${card.origin}</small>`;
};

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
  return false;
};
