"use client";

import * as React from "react";
import { useState } from "react";
import {
  TimelineType,
  PRODUCT_PHASES,
  ENHANCEMENT_PHASES,
  AVAILABLE_MONTHS,
} from "@/lib/timeline-data";
import {
  Calendar,
  Plus,
  Download,
  RefreshCw,
  Edit3,
  Check,
  FileSpreadsheet,
  FileJson,
  Palette,
} from "lucide-react";

interface TimelineHeaderProps {
  timelineType: TimelineType;
  onTimelineTypeChange: (type: TimelineType) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  asOfText: string;
  onAsOfChange: (asOf: string) => void;
  onAddClick: () => void;
  onExportAllClick: () => void;
  onExportExcel: () => void;
  onExportJSON: () => void;
  onOpenColorModal: () => void;
  onResetClick: () => void;
  isExporting?: boolean;
  isAdmin?: boolean;
}

export function TimelineHeader({
  timelineType,
  onTimelineTypeChange,
  selectedMonth,
  onMonthChange,
  asOfText,
  onAsOfChange,
  onAddClick,
  onExportAllClick,
  onExportExcel,
  onExportJSON,
  onOpenColorModal,
  onResetClick,
  isExporting = false,
  isAdmin = false,
}: TimelineHeaderProps) {
  const [isEditingAsOf, setIsEditingAsOf] = useState(false);
  const [tempAsOf, setTempAsOf] = useState(asOfText);

  const isEnhancement = timelineType === "enhancement";
  const phases = isEnhancement ? ENHANCEMENT_PHASES : PRODUCT_PHASES;

  const handleSaveAsOf = () => {
    if (tempAsOf.trim()) {
      onAsOfChange(tempAsOf.trim());
    }
    setIsEditingAsOf(false);
  };

  return (
    <div className="w-full select-none">
      {/* 1. Top Sub-Navigation: Timeline Type Tabs & Month Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-gray-100">
        {/* Timeline Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl">
          <button
            type="button"
            onClick={() => onTimelineTypeChange("product")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isEnhancement
                ? "bg-white text-[#ED1C24] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ED1C24]" />
            <span>New Product Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => onTimelineTypeChange("enhancement")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isEnhancement
                ? "bg-white text-[#0066CC] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0066CC]" />
            <span>Enhancement Timeline</span>
          </button>
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">รอบเดือน:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="text-xs font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
          >
            {AVAILABLE_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Main Title Bar: Calendar Badge, Title, and Action Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 pt-1">
        {/* Left: Calendar Badge + Editable Month/As-Of */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 transition-colors ${
              isEnhancement ? "bg-[#005BAB]" : "bg-[#ED1C24]"
            }`}
          >
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black tracking-tight text-[#2D2D2D] leading-none">
              {selectedMonth}
            </div>

            {/* Editable As Of Text */}
            <div className="mt-1 flex items-center gap-1.5">
              {isEditingAsOf ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempAsOf}
                    autoFocus
                    onChange={(e) => setTempAsOf(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveAsOf();
                      if (e.key === "Escape") setIsEditingAsOf(false);
                    }}
                    placeholder="เช่น as of 31 Aug"
                    className="text-xs font-semibold border border-[#ED1C24] rounded px-1.5 py-0.5 w-32 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAsOf}
                    className="p-1 bg-[#ED1C24] text-white rounded hover:bg-[#D4181F]"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 group cursor-pointer"
                  onClick={() => isAdmin && setIsEditingAsOf(true)}
                >
                  <span className="text-xs font-semibold text-[#64748B]">
                    {asOfText}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAsOf(true)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-700 transition-opacity"
                      title="คลิกเพื่อแก้ไข As of"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Big Timeline Header Title + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="text-right mr-2 hidden sm:block">
            <span
              className={`text-xl md:text-2xl font-black tracking-tight ${
                isEnhancement ? "text-[#0066CC]" : "text-[#ED1C24]"
              }`}
            >
              {isEnhancement ? "ENHANCEMENT" : "NEW PRODUCT"}{" "}
            </span>
            <span className="text-xl md:text-2xl font-black text-[#5A646E] tracking-tight">
              TIMELINE
            </span>
          </div>

          {/* Color Customizer Button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenColorModal}
              title="ปรับแต่งสีประจำ Channel / Broker"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
            >
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">ปรับสี</span>
            </button>
          )}

          {/* Reset button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onResetClick}
              title="รีเซ็ตเป็นข้อมูลเริ่มต้น"
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Excel Export Button */}
          <button
            type="button"
            onClick={onExportExcel}
            title="Export เป็นไฟล์ Excel (.xlsx)"
            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-700" />
            <span className="hidden md:inline">Excel</span>
          </button>

          {/* JSON Export Button */}
          <button
            type="button"
            onClick={onExportJSON}
            title="Export เป็นไฟล์ JSON"
            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">JSON</span>
          </button>

          {/* Export Full Image Button */}
          <button
            type="button"
            onClick={onExportAllClick}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>{isExporting ? "กำลัง Export..." : "Export ภาพรวม"}</span>
          </button>

          {/* Add Product Button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onAddClick}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-all ${
                isEnhancement
                  ? "bg-[#005BAB] hover:bg-[#004A8C]"
                  : "bg-[#ED1C24] hover:bg-[#D4181F]"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isEnhancement ? "เพิ่ม Enhancement" : "เพิ่ม Product"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Columns Header Bar */}
      <div className="grid grid-cols-[220px_1fr_130px] items-stretch gap-2 mb-3">
        {/* Left spacer for product info card */}
        <div className="hidden lg:block" />

        {/* 7 Phase Columns */}
        <div className="grid grid-cols-7 gap-2 px-2">
          {phases.map((phase) => (
            <div
              key={phase.key}
              className={`flex items-center justify-center text-center p-2 rounded-md ${phase.badgeBg} ${phase.badgeTextColor} font-bold text-xs leading-tight min-h-[44px] shadow-2xs`}
            >
              <span className="whitespace-pre-line">{phase.label}</span>
            </div>
          ))}
        </div>

        {/* Right spacer for Launch dates */}
        <div className="hidden lg:block" />
      </div>
    </div>
  );
}
