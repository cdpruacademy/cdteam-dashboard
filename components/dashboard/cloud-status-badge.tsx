"use client";

import * as React from "react";
import { Cloud, CheckCircle2, HardDrive, RefreshCw } from "lucide-react";

interface CloudStatusBadgeProps {
  isCloudConnected: boolean;
  isSyncing?: boolean;
  onClick?: () => void;
  isAdmin?: boolean;
}

export function CloudStatusBadge({
  isCloudConnected,
  isSyncing = false,
  onClick,
  isAdmin = false,
}: CloudStatusBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAdmin}
      title={
        isAdmin
          ? "คลิกเพื่อจัดการการเชื่อมต่อ Cloud Database (Supabase)"
          : isCloudConnected
          ? "ระบบเชื่อมต่อ Cloud กลาง ข้อมูลอัปเดตตรงกันทุกเครื่อง"
          : "ทำงานในโหมดออฟไลน์ (Local Storage)"
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
        isSyncing
          ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
          : isCloudConnected
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
      } ${isAdmin ? "cursor-pointer" : "cursor-default"}`}
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
    </button>
  );
}
