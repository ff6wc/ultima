import React, { createContext, useContext, useState, useEffect } from "react";

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false";

export type AppSession = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    discordId?: string | null;
    accessToken?: string | null;
    isAdmin?: boolean;
  } | null;
};

export type AppSessionContextType = {
  data: AppSession | null;
  status: "authenticated" | "unauthenticated" | "loading";
};

const AppSessionContext = createContext<AppSessionContextType>({
  data: null,
  status: "loading",
});

export const signIn = (provider?: string) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  window.location.href = `${BACKEND_URL}/api/v1/auth/login`;
};

export const signOut = (options?: { callbackUrl?: string }) => {
  localStorage.removeItem("auth_token");
  if (typeof window !== "undefined") {
    window.location.href = options?.callbackUrl || "/";
  }
};

export const AppSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
  session?: any;
}) => {
  const [data, setData] = useState<AppSession | null>(null);
  const [status, setStatus] = useState<"authenticated" | "unauthenticated" | "loading">("loading");

  useEffect(() => {
    if (!AUTH_ENABLED) {
      setData(null);
      setStatus("unauthenticated");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        
        const discordId = payload.sub || payload.discordId;
        const name = payload.username || payload.name || "Discord User";
        let image = payload.avatar || payload.image || null;
        if (image && !image.startsWith("http") && discordId) {
          image = `https://cdn.discordapp.com/avatars/${discordId}/${image}.png`;
        }

        const isAdmin = !!(payload.isAdmin || payload.is_admin || payload.isSuperadmin);

        setData({
          user: {
            name,
            email: payload.email || null,
            image,
            discordId,
            accessToken: token,
            isAdmin,
          },
        });
        setStatus("authenticated");
      } catch (e) {
        console.error("Invalid token parsing state:", e);
        localStorage.removeItem("auth_token");
        setData(null);
        setStatus("unauthenticated");
      }
    } else {
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  return (
    <AppSessionContext.Provider value={{ data, status }}>
      {children}
    </AppSessionContext.Provider>
  );
};

export const useAppSession = () => {
  return useContext(AppSessionContext);
};
