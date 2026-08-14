"use client";

import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_WRITE_INTERVAL_MS = 15 * 1000;
const LAST_ACTIVITY_KEY = "sari-saas-last-activity";
const TRACKED_USER_KEY = "sari-saas-activity-user";

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // In-memory tracking still protects the current tab.
  }
}

function removeStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clear when browser storage is unavailable.
  }
}

export function SessionTimeout() {
  useEffect(() => {
    let activeUserId: string | null = null;
    let lastActivityWrite = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let signingOut = false;
    let disposed = false;

    function clearTimer() {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
    }

    function clearTracking() {
      clearTimer();
      activeUserId = null;
      removeStorage(LAST_ACTIVITY_KEY);
      removeStorage(TRACKED_USER_KEY);
    }

    function readLastActivity() {
      const storedValue = Number(readStorage(LAST_ACTIVITY_KEY));
      return Number.isFinite(storedValue) && storedValue > 0 ? storedValue : null;
    }

    async function signOutForInactivity() {
      if (signingOut || !activeUserId) return;
      signingOut = true;
      clearTimer();

      try {
        await supabase.auth.signOut({ scope: "local" });
      } finally {
        clearTracking();
        window.location.replace("/login?reason=inactive");
      }
    }

    function scheduleTimeout(lastActivity: number) {
      clearTimer();
      const remaining = INACTIVITY_TIMEOUT_MS - (Date.now() - lastActivity);

      if (remaining <= 0) {
        void signOutForInactivity();
        return;
      }

      timeoutId = setTimeout(() => void signOutForInactivity(), remaining);
    }

    function startTracking(session: Session) {
      activeUserId = session.user.id;
      const trackedUserId = readStorage(TRACKED_USER_KEY);
      let lastActivity = readLastActivity();

      if (trackedUserId !== activeUserId || !lastActivity) {
        lastActivity = Date.now();
        writeStorage(TRACKED_USER_KEY, activeUserId);
        writeStorage(LAST_ACTIVITY_KEY, String(lastActivity));
      }

      lastActivityWrite = lastActivity;
      scheduleTimeout(lastActivity);
    }

    function recordActivity() {
      if (!activeUserId || signingOut) return;

      const now = Date.now();
      const lastActivity = readLastActivity() ?? lastActivityWrite;

      if (now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
        void signOutForInactivity();
        return;
      }

      if (now - lastActivityWrite < ACTIVITY_WRITE_INTERVAL_MS) return;

      lastActivityWrite = now;
      writeStorage(LAST_ACTIVITY_KEY, String(now));
      scheduleTimeout(now);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") recordActivity();
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== LAST_ACTIVITY_KEY || !activeUserId) return;
      const lastActivity = readLastActivity();
      if (lastActivity) {
        lastActivityWrite = lastActivity;
        scheduleTimeout(lastActivity);
      }
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
      "focus",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (disposed) return;
      if (session) startTracking(session);
      else clearTracking();
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (disposed) return;
      if (data.session) startTracking(data.session);
      else clearTracking();
    });

    return () => {
      disposed = true;
      clearTimer();
      authListener.subscription.unsubscribe();
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
