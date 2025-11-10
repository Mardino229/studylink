import {useEffect, useState} from "react";
import {Moon, Sun} from "lucide-react";

function getStoredTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function storeTheme(value: string) {
  try {
    localStorage.setItem("theme", value);
  } catch {}
}

function applyTheme(theme: string | null, animate: boolean = false) {
  const root = document.documentElement;
  // Optionally add a temporary transition class to animate color variables smoothly
  if (animate) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  }
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) root.classList.add("dark"); else root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const t = getStoredTheme();
    setTheme(t);
    applyTheme(t, false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => { if (!theme) applyTheme(null, true); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const toggle = () => {
    const next = (document.documentElement.classList.contains("dark")) ? "light" : "dark";
    setTheme(next);
    storeTheme(next);
    applyTheme(next, true);
  };

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
    >
      {isDark ? <Sun className="h-5 w-5 mx-auto"/> : <Moon className="h-5 w-5 mx-auto"/>}
    </button>
  );
}
