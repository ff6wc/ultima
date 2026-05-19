import React from "react";
import Head from "next/head";
import { AppLayout } from "~/components/AppLayout/AppLayout";
import { AdminGuard } from "~/components/AdminGuard/AdminGuard";
import { useSession } from "next-auth/react";
import { FaSlidersH, FaTools, FaDatabase, FaShieldAlt } from "react-icons/fa";

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>FF6WC - Admin Panel</title>
        <meta name="description" content="Restricted administrator panel" />
      </Head>
      <AppLayout>
        <div className="max-w-4xl mx-auto my-6 p-4">
          <AdminGuard>
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
              <FaShieldAlt className="text-blue-500" size={32} />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
                  ADMIN PANEL
                </h1>
                <p className="text-slate-400 text-sm">
                  System configuration & secure administrative dashboard
                </p>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* User Metadata Card */}
              <div 
                style={{
                  border: "2px solid #334155",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  imageRendering: "pixelated",
                  position: "relative"
                }}
                className="p-6 rounded-lg overflow-hidden"
              >
                {/* 3x retro pattern visual backing */}
                <div 
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.02,
                    backgroundImage: "url('/assets/W1/defaultB.png')",
                    backgroundSize: "96px 96px",
                    imageRendering: "pixelated",
                    pointerEvents: "none"
                  }}
                />
                
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2 font-mono">
                  <span>👤</span> Active Session Profile
                </h2>
                
                {session?.user && (
                  <div className="flex items-center gap-4">
                    {session.user.image && (
                      <img 
                        src={session.user.image} 
                        alt="Avatar" 
                        className="w-16 h-16 rounded-full border-2 border-blue-500"
                      />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-white font-semibold text-base">
                        {session.user.name}
                      </div>
                      <div className="text-slate-400 text-xs font-mono">
                        ID: {(session.user as any).discordId || "N/A"}
                      </div>
                      <div className="text-slate-400 text-xs">
                        Email: {session.user.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance Tools Card */}
              <div 
                style={{
                  border: "2px solid #334155",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  imageRendering: "pixelated",
                  position: "relative"
                }}
                className="p-6 rounded-lg overflow-hidden"
              >
                <div 
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.02,
                    backgroundImage: "url('/assets/W8/defaultB.png')",
                    backgroundSize: "96px 96px",
                    imageRendering: "pixelated",
                    pointerEvents: "none"
                  }}
                />
                
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2 font-mono">
                  <FaTools className="text-blue-500" /> System Control
                </h2>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => alert("Beta Flag Options have been toggled!")}
                    className="w-full flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded transition-all text-slate-200 text-sm font-sans"
                  >
                    <span>Toggle Beta Features</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs">ACTIVE</span>
                  </button>

                  <button 
                    onClick={() => alert("Presets cache purged successfully!")}
                    className="w-full flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded transition-all text-slate-200 text-sm font-sans"
                  >
                    <span>Purge Presets Cache</span>
                    <FaDatabase className="text-slate-400" />
                  </button>
                </div>
              </div>

            </div>
          </AdminGuard>
        </div>
      </AppLayout>
    </>
  );
}
