import { useEffect } from "react";

export default function LoginSuccess() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let token = "";

    // 1. Try to extract token from query parameters (?token=...)
    const searchParams = new URLSearchParams(window.location.search);
    token = searchParams.get("token") || "";

    // 2. Try to extract token from hash fragment (#token=... or #access_token=...)
    if (!token) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      token = hashParams.get("token") || hashParams.get("access_token") || "";
    }

    if (token) {
      localStorage.setItem("auth_token", token);
      
      // If we are in a popup, send the token to the opener
      if (window.opener) {
        try {
          window.opener.postMessage({ type: "LOGIN_SUCCESS", token }, "*");
          // Close the popup after a short delay to ensure message delivery
          const timer = setTimeout(() => {
            window.close();
          }, 800);
          return () => clearTimeout(timer);
        } catch (e) {
          console.error("Failed to post message to opener:", e);
        }
      }

      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Fallback: if no token is found, redirect back home after a short delay
      if (window.opener) {
        const timer = setTimeout(() => {
          window.close();
        }, 1500);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "700ms" }} />

      <div className="z-10 flex flex-col items-center max-w-md px-6 py-12 text-center bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
        {/* Animated magical orb loader */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 animate-spin blur-md opacity-75" />
          <div className="absolute inset-1 rounded-full bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
          SECURE CONNECTION
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-1">
          Authenticating with Narshe...
        </p>
        <p className="text-slate-500 text-xs">
          Please wait while we finalize your secure session.
        </p>
      </div>
    </div>
  );
}
