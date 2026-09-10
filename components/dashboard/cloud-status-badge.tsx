"use client";

import * as React from "react";
import { Cloud, CheckCircle2, HardDrive, RefreshCw } from "lucide-react";

interface CloudStatusBadgeProps {
  isCloudConnected: boolean;
  isSyncing?: boolean;
}

export function CloudStatusBadge({
  isCloudConnected,
  isSyncing = false,
}: CloudStatusBadgeProps) {
  return (
    <div
      title={
        isCloudConnected
          ? "เชื่อมต่อฐานข้อมูล Cloud (Supabase) เรียบร้อยแล้ว ข้อมูลอัปเดตตรงกันทุกเครื่อง"
          : "ทำงานในโหมดออฟไลน์ (Local Storage)"
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all select-none cursor-default ${
        isSyncing
          ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
          : isCloudConnected
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
          <span>กำลังซิงค์...</span>
        </>
      ) : isCloudConnected ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs animate-pulse" />
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Cloud Synced</span>
          <span className="sm:hidden">Cloud</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <HardDrive className="w-3 h-3 text-slate-500" />
          <span className="hidden sm:inline">โหมดในเครื่อง (Local)</span>
          <span className="sm:hidden">Local</span>
        </>
      )}
    </div>
  );
}
