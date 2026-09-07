import * as XLSX from "xlsx";
import { ProductItem, PHASES } from "./timeline-data";

/**
 * Export product timeline items to an Excel (.xlsx) file
 */
export function exportTimelineToExcel(
  items: ProductItem[],
  timelineTitle: string,
  month: string,
  asOf: string
) {
  // Flatten items for Excel table
  const rows = items.map((p, idx) => {
    const row: Record<string, string> = {
      "No.": (idx + 1).toString(),
      Broker: p.broker,
      "Product / Project Name": p.name,
      Owner: p.owner,
    };

    // Add milestone columns
    PHASES.forEach((phase) => {
      const m = p.milestones[phase.key];
      row[phase.label.replace("\n", " ")] = m
        ? `${m.date || ""} (${m.status})`
        : "-";
    });

    row["Internal Date"] = p.internalDate || "-";
    row["Commercial Date"] = p.commercialDate || "-";
    if (p.customRightLabel) {
      row["Status / Launch Info"] = p.customRightLabel;
    }

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Timeline Data");

  const safeTitle = timelineTitle.replace(/\s+/g, "_");
  const filename = `Prudential_${safeTitle}_${month.replace(/\s+/g, "_")}_${asOf.replace(/\s+/g, "_")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Export timeline items as JSON file (ready to drag and drop into GitHub)
 */
export function exportTimelineToJSON(
  items: ProductItem[],
  timelineTitle: string,
  month: string
) {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(items, null, 2));
  const link = document.createElement("a");
  const safeTitle = timelineTitle.replace(/\s+/g, "_").toLowerCase();
  link.setAttribute("href", dataStr);
  link.setAttribute(
    "download",
    `${safeTitle}_${month.replace(/\s+/g, "_").toLowerCase()}.json`
  );
  link.click();
}

/**
 * Parse uploaded Excel or JSON file into ProductItem[]
 */
export async function parseUploadedDataFile(file: File): Promise<ProductItem[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "json") {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed as ProductItem[];
    }
    throw new Error("ไฟล์ JSON มีรูปแบบข้อมูลไม่ถูกต้อง");
  }

  if (ext === "xlsx" || ext === "xls") {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      throw new Error("ไม่พบข้อมูลในไฟล์ Excel");
    }

    // Convert raw rows back to ProductItem
    return rawRows.map((r, i) => {
      const id = `pru-${Date.now()}-${i}`;
      const broker = r["Broker"] || "New Broker";
      const name = r["Product / Project Name"] || r["Product Name"] || `Product ${i + 1}`;
      const owner = r["Owner"] || "-";

      const milestones: Partial<Record<string, any>> = {};
      PHASES.forEach((p) => {
        const key = p.label.replace("\n", " ");
        const val = r[key];
        if (val && val !== "-") {
          const matchDate = val.split("(")[0]?.trim();
          const isCompleted = val.toLowerCase().includes("completed") || true;
          milestones[p.key] = {
            phase: p.key,
            date: matchDate || undefined,
            status: isCompleted ? "completed" : "pending",
          };
        }
      });

      return {
        id,
        broker,
        name,
        owner,
        milestones,
        internalDate: r["Internal Date"] || "TBC",
        commercialDate: r["Commercial Date"] || "TBC",
        customRightLabel: r["Status / Launch Info"] || undefined,
      };
    });
  }

  throw new Error("รองรับเฉพาะไฟล์ .xlsx, .xls หรือ .json เท่านั้น");
}
