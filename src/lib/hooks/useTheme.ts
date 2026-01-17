import { useState, useEffect } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "qalam-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      // Fall back to system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove("light", "dark");

    // Add the current theme class
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, setTheme, toggleTheme };
}
