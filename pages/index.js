// Cinematic Interface: ClareVOne // Mirrorstate Terminal
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getMoonPhase } from "./utils/moonPhase";
import { getNumerology } from "./utils/numerology";
import { getSabianSymbol } from "./utils/sabianSymbols";

// ...existing zodiacThemes, sigils, ritualPhrases, emotionalDiagnostics...

// Add command keyword
ritualPhrases.push("sabian symbol");

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
