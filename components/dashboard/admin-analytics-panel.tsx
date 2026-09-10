"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { ProductItem, TimelineType } from "@/lib/timeline-data";
import { DonutChart, DonutChartSegment } from "@/components/ui/donut-chart";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  Users,
  Layers,
  GraduationCap,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Filter,
  CheckCircle2,
  Package,
  Boxes,
} from "lucide-react";

interface AdminAnalyticsPanelProps {
  items: ProductItem[];
  timelineType: TimelineType;
  selectedMonth: string;
  teamMembers: string[];
  selectedMemberFilter: string | null;
  onSelectMemberFilter: (member: string | null) => void;
  onOpenTeamModal: () => void;
  customColorMap?: Record<string, string>;
  productCount?: number;
  enhancementCount?: number;
}

export function AdminAnalyticsPanel({
  items,
  timelineType,
  selectedMonth,
  teamMembers,
  selectedMemberFilter,
  onSelectMemberFilter,
  onOpenTeamModal,
  customColorMap = {},
  productCount = 0,
  enhancementCount = 0,
}: AdminAnalyticsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chartMode, setChartMode] = useState<"channel" | "member">("channel");
  const [hoveredSegmentLabel, setHoveredSegmentLabel] = useState<string | null>(null);

  // 1. KPI Counts
  const totalItems = items.length;
  const elearningCount = items.filter((i) =>
    Object.values(i.milestones || {}).some(
      (m) =>
        m?.isElearningIcon ||
        m?.phase === "first-draft-elearning" ||
        m?.phase === "final-elearning"
    )
  ).length;

  // 2. Counts per team member
  const memberCounts = useMemo(() => {
    const map: Record<string, number> = {};
    teamMembers.forEach((m) => {
      map[m] = 0;
    });

    items.forEach((item) => {
      const resp = (item.owner || "").toLowerCase();
      teamMembers.forEach((member) => {
        // Match member first name or full name
        const shortName = member.split(" ")[0].toLowerCase();
        if (resp.includes(shortName) || resp.includes(member.toLowerCase())) {
          map[member] = (map[member] || 0) + 1;
        }
      });
    });
    return map;
  }, [items, teamMembers]);

  // 3. Counts per channel/broker
  const channelCounts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      const ch = item.broker || "Other";
      map[ch] = (map[ch] || 0) + 1;
    });
    return map;
  }, [items]);

  // Palette generator matching Prudential CI
  const memberColors = [
    "#ED1C24", // Prudential Red
    "#0066CC", // Prudential Navy/Blue
    "#009FE3", // ttb Sky Cyan
    "#0B2265", // UOB Deep Navy
    "#8B5CF6", // Violet
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EC4899", // Pink
  ];

  // Channel Segments for Donut
  const channelSegments: DonutChartSegment[] = useMemo(() => {
    const entries = Object.entries(channelCounts);
    return entries.map(([channel, count], idx) => {
      const color =
        customColorMap[channel] ||
        (channel.toLowerCase().includes("ttb")
          ? "#009FE3"
          : channel.toLowerCase().includes("uob")
          ? "#0B2265"
          : channel.toLowerCase().includes("agency")
          ? "#ED1C24"
          : memberColors[idx % memberColors.length]);
      return {
        label: channel,
        value: count,
        color,
      };
    });
  }, [channelCounts, customColorMap]);

  // Member Segments for Donut
  const memberSegments: DonutChartSegment[] = useMemo(() => {
    return teamMembers.map((member, idx) => ({
      label: member,
      value: memberCounts[member] || 0,
      color: memberColors[idx % memberColors.length],
    }));
  }, [teamMembers, memberCounts]);

  const activeSegments = chartMode === "channel" ? channelSegments : memberSegments;
  const totalChartValue = activeSegments.reduce((sum, s) => sum + s.value, 0);

  const activeHoveredSegment = activeSegments.find(
    (s) => s.label === hoveredSegmentLabel
  );
  const displayValue = activeHoveredSegment?.value ?? totalChartValue;
  const displayLabel = activeHoveredSegment?.label ?? (chartMode === "channel" ? "ทุกช่องทาง" : "ภาระงานรวม");
  const displayPercentage =
    totalChartValue > 0 && activeHoveredSegment
      ? ((activeHoveredSegment.value / totalChartValue) * 100).toFixed(0)
      : "100";

  return (
    <div className="export-hide mb-4 bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden transition-all">
      {/* Top Banner Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-red-50/70 via-slate-50 to-blue-50/50 border-b border-red-100/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ED1C24] text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
                EXECUTIVE SUMMARY & TEAM ANALYTICS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100/70 px-2 py-0.5 rounded-full border border-red-200">
                <Sparkles className="w-2.5 h-2.5" /> Admin Only
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              วิเคราะห์สัดส่วนงานและติดตามภาระงานรายบุคคลในรอบเดือน {selectedMonth}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTeamModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-2xs transition-all hover:border-gray-300"
            title="จัดการรายชื่อคนในทีม (เพิ่ม/ลบ/แก้ไข)"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">จัดการสมาชิกทีม</span>
            <span className="sm:hidden">ทีม</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors"
            title={isCollapsed ? "ขยายแผงสถิติ" : "ย่อแผงสถิติ"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Row 1: 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Card 1: Total */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500">
                  โครงการทั้งหมด
                </span>
                <div className="text-xl sm:text-2xl font-black text-gray-900">
                  {totalItems}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200/70 text-gray-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: New Product */}
            <div className="p-3.5 bg-red-50/50 rounded-xl border border-red-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#ED1C24]">
                  New Product
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#ED1C24]">
                  {productCount > 0 ? productCount : timelineType === "product" ? totalItems : 0}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#ED1C24] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Enhancement */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#0066CC]">
                  Enhancement
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#0066CC]">
                  {enhancementCount > 0 ? enhancementCount : timelineType === "enhancement" ? totalItems : 0}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0066CC] flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: eLearning */}
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-purple-700">
                  มีคอร์ส eLearning
                </span>
                <div className="text-xl sm:text-2xl font-black text-purple-800">
                  {elearningCount}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Row 2: Filter by Team Member & Interactive Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Filter by Team Member (Pills) */}
            <div className="lg:col-span-6 space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#ED1C24]" />
                  <span className="text-xs font-bold text-gray-800">
                    กรองตารางตามผู้รับผิดชอบ (Filter by Owner)
                  </span>
                </div>
                {selectedMemberFilter && (
                  <button
                    type="button"
                    onClick={() => onSelectMemberFilter(null)}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>

              {/* Filter Pills List */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectMemberFilter(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedMemberFilter === null
                      ? "bg-[#ED1C24] text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  ทั้งหมด ({totalItems})
                </button>

                {teamMembers.map((member) => {
                  const count = memberCounts[member] || 0;
                  const isSelected = selectedMemberFilter === member;
                  return (
                    <button
                      key={member}
                      type="button"
                      onClick={() =>
                        onSelectMemberFilter(isSelected ? null : member)
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#ED1C24] text-white shadow-xs ring-2 ring-red-400/30"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{member}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? "bg-white/30 text-white font-black"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Helper Notice */}
              <div className="text-[11px] text-gray-500 pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>
                  {selectedMemberFilter
                    ? `กำลังแสดงผลเฉพาะงานของ "${selectedMemberFilter}" ด้านล่าง`
                    : "คลิกที่ชื่อคนในทีมเพื่อกรองตาราง Timeline ให้แสดงเฉพาะงานของผู้นั้น"}
                </span>
              </div>
            </div>

            {/* Right: Donut Chart Breakdown */}
            <div className="lg:col-span-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-3">
              {/* Chart Mode Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  สัดส่วนโครงการ (Project Breakdown)
                </span>
                <div className="inline-flex p-0.5 bg-gray-200/80 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setChartMode("channel")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      chartMode === "channel"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    แยกตามช่องทาง
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("member")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      chartMode === "member"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    ภาระงานรายคน
                  </button>
                </div>
              </div>

              {/* Donut Chart and Legend */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                {/* Donut Chart SVG */}
                <div className="shrink-0">
                  <DonutChart
                    data={activeSegments}
                    size={170}
                    strokeWidth={22}
                    animationDuration={0.8}
                    highlightOnHover={true}
                    centerContent={
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={displayLabel}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="flex flex-col items-center justify-center text-center px-1"
                        >
                          <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[90px]">
                            {displayLabel}
                          </span>
                          <span className="text-2xl font-black text-gray-900 leading-tight">
                            {displayValue}
                          </span>
                          {activeHoveredSegment && totalChartValue > 0 && (
                            <span className="text-[10px] font-bold text-red-600">
                              {displayPercentage}%
                            </span>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    }
                  />
                </div>

                {/* Legend List */}
                <div className="w-full sm:flex-1 space-y-1 max-h-[160px] overflow-y-auto pr-1">
                  {activeSegments.map((segment) => {
                    const isHovered = hoveredSegmentLabel === segment.label;
                    const pct =
                      totalChartValue > 0
                        ? ((segment.value / totalChartValue) * 100).toFixed(0)
                        : "0";
                    return (
                      <div
                        key={segment.label}
                        onMouseEnter={() => setHoveredSegmentLabel(segment.label)}
                        onMouseLeave={() => setHoveredSegmentLabel(null)}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                          isHovered ? "bg-white shadow-2xs font-bold" : "hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="truncate text-gray-800 text-[11px]">
                            {segment.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-gray-900 text-[11px]">
                            {segment.value}
                          </span>
                          <span className="text-[10px] text-gray-400 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
