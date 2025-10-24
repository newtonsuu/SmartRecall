import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextValue = {
  dark: boolean;
  toggle: (next?: boolean) => void;
  set: (next: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  dark: false,
  toggle: () => {},
  set: () => {},
});

const STORAGE_KEY = "sr:darkMode";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") return true;
      if (v === "0") return false;
      // if not set, try prefers-color-scheme
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const toggle = (next?: boolean) =>
    setDark((s) => (typeof next === "boolean" ? next : !s));
  const set = (next: boolean) => setDark(next);

  return (
    <ThemeContext.Provider value={{ dark, toggle, set }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
