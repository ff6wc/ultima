import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID || process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.AUTH_DISCORD_SECRET || process.env.DISCORD_CLIENT_SECRET || "",
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Map profile id to token
        token.discordId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Expose discordId on the client session object
        (session.user as any).discordId = token.discordId;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
