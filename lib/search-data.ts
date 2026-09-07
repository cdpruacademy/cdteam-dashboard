export interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  category: "Product" | "Training" | "Process" | "e-Learning" | "Compliance";
  tags: string[];
  askedBy?: string;
  answeredBy?: string;
  updatedAt: string;
}

export const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: "q-1",
    question: "ขั้นตอนการพัฒนาหลักสูตร e-learning สำหรับ New Product มีกี่ขั้นตอนและใช้เวลานานเท่าใด?",
    answer: "การพัฒนาหลักสูตร e-learning ประกอบด้วย 4 ขั้นตอนหลัก: 1) First Draft Content จัดทำโครงสร้างเนื้อหาร่วมกับ Product Owner (2-3 สัปดาห์), 2) Review & Stakeholder Feedback ตรวจสอบความถูกต้องและข้อบังคับ คปภ. (1 สัปดาห์), 3) Production จัดทำภาพ สื่อ และ Interactive e-learning (2-3 สัปดาห์), 4) Final Approval & System Upload ทดสอบระบบและขึ้นระบบ LMS ก่อนวัน Internal Training Date อย่างน้อย 7 วัน",
    category: "e-Learning",
    tags: ["e-learning", "timeline", "process", "LMS", "หลักสูตร"],
    askedBy: "ทีม Broker Sales",
    answeredBy: "ฝ่ายพัฒนาหลักสูตร",
    updatedAt: "25 Aug 2026",
  },
  {
    id: "q-2",
    question: "หลักสูตร PRUInfinity 888 Ultra มีเงื่อนไขการอบรมของฝ่ายขายอย่างไร?",
    answer: "สำหรับ PRUInfinity 888 Ultra ตัวแทนและนายหน้าต้องผ่านการอบรม Internal Training และทำแบบทดสอบ e-learning ให้ได้คะแนนไม่ต่ำกว่า 80% ก่อนวัน Commercial Launch (7 Aug 2026) จึงจะได้รับสิทธิ์ในการเสนอขายในระบบ",
    category: "Product",
    tags: ["PRUInfinity 888 Ultra", "การอบรม", "เงื่อนไขการขาย", "คะแนนผ่าน"],
    askedBy: "Agency Channel",
    answeredBy: "Surakit P.",
    updatedAt: "10 Aug 2026",
  },
  {
    id: "q-3",
    question: "กำหนดการ Kick-off หลักสูตร ttb growth and protect booster ต้องเตรียมเอกสารอะไรบ้าง?",
    answer: "เอกสารที่ต้องเตรียมประกอบด้วย: 1) Product Specification ฉบับผ่านการอนุมัติ, 2) Target Customer Persona & Selling Points, 3) Policy Wording & Exclusions, 4) ข้อมูลเปรียบเทียบกับผลิตภัณฑ์เดิมในตลาด เพื่อให้ทีมออกแบบกิจกรรม Role-play และ Case Study ได้ตรงจุด",
    category: "Process",
    tags: ["ttb", "growth and protect", "kick-off", "เอกสารประกอบ"],
    askedBy: "Partnership Team",
    answeredBy: "Nitikan B.",
    updatedAt: "15 Jul 2026",
  },
  {
    id: "q-4",
    question: "ความแตกต่างระหว่าง Internal Training Date กับ Commercial Date คืออะไร?",
    answer: "Internal Training Date คือวันเริ่มเปิดให้พนักงานภายใน ตัวแทน และนายหน้าเข้าอบรมทำความเข้าใจผลิตภัณฑ์และทดสอบระบบการขาย ส่วน Commercial Date คือวันแรกที่เปิดให้เสนอขายแก่ลูกค้าภายนอกและออกใบเสนอราคา (Quotation) ได้อย่างเป็นทางการ",
    category: "Training",
    tags: ["Internal Training", "Commercial Date", "นิยาม", "ความแตกต่าง"],
    askedBy: "New Joiner",
    answeredBy: "ฝ่ายพัฒนาหลักสูตร",
    updatedAt: "1 Aug 2026",
  },
  {
    id: "q-5",
    question: "ผลิตภัณฑ์ UOB Pinnacle Principle Protect 5/14 ต้องมีใบอนุญาต IC License หรือไม่?",
    answer: "UOB Pinnacle Principle Protect 5/14 เป็นแบบประกันชีวิตควบการลงทุน (Unit Linked) ดังนั้นผู้เสนอขายจำเป็นต้องมีใบอนุญาตตัวแทน/นายหน้าประกันชีวิต พร้อมทั้งใบอนุญาตผู้แนะนำการลงทุน (IC License) ที่ยังไม่หมดอายุ",
    category: "Compliance",
    tags: ["UOB", "Unit Linked", "IC License", "ใบอนุญาต", "คปภ."],
    askedBy: "UOB Branch Specialist",
    answeredBy: "Jirapat O.",
    updatedAt: "28 Aug 2026",
  },
  {
    id: "q-6",
    question: "หากหลักสูตร First Draft ไม่ผ่านการอนุมัติตาม Timeline ต้องปฏิบัติตามขั้นตอนใด?",
    answer: "หาก First Draft ต้องแก้ไขอย่างมีนัยสำคัญ Product Owner และทีมพัฒนาหลักสูตรต้องประชุม Call ฉุกเฉินภายใน 48 ชั่วโมงเพื่อปรับปรุง และส่ง First Draft ฉบับแก้ไขภายใน 5 วันทำการ โดยจะประเมินว่ากระทบต่อวัน Launch Date หรือไม่ หากกระทบจะต้องแจ้ง Escalation ไปยัง Head of Curriculum",
    category: "Process",
    tags: ["First Draft", "Escalation", "การแก้ไข", "Timeline Delay"],
    askedBy: "Course Designer",
    answeredBy: "ฝ่ายพัฒนาหลักสูตร",
    updatedAt: "18 Aug 2026",
  },
  {
    id: "q-7",
    question: "สื่อประกอบการอบรม PRUWhole Life Protect 99/20 สามารถดาวน์โหลดได้จากช่องทางใด?",
    answer: "สื่อสไลด์นำเสนอ (PDF), สรุปจุดเด่น 1-Page Summary, และวิดีโอ Replay สามารถดาวน์โหลดได้จากระบบ PRU Academy Portal ในหมวดหมู่ 'New Product Launches 2026'",
    category: "Training",
    tags: ["PRUWhole Life", "สื่อการสอน", "PRU Academy", "ดาวน์โหลด"],
    askedBy: "Training Coordinator",
    answeredBy: "Nitikan B.",
    updatedAt: "8 Aug 2026",
  },
  {
    id: "q-8",
    question: "การจัดทำ e-learning รองรับการเปิดบนอุปกรณ์มือถือ (Mobile Responsive) หรือไม่?",
    answer: "ระบบ e-learning ทั้งหมดของปี 2026 พัฒนาด้วยเทคโนโลยี HTML5 Responsive สามารถเปิดเรียนได้สมบูรณ์ทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน (iOS/Android) ผ่าน Web Browser และแอปพลิเคชันองค์กร",
    category: "e-Learning",
    tags: ["e-learning", "Mobile", "Responsive", "อุปกรณ์"],
    askedBy: "Digital Learning Team",
    answeredBy: "Technical Support",
    updatedAt: "20 Jul 2026",
  },
];
