import { useAppSession } from "~/hooks/useAppSession";

/**
 * Hook to check admin status. Uses our unified useAppSession hook
 * to run safely in both static (Cloudflare) and Node.js (local dev) environments.
 */
export function useAdmin() {
  const { data: session, status } = useAppSession();

  const userDiscordId = (session?.user as any)?.discordId;
  const isAdmin =
    status === "authenticated" &&
    !!(session?.user as any)?.isAdmin;

  return {
    isAdmin,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    discordId: userDiscordId,
  };
}
