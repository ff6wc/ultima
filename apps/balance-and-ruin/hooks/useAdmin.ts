import { useState, useEffect } from "react";
import { useAppSession } from "~/hooks/useAppSession";

/**
 * Hook to check admin status. Uses our unified useAppSession hook
 * to run safely in both static (Cloudflare) and Node.js (local dev) environments.
 */
export function useAdmin() {
  const { data: session, status } = useAppSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const devAdminOverride =
    isMounted &&
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_DEV_ADMIN_TOGGLE === "true" &&
    localStorage.getItem("dev_admin_override") === "true";

  const userDiscordId = (session?.user as any)?.discordId;
  const isAdmin =
    devAdminOverride ||
    (status === "authenticated" && !!(session?.user as any)?.isAdmin);

  return {
    isAdmin,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" || devAdminOverride,
    user:
      session?.user ||
      (devAdminOverride
        ? {
            name: "Dev Admin",
            email: "dev-admin@localhost",
            discordId: "12345",
          }
        : undefined),
    discordId: userDiscordId || (devAdminOverride ? "12345" : undefined),
  };
}
