import { useSession } from "next-auth/react";

export const useAdmin = () => {
  const { data: session, status } = useSession();

  const userDiscordId = (session?.user as any)?.discordId;
  const isAdmin = 
    status === "authenticated" && 
    !!(session?.user as any)?.isAdmin;

  return {
    isAdmin,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    discordId: userDiscordId
  };
};
