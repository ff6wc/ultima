import { useSession } from "next-auth/react";

export const useAdmin = () => {
  const { data: session, status } = useSession();

  const adminIdsStr = process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS || "";
  const adminIds = adminIdsStr.split(",").map((id) => id.trim()).filter(Boolean);
  const userDiscordId = (session?.user as any)?.discordId;

  // In local development, if no admin whitelist is specified, any authenticated user acts as admin
  const isAdmin = 
    status === "authenticated" && 
    (adminIds.length === 0 || (userDiscordId && adminIds.includes(userDiscordId)));

  return {
    isAdmin,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    discordId: userDiscordId
  };
};
