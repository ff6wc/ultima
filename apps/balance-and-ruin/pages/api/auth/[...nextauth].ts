import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import fs from "fs";
import path from "path";

const SUPERADMINS = ["451050854934511647", "197757429948219392"];
const DB_DIR = path.join(process.cwd(), "..", "db");
const USERS_FILE = path.join(DB_DIR, "users.json");

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
      const discordId = (profile as any)?.id || token.discordId;
      const isSuperadmin = typeof discordId === "string" && SUPERADMINS.includes(discordId);
      
      // Sync or initialize users.json database
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([]));
      }
      
      let users: any[] = [];
      try {
        users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      } catch (e) {
        users = [];
      }

      // Initial login hook
      if (account && profile && discordId) {
        const name = (profile as any).username || profile.name;
        const email = profile.email;

        token.discordId = discordId;
        token.accessToken = account.access_token;
        token.isSuperadmin = isSuperadmin;

        const adminIdsStr = process.env.ADMIN_DISCORD_IDS || "";
        const envAdminIds = adminIdsStr.split(",").map((id) => id.trim()).filter(Boolean);

        const userIndex = users.findIndex((u: any) => u.discordId === discordId);
        
        if (userIndex > -1) {
          users[userIndex].loginCount = (users[userIndex].loginCount || 0) + 1;
          users[userIndex].lastLogin = new Date().toISOString();
          users[userIndex].name = name;
          users[userIndex].email = email;
          
          if (isSuperadmin) {
             users[userIndex].isAdmin = true;
          }
          
          token.isAdmin = !!users[userIndex].isAdmin;
        } else {
          const isEnvAdmin = envAdminIds.includes(discordId as string);
          const newAdminStatus = isSuperadmin || isEnvAdmin;
          users.push({
            discordId,
            name,
            email,
            firstLogin: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            isAdmin: newAdminStatus
          });
          token.isAdmin = newAdminStatus;
        }

        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      } else if (discordId) {
        // Subsequent hook - live hydrate admin status
        token.isSuperadmin = isSuperadmin;
        if (isSuperadmin) {
           token.isAdmin = true;
        } else {
           const dbUser = users.find((u: any) => u.discordId === discordId);
           if (dbUser) {
             token.isAdmin = !!dbUser.isAdmin;
           }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).discordId = token.discordId;
        (session.user as any).isAdmin = !!token.isAdmin;
        (session.user as any).isSuperadmin = !!token.isSuperadmin;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
