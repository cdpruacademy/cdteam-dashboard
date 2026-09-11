import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { MonthlyStore, getSystemCurrentMonth } from "./timeline-data";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface CloudTimelinePayload {
  monthlyStore: MonthlyStore;
  availableMonths: string[];
  activeMonth?: string;
  updatedAt?: string;
}

const SUPABASE_CONFIG_KEY = "pru_supabase_config_v1";

export const DEFAULT_SUPABASE_URL = "https://bwevlsmrtbqbgsqjpppn.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_-o_L_yfoqNCpq4NnP1tiHQ_kFbmbiMF";

// Read configuration from LocalStorage or environment variables or defaults
export function getStoredSupabaseConfig(): SupabaseConfig | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return parsed;
        }
      }
    } catch (_) {}
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

export function saveStoredSupabaseConfig(config: SupabaseConfig | null) {
  if (typeof window === "undefined") return;
  if (!config || !config.url || !config.anonKey) {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
  } else {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  }
}

let cachedClient: SupabaseClient | null = null;
let currentClientUrl = "";
let currentClientKey = "";

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config) return null;

  if (
    cachedClient &&
    currentClientUrl === config.url &&
    currentClientKey === config.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });
    currentClientUrl = config.url;
    currentClientKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client", err);
    return null;
  }
}

/**
 * Test connectivity with Supabase and check if table exists
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; tableExists?: boolean }> {
  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await client
      .from("timeline_store")
      .select("id, updated_at")
      .eq("id", "current")
      .maybeSingle();

    if (error) {
      // Check if table missing
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return {
          success: true,
          tableExists: false,
          message: "เชื่อมต่อ Supabase สำเร็จ แต่ยังไม่พบตาราง timeline_store (กรุณารันคำสั่งสร้างตารางใน SQL Editor)",
        };
      }
      return {
        success: false,
        message: "เชื่อมต่อไม่สำเร็จ: " + error.message,
      };
    }

    return {
      success: true,
      tableExists: true,
      message: "เชื่อมต่อฐานข้อมูล Supabase และพบตารางเรียบร้อยแล้ว!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + (err && err.message ? err.message : "ไม่สามารถติดต่อ Supabase ได้"),
    };
  }
}

/**
 * Fetch latest timeline store from Supabase Cloud DB
 */
export async function fetchTimelineFromCloud(): Promise<CloudTimelinePayload | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("timeline_store")
      .select("id, data, available_months, active_month, updated_at")
      .eq("id", "current")
      .maybeSingle();

    if (error) {
      console.warn("Cloud DB fetch error:", error.message);
      return null;
    }

    if (!data || !data.data) {
      return null;
    }

    return {
      monthlyStore: data.data,
      availableMonths: Array.isArray(data.available_months) ? data.available_months : [],
      activeMonth: data.active_month || undefined,
      updatedAt: data.updated_at || undefined,
    };
  } catch (err) {
    console.warn("Cloud DB network fetch error:", err);
    return null;
  }
}

/**
 * Save timeline store to Supabase Cloud DB
 */
export async function saveTimelineToCloud(
  payload: CloudTimelinePayload
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: "ไม่ได้กำหนดค่าการเชื่อมต่อ Cloud Database" };
  }

  try {
    const row = {
      id: "current",
      data: payload.monthlyStore,
      available_months: payload.availableMonths,
      active_month: payload.activeMonth || getSystemCurrentMonth(),
      updated_at: new Date().toISOString(),
      updated_by: "pru_admin",
    };

    const { error } = await client.from("timeline_store").upsert(row, {
      onConflict: "id",
    });

    if (error) {
      console.error("Cloud DB save error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Cloud DB save exception:", err);
    return { success: false, error: err && err.message ? err.message : "บันทึกข้อมูลไม่สำเร็จ" };
  }
}

/**
 * Subscribe to real-time changes on timeline_store table
 */
export function subscribeToTimelineCloud(
  onUpdate: (payload: CloudTimelinePayload) => void
): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel("timeline_realtime_sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timeline_store",
        },
        (change) => {
          if (change.new && (change.new as any).data) {
            const row = change.new as any;
            onUpdate({
              monthlyStore: row.data,
              availableMonths: Array.isArray(row.available_months) ? row.available_months : [],
              activeMonth: row.active_month,
              updatedAt: row.updated_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Could not subscribe to Supabase realtime:", err);
    return null;
  }
}

export const SUPABASE_SQL_SETUP = `-- Copy & Paste this into Supabase SQL Editor and click 'Run':

create table if not exists public.timeline_store (
  id text primary key default 'current',
  data jsonb not null default '{}'::jsonb,
  available_months jsonb default '[]'::jsonb,
  active_month text default 'AUG 2026',
  updated_at timestamptz default now(),
  updated_by text default 'admin'
);

-- Enable RLS
alter table public.timeline_store enable row level security;

-- Drop existing policies if any
drop policy if exists "Allow public read" on public.timeline_store;
drop policy if exists "Allow anon write" on public.timeline_store;

-- Policies for public reading and anon saving
create policy "Allow public read" on public.timeline_store
  for select using (true);

create policy "Allow anon write" on public.timeline_store
  for all using (true) with check (true);
`;
