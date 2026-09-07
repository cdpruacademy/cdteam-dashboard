"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Palette, X, Check, RotateCcw } from "lucide-react";

interface BrokerColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorChange: (broker: string, hexColor: string) => void;
  onResetColors: () => void;
  currentColors: Record<string, string>;
}

const PRESET_COLORS = [
  { name: "ฟ้า ttb (Primary)", hex: "#009FE3" },
  { name: "น้ำเงิน UOB (Navy)", hex: "#0B2265" },
  { name: "แดง Prudential", hex: "#ED1C24" },
  { name: "ส้ม ttb (Accent)", hex: "#F37021" },
  { name: "เขียว (Emerald)", hex: "#10B981" },
  { name: "ม่วง (Purple)", hex: "#8B5CF6" },
  { name: "เทาเข้ม (Charcoal)", hex: "#334155" },
  { name: "ดำ (Black)", hex: "#0F172A" },
];

export function BrokerColorModal({
  isOpen,
  onClose,
  onColorChange,
  onResetColors,
  currentColors,
}: BrokerColorModalProps) {
  const [selectedBroker, setSelectedBroker] = useState("ttb");
  const [hexInput, setHexInput] = useState("#009FE3");

  const brokers = Object.keys(currentColors);

  useEffect(() => {
    if (currentColors[selectedBroker]) {
      setHexInput(currentColors[selectedBroker]);
    }
  }, [selectedBroker, currentColors]);

  if (!isOpen) return null;

  const handleApply = (hex: string) => {
    setHexInput(hex);
    onColorChange(selectedBroker, hex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <span>กำหนดสีประจำ Channel / Broker</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Select Broker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              เลือก Channel ที่ต้องการปรับสี:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {brokers.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBroker(b)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center justify-between transition-all ${
                    selectedBroker === b
                      ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate">[{b}]</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border shrink-0"
                    style={{ backgroundColor: currentColors[b] || "#666" }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              เลือกสีสำหรับ [{selectedBroker}]:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => handleApply(c.hex)}
                  className={`p-2 text-[11px] font-medium rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    hexInput.toLowerCase() === c.hex.toLowerCase()
                      ? "border-black ring-2 ring-black/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shadow-2xs border"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] text-gray-600 truncate w-full text-center">
                    {c.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Hex input */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-600 shrink-0">รหัสสี HEX:</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="#009FE3"
              className="w-28 text-xs font-mono border border-gray-300 rounded-lg p-2 uppercase"
            />
            <button
              type="button"
              onClick={() => handleApply(hexInput)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-black hover:bg-gray-800 rounded-lg shadow-xs"
            >
              ใช้สีนี้
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onResetColors}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>คืนค่าสีเริ่มต้น</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-[#ED1C24] hover:bg-[#D4181F] rounded-lg shadow-sm"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
