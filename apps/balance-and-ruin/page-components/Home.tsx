import React from "react";
import { FaBook, FaDiscord } from "react-icons/fa";
import { PageContainer } from "~/components/PageContainer/PageContainer";

const WIKI_URL = "https://wiki.ff6worldscollide.com/wiki/Main_Page";
const DISCORD_URL = "https://discord.gg/5MPeng5";

export const Home = ({ logoSrc }: { logoSrc?: string }) => {
  return (
    <PageContainer columns={1} className="max-w-4xl mx-auto py-4">
      {/* Supermassive Hero Banner */}
      <div className="relative w-full h-[280px] md:h-[360px] overflow-hidden rounded-2xl mb-8 flex items-center justify-center bg-slate-900 shadow-md border border-[var(--border-light)]">
        {/* Background image banner - 100% vibrant, bold opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 filter blur-[0.3px]"
          style={{ backgroundImage: 'url("/landing_banner.jpg")' }}
        />
        {/* Soft radial shadow overlay to enhance logo readability without washing out colors */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.15)_60%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.15)_100%)]" />

        {/* Supermassive centered logo */}
        <div className="relative z-10 flex flex-col items-center gap-4 select-none">
          <img
            src={logoSrc || "/logo-transparent.png"}
            alt="FF6WC Logo"
            className={`h-36 md:h-48 w-auto transition-all filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${logoSrc ? "" : "invert dark:invert-0"}`}
          />
        </div>
      </div>

      {/* Landing Page Content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-6 md:p-10 shadow-md">
        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg md:text-xl font-outfit">
          <p>
            Worlds Collide (WC) is an open-world randomizer for Final Fantasy VI
            on the SNES. Players begin aboard the airship and can travel freely
            between the World of Balance and the World of Ruin to discover
            characters, espers and loot while fighting your way to defeat Kefka
            and save the world.
          </p>
          <p>
            Ways to play WC include options to randomize characters, commands,
            magic, items and more with over 200 flags to customize each
            playthrough. Use the options on the left to select a pre-made seed
            or customize one of your own. Once you've made your selections,
            click the Generate button, load a ROM and download your seed.
          </p>
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Look through our Wiki or find us on Discord for help getting
            started.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
          <a
            href={WIKI_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-lg tracking-wide uppercase font-outfit cursor-pointer"
          >
            <FaBook size={20} />
            <span>WIKI</span>
          </a>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-lg tracking-wide uppercase font-outfit cursor-pointer"
          >
            <FaDiscord size={20} />
            <span>DISCORD</span>
          </a>
        </div>
      </div>
    </PageContainer>
  );
};
