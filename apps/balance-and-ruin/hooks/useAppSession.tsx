import React, { createContext, useContext } from "react";
import { SessionProvider, useSession as useNextAuthSession } from "next-auth/react";

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

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
  status: "unauthenticated",
});

const NextAuthAppSessionBridge = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useNextAuthSession();
  return (
    <AppSessionContext.Provider value={{ data: session as AppSession | null, status }}>
      {children}
    </AppSessionContext.Provider>
  );
};

const DummySessionProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppSessionContext.Provider value={{ data: null, status: "unauthenticated" }}>
      {children}
    </AppSessionContext.Provider>
  );
};

export const AppSessionProvider = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) => {
  if (!AUTH_ENABLED) {
    return <DummySessionProvider>{children}</DummySessionProvider>;
  }
  return (
    <SessionProvider session={session}>
      <NextAuthAppSessionBridge>{children}</NextAuthAppSessionBridge>
    </SessionProvider>
  );
};

export const useAppSession = () => {
  return useContext(AppSessionContext);
};
