import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fs from "fs";
import path from "path";

const PRESETS_FILE = path.join(process.cwd(), "presets.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use the exact same secrets that [...nextauth].ts expects
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET });
  
  const discordId = token?.discordId as string | undefined;
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
  
  const username = token?.name as string | undefined || "Unknown User";

  let presets: any[] = [];
  if (fs && PRESETS_FILE) {
    if (!fs.existsSync(PRESETS_FILE)) {
      try { fs.writeFileSync(PRESETS_FILE, JSON.stringify([])); } catch(e) {}
    }

    try {
      const rawData = fs.readFileSync(PRESETS_FILE, "utf-8");
      presets = JSON.parse(rawData);
    } catch (e) {
      presets = [];
    }
  }

  // GET handler: allows anyone to sync public presets and overrides
  if (req.method === "GET") {
    if (isAdmin && req.query.all === "true") {
      return res.status(200).json(presets);
    } else {
      const filtered = presets.filter((p) => {
        const isOwner = discordId && String(p.creator_id) === String(discordId);
        if (req.query.mine === "true") {
          return isOwner;
        }
        const isOverride =
          p.creator_id === "override" ||
          p.deleted ||
          p.official ||
          (Array.isArray(p.tags) && p.tags.length > 0);
        return isOwner || isOverride;
      });
      return res.status(200).json(filtered);
    }
  }

  // All other methods (POST, PUT, DELETE) require authentication
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { name, description, flags } = req.body;
    
    if (!name || !flags) {
      return res.status(400).json({ error: "Missing name or flags" });
    }

    const userPresetCount = presets.filter(p => String(p.creator_id) === String(discordId)).length;
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
      tags: [],
      official: false,
    };

    presets.push(newPreset);
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));

    return res.status(201).json(newPreset);
  }

  if (req.method === "PUT") {
    const { id, name, tags } = req.body;

    // Admin updating tags or official status (override workflow)
    if (tags !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const isOfficial = Array.isArray(tags) && tags.includes("official");

      // 1. Find by database id
      let presetIndex = -1;
      if (id) {
        presetIndex = presets.findIndex((p) => String(p.id) === String(id));
      }

      // 2. Find by name
      if (presetIndex === -1 && name) {
        presetIndex = presets.findIndex(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
      }

      if (presetIndex > -1) {
        presets[presetIndex].tags = tags;
        presets[presetIndex].official = isOfficial;
        fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
        return res.status(200).json(presets[presetIndex]);
      } else {
        // Save a brand new local override record for the API preset
        const newOverride = {
          id: Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7),
          name: name || id,
          tags,
          official: isOfficial,
          creator_id: "override",
          creator_name: "System",
          created_timestamp: new Date().toISOString(),
          download_timestamp: null,
          flags: "", // Not needed for pure overrides
          deleted: false,
        };
        presets.push(newOverride);
        fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
        return res.status(200).json(newOverride);
      }
    }

    // Update download timestamp when a seed is downloaded using these flags/preset name
    const { flags, presetName } = req.body;

    let updated = false;
    if (presetName) {
      for (let i = 0; i < presets.length; i++) {
        if (presets[i].name && presets[i].name.toLowerCase() === presetName.toLowerCase()) {
          presets[i].download_timestamp = new Date().toISOString();
          updated = true;
          break;
        }
      }
    } else if (flags) {
      for (let i = 0; i < presets.length; i++) {
        if (presets[i].flags === flags) {
          presets[i].download_timestamp = new Date().toISOString();
          updated = true;
        }
      }
    } else {
      return res.status(400).json({ error: "Missing flags or presetName" });
    }

    if (updated) {
      fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ error: "No matching preset found" });
  }

  if (req.method === "DELETE") {
    const id = req.query.id || req.body?.id;
    const name = req.query.name || req.body?.name;
    const ids = req.body?.ids || (req.query.ids ? String(req.query.ids).split(",") : null);
    const names = req.body?.names || (req.query.names ? String(req.query.names).split(",") : null);
    
    console.log(`[DELETE PRESET] Request received. id: "${id}", name: "${name}", ids: "${JSON.stringify(ids)}", names: "${JSON.stringify(names)}"`);
    console.log(`[DELETE PRESET] User discordId: "${discordId}", isAdmin: ${isAdmin}`);
    
    if (!id && !ids && !name && !names) {
      return res.status(400).json({ error: "Missing preset identifier(s)" });
    }

    const targets: { type: "id" | "name"; value: string }[] = [];
    if (id) targets.push({ type: "id", value: String(id) });
    if (name) targets.push({ type: "name", value: String(name) });
    if (ids) ids.forEach((x: any) => targets.push({ type: "id", value: String(x) }));
    if (names) names.forEach((x: any) => targets.push({ type: "name", value: String(x) }));

    let deletedCount = 0;

    for (const target of targets) {
      if (target.type === "id") {
        const presetIndex = presets.findIndex((p) => String(p.id) === target.value);
        if (presetIndex > -1) {
          const targetPreset = presets[presetIndex];
          if (isAdmin || String(targetPreset.creator_id) === String(discordId)) {
            if (targetPreset.creator_id === "override") {
              // Mark override as deleted
              targetPreset.deleted = true;
            } else {
              // Delete standard user preset
              presets.splice(presetIndex, 1);
            }
            deletedCount++;
          }
        } else {
          // If database ID not found, it is likely an API preset. Check if we have an override, or create one.
          if (isAdmin) {
            const overrideIdx = presets.findIndex(
              (p) => p.name.toLowerCase() === target.value.toLowerCase()
            );
            if (overrideIdx > -1) {
              presets[overrideIdx].deleted = true;
            } else {
              presets.push({
                id: Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7),
                name: target.value,
                deleted: true,
                creator_id: "override",
                created_timestamp: new Date().toISOString(),
              });
            }
            deletedCount++;
          }
        }
      } else if (target.type === "name") {
        if (isAdmin) {
          const overrideIdx = presets.findIndex(
            (p) => p.name.toLowerCase() === target.value.toLowerCase()
          );
          if (overrideIdx > -1) {
            presets[overrideIdx].deleted = true;
          } else {
            presets.push({
              id: Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7),
              name: target.value,
              deleted: true,
              creator_id: "override",
              created_timestamp: new Date().toISOString(),
            });
          }
          deletedCount++;
        }
      }
    }

    if (deletedCount > 0) {
      fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
      console.log(`[DELETE PRESET] Successfully processed deletion for ${deletedCount} preset(s).`);
      return res.status(200).json({ success: true, deleted: deletedCount });
    }

    console.log(`[DELETE PRESET] Presets not found or unauthorized`);
    return res.status(404).json({ error: "Presets not found or unauthorized" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
