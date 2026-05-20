import { useSession } from "next-auth/react";
import { useRef } from "react";

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

/** Safe no-op session result for when auth is disabled */
const DISABLED_RESULT = {
  isAdmin: false,
  isLoading: false,
  isAuthenticated: false,
  user: null as any,
  discordId: undefined as string | undefined,
};

/**
 * Hook to check admin status. When NEXT_PUBLIC_AUTH_ENABLED is not "true"
 * (i.e. static Cloudflare deployment), this returns safe defaults without
 * ever calling useSession, avoiding the missing SessionProvider crash.
 */
export function useAdmin() {
  if (!AUTH_ENABLED) {
    // AUTH_ENABLED is a build-time constant so this branch is
    // deterministic and does not violate Rules of Hooks.
    return DISABLED_RESULT;
  }

  /* eslint-disable react-hooks/rules-of-hooks */
  const { data: session, status } = useSession();
  /* eslint-enable react-hooks/rules-of-hooks */

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
