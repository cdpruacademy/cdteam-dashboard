"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ProductItem,
  TimelineType,
  INITIAL_PRODUCTS,
  INITIAL_ENHANCEMENTS,
  AVAILABLE_MONTHS,
} from "@/lib/timeline-data";
import { exportTimelineToExcel, exportTimelineToJSON } from "@/lib/excel-service";

const PRODUCTS_STORAGE_KEY = "pru_dashboard_products_v2";
const ENHANCEMENTS_STORAGE_KEY = "pru_dashboard_enhancements_v2";
const CONFIG_STORAGE_KEY = "pru_timeline_config_v2";

export function useProducts() {
  const [timelineType, setTimelineType] = useState<TimelineType>("product");
  const [selectedMonth, setSelectedMonth] = useState<string>("AUG 2026");
  const [asOfText, setAsOfText] = useState<string>("as of 31 Aug");

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [enhancements, setEnhancements] = useState<ProductItem[]>(INITIAL_ENHANCEMENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage after mounting
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
      }

      const storedEnhancements = localStorage.getItem(ENHANCEMENTS_STORAGE_KEY);
      if (storedEnhancements) {
        const parsed = JSON.parse(storedEnhancements);
        if (Array.isArray(parsed) && parsed.length > 0) setEnhancements(parsed);
      }

      const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        if (config.asOfText) setAsOfText(config.asOfText);
        if (config.selectedMonth) setSelectedMonth(config.selectedMonth);
      }
    } catch (err) {
      console.error("Failed to load timeline data from localStorage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes
  const saveProducts = useCallback((items: ProductItem[]) => {
    setProducts(items);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  }, []);

  const saveEnhancements = useCallback((items: ProductItem[]) => {
    setEnhancements(items);
    try {
      localStorage.setItem(ENHANCEMENTS_STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  }, []);

  const saveConfig = useCallback((month: string, asOf: string) => {
    try {
      localStorage.setItem(
        CONFIG_STORAGE_KEY,
        JSON.stringify({ selectedMonth: month, asOfText: asOf })
      );
    } catch (_) {}
  }, []);

  const handleSetAsOfText = useCallback(
    (newAsOf: string) => {
      setAsOfText(newAsOf);
      saveConfig(selectedMonth, newAsOf);
    },
    [selectedMonth, saveConfig]
  );

  const handleSetSelectedMonth = useCallback(
    (newMonth: string) => {
      setSelectedMonth(newMonth);
      saveConfig(newMonth, asOfText);
    },
    [asOfText, saveConfig]
  );

  // Current active list depending on timelineType
  const currentItems = useMemo(() => {
    const list = timelineType === "product" ? products : enhancements;
    // Filter by month if set, or return all if all belong to current cycle
    return list;
  }, [timelineType, products, enhancements]);

  // CRUD for active timeline
  const addProduct = useCallback(
    (item: Omit<ProductItem, "id">) => {
      const newId = `${timelineType === "product" ? "pru" : "enh"}-${Date.now()}`;
      const newItem: ProductItem = {
        ...item,
        id: newId,
        month: selectedMonth,
      };

      if (timelineType === "product") {
        saveProducts([...products, newItem]);
      } else {
        saveEnhancements([...enhancements, newItem]);
      }
      return newItem;
    },
    [timelineType, products, enhancements, selectedMonth, saveProducts, saveEnhancements]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<ProductItem>) => {
      if (timelineType === "product") {
        const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
        saveProducts(updated);
      } else {
        const updated = enhancements.map((p) => (p.id === id ? { ...p, ...updates } : p));
        saveEnhancements(updated);
      }
    },
    [timelineType, products, enhancements, saveProducts, saveEnhancements]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      if (timelineType === "product") {
        saveProducts(products.filter((p) => p.id !== id));
      } else {
        saveEnhancements(enhancements.filter((p) => p.id !== id));
      }
    },
    [timelineType, products, enhancements, saveProducts, saveEnhancements]
  );

  const resetToDefault = useCallback(() => {
    if (timelineType === "product") {
      saveProducts(INITIAL_PRODUCTS);
    } else {
      saveEnhancements(INITIAL_ENHANCEMENTS);
    }
  }, [timelineType, saveProducts, saveEnhancements]);

  // Bulk import
  const importItems = useCallback(
    (imported: ProductItem[]) => {
      if (timelineType === "product") {
        saveProducts(imported);
      } else {
        saveEnhancements(imported);
      }
    },
    [timelineType, saveProducts, saveEnhancements]
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
    availableMonths: AVAILABLE_MONTHS,
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
  };
}
