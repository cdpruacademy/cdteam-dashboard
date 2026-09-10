"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useProducts } from "@/hooks/use-products";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ProductItem } from "@/lib/timeline-data";
import { TimelineHeader } from "./timeline-header";
import { TimelineRow } from "./timeline-row";
import { ProductFormModal } from "./product-form-modal";
import { BrokerColorModal } from "./broker-color-modal";
import { toPng } from "html-to-image";
import { Plus, AlertCircle } from "lucide-react";

const BROKER_COLORS_KEY = "pru_broker_colors_map_v1";

const DEFAULT_COLORS: Record<string, string> = {
  ttb: "#009FE3", // ฟ้าสดใส ttb
  "ttb touch": "#009FE3",
  UOB: "#0B2265", // น้ำเงินเข้ม UOB
  Agency: "#ED1C24", // แดง Prudential
  "New Broker": "#334155", // เทา Slate
  Audit: "#1E293B", // ดำ Charcoal
};

export function ProductTimeline() {
  const {
    timelineType,
    setTimelineType,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    addNewMonth,
    copyFromPreviousMonth,
    asOfText,
    setAsOfText,
    currentItems,
    isLoaded,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    exportExcel,
    exportJSON,
    monthlyStore,
    isCloudConnected,
    isSyncing,
  } = useProducts();

  const { isAdmin } = useAdminAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductItem | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Broker Colors State
  const [colorMap, setColorMap] = useState<Record<string, string>>(DEFAULT_COLORS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BROKER_COLORS_KEY);
      if (stored) {
        setColorMap({ ...DEFAULT_COLORS, ...JSON.parse(stored) });
      }
    } catch (_) {}
  }, []);

  const handleColorChange = (broker: string, hex: string) => {
    const updated = { ...colorMap, [broker]: hex };
    setColorMap(updated);
    try {
      localStorage.setItem(BROKER_COLORS_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleResetColors = () => {
    setColorMap(DEFAULT_COLORS);
    try {
      localStorage.setItem(BROKER_COLORS_KEY, JSON.stringify(DEFAULT_COLORS));
    } catch (_) {}
  };

  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProductItem) => {
    setProductToEdit(item);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (data: Omit<ProductItem, "id">, id?: string) => {
    if (id) {
      updateProduct(id, data);
    } else {
      addProduct(data);
    }
  };

  // Clean Image Export (Completely Filters Out All Buttons)
  const handleExportAll = async () => {
    if (!dashboardRef.current) return;
    try {
      setIsExportingAll(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(dashboardRef.current, {
        cacheBust: true,
        backgroundColor: "#FFFFFF",
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains("export-hide")) {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement("a");
      const prefix =
        timelineType === "product"
          ? "Prudential-New-Product-Timeline"
          : "Prudential-Enhancement-Timeline";
      link.download = `${prefix}-${selectedMonth.replace(/\s+/g, "_")}-${asOfText.replace(
        /\s+/g,
        "_"
      )}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export dashboard image", err);
      alert("ไม่สามารถ Export ภาพรวมได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto py-4 px-3 sm:px-6">
      {/* Main Container Card */}
      <div
        ref={dashboardRef}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8"
      >
        {/* Timeline Header */}
        <TimelineHeader
          timelineType={timelineType}
          onTimelineTypeChange={setTimelineType}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableMonths={availableMonths}
          onAddNewMonth={addNewMonth}
          asOfText={asOfText}
          onAsOfChange={setAsOfText}
          onAddClick={handleOpenAdd}
          onExportAllClick={handleExportAll}
          onExportExcel={exportExcel}
          onExportJSON={exportJSON}
          onOpenColorModal={() => setIsColorModalOpen(true)}
          onResetClick={resetToDefault}
          isExporting={isExportingAll}
          isAdmin={isAdmin}
          isCloudConnected={isCloudConnected}
          isSyncing={isSyncing}
        />

        {/* Timeline Rows Area with Horizontal Scroll */}
        <div className="overflow-x-auto pb-4 mt-2">
          <div className="min-w-[960px] space-y-1">
            {isLoaded && currentItems.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl my-4">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-700">
                  ยังไม่มีข้อมูลใน{" "}
                  {timelineType === "product"
                    ? "New Product Timeline"
                    : "Enhancement Timeline"}{" "}
                  รอบเดือน ({selectedMonth})
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  {isAdmin
                    ? "กดปุ่มด้านล่างเพื่อเริ่มเพิ่มข้อมูล หรือกดคัดลอกจากเดือนก่อนหน้า"
                    : "เข้าสู่โหมด Admin เพื่อเพิ่มข้อมูลในรอบเดือนนี้"}
                </p>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#ED1C24] text-white hover:bg-[#D4181F] transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มข้อมูลรอบนี้
                  </button>
                ) : null}
              </div>
            ) : (
              currentItems.map((item) => (
                <TimelineRow
                  key={item.id}
                  product={item}
                  timelineType={timelineType}
                  isAdmin={isAdmin}
                  onEdit={handleOpenEdit}
                  onDelete={deleteProduct}
                  customColorMap={colorMap}
                />
              ))
            )}
          </div>
        </div>

        {/* Clean Footer (without tips) */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <div className="export-hide">
            {isAdmin ? "🔒 สิทธิ์ Admin: เปิดใช้งาน" : "โหมดผู้ชม (Read-only)"}
          </div>
          <div className="font-medium text-gray-500">
            Prudential Thailand • ฝ่ายพัฒนาหลักสูตร
          </div>
        </div>
      </div>

      {/* Redesigned Centered Shadcn Modal for Add/Edit */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        timelineType={timelineType}
        selectedMonth={selectedMonth}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        onDelete={deleteProduct}
      />

      {/* Broker Color Customizer Modal */}
      <BrokerColorModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onColorChange={handleColorChange}
        onResetColors={handleResetColors}
        currentColors={colorMap}
      />
    </div>
  );
}
