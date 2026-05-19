import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { FaDiscord, FaLock, FaExclamationTriangle } from "react-icons/fa";
import styles from "~/components/FlagCreatePage/FlagCreatePage.module.css";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-slate-900/40 rounded-lg border border-slate-700/50">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="rounded-full bg-slate-700 h-12 w-12 flex items-center justify-center">
            <FaLock className="text-slate-400 animate-bounce" size={20} />
          </div>
          <div className="h-4 bg-slate-700 rounded w-48"></div>
        </div>
      </div>
    );
  }

  // Check admin authorization via Discord User ID whitelist
  const adminIdsStr = process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS || "";
  const adminIds = adminIdsStr.split(",").map((id) => id.trim()).filter(Boolean);
  const userDiscordId = (session?.user as any)?.discordId;

  // Let local development/mock tests bypass if no whitelist is specified (to facilitate testing)
  const isAuthorized = 
    (adminIds.length === 0 && session) || 
    (userDiscordId && adminIds.includes(userDiscordId));

  if (!isAuthorized) {
    return (
      <div 
        style={{
          border: "4px double #ef4444",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
          position: "relative",
          zIndex: 10,
          imageRendering: "pixelated"
        }}
        className="p-8 rounded-lg max-w-xl mx-auto my-12 text-center"
      >
        {/* Retro Wave Style Background (dynamic mask) */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: "url('/assets/W3/defaultB.png')",
            backgroundSize: "96px 96px",
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: -1
          }}
        />

        <div className="flex justify-center mb-4 text-red-500">
          <FaExclamationTriangle size={48} className="animate-pulse" />
        </div>

        <h2 
          className="text-red-500 font-bold uppercase tracking-widest text-3xl mb-3 font-mono"
          style={{ textShadow: "2px 2px #000000" }}
        >
          Access Denied
        </h2>
        
        <p className="text-slate-300 font-sans text-base mb-6 leading-relaxed">
          {session 
            ? "Your Discord account does not have administrator privileges to access this secure zone."
            : "This section is restricted to Final Fantasy VI Worlds Collide randomizer administrators. Please authenticate with your Discord account to proceed."}
        </p>

        {!session ? (
          <button
            onClick={() => signIn("discord")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752c4] active:scale-95 transition-all text-white font-semibold rounded-md shadow-md hover:shadow-[#5865F2]/20 hover:shadow-lg font-sans"
          >
            <FaDiscord size={20} />
            <span>Login with Discord</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/40 border border-red-900/60 rounded text-red-400 font-mono text-sm">
            <span>Discord ID: {userDiscordId || "Unknown"}</span>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
