const DEVANAGARI_DIGITS = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };

const NUMBER_WORDS = [
  { value: "1", words: ["one", "first", "option a", "option aa", "ek", "एक", "पहला", "पहला", "ए", "a", "alpha"] },
  { value: "2", words: ["two", "second", "option b", "do", "दो", "दूसरा", "बी", "b", "bravo"] },
  { value: "3", words: ["three", "third", "option c", "teen", "तीन", "तीसरा", "सी", "c", "charlie"] },
  { value: "4", words: ["four", "fourth", "option d", "char", "चार", "चौथा", "डी", "d", "delta"] },
  { value: "5", words: ["five", "fifth", "option e", "panch", "पाँच", "पांच", "पाचवा", "ई", "e", "echo"] },
];

const LETTER_KEYS = { a: "a", b: "b", c: "c", d: "d", e: "e" };

function normalize(raw) {
  let text = (raw || "").toLowerCase().trim();
  text = text.replace(/[०-९]/g, (d) => DEVANAGARI_DIGITS[d] || d);
  text = text.replace(/[.,?!;:।]/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function includesAny(text, list) {
  return list.some((item) => text.includes(item));
}

function extractOption(text) {
  for (const row of NUMBER_WORDS) {
    if (row.words.some((word) => new RegExp(`(?:^|\\s)${word}(?:\\s|$)`).test(text))) {
      return row.value;
    }
  }
  const numbered = text.match(/\b([1-5])\b/);
  if (numbered) return numbered[1];
  const letter = text.match(/\boption\s+([a-e])\b/);
  if (letter) return LETTER_KEYS[letter[1]];
  return null;
}

function extractQuestionNumber(text) {
  const match = text.match(/(?:question|prashn|प्रश्न)\s*(\d{1,3})/) || text.match(/\b(\d{1,3})\b/);
  return match ? Number(match[1]) : null;
}

function extractStatement(text) {
  if (includesAny(text, ["statement a", "कथन अ", "कथन ए", " a ", "अ"])) {
    if (includesAny(text, ["statement a", "कथन अ", "कथन ए"])) return "A";
  }
  const match = text.match(/(?:statement|kathan|कथन)\s*([a-dअ-ई1-4])/i);
  if (!match) return null;
  const token = match[1].toUpperCase();
  if (token === "अ" || token === "1") return "A";
  if (token === "ब" || token === "2") return "B";
  if (token === "स" || token === "3") return "C";
  if (token === "द" || token === "4") return "D";
  return token;
}

function extractCharLookup(text) {
  const fromRight = includesAny(text, ["right", "दाएँ", "दाए", "दायें", "end"]);
  const fromLeft = includesAny(text, ["left", "बाएँ", "बाए", "बायें"]);
  const pos = text.match(/(\d{1,2})(?:st|nd|rd|th)?/);
  if (!pos) return null;
  if (!fromRight && !fromLeft && !includesAny(text, ["position", "स्थान", "from the"])) return null;
  return { position: Number(pos[1]), from: fromRight && !fromLeft ? "right" : "left" };
}

export function matchOptionByText(question, utterance) {
  if (!question?.options?.length) return [];
  const needle = cleanAnswer(utterance);
  if (needle.length < 3) return [];
  if (["yes", "yeah", "okay", "please", "sorry", "next", "back", "help", "haan", "skip", "flag", "again"].includes(needle)) return [];

  const scored = question.options
    .map((opt) => ({ opt, score: scoreMatch(cleanAnswer(opt.text), needle) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return [];
  const best = scored[0].score;
  return scored.filter((row) => row.score === best).map((row) => row.opt);
}

function cleanAnswer(raw) {
  return normalize(raw)
    .replace(/^(the answer is|answer is|it is|it's|its|i think|i say|maybe|capital is|उत्तर है|उत्तर|मेरा उत्तर)\s+/u, "")
    .replace(/\b(mr|mrs|dr|shri|smt)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreMatch(hay, needle) {
  if (!hay || !needle) return 0;
  if (hay === needle) return 4;
  if (hay.includes(needle) || needle.includes(hay)) return 3;
  const tokens = needle.split(" ").filter((token) => token.length > 2);
  if (!tokens.length) return 0;
  const hits = tokens.filter((token) => hay.includes(token));
  if (hits.length === tokens.length) return 3;
  if (hits.length >= Math.ceil(tokens.length * 0.7)) return 2;
  return 0;
}

export function parseIntent(raw, context = {}) {
  const text = normalize(raw);
  if (!text) return { type: "EMPTY" };

  if (includesAny(text, ["help", "मदद", "what can you", "क्या कर"])) {
    return { type: "HELP" };
  }

  if (includesAny(text, ["turn off", "scribe off", "बंद कर", "लेखक बंद"])) {
    return { type: "SCRIBE_OFF" };
  }
  if (includesAny(text, ["turn on", "scribe on", "चालू कर", "लेखक चालू"])) {
    return { type: "SCRIBE_ON" };
  }

  if (includesAny(text, [
    "what is the answer", "tell me the answer", "solve", "correct option", "right option", "which is correct",
    "give me a hint", "hint please",
    "उत्तर बता", "हल कर", "सही विकल्प", "सही उत्तर", "क्या उत्तर",
  ]) && !includesAny(text, ["mark", "my answer", "i choose", "answer is", "चिह्नित", "मेरा उत्तर"])) {
    return { type: "REFUSE_SOLVE" };
  }

  if (includesAny(text, ["language", "speak in", "switch to", "भाषा"])) {
    if (includesAny(text, ["hindi", "हिंदी", "हिन्दी"])) return { type: "LANGUAGE", lang: "hi" };
    if (includesAny(text, ["english", "अंग्रेज़ी", "अंग्रेजी"])) return { type: "LANGUAGE", lang: "en" };
  }

  if (context.screen === "papers" || context.screen === "setup") {
    return { type: "SELECT_PAPER", utterance: text };
  }

  if (context.pending === "review" && includesAny(text, ["yes", "yeah", "ok", "okay", "preview", "review", "haan", "हाँ", "हां", "जी", "देखो", "रिव्यू"])) {
    return { type: "REVIEW" };
  }
  if (context.pending === "review" && includesAny(text, ["no", "later", "not now", "nahi", "नहीं", "बाद में", "रुको"])) {
    return { type: "STAY" };
  }

  if (includesAny(text, ["time left", "how much time", "remaining time", "minutes left", "kitna time", "कितना समय", "समय कितना", "टाइम बचा", "how many minutes"])) {
    return { type: "TIME_LEFT" };
  }

  if (includesAny(text, ["review", "preview", "answer sheet", "रिव्यू", "उत्तर पत्रक", "सारे उत्तर", "preview the answers"])) {
    return { type: "REVIEW" };
  }

  if (includesAny(text, [
    "last sentence", "rewind", "what was that", "say that again", "repeat that",
    "पिछली पंक्ति", "दोबारा वो", "वो फिर",
  ])) {
    return { type: "REWIND" };
  }

  if (includesAny(text, ["unflag", "remove flag", "फ्लैग हटा"])) {
    return { type: "UNFLAG" };
  }
  if (includesAny(text, ["flag this", "flag it", "flag for later", "bookmark", "फ्लैग", "बाद में देख"])) {
    if (!includesAny(text, ["flagged", "next flag", "go to flag", "वाले"])) return { type: "FLAG" };
  }

  if (includesAny(text, ["flagged", "next flag", "go to flag", "फ्लैग वाले"])) {
    return { type: "NEXT_FLAGGED" };
  }
  if (includesAny(text, ["unanswered", "not answered", "not marked", "next unanswered", "रिक्त", "नहीं किया", "बाकी प्रश्न"])) {
    return { type: "NEXT_UNANSWERED" };
  }

  if (includesAny(text, ["next section", "section time", "अगला खंड", "सेक्शन"])) {
    if (includesAny(text, ["next", "अगला"])) return { type: "NEXT_SECTION" };
  }
  if (includesAny(text, ["faster", "तेज", "तेज़"])) return { type: "FASTER" };
  if (includesAny(text, ["pause", "stop reading", "रुक", "चुप"])) return { type: "PAUSE" };

  if (includesAny(text, ["go back to", "take me back to", "take me to", "question about", "question on", "question of", "वाले प्रश्न"])) {
    const numbered = extractQuestionNumber(text);
    if (numbered) return { type: "GOTO", number: numbered };
    return { type: "FIND_QUESTION", utterance: text };
  }

  if (includesAny(text, ["previous", "go back", "last question", "पिछला", "पीछे"])) {
    return { type: "PREV" };
  }
  if (includesAny(text, ["skip", "skip this", "skip question", "leave this", "छोड़ो", "छोड़ दो", "स्किप"])) {
    return { type: "SKIP" };
  }
  if (includesAny(text, ["next", "अगला", "आगे"])) {
    return { type: "NEXT" };
  }

  if (includesAny(text, ["go to", "question number", "prashn", "प्रश्न"]) && /\d/.test(text)) {
    const n = extractQuestionNumber(text);
    if (n) return { type: "GOTO", number: n };
  }

  if (includesAny(text, ["unmark", "clear answer", "remove mark", "चिह्न हटा", "हटाओ"])) {
    return { type: "UNMARK" };
  }

  if (includesAny(text, ["what did i mark", "my answer", "current mark", "मैंने क्या", "मेरा उत्तर"])) {
    return { type: "STATUS_CURRENT" };
  }
  if (includesAny(text, ["how many marked", "how many left", "status", "progress", "कितने चिह्नित", "कितने बचे"])) {
    return { type: "STATUS" };
  }

  if (includesAny(text, ["read table", "the table", "तालिका", "describe table"])) {
    return { type: "READ_TABLE" };
  }
  if (includesAny(text, ["theft", "stalking", "assault", "murder", "trespass", "चोरी", "हत्या", "हमला", "हिमाचल", "बिहार", "दिल्ली", "राजस्थान", "हरियाणा", "bihar", "delhi", "himachal", "haryana", "uttar pradesh", "madhya"])) {
    return { type: "LOOKUP_TABLE", utterance: text };
  }

  const charLookup = extractCharLookup(text);
  if (charLookup && includesAny(text, ["arrangement", "string", "character", "from the", "शृंखला", "अक्षर"])) {
    return { type: "LOOKUP_CHAR", ...charLookup };
  }
  if (charLookup && includesAny(text, ["right", "left", "दाएँ", "बाएँ"])) {
    return { type: "LOOKUP_CHAR", ...charLookup };
  }

  if (includesAny(text, ["read arrangement", "the string", "character by character", "शृंखला पढ़"])) {
    return { type: "READ_ARRANGEMENT" };
  }

  if (includesAny(text, ["read statement", "कथन"])) {
    const key = extractStatement(text);
    if (key) return { type: "READ_STATEMENT", key };
    return { type: "READ_STATEMENTS" };
  }
  if (includesAny(text, ["statements", "कथन"])) return { type: "READ_STATEMENTS" };
  if (includesAny(text, ["conclusions", "निष्कर्ष"])) return { type: "READ_CONCLUSIONS" };

  const askingOption = includesAny(text, [
    "what was option", "what is option", "what's option", "whats option",
    "what was", "what is", "what's", "tell me option", "read option", "repeat option",
    "option kya", "kya tha option", "विकल्प क्या", "क्या था विकल्प", "क्या है विकल्प", "क्या था",
  ]);
  const hasOptionWord = includesAny(text, ["option", "विकल्प"]);
  const marking = includesAny(text, ["mark", "choose", "i go with", "i choose", "answer is", "चिह्नित", "चुन", "उत्तर है"]);
  const extracted = extractOption(text);

  if (extracted && (askingOption || (hasOptionWord && !marking))) {
    return { type: "READ_OPTION", key: extracted };
  }

  if (includesAny(text, ["read options", "the options", "विकल्प पढ़ो", "सभी विकल्प"])) {
    return { type: "READ_OPTIONS" };
  }

  if (includesAny(text, ["repeat the question", "read question", "read it", "पढ़ो प्रश्न", "प्रश्न पढ़ो", "पढ़िए"])) {
    return { type: "READ_QUESTION" };
  }
  if (includesAny(text, ["repeat", "again", "दोहरा", "फिर से"])) {
    return { type: "REWIND" };
  }

  if (includesAny(text, ["change to", "change option", "बदल"])) {
    if (extracted) return { type: "MARK", key: extracted, changed: true };
  }

  if (includesAny(text, ["none of these", "none of the these", "इनमें से कोई नहीं", "इनमे से कोई नहीं"])) {
    return { type: "MARK_NONE" };
  }

  if (marking && extracted) {
    return { type: "MARK", key: extracted };
  }

  if (extracted && text.split(" ").length <= 3 && !hasOptionWord) {
    return { type: "MARK", key: extracted };
  }

  return { type: "MATCH_OPTION", utterance: text };
}
