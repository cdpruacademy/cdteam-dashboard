"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  ProductItem,
  PHASES,
  PhaseKey,
  MilestoneStatus,
  TimelineType,
} from "@/lib/timeline-data";
import { X, Trash2, CheckCircle2 } from "lucide-react";

interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  timelineType?: TimelineType;
  productToEdit?: ProductItem | null;
  onSave: (product: Omit<ProductItem, "id">, id?: string) => void;
  onDelete?: (id: string) => void;
}

const BROKER_OPTIONS = ["ttb", "ttb touch", "New Broker", "Agency", "UOB", "Audit", "Other"];

export function ProductFormDrawer({
  isOpen,
  onClose,
  timelineType = "product",
  productToEdit,
  onSave,
  onDelete,
}: ProductFormDrawerProps) {
  const isEnhancement = timelineType === "enhancement";

  const [broker, setBroker] = useState<string>(isEnhancement ? "ttb" : "New Broker");
  const [customBroker, setCustomBroker] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [internalDate, setInternalDate] = useState<string>("TBC");
  const [commercialDate, setCommercialDate] = useState<string>("TBC");
  const [csDate, setCsDate] = useState<string>("");
  const [customRightLabel, setCustomRightLabel] = useState<string>("");

  interface MilestoneFormState {
    enabled: boolean;
    date: string;
    status: MilestoneStatus;
    isElearningIcon: boolean;
  }

  const [milestonesState, setMilestonesState] = useState<Record<PhaseKey, MilestoneFormState>>({
    "kick-off": { enabled: true, date: "", status: "completed", isElearningIcon: false },
    "first-draft": { enabled: false, date: "", status: "pending", isElearningIcon: false },
    "first-draft-elearning": { enabled: false, date: "", status: "pending", isElearningIcon: false },
    "final-approval": { enabled: false, date: "", status: "pending", isElearningIcon: false },
    "final-elearning": { enabled: false, date: "", status: "pending", isElearningIcon: false },
    "internal-training": { enabled: false, date: "", status: "pending", isElearningIcon: false },
    launch: { enabled: false, date: "", status: "pending", isElearningIcon: true },
  });

  const [errors, setErrors] = useState<{ name?: string; owner?: string }>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      if (BROKER_OPTIONS.includes(productToEdit.broker)) {
        setBroker(productToEdit.broker);
        setCustomBroker("");
      } else {
        setBroker("Other");
        setCustomBroker(productToEdit.broker);
      }
      setName(productToEdit.name);
      setOwner(productToEdit.owner);
      setInternalDate(productToEdit.internalDate || "TBC");
      setCommercialDate(productToEdit.commercialDate || "TBC");
      setCsDate(productToEdit.csDate || "");
      setCustomRightLabel(productToEdit.customRightLabel || "");

      const nextMState: Record<PhaseKey, MilestoneFormState> = { ...milestonesState };
      PHASES.forEach((p) => {
        const existing = productToEdit.milestones[p.key];
        if (existing) {
          nextMState[p.key] = {
            enabled: true,
            date: existing.date || "",
            status: existing.status || "completed",
            isElearningIcon: !!existing.isElearningIcon,
          };
        } else {
          nextMState[p.key] = {
            enabled: false,
            date: "",
            status: "pending",
            isElearningIcon: false,
          };
        }
      });
      setMilestonesState(nextMState);
    } else {
      // Default new entry
      setBroker(isEnhancement ? "ttb" : "New Broker");
      setCustomBroker("");
      setName("");
      setOwner("");
      setInternalDate("TBC");
      setCommercialDate("TBC");
      setCsDate("");
      setCustomRightLabel("");
      setMilestonesState({
        "kick-off": { enabled: true, date: "", status: "completed", isElearningIcon: false },
        "first-draft": { enabled: true, date: "", status: "completed", isElearningIcon: false },
        "first-draft-elearning": { enabled: false, date: "", status: "pending", isElearningIcon: false },
        "final-approval": { enabled: true, date: "", status: "completed", isElearningIcon: false },
        "final-elearning": { enabled: false, date: "", status: "pending", isElearningIcon: false },
        "internal-training": { enabled: false, date: "", status: "pending", isElearningIcon: false },
        launch: { enabled: true, date: "", status: "completed", isElearningIcon: true },
      });
    }
    setErrors({});
    setIsConfirmingDelete(false);
  }, [productToEdit, isOpen, isEnhancement]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; owner?: string } = {};
    if (!name.trim()) newErrors.name = "กรุณาระบุชื่อรายการ";
    if (!owner.trim()) newErrors.owner = "กรุณาระบุชื่อผู้รับผิดชอบ";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const builtMilestones: Partial<Record<PhaseKey, any>> = {};
    PHASES.forEach((p) => {
      const ms = milestonesState[p.key];
      if (ms && ms.enabled) {
        builtMilestones[p.key] = {
          phase: p.key,
          date: ms.date.trim() || undefined,
          status: ms.status,
          isElearningIcon: ms.isElearningIcon,
        };
      }
    });

    const finalBroker = broker === "Other" ? customBroker.trim() || "Broker" : broker;

    const savedData: Omit<ProductItem, "id"> = {
      broker: finalBroker,
      name: name.trim(),
      owner: owner.trim(),
      internalDate: internalDate.trim() || undefined,
      commercialDate: commercialDate.trim() || undefined,
      csDate: csDate.trim() || undefined,
      customRightLabel: customRightLabel.trim() || undefined,
      milestones: builtMilestones,
    };

    onSave(savedData, productToEdit?.id);
    onClose();
  };

  const handleDelete = () => {
    if (productToEdit && onDelete) {
      onDelete(productToEdit.id);
      onClose();
    }
  };

  const primaryColor = isEnhancement ? "bg-[#005BAB] hover:bg-[#004A8C]" : "bg-[#ED1C24] hover:bg-[#D4181F]";
  const ringColor = isEnhancement ? "focus:ring-[#0066CC]" : "focus:ring-[#ED1C24]";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {productToEdit
                ? isEnhancement
                  ? "แก้ไข Enhancement Timeline"
                  : "แก้ไข Product Timeline"
                : isEnhancement
                ? "เพิ่ม Enhancement ใหม่"
                : "เพิ่ม Product ใหม่"}
            </h2>
            <p className="text-xs text-gray-500">
              กรอกข้อมูลและกำหนดหมุดหมายใน timeline ({isEnhancement ? "Enhancement" : "New Product"})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: ข้อมูลทั่วไป */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-1 border-b border-gray-100 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isEnhancement ? "bg-[#0066CC]" : "bg-[#ED1C24]"}`} />
              ข้อมูลทั่วไป
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Channel / Tag <span className="text-red-500">*</span>
                </label>
                <select
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className={`w-full text-sm border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 ${ringColor}`}
                >
                  {BROKER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {broker === "Other" && (
                  <input
                    type="text"
                    value={customBroker}
                    onChange={(e) => setCustomBroker(e.target.value)}
                    placeholder="ระบุชื่อ Channel..."
                    className={`mt-2 w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${ringColor}`}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ผู้รับผิดชอบ (Owner) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="เช่น Surakit P."
                  className={`w-full text-sm border rounded-lg p-2 focus:outline-none focus:ring-2 ${ringColor} ${
                    errors.owner ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชื่อ Product / โครงการ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Add New fund ILP"
                className={`w-full text-sm border rounded-lg p-2 focus:outline-none focus:ring-2 ${ringColor} ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Section 2: Milestones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isEnhancement ? "bg-[#0066CC]" : "bg-[#ED1C24]"}`} />
                Milestones (หมุดหมายใน Timeline)
              </h3>
              <span className="text-[11px] text-gray-500">เลือกสถานะและวันที่</span>
            </div>

            <div className="space-y-2">
              {PHASES.map((phase) => {
                const ms = milestonesState[phase.key];
                return (
                  <div
                    key={phase.key}
                    className={`p-2.5 rounded-lg border transition-all ${
                      ms.enabled
                        ? "bg-white border-gray-200 shadow-2xs"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={ms.enabled}
                          onChange={(e) => {
                            setMilestonesState((prev) => ({
                              ...prev,
                              [phase.key]: { ...prev[phase.key], enabled: e.target.checked },
                            }));
                          }}
                          className={`rounded h-4 w-4 ${isEnhancement ? "text-[#0066CC]" : "text-[#ED1C24]"}`}
                        />
                        <span className="text-xs font-bold text-gray-800">
                          {phase.label.replace("\n", " ")}
                        </span>
                      </label>

                      {ms.enabled && (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={ms.date}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMilestonesState((prev) => ({
                                ...prev,
                                [phase.key]: { ...prev[phase.key], date: val },
                              }));
                            }}
                            placeholder="เช่น 11 Aug 2026"
                            className={`text-xs border border-gray-300 rounded px-2 py-1 w-28 focus:outline-none focus:ring-1 ${ringColor}`}
                          />

                          <select
                            value={ms.status}
                            onChange={(e) => {
                              const val = e.target.value as MilestoneStatus;
                              setMilestonesState((prev) => ({
                                ...prev,
                                [phase.key]: { ...prev[phase.key], status: val },
                              }));
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none"
                          >
                            <option value="completed">Completed (เขียว)</option>
                            <option value="in-progress">In Progress</option>
                            <option value="pending">Pending (เทา)</option>
                          </select>

                          <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer ml-1">
                            <input
                              type="checkbox"
                              checked={ms.isElearningIcon}
                              onChange={(e) => {
                                setMilestonesState((prev) => ({
                                  ...prev,
                                  [phase.key]: {
                                    ...prev[phase.key],
                                    isElearningIcon: e.target.checked,
                                  },
                                }));
                              }}
                              className="rounded h-3.5 w-3.5"
                            />
                            <span className={isEnhancement ? "text-[#0066CC] font-medium" : "text-red-600 font-medium"}>
                              ไอคอนจอคอม
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: กำหนดการเปิดตัว / สถานะฝั่งขวา */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-1 border-b border-gray-100 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isEnhancement ? "bg-[#0066CC]" : "bg-[#ED1C24]"}`} />
              กำหนดการเปิดตัว (Launch Dates & Status)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                สถานะเฉพาะฝั่งขวา (เช่น Sent out : 7 Aug 2026 หรือ Submission Date : Mid of Oct 2026)
              </label>
              <input
                type="text"
                value={customRightLabel}
                onChange={(e) => setCustomRightLabel(e.target.value)}
                placeholder="ระบุข้อความกำหนดการฝั่งขวา (ถ้ามี จะแสดงแทน Internal/Commercial)"
                className={`w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${ringColor}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Internal Date
                </label>
                <input
                  type="text"
                  value={internalDate}
                  onChange={(e) => setInternalDate(e.target.value)}
                  placeholder="เช่น 13 Aug 2026 หรือ TBC"
                  className={`w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${ringColor}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Commercial Date
                </label>
                <input
                  type="text"
                  value={commercialDate}
                  onChange={(e) => setCommercialDate(e.target.value)}
                  placeholder="เช่น 14 Aug 2026 หรือ TBC"
                  className={`w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${ringColor}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CS Date (optional)
                </label>
                <input
                  type="text"
                  value={csDate}
                  onChange={(e) => setCsDate(e.target.value)}
                  placeholder="เช่น CS: 27 Aug 2026"
                  className={`w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${ringColor}`}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 flex items-center justify-between">
          <div>
            {productToEdit && onDelete && (
              <>
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 font-semibold">ยืนยันลบ?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1 text-xs bg-red-600 text-white rounded font-medium hover:bg-red-700"
                    >
                      ลบจริง
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ลบรายการนี้</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-colors ${primaryColor}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
