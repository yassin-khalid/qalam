import { localStorageCollection } from "@/lib/db/localStorageCollection";
import { useLiveQuery } from "@tanstack/react-db";
import React, { useState, useEffect } from "react";

const Navbar: React.FC = () => {
  // const [isDark, setIsDark] = useState(() => {
  //   if (typeof window !== "undefined") {
  //     return (
  //       document.documentElement.classList.contains("dark") ||
  //       localStorage.getItem("theme") === "dark"
  //     );
  //   }
  //   return false;
  // });
  const { data: authSession = [] } = useLiveQuery(q => q.from({ session: localStorageCollection }))
  const currentSession = authSession[0]
  const isDark = currentSession?.theme === 'dark'

  const [isScrolled, setIsScrolled] = useState(false);



  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 lg:px-36 transition-all duration-500 ${isScrolled
        ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-zinc-100 dark:border-white/10"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          {/* <div className="w-12 h-10 relative overflow-hidden">
            <div className="w-6 h-6 bg-sky-950 dark:bg-teal-500 rounded-lg absolute bottom-0 left-0 transition-colors"></div>
            <div className="w-4 h-8 bg-teal-500 dark:bg-sky-200 rounded-sm absolute top-0 right-0 transition-colors"></div>
          </div>
          <span className="text-2xl font-bold text-sky-950 dark:text-white">
            قلم
          </span> */}
          {isDark ? <img src="/qalam-logo-dark.svg" alt="Qalam Logo" className="w-16 h-16" /> : <img src="/qalam-logo.svg" alt="Qalam Logo" className="w-16 h-16" />}
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <a
            href="#"
            className="text-stone-900 dark:text-white text-lg font-bold border-b-4 border-teal-500 py-1 transition-colors"
          >
            الرئيسية
          </a>
          <a
            href="#"
            className="text-stone-900 dark:text-zinc-400 text-base font-semibold hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            عن المنصة
          </a>
          <a
            href="#"
            className="text-stone-900 dark:text-zinc-400 text-base font-semibold hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            تواصل معنا
          </a>
        </div>

        {/* CTA & Theme Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              localStorageCollection.update('current', (draft) => {
                draft.theme = draft.theme === 'dark' ? 'light' : 'dark'
              })
            }}
            className="p-2.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-sky-950 dark:text-teal-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <button className="bg-sky-950 dark:bg-teal-500 text-sky-50 dark:text-slate-950 px-6 py-2.5 rounded-lg font-bold text-lg hover:bg-sky-900 dark:hover:bg-teal-400 transition-all shadow-md">
            سجل معنا
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
