"use client";

import { useState, useEffect, useCallback } from "react";

export const DEFAULT_TEAM_MEMBERS = [
  "Jirapat O.",
  "Sakkarin S.",
  "Nitikan B.",
  "Surakit P.",
];

const STORAGE_KEY = "pru_team_members_v1";

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<string[]>(DEFAULT_TEAM_MEMBERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeamMembers(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load team members from storage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save helper
  const saveMembers = useCallback((newList: string[]) => {
    setTeamMembers(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (err) {
      console.error("Failed to save team members", err);
    }
  }, []);

  // Add Member
  const addMember = useCallback(
    (name: string): boolean => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      if (teamMembers.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
        return false; // Already exists
      }
      const updated = [...teamMembers, trimmed];
      saveMembers(updated);
      return true;
    },
    [teamMembers, saveMembers]
  );

  // Update Member
  const updateMember = useCallback(
    (oldName: string, newName: string): boolean => {
      const trimmed = newName.trim();
      if (!trimmed) return false;
      const index = teamMembers.indexOf(oldName);
      if (index === -1) return false;
      // Check duplicate with another member
      if (
        teamMembers.some(
          (m, i) => i !== index && m.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        return false;
      }
      const updated = [...teamMembers];
      updated[index] = trimmed;
      saveMembers(updated);
      return true;
    },
    [teamMembers, saveMembers]
  );

  // Delete Member
  const deleteMember = useCallback(
    (name: string): boolean => {
      if (teamMembers.length <= 1) {
        return false; // Prevent removing all members
      }
      const updated = teamMembers.filter((m) => m !== name);
      saveMembers(updated);
      return true;
    },
    [teamMembers, saveMembers]
  );

  // Reset to Default
  const resetToDefault = useCallback(() => {
    saveMembers(DEFAULT_TEAM_MEMBERS);
  }, [saveMembers]);

  return {
    teamMembers,
    isLoaded,
    addMember,
    updateMember,
    deleteMember,
    resetToDefault,
  };
}
