import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { selectFlagValues } from "~/state/flagSlice";
import { selectObjectives } from "~/state/objectiveSlice";
import styles from "./FlagSummary.module.css";

// ─── Objective result IDs ─────────────────────────────────────────────────────
const RESULT_FINAL_KEFKA = "2";
const RESULT_KT_SKIP = "3";

// Condition type IDs (from objective.json)
const COND_NONE = "0";
const COND_CHARACTERS = "2";
const COND_ESPERS = "4";
const COND_DRAGONS = "6";
const COND_BOSSES = "8";
const COND_CHECKS = "10";

// Command ID → name
const COMMAND_NAMES: Record<number, string> = {
  97: "None",
  0: "Fight",
  1: "Item",
  2: "Magic",
  3: "Morph",
  4: "Revert",
  5: "Steal",
  6: "Capture",
  7: "SwdTech",
  8: "Throw",
  9: "Tools",
  10: "Blitz",
  11: "Runic",
  12: "Lore",
  13: "Sketch",
  14: "Control",
  15: "Slot",
  16: "Rage",
  17: "Leap",
  18: "Mimic",
  19: "Dance",
  20: "Row",
  21: "Defend",
  22: "Jump",
  23: "X-Magic",
  24: "GP Rain",
  25: "Summon",
  26: "Health",
  27: "Shock",
  28: "Possess",
  29: "Magitek",
};

// ─── Standard Atma Series baseline values ────────────────────────────────────
// Deviations from these produce difficulty score changes.
// A seed matching all these values should score in "Standard" range.
//   lsced 2×, hmced 2×, xpm 3, mpm 5, gpm 5, nxppd (full XP)
//   bbs (boss shuffle), escr 100, esr 2–5, elrt
//   ccsr 20, sisr 20, rec1=28(Possess) rec2=27(Shock)
//   gp 5000, csrp 80–125, msl 40

type BulletSeverity = "hard" | "medium" | "easy" | "info";
interface Bullet { text: string; severity: BulletSeverity; }

const SCALING_FLAGS = ["-lsa", "-lsh", "-lsce", "-lsced", "-lsc", "-lst", "-lsbd"];
const HP_FLAGS = ["-hma", "-hmh", "-hmce", "-hmced", "-hmc", "-hmt", "-hmbd"];
const XP_GP_REWARD_FLAGS = ["-xga", "-xgh", "-xgce", "-xgced", "-xgc", "-xgt", "-xgbd"];

const SCALING_LABEL: Record<string, string> = {
  "-lsa": "party avg level", "-lsh": "highest party level",
  "-lsce": "chars + espers", "-lsced": "chars, espers & dragons",
  "-lsc": "checks completed", "-lst": "time elapsed",
  "-lsbd": "bosses & dragons",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hasFlag(fv: Record<string, any>, flag: string): boolean {
  const v = fv[flag];
  return v !== null && v !== undefined && v !== false && v !== "";
}
function flagNum(fv: Record<string, any>, flag: string): number | null {
  const v = fv[flag];
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return parseFloat(String(v[0]));
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}
function flagNumArr(fv: Record<string, any>, flag: string): number[] | null {
  const v = fv[flag];
  if (!Array.isArray(v)) return null;
  const nums = (v as any[]).map((x) => parseFloat(String(x))).filter((x) => !isNaN(x));
  return nums.length > 0 ? nums : null;
}
function flagStr(fv: Record<string, any>, flag: string): string | null {
  const v = fv[flag];
  if (v === null || v === undefined) return null;
  return String(v);
}

// Objective format: resultId.minRequired.maxRequired[.condId.val1[.val2]...]
function parseObjectiveValue(raw: string) {
  const parts = raw.split(".");
  const resultId = parts[0] ?? "0";
  const min = parseInt(parts[1] ?? "0", 10);
  const max = parseInt(parts[2] ?? "0", 10);
  return {
    resultId,
    minRequired: isNaN(min) ? 0 : min,
    maxRequired: isNaN(max) ? 0 : max,
  };
}

function describeObjectiveConditions(objective: any): string {
  if (!objective?.conditions?.length) return "";
  return (objective.conditions as any[])
    .filter((c) => c.id !== COND_NONE && c.id !== "0")
    .map((c) => {
      const vals = c.values ?? [];
      if (c.id === COND_CHARACTERS || c.id === "2")
        return vals[1] ? `${vals[0]}–${vals[1]} chars` : `${vals[0]} chars`;
      if (c.id === COND_ESPERS || c.id === "4")
        return vals[1] ? `${vals[0]}–${vals[1]} espers` : `${vals[0]} espers`;
      if (c.id === COND_DRAGONS || c.id === "6")
        return vals[1] ? `${vals[0]}–${vals[1]} dragons` : `${vals[0]} dragons`;
      if (c.id === COND_BOSSES || c.id === "8")
        return vals[1] ? `${vals[0]}–${vals[1]} bosses` : `${vals[0]} bosses`;
      if (c.id === COND_CHECKS || c.id === "10")
        return vals[1] ? `${vals[0]}–${vals[1]} checks` : `${vals[0]} checks`;
      return c.name ?? c.id;
    })
    .filter(Boolean)
    .join(", ");
}

// ─── Info panel rows ──────────────────────────────────────────────────────────
interface InfoRow { label: string; value: string; highlight?: boolean; }

function buildInfoRows(fv: Record<string, any>, objectives: Record<string, any>): InfoRow[] {
  const rows: InfoRow[] = [];

  // Game Mode
  if (hasFlag(fv, "-open")) {
    rows.push({ label: "Game Mode", value: "Open World" });
  } else if (hasFlag(fv, "-cg")) {
    rows.push({ label: "Game Mode", value: "Character Gating" });
  } else {
    rows.push({ label: "Game Mode", value: "Standard" });
  }

  // Starting party
  const startChars = ["-sc1", "-sc2", "-sc3", "-sc4"]
    .map((f) => flagStr(fv, f))
    .filter(Boolean);
  if (startChars.length) {
    const charList = startChars.map((c) =>
      c === "random" || c === "randomngu"
        ? "Random"
        : (c ?? "?").charAt(0).toUpperCase() + (c ?? "?").slice(1)
    );
    rows.push({
      label: "Starting Party",
      value: `${charList.length} characters (${charList.join(", ")})`,
    });
  }

  // No Free Characters/Espers (-nfce)
  if (hasFlag(fv, "-nfce")) {
    rows.push({
      label: "Challenges",
      value: "No Free Characters / Espers",
      highlight: true,
    });
  }

  // Final Kefka conditions
  const kefkaObjs = Object.values(objectives).filter(
    (o: any) => o?.result?.id === RESULT_FINAL_KEFKA
  );
  if (kefkaObjs.length > 0) {
    const obj = kefkaObjs[0] as any;
    const { minRequired } = parseObjectiveValue(flagStr(fv, obj.flag) ?? "2.0.0");
    const conds = describeObjectiveConditions(obj);
    rows.push({
      label: "Final Kefka",
      value: conds
        ? `${minRequired} of: ${conds}`
        : minRequired > 0
        ? `${minRequired} condition(s) required`
        : "No conditions set",
    });
  }

  // KT Skip conditions
  const ktObjs = Object.values(objectives).filter(
    (o: any) => o?.result?.id === RESULT_KT_SKIP
  );
  if (ktObjs.length > 0) {
    const obj = ktObjs[0] as any;
    const { minRequired } = parseObjectiveValue(flagStr(fv, obj.flag) ?? "3.0.0");
    const conds = describeObjectiveConditions(obj);
    rows.push({
      label: "KT Skip",
      value: conds
        ? `${minRequired} of: ${conds}`
        : minRequired > 0
        ? `${minRequired} condition(s) required`
        : "No conditions set",
    });
  }

  // Excluded Commands — only show if different from standard (Possess=28, Shock=27)
  const recFlags = ["-rec1", "-rec2", "-rec3", "-rec4", "-rec5", "-rec6"];
  const excludedCmds = recFlags
    .map((f) => flagNum(fv, f))
    .filter((v) => v !== null && v !== 97)
    .map((v) => COMMAND_NAMES[v as number] ?? `#${v}`);
  const sortedExcluded = [...excludedCmds].sort().join(", ");
  const stdExcluded = ["Possess", "Shock"].sort().join(", "); // rec1=28, rec2=27
  if (sortedExcluded !== stdExcluded) {
    rows.push({
      label: "Excluded Commands",
      value: excludedCmds.length > 0 ? excludedCmds.join(", ") : "None",
      highlight: true,
    });
  }

  // Scaling — always show; highlight if non-standard
  const activeScalingFlag = SCALING_FLAGS.find((f) => hasFlag(fv, f));
  if (activeScalingFlag) {
    const mult = flagNum(fv, activeScalingFlag);
    const isStd = activeScalingFlag === "-lsced" && mult === 2;
    rows.push({
      label: "Level Scaling",
      value: `${mult}× ${SCALING_LABEL[activeScalingFlag] ?? ""}`,
      highlight: !isStd,
    });
  } else {
    rows.push({ label: "Level Scaling", value: "None (fixed levels)", highlight: true });
  }

  // HP/MP Scaling — only if different from standard hmced 2
  const activeHpFlag = HP_FLAGS.find((f) => hasFlag(fv, f));
  if (activeHpFlag) {
    const hpMult = flagNum(fv, activeHpFlag);
    const isStd = activeHpFlag === "-hmced" && hpMult === 2;
    if (!isStd) {
      rows.push({
        label: "HP/MP Scaling",
        value: `${hpMult}× ${SCALING_LABEL[activeHpFlag] ?? ""}`,
        highlight: hpMult !== null && hpMult > 2.5,
      });
    }
  }

  // Multipliers — only show deviations from standard (xpm=3, mpm=5, gpm=5, full XP)
  const xpm = flagNum(fv, "-xpm");
  const mpm = flagNum(fv, "-mpm");
  const gpm = flagNum(fv, "-gpm");
  const partyXpSplit = !hasFlag(fv, "-nxppd");
  const multParts: string[] = [];
  if (xpm !== null && xpm !== 3) multParts.push(`XP ×${xpm}`);
  if (mpm !== null && mpm !== 5) multParts.push(`MP ×${mpm}`);
  if (gpm !== null && gpm !== 5) multParts.push(`Gold ×${gpm}`);
  if (partyXpSplit) multParts.push("Party XP split among survivors");
  if (multParts.length > 0) {
    rows.push({ label: "Multipliers", value: multParts.join(", "), highlight: true });
  }

  // Boss Settings — only if non-standard
  const bossParts: string[] = [];
  if (hasFlag(fv, "-bbr")) bossParts.push("Fully randomized bosses");
  const drloc = flagStr(fv, "-drloc");
  if (drloc && drloc !== "shuffle") bossParts.push(`Dragons: ${drloc}`);
  const stloc = flagStr(fv, "-stloc");
  if (stloc && stloc !== "mix") bossParts.push(`Statues: ${stloc}`);
  if (!hasFlag(fv, "-be")) bossParts.push("Bosses give no EXP");
  if (!hasFlag(fv, "-bnu")) bossParts.push("Boss undead on");
  if (bossParts.length > 0) {
    rows.push({ label: "Boss Settings", value: bossParts.join(", "), highlight: true });
  }

  // Natural Magic — only if non-standard
  const nm1 = flagStr(fv, "-nm1");
  const nm2 = flagStr(fv, "-nm2");
  const nmParts: string[] = [];
  if (nm1 && nm1 !== "random") nmParts.push(`Terra → ${nm1}`);
  if (nm2 && nm2 !== "random") nmParts.push(`Celes → ${nm2}`);
  if (!hasFlag(fv, "-nm1") && !hasFlag(fv, "-nm2")) nmParts.push("Disabled");
  if (nmParts.length > 0) {
    rows.push({ label: "Natural Magic", value: nmParts.join(", "), highlight: true });
  }

  // Esper Equipability — only if set
  if (hasFlag(fv, "-eer")) {
    const arr = flagNumArr(fv, "-eer");
    if (arr)
      rows.push({ label: "Esper Equipability", value: `${arr[0]}–${arr[1]} chars per esper`, highlight: true });
  } else if (hasFlag(fv, "-eebr")) {
    const v = flagNum(fv, "-eebr");
    rows.push({ label: "Esper Equipability", value: `${v} chars balanced`, highlight: true });
  }

  // Starting Gold — only if different from 5000
  const gp = flagNum(fv, "-gp");
  if (gp !== null && gp !== 5000) {
    rows.push({ label: "Starting Gold", value: `${gp.toLocaleString()} GP`, highlight: gp < 1000 });
  }

  // Shops — always show; highlight deviations from standard
  const shopParts: string[] = [];
  if (hasFlag(fv, "-sie")) {
    shopParts.push("Empty");
  } else {
    const sisr = flagNum(fv, "-sisr");
    shopParts.push(`${sisr ?? 0}% inventory randomized`);
    const sprp = flagNumArr(fv, "-sprp");
    if (sprp && (sprp[0] !== 75 || sprp[1] !== 125))
      shopParts.push(`prices ${sprp[0]}–${sprp[1]}%`);
    if (!hasFlag(fv, "-npi")) shopParts.push("priceless items kept");
  }
  rows.push({
    label: "Shops",
    value: shopParts.join(", "),
    highlight: hasFlag(fv, "-sie"),
  });

  // Chest randomization — always show
  const chestParts: string[] = [];
  if (hasFlag(fv, "-cce")) {
    chestParts.push("All empty");
  } else if (hasFlag(fv, "-ccrs")) {
    chestParts.push("Scaled tiered random");
  } else if (hasFlag(fv, "-ccrt")) {
    chestParts.push("Tiered random");
  } else {
    const ccsr = flagNum(fv, "-ccsr");
    chestParts.push(`${ccsr ?? 0}% randomized`);
  }
  const chrm = flagNumArr(fv, "-chrm");
  if (chrm && chrm[0] > 0) chestParts.push(`${chrm[0]}% monster chests`);
  rows.push({
    label: "Chests",
    value: chestParts.join(", "),
    highlight: hasFlag(fv, "-cce"),
  });

  // Equipment randomization — only if non-standard
  const eqParts: string[] = [];
  const ieor = flagNum(fv, "-ieor");
  if (ieor !== null && ieor !== 33) eqParts.push(`Weapons +${ieor}%`);
  const ieror = flagNum(fv, "-ieror");
  if (ieror !== null && ieror !== 33) eqParts.push(`Relics +${ieror}%`);
  if (hasFlag(fv, "-ier")) { const a = flagNumArr(fv, "-ier"); eqParts.push(`Weapons: ${a?.[0]}–${a?.[1]} chars`); }
  if (hasFlag(fv, "-iebr")) { const v = flagNum(fv, "-iebr"); eqParts.push(`Weapons: ${v} chars balanced`); }
  if (eqParts.length > 0) rows.push({ label: "Equipable Items", value: eqParts.join(", "), highlight: true });

  // Restrictions
  const resParts: string[] = [];
  if (hasFlag(fv, "-sn")) resParts.push("Start naked");
  if (!hasFlag(fv, "-mca")) resParts.push("Moogle Charm: char-restricted");
  if (hasFlag(fv, "-escr")) {
    const pct = flagNum(fv, "-escr");
    if (pct !== null && pct < 100) resParts.push(`${pct}% encounters escapable`);
  }
  if (resParts.length > 0) {
    rows.push({ label: "Restrictions", value: resParts.join(", "), highlight: true });
  }

  // Bug Fixes — only if not all on
  const fixFlags = ["-fs", "-fe", "-fvd", "-fr", "-fj", "-fbs", "-fedc", "-fc"];
  const activeFixes = fixFlags.filter((f) => hasFlag(fv, f));
  const missingFixes = fixFlags.filter((f) => !hasFlag(fv, f));
  if (missingFixes.length > 0 && missingFixes.length < fixFlags.length) {
    rows.push({ label: "Bug Fixes", value: `${activeFixes.length}/${fixFlags.length} enabled`, highlight: missingFixes.length > 2 });
  } else if (missingFixes.length === fixFlags.length) {
    rows.push({ label: "Bug Fixes", value: "None enabled", highlight: true });
  }

  return rows;
}

// ─── Difficulty analysis ──────────────────────────────────────────────────────
// Scoring philosophy:
//   A seed matching ALL Atma Series standard settings should score ~15 → "Standard"
//   BASE_SCORE = 15 represents the "you are playing a randomizer with objectives and
//   boss shuffle and enemy scaling" starting point. Deviations add or subtract from it.

const BASE_SCORE = 15;

function analyzeDifficulty(
  fv: Record<string, any>,
  objectives: Record<string, any>
): { score: number; label: string; color: string; bullets: Bullet[] } {
  const bullets: Bullet[] = [];
  let delta = 0; // points above/below the standard baseline

  // ── ALWAYS-SHOW: Final Kefka conditions ──
  const kefkaObjRaw = Object.values(objectives)
    .filter((o: any) => o?.result?.id === RESULT_FINAL_KEFKA)
    .map((o: any) => ({
      parsed: parseObjectiveValue(flagStr(fv, (o as any).flag) ?? "2.0.0"),
      obj: o as any,
    }));
  const ktObjRaw = Object.values(objectives)
    .filter((o: any) => o?.result?.id === RESULT_KT_SKIP)
    .map((o: any) => ({
      parsed: parseObjectiveValue(flagStr(fv, (o as any).flag) ?? "3.0.0"),
      obj: o as any,
    }));

  const kefkaRequired = kefkaObjRaw.reduce((s, o) => s + o.parsed.minRequired, 0);
  const ktRequired = ktObjRaw.reduce((s, o) => s + o.parsed.minRequired, 0);

  if (kefkaRequired > 0 || ktRequired > 0) {
    const kefkaConds = kefkaObjRaw.length > 0 ? describeObjectiveConditions(kefkaObjRaw[0].obj) : "";
    const ktConds = ktObjRaw.length > 0 ? describeObjectiveConditions(ktObjRaw[0].obj) : "";

    const kefkaText = kefkaConds
      ? `Final Kefka: ${kefkaRequired} of (${kefkaConds})`
      : `Final Kefka: ${kefkaRequired} condition(s)`;
    const ktText =
      ktRequired > 0
        ? ktConds
          ? ` · KT Skip: ${ktRequired} of (${ktConds})`
          : ` · KT Skip: ${ktRequired} condition(s)`
        : "";

    const total = kefkaRequired + ktRequired;
    const sev: BulletSeverity = total >= 6 ? "hard" : total >= 3 ? "medium" : "info";
    bullets.push({ text: kefkaText + ktText, severity: sev });
    delta += total >= 6 ? 10 : total >= 3 ? 4 : 0;
  } else if (Object.keys(objectives).length > 0) {
    bullets.push({ text: "Final Kefka: no conditions set — open access to endgame", severity: "info" });
  }

  // ── ALWAYS-SHOW: Level scaling ──
  const activeScalingFlag = SCALING_FLAGS.find((f) => hasFlag(fv, f));
  if (activeScalingFlag) {
    const mult = flagNum(fv, activeScalingFlag);
    const lbl = SCALING_LABEL[activeScalingFlag] ?? "";
    const isStd = activeScalingFlag === "-lsced" && mult === 2;

    if (mult !== null) {
      if (mult < 1.0) {
        bullets.push({ text: `Enemy scaling ${mult}× — enemies are much weaker than standard`, severity: "easy" });
        delta -= 12;
      } else if (mult < 2.0) {
        bullets.push({ text: `Enemy scaling ${mult}× ${lbl} — easier than the 2× standard`, severity: "easy" });
        delta -= 6;
      } else if (mult >= 4.0) {
        bullets.push({ text: `Enemy scaling ${mult}× ${lbl} — extreme difficulty`, severity: "hard" });
        delta += 25;
      } else if (mult >= 3.0) {
        bullets.push({ text: `Enemy scaling ${mult}× ${lbl} — harder than standard 2×`, severity: "hard" });
        delta += 15;
      } else if (mult > 2.5) {
        bullets.push({ text: `Enemy scaling ${mult}× ${lbl} — slightly above standard`, severity: "medium" });
        delta += 8;
      } else {
        // 2.0–2.5 = standard — always show as info
        bullets.push({ text: `Enemy scaling ${mult}× ${lbl}`, severity: "info" });
      }

      // Max scale level — only call out if non-standard (standard = 40)
      const msl = flagNum(fv, "-msl");
      if (msl !== null && msl !== 40) {
        if (msl < 30) { bullets.push({ text: `Enemy level cap: ${msl} — late-game is much easier`, severity: "easy" }); delta -= 8; }
        else if (msl === 99) { bullets.push({ text: "No enemy level cap — scaling continues to 99", severity: "medium" }); delta += 5; }
        else { bullets.push({ text: `Enemy level cap: ${msl}`, severity: "info" }); }
      }
    }
  } else {
    bullets.push({ text: "No enemy level scaling — enemies at fixed levels", severity: "info" });
    delta -= 5; // easier than having scaling
  }

  // ── HP/MP Scaling ── (2× = standard, no delta)
  const activeHpFlag = HP_FLAGS.find((f) => hasFlag(fv, f));
  if (activeHpFlag) {
    const hpMult = flagNum(fv, activeHpFlag);
    if (hpMult !== null) {
      if (hpMult < 1.5) { bullets.push({ text: `Enemy HP/MP ${hpMult}× — squishier than standard`, severity: "easy" }); delta -= 6; }
      else if (hpMult > 3.0) { bullets.push({ text: `Enemy HP/MP ${hpMult}× — very tanky, fights are drawn out`, severity: "hard" }); delta += 18; }
      else if (hpMult > 2.5) { bullets.push({ text: `Enemy HP/MP ${hpMult}× — above-standard tankiness`, severity: "hard" }); delta += 10; }
      else if (hpMult < 2.0) { bullets.push({ text: `Enemy HP/MP ${hpMult}× — slightly below standard`, severity: "easy" }); delta -= 3; }
      // 2.0–2.5 = standard, skip
    }
  }

  // ── Ability Scaling ── (≤2× = standard, skip)
  if (hasFlag(fv, "-ase") || hasFlag(fv, "-asr")) {
    const asMult = flagNum(fv, "-ase") || flagNum(fv, "-asr");
    if (asMult !== null && asMult >= 4.0) { bullets.push({ text: `Ability scaling ${asMult}× — spells escalate very quickly`, severity: "hard" }); delta += 12; }
    else if (asMult !== null && asMult >= 3.0) { bullets.push({ text: `Ability scaling ${asMult}× — above standard 2×`, severity: "medium" }); delta += 6; }
  }

  // ── XP Multiplier ── (3× = standard; 7× if party XP split)
  const xpm = flagNum(fv, "-xpm");
  const partyXpSplit = !hasFlag(fv, "-nxppd");
  const xpmBaseline = partyXpSplit ? 7 : 3;
  if (partyXpSplit) {
    bullets.push({ text: "Party XP divided among survivors — effective XP baseline shifts to ~7×", severity: "hard" });
    delta += 12;
  }
  if (xpm !== null) {
    const xpmDiff = xpm - xpmBaseline;
    if (xpmDiff < 0) {
      if (xpmDiff <= -4) {
        bullets.push({ text: `XP multiplier ${xpm}× is extremely low compared to baseline (${xpmBaseline}×) — grinding will be extremely slow`, severity: "hard" });
        delta += 24;
      } else if (xpmDiff <= -2) {
        bullets.push({ text: `XP multiplier ${xpm}× is well below baseline (${xpmBaseline}×) — leveling is very slow`, severity: "hard" });
        delta += 16;
      } else {
        bullets.push({ text: `XP multiplier ${xpm}× is slightly below baseline (${xpmBaseline}×) — slow leveling`, severity: "medium" });
        delta += 8;
      }
    } else if (xpmDiff > 0) {
      if (xpmDiff >= 20) {
        bullets.push({ text: `XP multiplier ${xpm}× is overwhelmingly high — leveling is virtually instant`, severity: "easy" });
        delta -= 32;
      } else if (xpmDiff >= 12) {
        bullets.push({ text: `XP multiplier ${xpm}× is extremely high — extremely fast leveling`, severity: "easy" });
        delta -= 24;
      } else if (xpmDiff >= 6) {
        bullets.push({ text: `XP multiplier ${xpm}× is very high — fast leveling`, severity: "easy" });
        delta -= 16;
      } else if (xpmDiff >= 3) {
        bullets.push({ text: `XP multiplier ${xpm}× is above baseline — fast leveling`, severity: "easy" });
        delta -= 10;
      } else if (xpmDiff >= 1) {
        bullets.push({ text: `XP multiplier ${xpm}× is slightly above baseline — faster leveling`, severity: "easy" });
        delta -= 5;
      }
    }
  }

  // ── XP/GP reward scaling from enemies ── (2× = standard)
  const activeXgFlag = XP_GP_REWARD_FLAGS.find((f) => hasFlag(fv, f));
  if (activeXgFlag) {
    const xgMult = flagNum(fv, activeXgFlag);
    if (xgMult !== null) {
      if (xgMult < 1.0) { bullets.push({ text: `Enemy XP/GP yield ${xgMult}× — very low rewards`, severity: "hard" }); delta += 10; }
      else if (xgMult < 2.0) { bullets.push({ text: `Enemy XP/GP yield ${xgMult}× — below the 2× standard`, severity: "medium" }); delta += 5; }
      else if (xgMult > 4.0) { bullets.push({ text: `Enemy XP/GP yield ${xgMult}× — generous rewards`, severity: "easy" }); delta -= 8; }
    }
  }

  // ── Boss Randomization (shuffle = standard, no delta) ──
  if (hasFlag(fv, "-bbr")) {
    bullets.push({ text: "Bosses fully randomized — any boss may appear at any location", severity: "medium" });
    delta += 10;
  }

  // ── Escapable Encounters (100% = standard) ──
  if (hasFlag(fv, "-escr")) {
    const pct = flagNum(fv, "-escr");
    if (pct !== null && pct === 0) { bullets.push({ text: "No encounters can be escaped — all battles are forced", severity: "hard" }); delta += 20; }
    else if (pct !== null && pct <= 25) { bullets.push({ text: `Only ${pct}% of encounters escapable — most battles are forced`, severity: "hard" }); delta += 14; }
    else if (pct !== null && pct <= 60) { bullets.push({ text: `${pct}% of encounters escapable — below the 100% standard`, severity: "medium" }); delta += 6; }
  }

  // ── ALWAYS-SHOW: Shop settings ──
  if (hasFlag(fv, "-sie")) {
    bullets.push({ text: "All shop inventories empty — items must be sourced from the field", severity: "hard" });
    delta += 18;
  } else {
    const sisr = flagNum(fv, "-sisr") ?? 0;
    const shopSev: BulletSeverity = sisr > 60 ? "medium" : "info";
    bullets.push({
      text: sisr === 0
        ? "Shops: standard inventory (no randomization)"
        : `Shops: ${sisr}% inventory randomized`,
      severity: shopSev,
    });
    if (sisr !== 20) delta += sisr > 60 ? 4 : 0; // standard sisr=20, no delta
  }

  // ── ALWAYS-SHOW: Chest randomization ──
  if (hasFlag(fv, "-cce")) {
    bullets.push({ text: "All chests are empty — no items in treasure chests", severity: "hard" });
    delta += 18;
  } else if (hasFlag(fv, "-ccrs") || hasFlag(fv, "-ccrt")) {
    bullets.push({ text: "Chest contents tiered/scaled — higher chance of quality finds", severity: "easy" });
    delta -= 4;
  } else {
    const ccsr = flagNum(fv, "-ccsr") ?? 0;
    bullets.push({ text: `Chests: ${ccsr}% contents randomized`, severity: "info" });
    // standard ccsr=20, small deltas for big deviations only
    if (ccsr > 80) delta -= 2;
  }

  // Chest monsters
  const chrm = flagNumArr(fv, "-chrm");
  if (chrm && chrm[0] > 0) {
    bullets.push({ text: `${chrm[0]}% of chests contain enemies (${chrm[1]}% boss chance)`, severity: chrm[0] >= 30 ? "hard" : "medium" });
    delta += chrm[0] >= 30 ? 10 : 4;
  }

  // ── Esper Spells ── (2–5 per esper = standard, no bullet unless different)
  if (hasFlag(fv, "-esr")) {
    const esrArr = flagNumArr(fv, "-esr");
    if (esrArr) {
      const [minS, maxS] = esrArr;
      const isStd = minS === 2 && maxS === 5;
      if (!isStd) {
        if (maxS < 2) { bullets.push({ text: `Esper spells ${minS}–${maxS} per esper — below 2–5 standard, weaker magic`, severity: "hard" }); delta += 10; }
        else if (minS < 1) { bullets.push({ text: `Esper spells ${minS}–${maxS} per esper — some espers may teach nothing`, severity: "medium" }); delta += 5; }
        else { bullets.push({ text: `Esper spells ${minS}–${maxS} per esper (standard is 2–5)`, severity: "info" }); }
      }
      // 2–5 = standard, no bullet
    }
  } else if (hasFlag(fv, "-ess")) {
    bullets.push({ text: "Esper spells shuffled — magic redistributed, total unchanged", severity: "info" });
  }

  // Esper learn rates (randomized = standard — no bullet)
  // Esper Equipability
  if (hasFlag(fv, "-eer")) {
    const arr = flagNumArr(fv, "-eer");
    if (arr) {
      const [minE, maxE] = arr;
      if (maxE <= 1) {
        bullets.push({ text: `Esper equipability brutally restricted (${minE}–${maxE} chars per esper) — virtually no spell sharing possible`, severity: "hard" });
        delta += 32;
      } else if (maxE <= 2) {
        bullets.push({ text: `Esper equipability highly restricted (${minE}–${maxE} chars per esper) — extremely limited magic access`, severity: "hard" });
        delta += 24;
      } else if (maxE <= 4) {
        bullets.push({ text: `Esper equipability significantly restricted (${minE}–${maxE} chars per esper) — restricted magic access`, severity: "hard" });
        delta += 16;
      } else if (maxE <= 6) {
        bullets.push({ text: `Esper equipability moderately restricted (${minE}–${maxE} chars per esper)`, severity: "medium" });
        delta += 10;
      } else {
        bullets.push({ text: `Esper equipability slightly restricted (${minE}–${maxE} chars per esper)`, severity: "medium" });
        delta += 6;
      }
    }
  } else if (hasFlag(fv, "-eebr")) {
    const v = flagNum(fv, "-eebr");
    if (v !== null) {
      if (v <= 1) {
        bullets.push({ text: `Esper equipability balanced but brutally restricted (${v} char per esper) — virtually no spell sharing possible`, severity: "hard" });
        delta += 32;
      } else if (v <= 2) {
        bullets.push({ text: `Esper equipability balanced but highly restricted (${v} chars per esper) — extremely limited magic access`, severity: "hard" });
        delta += 24;
      } else if (v <= 4) {
        bullets.push({ text: `Esper equipability balanced but significantly restricted (${v} chars per esper) — restricted magic access`, severity: "hard" });
        delta += 16;
      } else if (v <= 6) {
        bullets.push({ text: `Esper equipability balanced but moderately restricted (${v} chars per esper)`, severity: "medium" });
        delta += 10;
      } else {
        bullets.push({ text: `Esper equipability balanced and slightly restricted (${v} chars per esper)`, severity: "medium" });
        delta += 6;
      }
    }
  }

  // ── Character Stats ──
  const csrp = flagNumArr(fv, "-csrp");
  if (csrp) {
    const [lo, hi] = csrp;
    if (lo < 40) {
      bullets.push({ text: `Character stats ${lo}–${hi}% — severe stats penalty, characters are extremely weak`, severity: "hard" });
      delta += 25;
    } else if (lo < 60) {
      bullets.push({ text: `Character stats ${lo}–${hi}% — notable stats penalty, characters are significantly weaker`, severity: "hard" });
      delta += 16;
    } else if (lo < 78) {
      bullets.push({ text: `Character stats ${lo}–${hi}% — slight stats penalty`, severity: "medium" });
      delta += 8;
    } else if (lo >= 150 && hi >= 200) {
      bullets.push({ text: `Character stats ${lo}–${hi}% — godlike stats boost, characters are overwhelmingly powerful`, severity: "easy" });
      delta -= 30;
    } else if (lo >= 120 && hi >= 160) {
      bullets.push({ text: `Character stats ${lo}–${hi}% — massive stats boost, characters are extremely powerful`, severity: "easy" });
      delta -= 22;
    } else if (lo >= 100 && hi >= 135) {
      bullets.push({ text: `Character stats ${lo}–${hi}% — solid stats boost, characters are stronger than standard`, severity: "easy" });
      delta -= 14;
    } else if (lo > 80 || hi > 125) {
      bullets.push({ text: `Character stats ${lo}–${hi}% — slight stats advantage`, severity: "easy" });
      delta -= 6;
    }
  }

  // ── Equipment Randomization ──
  if (hasFlag(fv, "-ier") || hasFlag(fv, "-iebr") || hasFlag(fv, "-ietr")) {
    bullets.push({ text: "Equipment availability randomized — limited gear options per character", severity: "medium" });
    delta += 5;
  }

  // ── Challenge flags ──
  if (hasFlag(fv, "-nfce")) {
    bullets.push({ text: "No Free Characters/Espers — rewards removed from events (Auction, Collapsing House, etc.)", severity: "medium" });
    delta += 8;
  }
  if (hasFlag(fv, "-sn")) {
    bullets.push({ text: "Start naked — recruited characters have no starting equipment", severity: "hard" });
    delta += 10;
  }

  // Starting Gold
  const gp = flagNum(fv, "-gp");
  if (gp !== null && gp <= 0) { bullets.push({ text: "Starting with no gold", severity: "hard" }); delta += 6; }
  else if (gp !== null && gp >= 50000) { bullets.push({ text: `Starting with ${gp.toLocaleString()} gold — strong economic advantage`, severity: "easy" }); delta -= 5; }

  // Open World
  if (hasFlag(fv, "-open")) { bullets.push({ text: "Open world — all events accessible from the start", severity: "easy" }); delta -= 5; }

  // Final score = BASE (standard) + deviations
  const score = Math.max(0, BASE_SCORE + delta);

  let label: string;
  let color: string;
  // Thresholds relative to BASE_SCORE=15:
  //   ≤8  = Casual    (significantly easier than standard)
  //   9–22 = Standard  (close to Atma baseline)
  //   23–42 = Challenging
  //   43–65 = Hard
  //   >65  = Brutal
  if (score <= 8)       { label = "Casual";      color = "#22c55e"; }
  else if (score <= 22) { label = "Standard";    color = "#3b82f6"; }
  else if (score <= 42) { label = "Challenging"; color = "#f59e0b"; }
  else if (score <= 65) { label = "Hard";        color = "#ef4444"; }
  else                  { label = "Brutal";      color = "#a855f7"; }

  return { score, label, color, bullets };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const FlagSummary = () => {
  const flagValues = useSelector(selectFlagValues) as Record<string, any>;
  const objectives = useSelector(selectObjectives) as Record<string, any>;

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("flag_summary_collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("flag_summary_collapsed", String(nextState));
  };

  const infoRows = buildInfoRows(flagValues, objectives);
  const { score, label, color, bullets } = analyzeDifficulty(flagValues, objectives);

  const severityIcon: Record<BulletSeverity, string> = {
    hard: "⚠️", medium: "◆", easy: "✓", info: "ℹ",
  };
  const severityColor: Record<BulletSeverity, string> = {
    hard: "#ef4444", medium: "#f59e0b", easy: "#22c55e", info: "#60a5fa",
  };

  return (
    <div className={styles.container}>
      {/* ── Collapsible Header ── */}
      <div 
        className={styles.cardHeader} 
        onClick={toggleCollapse} 
        role="button" 
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCollapse();
          }
        }}
      >
        <div className={styles.headerTitleGroup}>
          <h3 className={styles.title}>Flag Set Summary</h3>
          {isCollapsed && (
            <div className={styles.difficultyBadgeCompact} style={{ borderColor: color, color }}>
              <span className={styles.difficultyLabelCompact}>{label}</span>
              <span className={styles.difficultyScoreCompact} style={{ backgroundColor: color }}>
                {score} pts
              </span>
            </div>
          )}
        </div>
        <button 
          className={styles.collapseBtn} 
          aria-label={isCollapsed ? "Expand Flag Set Summary" : "Collapse Flag Set Summary"}
          onClick={(e) => {
            // Prevent event bubbling so double clicking/triggering is avoided
            e.stopPropagation();
            toggleCollapse();
          }}
        >
          {isCollapsed ? <HiChevronDown size={18} /> : <HiChevronUp size={18} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.collapsibleContent}>
          {/* ── Info Panel ── */}
          <div className={styles.infoGrid}>
            {infoRows.map((row, i) => (
              <div key={i} className={styles.infoRow}>
                <span className={styles.infoLabel}>{row.label}</span>
                <span className={`${styles.infoValue} ${row.highlight ? styles.infoValueHighlight : ""}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className={styles.sectionDivider} />

          {/* ── Difficulty ── */}
          <div className={styles.header}>
            <span className={styles.difficultyTitle}>Difficulty</span>
            <div className={styles.difficultyBadge} style={{ borderColor: color, color }}>
              <span className={styles.difficultyLabel}>{label}</span>
              <span className={styles.difficultyScore} style={{ backgroundColor: color }}>
                {score} pts
              </span>
            </div>
          </div>

          <div className={styles.meterBar}>
            <div
              className={styles.meterFill}
              style={{ width: `${Math.min(100, (score / 80) * 100)}%`, backgroundColor: color }}
            />
          </div>
          <div className={styles.meterLabels}>
            <span>Casual</span>
            <span>Standard</span>
            <span>Challenging</span>
            <span>Hard</span>
            <span>Brutal</span>
          </div>

          {bullets.length === 0 ? (
            <p className={styles.noBullets}>No significant difficulty modifiers detected.</p>
          ) : (
            <ul className={styles.bulletList}>
              {bullets.map((b, i) => (
                <li key={i} className={styles.bulletItem}>
                  <span
                    className={styles.bulletIcon}
                    style={{ color: severityColor[b.severity] }}
                    title={b.severity}
                  >
                    {severityIcon[b.severity]}
                  </span>
                  <span className={styles.bulletText}>{b.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
