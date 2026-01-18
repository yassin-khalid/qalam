
import QalamLogo from "@/lib/components/QalamLogo";
import ThemeToggleButton from "@/lib/components/ThemeToggleButton";
import { Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";

const Navbar: React.FC = () => {

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
          <QalamLogo className="w-16 h-16" />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link
            to=".."
            activeProps={{ className: "text-lg font-bold border-b-4 border-teal-500 py-1" }}
            className="text-stone-900 dark:text-white text-base font-semibold transition-colors"
          >
            الرئيسية
          </Link>
          {/* <a
            href="#"
            className="text-stone-900 dark:text-zinc-400 text-base font-semibold hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            عن المنصة
          </a> */}
          <Link
            to="/contact"
            activeProps={{ className: "text-lg font-bold border-b-4 border-teal-500 py-1" }}
            className="text-stone-900 dark:text-zinc-400 text-base font-semibold hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            تواصل معنا
          </Link>
        </div>

        {/* CTA & Theme Toggle */}
        <div className="flex items-center gap-4">
          <ThemeToggleButton className="p-2.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-sky-950 dark:text-teal-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all" />
          <Link to="/teacher/login" className="bg-sky-950 dark:bg-teal-500 text-sky-50 dark:text-slate-950 px-6 py-2.5 rounded-lg font-bold text-lg hover:bg-sky-900 dark:hover:bg-teal-400 transition-all shadow-md">
            سجل معنا
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
