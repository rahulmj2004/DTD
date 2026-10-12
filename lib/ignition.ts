"use client";

import { useSyncExternalStore } from "react";
import { IGNITION_KEY } from "@/lib/constants";


const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => document.documentElement.dataset.ignited === "1";
const getServerSnapshot = () => false;

/** Marks the loading sequence as finished and lets the hero start. */
export function ignite() {
  document.documentElement.dataset.ignited = "1";
  try {
    sessionStorage.setItem(IGNITION_KEY, "1");
  } catch {
    // Storage can be unavailable (private mode); the loader simply replays.
  }
  listeners.forEach((listener) => listener());
}

/** True once the loader has finished (or was skipped before first paint). */
export function useIgnited() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
