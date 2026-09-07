"use client";

import { useState, useEffect, useCallback } from "react";

const ADMIN_STORAGE_KEY = "pru_admin_auth_status";
const CORRECT_PASSWORD = "pru2026";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored === "true") {
        setIsAdmin(true);
      }
    } catch (_) {}
    setIsAuthLoaded(true);
  }, []);

  const login = useCallback((password: string): boolean => {
    if (password.trim() === CORRECT_PASSWORD) {
      setIsAdmin(true);
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      } catch (_) {}
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (_) {}
  }, []);

  return {
    isAdmin,
    isAuthLoaded,
    login,
    logout,
  };
}
