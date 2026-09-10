import { redirect } from "next/navigation";
// import { KnowledgeSearch } from "@/components/search/search-results";

export const metadata = {
  title: "คลังคำถามและคู่มือ | Prudential Thailand",
  description: "ระบบสืบค้นคำถาม-คำตอบของฝ่ายพัฒนาหลักสูตร",
};

export default function SearchPage() {
  // ปิดการเข้าถึงหน้าคลังคำถามชั่วคราวเพื่อความปลอดภัยของข้อมูล
  redirect("/");
  return null;
}

