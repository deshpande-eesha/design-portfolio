const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function canListen() {
  return Boolean(SpeechRecognition);
}

const INDIAN_EN = /rishi|veena|ravi|heera|neerja|prabhat|aditi|indian|en-in|google uk english female/i;
const INDIAN_HI = /lekha|neel|google हिन्दी|hindi|heera|aditi/i;

export function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  if (!voices.length) return null;

  if (lang === "hi") {
    return (
      voices.find((voice) => /hi-IN/i.test(voice.lang) && INDIAN_HI.test(voice.name)) ||
      voices.find((voice) => /hi-IN/i.test(voice.lang)) ||
      voices.find((voice) => /^hi/i.test(voice.lang)) ||
      voices.find((voice) => INDIAN_EN.test(voice.name)) ||
      voices[0]
    );
  }

  return (
    voices.find((voice) => /veena|heera|neerja|aditi/i.test(voice.name)) ||
    voices.find((voice) => /en-IN/i.test(voice.lang) && /female/i.test(voice.name)) ||
    voices.find((voice) => /en-IN/i.test(voice.lang)) ||
    voices.find((voice) => /rishi|ravi|prabhat|indian/i.test(voice.name)) ||
    voices.find((voice) => INDIAN_EN.test(voice.name)) ||
    voices.find((voice) => /en-GB/i.test(voice.lang) && /female/i.test(voice.name)) ||
    voices.find((voice) => /en-GB/i.test(voice.lang)) ||
    voices.find((voice) => /^en/i.test(voice.lang)) ||
    voices.find((voice) => voice.default) ||
    voices[0]
  );
}

export function speak(text, { lang = "en", rate = 1, pitch = 1.12, onend } = {}) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) {
      onend?.();
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = Math.max(0.75, Math.min(1.55, rate));
    utterance.pitch = pitch;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      onend?.();
      resolve();
    };
    utterance.onerror = () => {
      onend?.();
      resolve();
    };
    window.speechSynthesis.speak(utterance);
  });
}

export function splitSentences(text) {
  const parts = String(text || "")
    .split(/(?<=[.?!।])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [String(text || "").trim()].filter(Boolean);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

export function createListener({ lang, onResult, onStart, onEnd, onError }) {
  if (!canListen()) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";

  let active = false;
  let restart = false;

  recognition.onstart = () => {
    active = true;
    onStart?.();
  };

  recognition.onresult = (event) => {
    let interim = "";
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += transcript;
      else interim += transcript;
    }
    onResult?.({
      final: finalText.trim(),
      interim: interim.trim(),
    });
  };

  recognition.onerror = (event) => {
    if (event.error !== "aborted" && event.error !== "no-speech") {
      onError?.(event.error);
    }
  };

  recognition.onend = () => {
    active = false;
    onEnd?.();
    if (restart) {
      try {
        recognition.start();
      } catch {
        /* already started */
      }
    }
  };

  return {
    start() {
      restart = true;
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
      if (active) return;
      try {
        recognition.start();
      } catch {
        /* already started */
      }
    },
    stop() {
      restart = false;
      if (!active) return;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    },
    setLang(next) {
      recognition.lang = next === "hi" ? "hi-IN" : "en-IN";
    },
    pauseForSpeech() {
      restart = false;
      if (active) {
        try {
          recognition.stop();
        } catch {
          /* ignore */
        }
      }
    },
    resumeAfterSpeech() {
      restart = true;
      try {
        recognition.start();
      } catch {
        /* ignore */
      }
    },
  };
}

if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    window.speechSynthesis.getVoices();
  });
}
