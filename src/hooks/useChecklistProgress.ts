// src/hooks/useChecklistProgress.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MONTH_1_DAYS } from "@/lib/curriculum-month1-khanishk";

export interface ChecklistState {
  [key: string]: boolean; // key format: `${dayNumber}_${itemId}`
}

export function useChecklistProgress(profileId?: string) {
  const [completedItems, setCompletedItems] = useState<ChecklistState>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const storageKey = profileId ? `robomates_checklist_${profileId}` : "robomates_checklist_anonymous";

  // Load progress from localStorage first, then sync from Supabase
  useEffect(() => {
    let isMounted = true;

    const loadLocal = () => {
      try {
        const local = localStorage.getItem(storageKey);
        if (local) {
          const parsed = JSON.parse(local);
          if (isMounted) setCompletedItems(parsed);
        }
      } catch (err) {
        console.warn("Failed to parse local checklist state:", err);
      }
    };

    loadLocal();

    const fetchFromSupabase = async () => {
      if (!profileId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("daily_checklist_progress")
          .select("day_number, item_id, is_completed")
          .eq("profile_id", profileId);

        if (!error && data && data.length > 0) {
          const remoteState: ChecklistState = {};
          data.forEach((row) => {
            if (row.is_completed) {
              remoteState[`${row.day_number}_${row.item_id}`] = true;
            }
          });

          if (isMounted) {
            setCompletedItems((prev) => {
              const merged = { ...prev, ...remoteState };
              try {
                localStorage.setItem(storageKey, JSON.stringify(merged));
              } catch (_) {}
              return merged;
            });
          }
        }
      } catch (err) {
        // Fallback gracefully to local storage without throwing error
        console.warn("Checklist remote sync deferred (using local cache):", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [profileId, storageKey, supabase]);

  const toggleItem = useCallback(
    async (dayNumber: number, itemId: string) => {
      const key = `${dayNumber}_${itemId}`;
      const nextVal = !completedItems[key];

      // 1. Optimistic local update
      setCompletedItems((prev) => {
        const updated = { ...prev, [key]: nextVal };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      // 2. Persist to Supabase if profile is available
      if (profileId) {
        try {
          await supabase.from("daily_checklist_progress").upsert(
            {
              profile_id: profileId,
              day_number: dayNumber,
              item_id: itemId,
              is_completed: nextVal,
              completed_at: nextVal ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "profile_id,day_number,item_id" }
          );
        } catch (err) {
          console.warn("Checklist remote sync failed, saved locally:", err);
        }
      }
    },
    [completedItems, profileId, storageKey, supabase]
  );

  const isItemCompleted = useCallback(
    (dayNumber: number, itemId: string): boolean => {
      return Boolean(completedItems[`${dayNumber}_${itemId}`]);
    },
    [completedItems]
  );

  const getDayProgress = useCallback(
    (dayNumber: number, totalItems: number) => {
      let completed = 0;
      for (const [key, val] of Object.entries(completedItems)) {
        if (key.startsWith(`${dayNumber}_`) && val) {
          completed++;
        }
      }
      const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
      return { completed, total: totalItems, percentage };
    },
    [completedItems]
  );

  const getMonthProgress = useCallback(() => {
    let totalItems = 0;
    let completedCount = 0;

    MONTH_1_DAYS.forEach((day) => {
      totalItems += day.checklistItems.length;
      day.checklistItems.forEach((item) => {
        if (completedItems[`${day.dayNumber}_${item.id}`]) {
          completedCount++;
        }
      });
    });

    const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    return { completed: completedCount, total: totalItems, percentage };
  }, [completedItems]);

  return {
    completedItems,
    loading,
    toggleItem,
    isItemCompleted,
    getDayProgress,
    getMonthProgress,
  };
}

