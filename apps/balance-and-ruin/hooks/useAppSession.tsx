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
    isSuperadmin?: boolean;
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
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const loginUrl = `${BACKEND_URL}/api/v1/auth/login`;

  // If we are on a preview domain or local development (not the main domain), use a popup to handle cross-origin login
  const isMainDomain =
    typeof window !== "undefined" &&
    (window.location.hostname === "dev.ff6worldscollide.com" ||
      window.location.hostname === "ff6worldscollide.com");

  if (!isMainDomain && typeof window !== "undefined") {
    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      loginUrl,
      "narshe_login",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`,
    );
  } else {
    window.location.href = loginUrl;
  }
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
  const [status, setStatus] = useState<
    "authenticated" | "unauthenticated" | "loading"
  >("loading");

  useEffect(() => {
    // Add message listener for cross-origin popup login
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "LOGIN_SUCCESS" && event.data?.token) {
        localStorage.setItem("auth_token", event.data.token);
        window.location.reload();
      }
    };
    window.addEventListener("message", handleMessage);

    if (!AUTH_ENABLED) {
      setData(null);
      setStatus("unauthenticated");
      window.removeEventListener("message", handleMessage);
      return;
    }

    const checkToken = () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setData(null);
        setStatus("unauthenticated");
        return;
      }

      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const payload = JSON.parse(jsonPayload);

        // Check token expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.warn("Session token expired");
          localStorage.removeItem("auth_token");
          setData(null);
          setStatus("unauthenticated");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:expired"));
          }
          return;
        }

        const discordId = payload.sub || payload.discordId;
        const name = payload.username || payload.name || "Discord User";
        let image = payload.avatar || payload.image || null;
        if (image && !image.startsWith("http") && discordId) {
          image = `https://cdn.discordapp.com/avatars/${discordId}/${image}.png`;
        }

        const envAdminIds = process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS;
        const ADMIN_IDS = envAdminIds
          ? envAdminIds.split(",")
          : ["451050854934511647", "197757429948219392"];
        const isHardcodedAdmin =
          discordId && ADMIN_IDS.includes(String(discordId));
        const isAdmin = !!(
          payload.isAdmin ||
          payload.is_admin ||
          payload.isSuperadmin ||
          isHardcodedAdmin
        );
        const isSuperadmin = !!(payload.isSuperadmin || isHardcodedAdmin);

        setData({
          user: {
            name,
            email: payload.email || null,
            image,
            discordId,
            accessToken: token,
            isAdmin,
            isSuperadmin,
          },
        });
        setStatus("authenticated");
      } catch (e) {
        console.error("Invalid token parsing state:", e);
        localStorage.removeItem("auth_token");
        setData(null);
        setStatus("unauthenticated");
      }
    };

    checkToken();

    // Set up check token expiry every 30 seconds
    const interval = setInterval(checkToken, 30000);

    // Also listen for check requests or direct expiration events
    const handleAuthExpiredEvent = () => {
      localStorage.removeItem("auth_token");
      setData(null);
      setStatus("unauthenticated");
    };
    window.addEventListener("auth:expired", handleAuthExpiredEvent);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("auth:expired", handleAuthExpiredEvent);
      clearInterval(interval);
    };
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
