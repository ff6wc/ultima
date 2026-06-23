export const hasSevereProfanity = (text: string): boolean => {
  if (!text) return false;

  // 1. Check with word boundaries (catches exact words with punctuation/spaces around them)
  // Severe terms: fuck, cunt, faggot, nigger, chink, kike, dyke, tranny, retard, shit, cock
  const severePatterns = [
    /\bf[u*v]ck(?:s|ers?|ing)?\b/i,
    /\bc[u*]nt[s]?\b/i,
    /\bsh[i*!1]t[s]?\b/i,
    /\bc[o*0]ck[s]?\b/i,
    /\bfag[o0]t[s]?\b/i,
    /\bnigg[e3]r[s]?\b/i,
    /\bchink[s]?\b/i,
    /\bkik[e3][s]?\b/i,
    /\bdyk[e3][s]?\b/i,
    /\btrann[y]?[s]?\b/i,
    /\bretard(?:ed)?\b/i,
  ];

  if (severePatterns.some((pattern) => pattern.test(text))) {
    return true;
  }

  // 2. Normalize and check for strict severe terms (covers attempts to bypass with spaces or symbols)
  const normalized = text
    .toLowerCase()
    .replace(/[0oO*@4vV]/g, "u")
    .replace(/[1iIl!|]/g, "i")
    .replace(/[3eE]/g, "e")
    .replace(/[5sS$]/g, "s")
    .replace(/[7tT]/g, "t")
    .replace(/[^a-z]/g, ""); // strip all spaces, symbols, numbers

  const strictSubstrings = [
    "fuck",
    "faggot",
    "faggut",
    "nigger",
    "kike",
    "tranny",
  ];

  if (strictSubstrings.some((word) => normalized.includes(word))) {
    return true;
  }

  return false;
};
