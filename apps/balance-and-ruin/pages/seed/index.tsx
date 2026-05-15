import { useEffect, useState } from "react";
import Head from "next/head";
import { SeedDetails } from "~/components/SeedDetails/SeedDetails";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { FaBook, FaDiscord } from "react-icons/fa";

const SeedDetailsPage = () => {
  const [seedId, setSeedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const seedIdParam = queryParameters.get("id");
    if (seedIdParam) {
      setSeedId(seedIdParam);
    }

    // Load dynamic theme state
    const savedTheme = localStorage.getItem("app-theme") as "light" | "dark";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const defaultTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(defaultTheme);
    if (defaultTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("app-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <>
      <Head>
        <title>{`FF6WC Seed Details - ${seedId || ""}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col text-[var(--text-main)] font-sans transition-colors duration-200">
        {/* Modern Standalone Header */}
        <header className="h-16 border-b border-[var(--border-light)] bg-[var(--bg-card)] flex items-center justify-between px-6 md:px-10 py-4 sticky top-0 z-50 backdrop-blur-md shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-3">
            <img
              src="/logo-transparent.png"
              alt="FF6WC Logo"
              className="h-8 w-auto hidden md:block invert dark:invert-0 transition-all filter drop-shadow-sm"
            />
            <h1 className="font-bold tracking-wider text-lg uppercase font-outfit text-[var(--text-main)] select-none">
              Seed Details
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Universal Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm border border-slate-200 dark:border-slate-700"
              title={
                theme === "light" ? "Enable Dark Mode" : "Enable Light Mode"
              }
            >
              {theme === "light" ? (
                <HiOutlineMoon size={20} />
              ) : (
                <HiOutlineSun size={20} className="text-yellow-400" />
              )}
            </button>

            <a
              href="https://wiki.ff6worldscollide.com/wiki/Main_Page"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all tracking-widest"
            >
              <FaBook size={16} />
              <span className="hidden sm:inline uppercase text-xs">WIKI</span>
            </a>
            <a
              href="https://discord.gg/5MPeng5"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all tracking-widest"
            >
              <FaDiscord size={16} />
              <span className="hidden sm:inline uppercase text-xs">
                DISCORD
              </span>
            </a>
          </div>
        </header>

        {/* Spaced Standalone Modern Content Zone */}
        <main className="flex-grow flex flex-col items-center py-10 px-4 md:px-10">
          <div className="max-w-[1260px] w-full transition-all">
            {seedId ? (
              <SeedDetails seedId={seedId} />
            ) : (
              <div className="p-8 border border-red-500/30 bg-red-500/5 rounded-xl text-center text-red-400 text-lg font-medium shadow-sm max-w-xl mx-auto mt-12">
                No active Seed ID was detected in your browser address.
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default SeedDetailsPage;
