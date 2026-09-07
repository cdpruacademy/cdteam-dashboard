import { KnowledgeSearch } from "@/components/search/search-results";

export const metadata = {
  title: "คลังคำถามและคู่มือ | Prudential Thailand",
  description: "ระบบสืบค้นคำถาม-คำตอบของฝ่ายพัฒนาหลักสูตร",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen py-4">
      <KnowledgeSearch />
    </div>
  );
}
