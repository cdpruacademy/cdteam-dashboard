"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ProductItem,
  TimelineType,
  INITIAL_PRODUCTS,
  INITIAL_ENHANCEMENTS,
  AVAILABLE_MONTHS,
  MonthlyStore,
  INITIAL_MONTHLY_STORE,
  DEFAULT_AS_OF_BY_MONTH,
} from "@/lib/timeline-data";
import { exportTimelineToExcel, exportTimelineToJSON } from "@/lib/excel-service";

const MONTHLY_STORAGE_KEY = "pru_dashboard_monthly_v3";
const AVAILABLE_MONTHS_KEY = "pru_available_months_v3";
const ACTIVE_MONTH_KEY = "pru_active_month_v3";

export function useProducts() {
  const [timelineType, setTimelineType] = useState<TimelineType>("product");
  const [availableMonths, setAvailableMonths] = useState<string[]>(AVAILABLE_MONTHS);
  const [selectedMonth, setSelectedMonth] = useState<string>("AUG 2026");
  const [monthlyStore, setMonthlyStore] = useState<MonthlyStore>(INITIAL_MONTHLY_STORE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage after mounting + auto-migration
  useEffect(() => {
    try {
      // 1. Load available months
      const storedMonths = localStorage.getItem(AVAILABLE_MONTHS_KEY);
      if (storedMonths) {
        const parsed = JSON.parse(storedMonths);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableMonths(parsed);
        }
      }

      // 2. Load active month
      const storedActiveMonth = localStorage.getItem(ACTIVE_MONTH_KEY);
      if (storedActiveMonth && AVAILABLE_MONTHS.concat(JSON.parse(storedMonths || "[]")).includes(storedActiveMonth)) {
        setSelectedMonth(storedActiveMonth);
      }

      // 3. Load monthly store
      const storedData = localStorage.getItem(MONTHLY_STORAGE_KEY);
      if (storedData) {
        const parsed: MonthlyStore = JSON.parse(storedData);
        setMonthlyStore(parsed);
      } else {
        // Migration from legacy v2 storage if present
        const legacyProducts = localStorage.getItem("pru_dashboard_products_v2");
        const legacyEnhancements = localStorage.getItem("pru_dashboard_enhancements_v2");
        const legacyConfig = localStorage.getItem("pru_timeline_config_v2");

        const initial = { ...INITIAL_MONTHLY_STORE };
        if (legacyProducts || legacyEnhancements) {
          initial["AUG 2026"] = {
            products: legacyProducts ? JSON.parse(legacyProducts) : INITIAL_PRODUCTS,
            enhancements: legacyEnhancements ? JSON.parse(legacyEnhancements) : INITIAL_ENHANCEMENTS,
            asOfText: legacyConfig ? JSON.parse(legacyConfig).asOfText || "as of 31 Aug" : "as of 31 Aug",
          };
        }
        setMonthlyStore(initial);
        localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (err) {
      console.error("Failed to load monthly timeline data from localStorage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save full monthly store helper
  const saveStore = useCallback((updatedStore: MonthlyStore) => {
    setMonthlyStore(updatedStore);
    try {
      localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updatedStore));
    } catch (_) {}
  }, []);

  // Switch active month
  const handleSetSelectedMonth = useCallback(
    (newMonth: string) => {
      setSelectedMonth(newMonth);
      try {
        localStorage.setItem(ACTIVE_MONTH_KEY, newMonth);
      } catch (_) {}

      // If month doesn't exist in store yet, initialize it
      setMonthlyStore((prev) => {
        if (!prev[newMonth]) {
          const defaultAsOf = DEFAULT_AS_OF_BY_MONTH[newMonth] || `as of 15 ${newMonth.split(" ")[0]}`;
          const updated: MonthlyStore = {
            ...prev,
            [newMonth]: {
              products: [],
              enhancements: [],
              asOfText: defaultAsOf,
            },
          };
          try {
            localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
          } catch (_) {}
          return updated;
        }
        return prev;
      });
    },
    []
  );

  // Active month data
  const currentMonthData = useMemo(() => {
    return (
      monthlyStore[selectedMonth] || {
        products: [],
        enhancements: [],
        asOfText: DEFAULT_AS_OF_BY_MONTH[selectedMonth] || "as of 15th",
      }
    );
  }, [monthlyStore, selectedMonth]);

  const asOfText = currentMonthData.asOfText;

  // Change As Of text for current month
  const handleSetAsOfText = useCallback(
    (newAsOf: string) => {
      setMonthlyStore((prev) => {
        const monthObj = prev[selectedMonth] || {
          products: [],
          enhancements: [],
          asOfText: newAsOf,
        };
        const updated: MonthlyStore = {
          ...prev,
          [selectedMonth]: {
            ...monthObj,
            asOfText: newAsOf,
          },
        };
        try {
          localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    },
    [selectedMonth]
  );

  // Current active list depending on timelineType
  const currentItems = useMemo(() => {
    return timelineType === "product"
      ? currentMonthData.products
      : currentMonthData.enhancements;
  }, [timelineType, currentMonthData]);

  // CRUD for active month
  const addProduct = useCallback(
    (item: Omit<ProductItem, "id">) => {
      const newId = `${timelineType === "product" ? "pru" : "enh"}-${Date.now()}`;
      const newItem: ProductItem = {
        ...item,
        id: newId,
        month: selectedMonth,
      };

      setMonthlyStore((prev) => {
        const monthObj = prev[selectedMonth] || {
          products: [],
          enhancements: [],
          asOfText: DEFAULT_AS_OF_BY_MONTH[selectedMonth] || "as of 15th",
        };

        const updatedMonth =
          timelineType === "product"
            ? { ...monthObj, products: [...monthObj.products, newItem] }
            : { ...monthObj, enhancements: [...monthObj.enhancements, newItem] };

        const updated: MonthlyStore = {
          ...prev,
          [selectedMonth]: updatedMonth,
        };
        try {
          localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      return newItem;
    },
    [timelineType, selectedMonth]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<ProductItem>) => {
      setMonthlyStore((prev) => {
        const monthObj = prev[selectedMonth];
        if (!monthObj) return prev;

        const updatedMonth =
          timelineType === "product"
            ? {
                ...monthObj,
                products: monthObj.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
              }
            : {
                ...monthObj,
                enhancements: monthObj.enhancements.map((p) => (p.id === id ? { ...p, ...updates } : p)),
              };

        const updated: MonthlyStore = {
          ...prev,
          [selectedMonth]: updatedMonth,
        };
        try {
          localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    },
    [timelineType, selectedMonth]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setMonthlyStore((prev) => {
        const monthObj = prev[selectedMonth];
        if (!monthObj) return prev;

        const updatedMonth =
          timelineType === "product"
            ? {
                ...monthObj,
                products: monthObj.products.filter((p) => p.id !== id),
              }
            : {
                ...monthObj,
                enhancements: monthObj.enhancements.filter((p) => p.id !== id),
              };

        const updated: MonthlyStore = {
          ...prev,
          [selectedMonth]: updatedMonth,
        };
        try {
          localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    },
    [timelineType, selectedMonth]
  );

  const resetToDefault = useCallback(() => {
    setMonthlyStore((prev) => {
      const defaultMonthData = INITIAL_MONTHLY_STORE[selectedMonth] || {
        products: INITIAL_PRODUCTS,
        enhancements: INITIAL_ENHANCEMENTS,
        asOfText: DEFAULT_AS_OF_BY_MONTH[selectedMonth] || "as of 31 Aug",
      };

      const updated: MonthlyStore = {
        ...prev,
        [selectedMonth]: defaultMonthData,
      };
      try {
        localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, [selectedMonth]);

  // Clone from previous month (useful for admins starting a new month)
  const copyFromPreviousMonth = useCallback(() => {
    const currentIndex = availableMonths.indexOf(selectedMonth);
    if (currentIndex <= 0) {
      alert("ไม่มีข้อมูลรอบเดือนก่อนหน้าให้คัดลอก");
      return;
    }

    const prevMonthName = availableMonths[currentIndex - 1];
    const prevMonthData = monthlyStore[prevMonthName];
    if (!prevMonthData || (prevMonthData.products.length === 0 && prevMonthData.enhancements.length === 0)) {
      alert(`ไม่พบข้อมูลในรอบเดือน ${prevMonthName}`);
      return;
    }

    const confirmed = confirm(
      `คุณต้องการคัดลอกรายการจากเดือน ${prevMonthName} มายัง ${selectedMonth} หรือไม่? (ข้อมูลเดิมใน ${selectedMonth} จะถูกแทนที่)`
    );
    if (!confirmed) return;

    // Deep clone with new IDs
    const clonedProducts: ProductItem[] = prevMonthData.products.map((p, idx) => ({
      ...p,
      id: `pru-${Date.now()}-${idx}`,
      month: selectedMonth,
    }));

    const clonedEnhancements: ProductItem[] = prevMonthData.enhancements.map((e, idx) => ({
      ...e,
      id: `enh-${Date.now()}-${idx}`,
      month: selectedMonth,
    }));

    setMonthlyStore((prev) => {
      const updated: MonthlyStore = {
        ...prev,
        [selectedMonth]: {
          products: clonedProducts,
          enhancements: clonedEnhancements,
          asOfText: DEFAULT_AS_OF_BY_MONTH[selectedMonth] || `as of 15 ${selectedMonth.split(" ")[0]}`,
        },
      };
      try {
        localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    alert(`คัดลอกข้อมูลจาก ${prevMonthName} มายัง ${selectedMonth} สำเร็จเรียบร้อย`);
  }, [availableMonths, selectedMonth, monthlyStore]);

  // Add a new month cycle
  const addNewMonth = useCallback(
    (monthName: string) => {
      const clean = monthName.trim().toUpperCase();
      if (!clean) return;
      if (availableMonths.includes(clean)) {
        alert("รอบเดือนนี้มีอยู่ในระบบแล้ว");
        setSelectedMonth(clean);
        return;
      }

      const updatedMonths = [...availableMonths, clean];
      setAvailableMonths(updatedMonths);
      try {
        localStorage.setItem(AVAILABLE_MONTHS_KEY, JSON.stringify(updatedMonths));
      } catch (_) {}

      handleSetSelectedMonth(clean);
    },
    [availableMonths, handleSetSelectedMonth]
  );

  // Bulk import
  const importItems = useCallback(
    (imported: ProductItem[]) => {
      setMonthlyStore((prev) => {
        const monthObj = prev[selectedMonth] || {
          products: [],
          enhancements: [],
          asOfText: DEFAULT_AS_OF_BY_MONTH[selectedMonth] || "as of 15th",
        };

        const updatedMonth =
          timelineType === "product"
            ? { ...monthObj, products: imported }
            : { ...monthObj, enhancements: imported };

        const updated: MonthlyStore = {
          ...prev,
          [selectedMonth]: updatedMonth,
        };
        try {
          localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    },
    [timelineType, selectedMonth]
  );

  // Excel & JSON export
  const exportExcel = useCallback(() => {
    const title = timelineType === "product" ? "Product Timeline" : "Enhancement Timeline";
    exportTimelineToExcel(currentItems, title, selectedMonth, asOfText);
  }, [timelineType, currentItems, selectedMonth, asOfText]);

  const exportJSON = useCallback(() => {
    const title = timelineType === "product" ? "product_timeline" : "enhancement_timeline";
    exportTimelineToJSON(currentItems, title, selectedMonth);
  }, [timelineType, currentItems, selectedMonth]);

  return {
    timelineType,
    setTimelineType,
    selectedMonth,
    setSelectedMonth: handleSetSelectedMonth,
    availableMonths,
    addNewMonth,
    copyFromPreviousMonth,
    asOfText,
    setAsOfText: handleSetAsOfText,
    currentItems,
    isLoaded,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    importItems,
    exportExcel,
    exportJSON,
    monthlyStore,
  };
}

