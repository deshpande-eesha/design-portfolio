export const PAPERS = [
  {
    id: "ga-english",
    aliases: ["general awareness", "ga", "sbi clerk", "english paper", "awareness", "clerical"],
    title: "SBI Clerk · General Awareness 2008",
    titleHi: "एसबीआई क्लर्क · सामान्य ज्ञान 2008",
    subject: "General Awareness",
    language: "en",
    source: "SBI clerical staff recruitment sample",
    image: "papers/ga-english.png",
    blurb: "Six banking and current-affairs questions, including a multi-statement item.",
    blurbHi: "बैंकिंग और करंट अफेयर्स के छह प्रश्न, एक बहु-कथन प्रश्न सहित।",
    durationMinutes: 10,
    sections: [
      { id: "ga", name: "General Awareness", nameHi: "सामान्य ज्ञान", from: 1, to: 6, minutes: 10 },
    ],
    questions: [
      {
        number: 1,
        stem: "Who amongst the following is the Head of the RBI at present?",
        options: [
          { key: "1", text: "Mr. K. V. Kamath" },
          { key: "2", text: "Dr. Y. V. Reddy" },
          { key: "3", text: "Mr. N. R. Narayanamurthy" },
          { key: "4", text: "Mr. O. P. Bhatt" },
          { key: "5", text: "None of these" },
        ],
      },
      {
        number: 2,
        stem: "India has different categories of commercial banks. Which of the following is not one such category?",
        options: [
          { key: "1", text: "Private Banks" },
          { key: "2", text: "Commodity Banks" },
          { key: "3", text: "Nationalised Banks" },
          { key: "4", text: "Co-operative Banks" },
          { key: "5", text: "Foreign Banks" },
        ],
      },
      {
        number: 3,
        stem: "The Securities and Exchange Board of India (SEBI) recently imposed a restriction on money flow in equity through P-Notes. What is the full form of P-Notes?",
        options: [
          { key: "1", text: "Permanent Notes" },
          { key: "2", text: "Purchase Notes" },
          { key: "3", text: "Participatory Notes" },
          { key: "4", text: "Private Notes" },
          { key: "5", text: "None of these" },
        ],
      },
      {
        number: 4,
        stem: "Who amongst the following was the Captain of the Indian cricket team which won the Twenty20 World Cup 2007?",
        options: [
          { key: "1", text: "Yuvraj Singh" },
          { key: "2", text: "M. S. Dhoni" },
          { key: "3", text: "Rahul Dravid" },
          { key: "4", text: "Sourav Ganguly" },
          { key: "5", text: "None of these" },
        ],
      },
      {
        number: 5,
        stem: "The money which the Government of India spends on the development of infrastructure in the country comes from which of the following sources? Pick up the correct statement or statements.",
        statements: [
          { key: "A", text: "Loan from World Bank, ADB, etc." },
          { key: "B", text: "Taxes collected from the people." },
          { key: "C", text: "Loan from the RBI." },
        ],
        options: [
          { key: "1", text: "Only A" },
          { key: "2", text: "Only B" },
          { key: "3", text: "Only C" },
          { key: "4", text: "Both A and B" },
          { key: "5", text: "All A, B and C" },
        ],
      },
      {
        number: 6,
        stem: "Which of the following organisations or agencies has established a fund known as Investor Protection Fund?",
        options: [
          { key: "1", text: "SEBI" },
          { key: "2", text: "NABARD" },
          { key: "3", text: "Bombay Stock Exchange" },
          { key: "4", text: "Ministry of Health" },
          { key: "5", text: "None of these" },
        ],
      },
    ],
  },
  {
    id: "ga-hindi",
    aliases: ["hindi", "hindi paper", "सामान्य", "सचेतता", "हिंदी", "हिन्दी पेपर", "kd campus"],
    title: "सामान्य सचेतता",
    titleHi: "सामान्य सचेतता",
    subject: "General Awareness",
    language: "hi",
    source: "KD Campus sample",
    image: "papers/ga-hindi.png",
    blurb: "Hindi general awareness with five-option MCQs.",
    blurbHi: "पाँच विकल्पों वाले हिंदी सामान्य सचेतता प्रश्न।",
    durationMinutes: 10,
    sections: [
      { id: "ga", name: "General Awareness", nameHi: "सामान्य सचेतता", from: 1, to: 8, minutes: 10 },
    ],
    questions: [
      {
        number: 1,
        stem: "गुजरात की तत्कालीन मुख्यमंत्री श्रीमती आनंदीबेन पटेल ने 'उजाला योजना' का शुभारंभ किस शहर से किया?",
        options: [
          { key: "1", text: "राजकोट" },
          { key: "2", text: "अहमदाबाद" },
          { key: "3", text: "गांधीनगर" },
          { key: "4", text: "सूरत" },
          { key: "5", text: "वडोदरा" },
        ],
      },
      {
        number: 2,
        stem: "निम्नलिखित में से कौन-सा संस्थान भारत में मौद्रिक नीति का निर्धारण करता है?",
        options: [
          { key: "1", text: "वित्त मंत्रालय" },
          { key: "2", text: "नीति आयोग" },
          { key: "3", text: "भारतीय रिज़र्व बैंक" },
          { key: "4", text: "सेबी" },
          { key: "5", text: "नाबार्ड" },
        ],
      },
      {
        number: 3,
        stem: "G7 समूह में निम्नलिखित में से कौन-सा देश शामिल नहीं है?",
        options: [
          { key: "1", text: "जापान" },
          { key: "2", text: "कनाडा" },
          { key: "3", text: "भारत" },
          { key: "4", text: "फ्रांस" },
          { key: "5", text: "इटली" },
        ],
      },
      {
        number: 4,
        stem: "'मुद्रास्फीति जनित मंदी' किसे कहते हैं?",
        options: [
          { key: "1", text: "जब मुद्रास्फीति और आर्थिक मंदी एक साथ हों" },
          { key: "2", text: "जब केवल कीमतें गिर रही हों" },
          { key: "3", text: "जब केवल बेरोज़गारी घट रही हो" },
          { key: "4", text: "जब राजकोषीय घाटा शून्य हो" },
          { key: "5", text: "इनमें से कोई नहीं" },
        ],
      },
      {
        number: 5,
        stem: "खोंगजोम दिवस किस राज्य में मनाया जाता है?",
        options: [
          { key: "1", text: "नगालैंड" },
          { key: "2", text: "मणिपुर" },
          { key: "3", text: "मिजोरम" },
          { key: "4", text: "त्रिपुरा" },
          { key: "5", text: "असम" },
        ],
      },
      {
        number: 6,
        stem: "शेयर बाज़ार में किसी प्रतिभूति के मूल्य निर्धारण की तिथि को ______ कहते हैं।",
        options: [
          { key: "1", text: "निपटान तिथि" },
          { key: "2", text: "मूल्यांकन तिथि" },
          { key: "3", text: "रिकॉर्ड तिथि" },
          { key: "4", text: "सूचीबद्धता तिथि" },
          { key: "5", text: "परिपक्वता तिथि" },
        ],
      },
      {
        number: 7,
        stem: "किस संस्था ने निवेशक संरक्षण निधि की स्थापना की है?",
        options: [
          { key: "1", text: "सेबी" },
          { key: "2", text: "नाबार्ड" },
          { key: "3", text: "बॉम्बे स्टॉक एक्सचेंज" },
          { key: "4", text: "स्वास्थ्य मंत्रालय" },
          { key: "5", text: "इनमें से कोई नहीं" },
        ],
      },
      {
        number: 8,
        stem: "भारतीय रिज़र्व बैंक का मुख्यालय कहाँ स्थित है?",
        options: [
          { key: "1", text: "नई दिल्ली" },
          { key: "2", text: "कोलकाता" },
          { key: "3", text: "मुंबई" },
          { key: "4", text: "चेन्नई" },
          { key: "5", text: "हैदराबाद" },
        ],
      },
    ],
  },
  {
    id: "maths",
    aliases: ["maths", "math", "mathematics", "sbi maths", "di", "table", "गणित", "क्वांट", "quant"],
    title: "SBI Clerk Prelims · Maths",
    titleHi: "एसबीआई क्लर्क प्रीलिम्स · गणित",
    subject: "Quantitative Aptitude",
    language: "en",
    source: "Memory-based SBI Clerk prelims maths",
    image: "papers/maths.png",
    blurb: "Simplification, a crime-statistics table, and word problems.",
    blurbHi: "सरलीकरण, अपराध आँकड़ों की तालिका, और शब्द समस्याएँ।",
    durationMinutes: 20,
    sections: [
      { id: "simp", name: "Simplification", nameHi: "सरलीकरण", from: 36, to: 40, minutes: 8 },
      { id: "di", name: "Data Interpretation", nameHi: "डेटा व्याख्या", from: 41, to: 45, minutes: 8 },
      { id: "word", name: "Word problems", nameHi: "शब्द समस्याएँ", from: 51, to: 55, minutes: 4 },
    ],
    questions: [
      {
        number: 36,
        directions:
          "Directions (36–40): What should come in place of the question mark in the following questions?",
        stem: "7/9 of 58 + 3/7 of 139.2 = ?",
        speak: "7 by 9 of 58, plus 3 by 7 of 139.2, equals question mark.",
        options: [
          { key: "a", text: "105.2" },
          { key: "b", text: "108.4" },
          { key: "c", text: "112.6" },
          { key: "d", text: "98.8" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 37,
        stem: "12% of 555 + 15% of 666 = ?",
        speak: "12 percent of 555 plus 15 percent of 666 equals question mark.",
        options: [
          { key: "a", text: "166.5" },
          { key: "b", text: "166.6" },
          { key: "c", text: "167.5" },
          { key: "d", text: "168.6" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 38,
        stem: "45678 + 34567 − 23456 − 12345 = ?",
        speak: "45678 plus 34567 minus 23456 minus 12345 equals question mark.",
        options: [
          { key: "a", text: "44444" },
          { key: "b", text: "44544" },
          { key: "c", text: "44344" },
          { key: "d", text: "45444" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 39,
        stem: "33^7.8 × 33^1.2 ÷ 33^5 = 33 × 33^?",
        speak: "33 to the power 7.8, times 33 to the power 1.2, divided by 33 to the power 5, equals 33 times 33 to the power question mark.",
        options: [
          { key: "a", text: "2" },
          { key: "b", text: "3" },
          { key: "c", text: "4" },
          { key: "d", text: "1.8" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 40,
        stem: "√2601 = ?",
        speak: "Square root of 2601 equals question mark.",
        options: [
          { key: "a", text: "41" },
          { key: "b", text: "49" },
          { key: "c", text: "51" },
          { key: "d", text: "53" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 41,
        directions:
          "Directions (41–45): Study the following table carefully and answer the questions. The number of various crimes, as supplied by the national crime record, reported in different states in the year 2012–13.",
        stem: "What is the total number of theft cases reported in HP and Delhi together?",
        table: "crimes-2012",
        options: [
          { key: "a", text: "35724" },
          { key: "b", text: "36724" },
          { key: "c", text: "34724" },
          { key: "d", text: "37724" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 42,
        stem: "The number of murder cases in UP is approximately what percent of the murder cases in Bihar?",
        table: "crimes-2012",
        options: [
          { key: "a", text: "120%" },
          { key: "b", text: "140%" },
          { key: "c", text: "160%" },
          { key: "d", text: "180%" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 43,
        stem: "What is the average number of stalking cases in all the states together?",
        table: "crimes-2012",
        options: [
          { key: "a", text: "1973" },
          { key: "b", text: "1998" },
          { key: "c", text: "2010" },
          { key: "d", text: "2048" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 44,
        stem: "The number of assault cases in MP is how much more than the assault cases in Haryana?",
        table: "crimes-2012",
        options: [
          { key: "a", text: "6800" },
          { key: "b", text: "7000" },
          { key: "c", text: "7200" },
          { key: "d", text: "7400" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 45,
        stem: "Which state reported the highest number of criminal trespass cases?",
        table: "crimes-2012",
        options: [
          { key: "a", text: "UP" },
          { key: "b", text: "Bihar" },
          { key: "c", text: "Rajasthan" },
          { key: "d", text: "MP" },
          { key: "e", text: "Delhi" },
        ],
      },
      {
        number: 51,
        stem: "A mixture contains milk and water in the ratio 5 : 3. If 16 litres of the mixture is replaced by water, the ratio becomes 3 : 5. Find the original quantity of the mixture.",
        options: [
          { key: "a", text: "40 litres" },
          { key: "b", text: "48 litres" },
          { key: "c", text: "56 litres" },
          { key: "d", text: "64 litres" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 52,
        stem: "Simple interest on a sum for 3 years at 8% per annum is 2400 rupees. What is the principal?",
        speak: "Simple interest on a sum for 3 years at 8 percent per annum is 2400 rupees. What is the principal?",
        options: [
          { key: "a", text: "8000 rupees" },
          { key: "b", text: "9000 rupees" },
          { key: "c", text: "10000 rupees" },
          { key: "d", text: "12000 rupees" },
          { key: "e", text: "None of these" },
        ],
      },
      {
        number: 53,
        stem: "4 men and 3 women finish a job in 6 days. 2 men and 4 women finish the same job in 8 days. How long will 1 man and 1 woman take to do the work?",
        options: [
          { key: "a", text: "120/7 days" },
          { key: "b", text: "168/11 days" },
          { key: "c", text: "24 days" },
          { key: "d", text: "18 days" },
          { key: "e", text: "None of these" },
        ],
      },
    ],
    tables: {
      "crimes-2012": {
        title: "Crimes reported in different states, 2012–13",
        columns: [
          { id: "stalking", label: "Stalking", labels: ["stalking", "स्टॉकिंग"] },
          { id: "assault", label: "Assault", labels: ["assault", "हमला"] },
          { id: "theft", label: "Theft", labels: ["theft", "thefts", "चोरी"] },
          { id: "murder", label: "Murder", labels: ["murder", "हत्या"] },
          { id: "trespass", label: "Criminal Trespass", labels: ["trespass", "criminal trespass", "अतिचार"] },
        ],
        rows: [
          { id: "bihar", label: "Bihar", labels: ["bihar", "बिहार"], stalking: 2145, assault: 8732, theft: 18450, murder: 3210, trespass: 1560 },
          { id: "mp", label: "MP", labels: ["mp", "m p", "madhya pradesh", "मध्य प्रदेश"], stalking: 1980, assault: 12400, theft: 22100, murder: 2890, trespass: 2100 },
          { id: "up", label: "UP", labels: ["up", "u p", "uttar pradesh", "उत्तर प्रदेश"], stalking: 3420, assault: 15600, theft: 31240, murder: 5120, trespass: 3400 },
          { id: "hp", label: "HP", labels: ["hp", "h p", "himachal", "himachal pradesh", "हिमाचल"], stalking: 890, assault: 2100, theft: 12224, murder: 340, trespass: 780 },
          { id: "ap", label: "AP", labels: ["ap", "a p", "andhra", "andhra pradesh", "आंध्र"], stalking: 1670, assault: 9800, theft: 19800, murder: 2100, trespass: 1450 },
          { id: "delhi", label: "Delhi", labels: ["delhi", "दिल्ली"], stalking: 2560, assault: 6700, theft: 24500, murder: 890, trespass: 1120 },
          { id: "haryana", label: "Haryana", labels: ["haryana", "हरियाणा"], stalking: 1340, assault: 5400, theft: 16700, murder: 1560, trespass: 980 },
          { id: "rajasthan", label: "Rajasthan", labels: ["rajasthan", "राजस्थान"], stalking: 1780, assault: 7200, theft: 18900, murder: 2340, trespass: 1670 },
        ],
      },
    },
  },
  {
    id: "reasoning",
    aliases: ["reasoning", "logic", "po", "sbi po", "रीज़निंग", "तर्क"],
    title: "SBI PO · Reasoning 2008",
    titleHi: "एसबीआई पीओ · रीज़निंग 2008",
    subject: "Reasoning",
    language: "en",
    source: "State Bank Probationary Officers' Exam, July 2008",
    image: "papers/reasoning.png",
    blurb: "Coding, a character string, and a syllogism — the hard reading cases.",
    blurbHi: "कोडिंग, अक्षर शृंखला, और न्यायवाक्य — कठिन पठन वाले प्रश्न।",
    durationMinutes: 15,
    sections: [
      { id: "puzzles", name: "Puzzles", nameHi: "पहेली", from: 1, to: 16, minutes: 10 },
      { id: "syllogism", name: "Syllogism", nameHi: "न्यायवाक्य", from: 17, to: 22, minutes: 5 },
    ],
    questions: [
      {
        number: 1,
        stem: "If 'white' is called 'blue', 'blue' is called 'red', 'red' is called 'yellow', 'yellow' is called 'green', 'green' is called 'black', 'black' is called 'violet' and 'violet' is called 'orange', what would be the colour of a clear sky?",
        options: [
          { key: "1", text: "Orange" },
          { key: "2", text: "Red" },
          { key: "3", text: "Black" },
          { key: "4", text: "Green" },
          { key: "5", text: "Yellow" },
        ],
      },
      {
        number: 8,
        stem: "Four of the following five are alike in a certain way and so form a group. Which is the one that does not belong to that group?",
        options: [
          { key: "1", text: "Saucer" },
          { key: "2", text: "Mug" },
          { key: "3", text: "Pitcher" },
          { key: "4", text: "Jar" },
          { key: "5", text: "Bowl" },
        ],
      },
      {
        number: 11,
        directions:
          "Directions (11–16): These questions are based on the following arrangement of letters, numbers and symbols.",
        stem: "Which of the following is the eleventh from the right end of the arrangement?",
        arrangement: "alpha",
        options: [
          { key: "1", text: "T" },
          { key: "2", text: "I" },
          { key: "3", text: "V" },
          { key: "4", text: "9" },
          { key: "5", text: "None of these" },
        ],
      },
      {
        number: 12,
        stem: "How many such consonants are there in the arrangement, each of which is immediately preceded by a symbol but not immediately followed by a letter?",
        arrangement: "alpha",
        options: [
          { key: "1", text: "None" },
          { key: "2", text: "One" },
          { key: "3", text: "Two" },
          { key: "4", text: "Three" },
          { key: "5", text: "More than three" },
        ],
      },
      {
        number: 13,
        stem: "If all the numbers are dropped from the arrangement, which of the following will be the tenth from the left end?",
        arrangement: "alpha",
        options: [
          { key: "1", text: "R" },
          { key: "2", text: "%" },
          { key: "3", text: "J" },
          { key: "4", text: "D" },
          { key: "5", text: "None of these" },
        ],
      },
      {
        number: 15,
        stem: "Which of the following should come in place of the question mark in the series based on the arrangement: K hash M,  3 J D,  N at W,  copyright 9 ?",
        arrangement: "alpha",
        options: [
          { key: "1", text: "I F 1" },
          { key: "2", text: "T V 6" },
          { key: "3", text: "T I F" },
          { key: "4", text: "I V 6" },
          { key: "5", text: "None of these" },
        ],
      },
      {
        number: 17,
        directions:
          "Directions (17–19): In each question, statements are given followed by four conclusions. You have to take the given statements to be true even if they seem to be at variance with commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements.",
        stem: "Decide which conclusions follow from the statements.",
        statements: [
          { key: "1", text: "All desks are pencils." },
          { key: "2", text: "All pencils are windows." },
          { key: "3", text: "All windows are doors." },
          { key: "4", text: "All doors are walls." },
        ],
        conclusions: [
          { key: "I", text: "Some walls are windows." },
          { key: "II", text: "All desks are doors." },
          { key: "III", text: "Some doors are pencils." },
          { key: "IV", text: "Some walls are desks." },
        ],
        options: [
          { key: "1", text: "Only I, II and III follow" },
          { key: "2", text: "Only II, III and IV follow" },
          { key: "3", text: "Only I, III and IV follow" },
          { key: "4", text: "All follow" },
          { key: "5", text: "None of these" },
        ],
      },
    ],
    arrangements: {
      alpha: {
        title: "Letter–number–symbol arrangement",
        chars: ["B", "K", "5", "#", "M", "A", "3", "R", "%", "J", "2", "D", "E", "N", "@", "7", "W", "8", "©", "9", "T", "I", "V", "F", "6", "1", "H", "Q", "*", "Y", "4", "$", "L", "Z"],
      },
    },
  },
];

export function findQuestionIndex(paper, utterance) {
  if (!paper?.questions?.length) return -1;
  let query = (utterance || "").toLowerCase();
  query = query.replace(/go back to|take me (?:back )?to|go to|open|the question about|question about|question on|question of|question for|back to|वाले प्रश्न|प्रश्न पर जाओ|प्रश्न पर/gi, " ");
  query = query.replace(/\b(the|a|an|please|question|wala|वाला)\b/gi, " ");
  query = query.replace(/[.,?!;:।]/g, " ").replace(/\s+/g, " ").trim();
  if (query.length < 3) return -1;

  const tokens = query.split(" ").filter((token) => token.length > 2);
  let bestIndex = -1;
  let bestScore = 0;
  paper.questions.forEach((item, index) => {
    const hay = `${item.stem} ${(item.options || []).map((opt) => opt.text).join(" ")}`.toLowerCase();
    let score = 0;
    if (hay.includes(query)) score += 6;
    tokens.forEach((token) => {
      if (hay.includes(token)) score += 2;
    });
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  const need = tokens.length <= 2 ? 2 : Math.ceil(tokens.length * 0.5) * 2;
  return bestScore >= need ? bestIndex : -1;
}

export function sectionForQuestion(paper, number) {
  if (!paper?.sections?.length) return null;
  return paper.sections.find((section) => number >= section.from && number <= section.to) || paper.sections[0] || null;
}

export function nextSection(paper, section) {
  if (!paper?.sections?.length || !section) return null;
  const i = paper.sections.findIndex((item) => item.id === section.id);
  return i >= 0 ? paper.sections[i + 1] || null : null;
}

export function getPaper(id) {
  return PAPERS.find((paper) => paper.id === id) || null;
}

export function findPaperByUtterance(text) {
  const q = text.toLowerCase();
  return PAPERS.find((paper) => paper.aliases.some((alias) => q.includes(alias))) || null;
}

export function getQuestion(paper, index) {
  return paper.questions[index] || null;
}

export function getTable(paper, question) {
  if (!question?.table || !paper.tables) return null;
  return paper.tables[question.table] || null;
}

export function getArrangement(paper, question) {
  if (!question?.arrangement || !paper.arrangements) return null;
  return paper.arrangements[question.arrangement] || null;
}

export function lookupTableCell(table, utterance) {
  if (!table) return null;
  const q = utterance.toLowerCase();
  const row = table.rows.find((item) => item.labels.some((label) => q.includes(label)));
  const col = table.columns.find((item) => item.labels.some((label) => q.includes(label)));
  if (!row || !col) return null;
  return { row: row.label, column: col.label, value: row[col.id] };
}

export function lookupChar(arrangement, position, from) {
  if (!arrangement) return null;
  const chars = arrangement.chars;
  const i = from === "right" ? chars.length - position : position - 1;
  if (i < 0 || i >= chars.length) return null;
  return chars[i];
}
