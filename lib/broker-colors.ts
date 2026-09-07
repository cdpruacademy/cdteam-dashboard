export type BrokerTag = "ttb" | "ttb touch" | "UOB" | "Agency" | "New Broker" | "Audit" | string;

export interface BrokerColorConfig {
  textColor: string;
  borderColor: string;
  bgColor?: string;
}

// Real brand colors
export const DEFAULT_BROKER_COLORS: Record<string, BrokerColorConfig> = {
  // ttb: ฟ้าสดใส (TMBThanachart Primary Digital Blue)
  ttb: {
    textColor: "text-[#009FE3]",
    borderColor: "border-l-[#009FE3]",
    bgColor: "bg-[#009FE3]/10",
  },
  "ttb touch": {
    textColor: "text-[#009FE3]",
    borderColor: "border-l-[#009FE3]",
    bgColor: "bg-[#009FE3]/10",
  },
  // UOB: น้ำเงินเข้มธนาคารยูโอบี (UOB Deep Navy Blue)
  UOB: {
    textColor: "text-[#0B2265]",
    borderColor: "border-l-[#0B2265]",
    bgColor: "bg-[#0B2265]/10",
  },
  // Agency: แดง Prudential
  Agency: {
    textColor: "text-[#ED1C24]",
    borderColor: "border-l-[#ED1C24]",
    bgColor: "bg-[#ED1C24]/10",
  },
  // New Broker: Slate Grey
  "New Broker": {
    textColor: "text-[#475569]",
    borderColor: "border-l-[#475569]",
    bgColor: "bg-slate-100",
  },
  // Audit: Dark Charcoal
  Audit: {
    textColor: "text-[#1E293B]",
    borderColor: "border-l-[#1E293B]",
    bgColor: "bg-gray-100",
  },
};

const STORAGE_KEY = "pru_custom_broker_colors_v1";

export function getBrokerColors(): Record<string, BrokerColorConfig> {
  if (typeof window === "undefined") return DEFAULT_BROKER_COLORS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_BROKER_COLORS, ...JSON.parse(stored) };
    }
  } catch (_) {}
  return DEFAULT_BROKER_COLORS;
}

export function saveBrokerColor(broker: string, hexColor: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getBrokerColors();
    current[broker] = {
      textColor: `text-[${hexColor}]`,
      borderColor: `border-l-[${hexColor}]`,
      bgColor: `bg-[${hexColor}]/10`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (_) {}
}
