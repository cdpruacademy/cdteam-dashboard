"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  saveTimelineToCloud,
  fetchTimelineFromCloud,
  SUPABASE_SQL_SETUP,
  SupabaseConfig,
} from "@/lib/supabase";
import { MonthlyStore } from "@/lib/timeline-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
} from "lucide-react";

interface CloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyStore: MonthlyStore;
  availableMonths: string[];
  activeMonth: string;
  onCloudDataLoaded: (store: MonthlyStore, months: string[], activeMonth?: string) => void;
  onStatusChange?: (isConnected: boolean) => void;
}

export function CloudSettingsModal({
  isOpen,
  onClose,
  monthlyStore,
  availableMonths,
  activeMonth,
  onCloudDataLoaded,
  onStatusChange,
}: CloudSettingsModalProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists?: boolean;
  } | null>(null);
  const [hasCopiedSQL, setHasCopiedSQL] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      if (config) {
        setUrl(config.url || "");
        setAnonKey(config.anonKey || "");
      }
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: "กรุณาระบุทั้ง Supabase Project URL และ Anon API Key",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(res);
      if (res.success && res.tableExists) {
        onStatusChange?.(true);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: "กรุณากรอกข้อมูล Supabase URL และ Anon API Key ให้ครบถ้วน",
      });
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Save config to LocalStorage
      const newConfig: SupabaseConfig = {
        url: url.trim(),
        anonKey: anonKey.trim(),
      };
      saveStoredSupabaseConfig(newConfig);

      // 2. Upload current data to cloud
      const saveRes = await saveTimelineToCloud({
        monthlyStore,
        availableMonths,
        activeMonth,
      });

      if (!saveRes.success) {
        setTestResult({
          success: false,
          message: "บันทึกคอนฟิกแล้ว แต่ส่งข้อมูลขึ้น Cloud ไม่สำเร็จ: " + (saveRes.error || "กรุณาตรวจเช็กตารางใน SQL Editor"),
        });
        return;
      }

      onStatusChange?.(true);
      setTestResult({
        success: true,
        message: "เชื่อมต่อและซิงค์ข้อมูลขึ้น Cloud Database สำเร็จแล้ว! ทุกเครื่องและมือถือจะเห็นข้อมูลตรงกันทันที",
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "เกิดข้อผิดพลาด: " + (err?.message || "ไม่สามารถเชื่อมต่อได้"),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    try {
      const cloudData = await fetchTimelineFromCloud();
      if (cloudData && cloudData.monthlyStore) {
        onCloudDataLoaded(cloudData.monthlyStore, cloudData.availableMonths, cloudData.activeMonth);
        setTestResult({
          success: true,
          message: "ดึงข้อมูลล่าสุดจาก Cloud ลงมาที่เครื่องนี้สำเร็จ!",
        });
      } else {
        setTestResult({
          success: false,
          message: "ไม่พบข้อมูลบน Cloud หรือยังไม่ได้สร้างข้อมูล",
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    saveStoredSupabaseConfig(null);
    setUrl("");
    setAnonKey("");
    onStatusChange?.(false);
    setTestResult({
      success: true,
      message: "ยกเลิกการเชื่อมต่อ Cloud เรียบร้อยแล้ว (กลับสู่โหมดบันทึกในเครื่อง Local)",
    });
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setHasCopiedSQL(true);
    setTimeout(() => setHasCopiedSQL(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl my-auto">
        <Card className="border border-gray-200 shadow-2xl bg-white max-h-[92vh] flex flex-col">
          {/* Header */}
          <CardHeader className="pb-4 border-b border-gray-100 shrink-0 bg-gray-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                      ตั้งค่า Cloud Database (Supabase)
                    </CardTitle>
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs">
                      Free Tier
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-gray-500 mt-0.5">
                    เชื่อมต่อฐานข้อมูลกลางเพื่อให้ทุกเครื่องและมือถือเห็นข้อมูลอัปเดตตรงกันทันที
                  </CardDescription>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Benefits Notice */}
            <div className="p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ข้อมูลจะถูกแชร์ให้ทั้งทีมเห็นตรงกันแบบ Real-time:</span>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  เมื่อเปิดใช้งาน ใครที่เปิดดูผ่านคอมพิวเตอร์เครื่องอื่น หรือเปิดบนมือถือ จะเห็นข้อมูลล่าสุดทันทีโดยไม่ต้อง Export/Import ไฟล์
                </p>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label required>Supabase Project URL</Label>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    เปิด Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <Input
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-[11px] text-gray-500">
                  ดูได้จากเมนู Project Settings &gt; API ใน Supabase
                </p>
              </div>

              <div className="space-y-1.5">
                <Label required>Supabase Anon Public API Key</Label>
                <Input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                />
                <p className="text-[11px] text-gray-500">
                  คีย์แบบ anon public สำหรับให้หน้าเว็บอ่านและบันทึกข้อมูล
                </p>
              </div>
            </div>

            {/* Test Connection Button & Result */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  loading={isTesting}
                  className="text-xs h-9 gap-1.5"
                >
                  <Server className="w-3.5 h-3.5" />
                  ทดสอบการเชื่อมต่อ
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePullFromCloud}
                  loading={isSyncing}
                  className="text-xs h-9 text-blue-600 hover:bg-blue-50 gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  ดึงข้อมูลล่าสุดจาก Cloud
                </Button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-relaxed">
                    <span className="font-semibold">
                      {testResult.success ? "ผลการเชื่อมต่อ:" : "แจ้งเตือน:"}
                    </span>{" "}
                    {testResult.message}
                  </div>
                </div>
              )}
            </div>

            {/* SQL Script Accordion / Copy */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">
                  คำสั่งสร้างตารางบน Supabase (ทำครั้งเดียว):
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopySQL}
                  className="h-7 text-xs gap-1"
                >
                  {hasCopiedSQL ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      คัดลอกแล้ว!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      คัดลอกโค้ด SQL
                    </>
                  )}
                </Button>
              </div>
              <p className="text-gray-500 text-[11px]">
                นำโค้ดไปวางในเมนู <strong>SQL Editor</strong> บน Supabase แล้วกด <strong>Run</strong> เพื่อสร้างตาราง
              </p>
            </div>
          </div>

          {/* Footer */}
          <CardFooter className="border-t border-gray-100 p-4 bg-gray-50/60 shrink-0 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-gray-500 hover:text-red-600 text-xs"
            >
              ตัดการเชื่อมต่อ
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                ปิด
              </Button>
              <Button
                type="button"
                onClick={handleSaveAndSync}
                loading={isSyncing}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกและซิงค์ข้อมูลเดี๋ยวนี้</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
