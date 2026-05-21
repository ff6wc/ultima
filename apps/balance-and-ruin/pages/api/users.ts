import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "..", "db");
const USERS_FILE = path.join(DB_DIR, "users.json");
const SUPERADMINS = ["451050854934511647", "197757429948219392"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET });
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isAdmin = !!token.isAdmin;
  const isSuperadmin = !!token.isSuperadmin;

  if (req.method === "GET") {
    // Both standard admins and superadmins can view the user list statistics
    if (!isAdmin && !isSuperadmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!fs.existsSync(USERS_FILE)) {
      return res.status(200).json([]);
    }

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      return res.status(200).json(users);
    } catch (e) {
      return res.status(500).json({ error: "Database error" });
    }
  }

  if (req.method === "PUT") {
    // ONLY superadmins can promote or demote standard admins
    if (!isSuperadmin) {
      return res.status(403).json({ error: "Superadmin privileges required" });
    }

    const { discordId, isAdmin: newAdminStatus } = req.body;
    
    if (!discordId) {
      return res.status(400).json({ error: "Missing discordId" });
    }

    if (!fs.existsSync(USERS_FILE)) {
      return res.status(404).json({ error: "Database not found" });
    }

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      const userIndex = users.findIndex((u: any) => u.discordId === String(discordId));
      
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      // Protect against self-sabotage or demoting other superadmins
      if (SUPERADMINS.includes(String(discordId)) && newAdminStatus === false) {
        return res.status(400).json({ error: "Cannot revoke admin status from a Superadmin." });
      }

      users[userIndex].isAdmin = !!newAdminStatus;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

      return res.status(200).json(users[userIndex]);
    } catch (e) {
      return res.status(500).json({ error: "Database error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
