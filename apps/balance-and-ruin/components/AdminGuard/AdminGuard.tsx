import React, { useEffect } from "react";
import { useAppSession } from "~/hooks/useAppSession";
import { useRouter } from "next/router";

type AdminGuardProps = {
  children: React.ReactNode;
};

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { data: session, status } = useAppSession();
  const router = useRouter();

  const isAdmin = (session?.user as any)?.isAdmin;

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "400px",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          color: "#f8fafc",
          fontFamily: "var(--font-runic, monospace)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(59, 130, 246, 0.2)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: "bold",
            letterSpacing: "1px",
            color: "#60a5fa",
          }}
          className="animate-pulse"
        >
          LOADING SYSTEM SECURITY DATA...
        </div>
      </div>
    );
  }

  if (status === "authenticated" && isAdmin) {
    return <>{children}</>;
  }

  return null;
};
