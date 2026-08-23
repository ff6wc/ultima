/**
 * Helpers for rendering rows from the shared `seedlist` collection.
 *
 * `seedlist` is written by several producers (the SeedBot Discord bot, the
 * seedbot.net web app, and this site) and read back here on the profile page.
 * `share_url` is therefore NOT guaranteed to be same-origin, or even absolute:
 * seedbot.net's local rolls historically stored an origin-relative media path
 * such as `/media/preset_foo_abc123.zip`, which 404s when resolved against
 * ff6worldscollide.com.
 *
 * Every seed link rendered on this site must go through `resolveSeedShareUrl`,
 * which resolves relative paths against the origin that wrote the row and
 * returns null when the link cannot be trusted or reconstructed.
 */

const SEEDBOT_ORIGIN = "https://seedbot.net";

/** Values written to the `source` field by each producer. */
export const SEED_SOURCE = {
  /** SeedBot Discord bot. */
  DISCORD: "discord",
  /** seedbot.net web app. */
  SEEDBOT_WEB: "seedbot_web",
  /** This site. */
  FF6WC_WEB: "ff6wc_web",
} as const;

export type SeedHistoryEntry = {
  share_url?: string | null;
  server_name?: string | null;
  /**
   * Added by the producers so consumers do not have to infer origin from
   * `server_name`. Absent on rows written before that change.
   */
  source?: string | null;
};

/**
 * Legacy rows have no `source`, so fall back to the magic `server_name` value
 * seedbot.net wrote for every web roll. Real Discord guild names also land in
 * `server_name`, but those rows always stored absolute URLs, so failing to
 * classify them costs nothing.
 */
const isSeedbotWebRow = (seed: SeedHistoryEntry) => {
  if (seed.source) {
    return seed.source === SEED_SOURCE.SEEDBOT_WEB;
  }
  return (seed.server_name || "").trim().toLowerCase() === "webapp";
};

/**
 * Origin that wrote the row, used to resolve relative paths.
 * Returns null when we cannot say with confidence.
 */
const getWriterOrigin = (seed: SeedHistoryEntry): string | null => {
  if (isSeedbotWebRow(seed)) {
    return SEEDBOT_ORIGIN;
  }
  // Rows this site wrote are relative to this site.
  if (seed.source === SEED_SOURCE.FF6WC_WEB) {
    return typeof window !== "undefined" ? window.location.origin : null;
  }
  return null;
};

/**
 * Resolve a stored `share_url` into a URL that is safe to put in an href.
 *
 * Returns null when the row has no link, when a relative path cannot be
 * attributed to a known origin, or when the stored value is not http(s) —
 * these strings come from a shared datastore, so a `javascript:` payload must
 * never reach an anchor.
 */
export const resolveSeedShareUrl = (seed: SeedHistoryEntry): string | null => {
  const raw = (seed.share_url || "").trim();
  if (!raw) return null;

  const origin = getWriterOrigin(seed);
  // A base is required to parse relative values; an absolute `raw` ignores it.
  const base =
    origin || (typeof window !== "undefined" ? window.location.origin : null);

  let parsed: URL;
  try {
    parsed = base ? new URL(raw, base) : new URL(raw);
  } catch (e) {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  // Relative value with no known writer: resolving it against this site is how
  // the 404s happened, so drop the link instead of guessing.
  if (!origin && !/^https?:\/\//i.test(raw)) {
    return null;
  }

  return parsed.toString();
};

/**
 * Human-readable host for the seed card. `WebApp` is the legacy marker
 * seedbot.net wrote; show the actual site instead.
 */
export const formatSeedSource = (seed: SeedHistoryEntry): string | null => {
  if (isSeedbotWebRow(seed)) {
    return "seedbot.net";
  }
  if (seed.source === SEED_SOURCE.DISCORD) {
    return seed.server_name || "Discord";
  }
  return seed.server_name || null;
};
