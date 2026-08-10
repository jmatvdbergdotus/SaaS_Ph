"use client";

import { useCallback, useSyncExternalStore } from "react";
import { translations, type Language, type TranslationKey } from "./i18n";

const STORAGE_KEY = "sari-saas-language";
const listeners = new Set<() => void>();

let currentLanguage: Language = "en";
let storageLoaded = false;

function loadStoredLanguage() {
  if (storageLoaded || typeof window === "undefined") return;
  storageLoaded = true;

  try {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (savedLanguage === "en" || savedLanguage === "tl") {
      currentLanguage = savedLanguage;
    }
  } catch {
    // The selector still works when browser storage is unavailable.
  }

  document.documentElement.lang = currentLanguage === "tl" ? "fil" : "en";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getLanguageSnapshot() {
  loadStoredLanguage();
  return currentLanguage;
}

function getServerLanguageSnapshot(): Language {
  return "en";
}

function setLanguage(nextLanguage: Language) {
  currentLanguage = nextLanguage;
  document.documentElement.lang = nextLanguage === "tl" ? "fil" : "en";

  try {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  } catch {
    // Keep the in-memory choice for this session.
  }

  listeners.forEach((listener) => listener());
}

export function useLanguage() {
  const language = useSyncExternalStore(
    subscribe,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );
  const t = useCallback(
    (key: TranslationKey) => translations[language][key],
    [language]
  );

  return { language, setLanguage, t };
}
