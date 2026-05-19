import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fs from "fs";
import path from "path";

const TAGS_FILE = path.join(process.cwd(), "tags.json");
const PRESETS_FILE = path.join(process.cwd(), "presets.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use the exact same secrets that [...nextauth].ts expects
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET });
  let isAdmin = token?.isAdmin as boolean | undefined;
  
  // Instant revocation check against live database
  if (token?.discordId && !token.isSuperadmin) {
    const USERS_FILE = path.join(process.cwd(), "users.json");
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
        const dbUser = users.find((u: any) => u.discordId === token.discordId);
        if (dbUser) isAdmin = !!dbUser.isAdmin;
      }
    } catch (e) {}
  }

  // Initialize tags file if it doesn't exist
  if (!fs.existsSync(TAGS_FILE)) {
    fs.writeFileSync(TAGS_FILE, JSON.stringify([]));
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(fs.readFileSync(TAGS_FILE, "utf-8"));
  } catch (e) {
    tags = [];
  }

  // GET handler: Anyone can read the tags
  if (req.method === "GET") {
    return res.status(200).json(tags);
  }

  // All other methods require admin privileges
  if (!isAdmin) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { tag } = req.body;
    if (!tag || typeof tag !== "string") {
      return res.status(400).json({ error: "Invalid tag" });
    }
    
    const cleanTag = tag.trim().toLowerCase();
    // "official" is handled via its own dedicated system UI button, so don't allow it as a dynamic tag
    if (cleanTag === "official") {
      return res.status(400).json({ error: "System tags cannot be added manually." });
    }

    if (!tags.includes(cleanTag)) {
      tags.push(cleanTag);
      fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2));
    }
    return res.status(201).json(tags);
  }

  if (req.method === "PUT") {
    const { oldTag, newTag } = req.body;
    if (!oldTag || !newTag || typeof newTag !== "string") {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const cleanOld = oldTag.trim().toLowerCase();
    const cleanNew = newTag.trim().toLowerCase();

    if (cleanNew === "official") {
      return res.status(400).json({ error: "Cannot rename to a system tag." });
    }

    const index = tags.indexOf(cleanOld);
    if (index > -1) {
      // 1. Update tag in tags.json
      tags[index] = cleanNew;
      fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2));

      // 2. Cascade rename into presets.json
      if (fs.existsSync(PRESETS_FILE)) {
        let presets = JSON.parse(fs.readFileSync(PRESETS_FILE, "utf-8"));
        let updated = false;
        presets = presets.map((p: any) => {
          if (Array.isArray(p.tags) && p.tags.includes(cleanOld)) {
            p.tags = p.tags.map((t: string) => (t === cleanOld ? cleanNew : t));
            // De-duplicate tags just in case
            p.tags = Array.from(new Set(p.tags));
            updated = true;
          }
          return p;
        });
        if (updated) {
          fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
        }
      }
    }
    return res.status(200).json(tags);
  }

  if (req.method === "DELETE") {
    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ error: "Missing tag" });
    }
    const cleanTag = tag.trim().toLowerCase();
    
    // 1. Update tag in tags.json
    tags = tags.filter((t) => t !== cleanTag);
    fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2));

    // 2. Cascade delete into presets.json
    if (fs.existsSync(PRESETS_FILE)) {
      let presets = JSON.parse(fs.readFileSync(PRESETS_FILE, "utf-8"));
      let updated = false;
      presets = presets.map((p: any) => {
        if (Array.isArray(p.tags) && p.tags.includes(cleanTag)) {
          p.tags = p.tags.filter((t: string) => t !== cleanTag);
          updated = true;
        }
        return p;
      });
      if (updated) {
        fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
      }
    }

    return res.status(200).json(tags);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
