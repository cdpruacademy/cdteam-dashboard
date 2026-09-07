import { QuestionItem } from "./search-data";

const GEMINI_API_KEY_STORAGE = "pru_gemini_api_key";

export function getStoredGeminiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE) || "";
  } catch (_) {
    return "";
  }
}

export function saveStoredGeminiKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  } catch (_) {}
}

export interface GeminiQueryResult {
  answer: string;
  found: boolean;
  modelUsed: string;
  matchedQuestion?: QuestionItem;
}

export async function askGeminiOrKnowledgeBase(
  userQuery: string,
  knowledgeBase: QuestionItem[]
): Promise<GeminiQueryResult> {
  const apiKey = getStoredGeminiKey();

  // 1. If user provided a Gemini API Key, use Google Gemini REST API!
  if (apiKey) {
    try {
      // Build context from current knowledge base
      const contextText = knowledgeBase
        .map(
          (k, i) =>
            `[ข้อที่ ${i + 1}] หมวดหมู่: ${k.category}\nคำถาม: ${k.question}\nคำตอบ: ${k.answer}\nTags: ${k.tags.join(", ")}`
        )
        .join("\n\n");

      const systemInstruction = `คุณคือผู้ช่วย AI ฝ่ายพัฒนาหลักสูตร Prudential Thailand
หน้าที่ของคุณคือวิเคราะห์คำถามของผู้ใช้ และตอบคำถามเป็นภาษาไทยอย่างสุภาพและถูกต้อง โดยอ้างอิงจาก "คลังข้อมูลคำถาม-คำตอบ" ที่กำหนดให้เท่านั้น

กฎสำคัญ:
1. หากในคลังข้อมูลมีคำตอบที่ตรงหรือเกี่ยวข้องกับคำถาม: ให้สรุปและตอบอย่างกระชับ ชัดเจน
2. หากในคลังข้อมูล "ไม่มีข้อมูล" หรือไม่มีเนื้อหาที่ตอบคำถามนี้ได้เลย: ให้ตอบขึ้นต้นว่า "[NOT_FOUND] ขออภัยครับ ปัจจุบันยังไม่มีข้อมูลเรื่องนี้ในคลังคำถามของฝ่ายพัฒนาหลักสูตร"`;

      const prompt = `คลังข้อมูลคำถาม-คำตอบของทีม:
${contextText}

---
คำถามของผู้ใช้: "${userQuery}"

กรุณาตอบคำถาม:`;

      // Call Gemini 2.5 Flash / 1.5 Flash
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        }),
      });

      if (!res.ok) {
        // Fallback endpoint if model name varies
        const errJson = await res.json().catch(() => ({}));
        console.warn("Gemini API returned error:", errJson);
        // Fall back to local search
      } else {
        const data = await res.json();
        const candidateText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (candidateText.includes("[NOT_FOUND]")) {
          return {
            found: false,
            answer: candidateText.replace("[NOT_FOUND]", "").trim(),
            modelUsed: "Google Gemini (2.5 Flash)",
          };
        }

        return {
          found: true,
          answer: candidateText.trim(),
          modelUsed: "Google Gemini (2.5 Flash)",
        };
      }
    } catch (err) {
      console.error("Gemini API call failed, falling back to local search", err);
    }
  }

  // 2. Fallback: Smart local search over knowledgeBase
  const qLower = userQuery.toLowerCase().trim();
  const matched = knowledgeBase.find((k) => {
    return (
      k.question.toLowerCase().includes(qLower) ||
      k.answer.toLowerCase().includes(qLower) ||
      k.tags.some((t) => qLower.includes(t.toLowerCase())) ||
      qLower.split(" ").some((word) => word.length > 2 && k.question.toLowerCase().includes(word))
    );
  });

  if (matched) {
    return {
      found: true,
      answer: matched.answer,
      matchedQuestion: matched,
      modelUsed: apiKey ? "Local Knowledge Base (Fallback)" : "Local Knowledge Base",
    };
  }

  return {
    found: false,
    answer: "ไม่พบข้อมูลที่ตรงกับคำถามในคลังความรู้ของฝ่ายพัฒนาหลักสูตรในขณะนี้",
    modelUsed: apiKey ? "Local Knowledge Base (Fallback)" : "Local Knowledge Base",
  };
}
