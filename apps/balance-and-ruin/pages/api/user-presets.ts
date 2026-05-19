import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fs from "fs";
import path from "path";

const PRESETS_FILE = path.join(process.cwd(), "presets.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use the exact same secrets that [...nextauth].ts expects
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET });
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const discordId = token.discordId as string;
  const isAdmin = token.isAdmin as boolean;
  const username = token.name as string || "Unknown User";

  // Ensure file exists
  if (!fs.existsSync(PRESETS_FILE)) {
    fs.writeFileSync(PRESETS_FILE, JSON.stringify([]));
  }

  const rawData = fs.readFileSync(PRESETS_FILE, "utf-8");
  let presets: any[] = [];
  try {
    presets = JSON.parse(rawData);
  } catch (e) {
    presets = [];
  }

  if (req.method === "GET") {
    // Admins can request all presets, otherwise users only see their own
    if (isAdmin && req.query.all === 'true') {
      return res.status(200).json(presets);
    } else {
      return res.status(200).json(presets.filter(p => p.creator_id === discordId));
    }
  }

  if (req.method === "POST") {
    const { name, description, flags } = req.body;
    
    if (!name || !flags) {
      return res.status(400).json({ error: "Missing name or flags" });
    }

    const userPresetCount = presets.filter(p => p.creator_id === discordId).length;
    if (userPresetCount >= 50) {
      return res.status(403).json({ error: "Maximum limit of 50 saved presets reached." });
    }

    const newPreset = {
      id: Date.now().toString(),
      name,
      description: description || "",
      flags,
      creator_id: discordId,
      creator_name: username,
      created_timestamp: new Date().toISOString(),
      download_timestamp: null,
    };

    presets.push(newPreset);
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));

    return res.status(201).json(newPreset);
  }

  if (req.method === "PUT") {
    // Update download timestamp when a seed is downloaded using these flags
    const { flags } = req.body;
    if (!flags) return res.status(400).json({ error: "Missing flags" });

    let updated = false;
    for (let i = 0; i < presets.length; i++) {
      if (presets[i].flags === flags) {
        presets[i].download_timestamp = new Date().toISOString();
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ error: "No matching preset found" });
  }

  if (req.method === "DELETE") {
    const id = req.query.id || req.body?.id;
    console.log(`[DELETE PRESET] Request received to delete preset with id: "${id}"`);
    console.log(`[DELETE PRESET] Active user discordId: "${discordId}", isAdmin: ${isAdmin}`);
    
    if (!id) {
      return res.status(400).json({ error: "Missing preset ID" });
    }

    const presetIndex = presets.findIndex(p => String(p.id) === String(id));
    console.log(`[DELETE PRESET] Found preset index: ${presetIndex}`);

    if (presetIndex > -1) {
      const targetPreset = presets[presetIndex];
      console.log(`[DELETE PRESET] Target preset creator_id: "${targetPreset.creator_id}"`);
      
      if (isAdmin || String(targetPreset.creator_id) === String(discordId)) {
        presets.splice(presetIndex, 1);
        fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
        console.log(`[DELETE PRESET] Successfully deleted preset from database!`);
        return res.status(200).json({ success: true });
      } else {
        console.log(`[DELETE PRESET] Unauthorized deletion attempt by user`);
        return res.status(403).json({ error: "Unauthorized" });
      }
    }
    console.log(`[DELETE PRESET] Preset not found in database`);
    return res.status(404).json({ error: "Preset not found" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
