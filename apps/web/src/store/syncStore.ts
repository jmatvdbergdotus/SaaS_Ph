"use client";
import { create } from "zustand";

type SyncStatus = "synced" | "syncing" | "offline" | "pending";

interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  setStatus: (s: SyncStatus) => void;
  setPendingCount: (n: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: "synced",
  pendingCount: 0,
  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
}));
