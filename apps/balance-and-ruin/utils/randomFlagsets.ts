function weightedChoice<T>(options: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

function choice<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function randint(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandom(): string {
  // -----GAME-----
  // SETTINGS
  const mode = weightedChoice(["-open", "-cg"], [1, 15]);
  const slog = weightedChoice(["", " -sl"], [1, 0]);
  const settings = mode + slog;

  // KEFKA'S TOWER & STATUE SKIP
  const ktcr1 = randint(5, 7);
  const ktcr2 = randint(ktcr1, 10);
  const kter1 = randint(7, 11);
  const kter2 = randint(kter1, 13);
  const ktdr1 = randint(1, 3);
  const ktdr2 = randint(ktdr1, 3);
  const stcr1 = randint(6, 8);
  const stcr2 = randint(stcr1, 11);
  const ster1 = randint(8, 12);
  const ster2 = randint(ster1, 14);
  const stdr1 = randint(2, 4);
  const stdr2 = randint(stdr1, 4);
  const stno = weightedChoice([true, false], [6, 1]);

  let kt = "";
  if (stno) {
    kt = " -oa 2.2.2.2." + [ktcr1, ktcr2, "4", kter1, kter2, "6", ktdr1, ktdr2].join(".");
  } else {
    kt = " -oa 2.2.2.2." + [ktcr1, ktcr2, "4", kter1, kter2, "6", ktdr1, ktdr2].join(".");
    kt += " -ob 3.2.2.2." + [stcr1, stcr2, "4", ster1, ster2, "6", stdr1, stdr2].join(".");
  }

  const objectives = weightedChoice([" -oc 0.1.1.1.r", " -oc 0.1.1.1.r -od 0.1.1.1.r"], [4, 1]);
  const game = settings + kt + objectives;

  // -----PARTY-----
  // STARTING PARTY
  const sc1 = choice([" -sc1 random", " -sc1 randomngu"]);
  const sc2 = choice([" -sc2 random", " -sc2 randomngu"]);
  const sc3 = weightedChoice([" -sc3 random", " -sc3 randomngu", ""], [1, 1, 5]);
  const sc4 = weightedChoice([" -sc4 random", " -sc4 randomngu", ""], [0, 0, 1]);
  const sparty = sc1 + sc2 + sc3 + sc4;

  // SWORDTECHS
  const fst = weightedChoice([" -fst", ""], [1, 0]);
  const sel = weightedChoice([" -sel", ""], [1, 5]);
  const swdtech = fst + sel;

  // BLITZES
  const brl = weightedChoice([" -brl", ""], [10, 1]);
  const bel = weightedChoice([" -bel", ""], [1, 10]);
  const blitz = brl + bel;

  // LORES
  const slr1 = randint(0, 7);
  const slr2 = randint(slr1, 10);
  const slrr = " -slr " + slr1 + " " + slr2;
  const slr = weightedChoice([slrr, ""], [10, 1]);
  const lmprp1 = randint(75, 100);
  const lmprp2 = randint(lmprp1, 125);
  const lmprv1 = randint(20, 40);
  const lmprv2 = randint(lmprv1, 75);
  const lmprp = " -lmprp " + lmprp1 + " " + lmprp2;
  const lmprv = " -lmprv " + lmprv1 + " " + lmprv2;
  const loremp = weightedChoice(["", " -lmps", lmprp, lmprv], [1, 3, 10, 3]);
  const lel = weightedChoice([" -lel", ""], [1, 0]);
  const lores = slr + loremp + lel;

  // RAGES
  const srr1 = randint(0, 10);
  const srr2 = randint(srr1, 25);
  const srr = " -srr " + srr1 + " " + srr2;
  const srages = weightedChoice(["", srr], [1, 13]);
  const rnl = weightedChoice([" -rnl", ""], [1, 0]);
  const rnc = weightedChoice([" -rnc", ""], [15, 1]);
  const rage = srages + rnl + rnc;

  // DANCES
  const sdr1 = randint(0, 2);
  const sdr2 = randint(sdr1, 4);
  const sdr = " -sdr " + sdr1 + " " + sdr2;
  const das = weightedChoice([" -das", ""], [1, 0]);
  const dda = weightedChoice([" -dda", ""], [1, 0]);
  const dns = weightedChoice([" -dns", ""], [1, 0]);
  const d_el = weightedChoice([" -del", ""], [0, 1]);
  const dance = sdr + das + dda + dns + d_el;

  // STEAL CHANCES
  const steal = choice(["", " -sch", " -sch", " -sca", " -sca", " -sca"]);

  // CHARACTERS
  const sal = weightedChoice([" -sal", ""], [13, 1]);
  const sn = weightedChoice([" -sn", ""], [1, 13]);
  const eu = weightedChoice([" -eu", ""], [13, 1]);
  const csrp1 = randint(90, 120);
  const csrp2 = randint(csrp1, 130);
  const csrp = " -csrp " + csrp1 + " " + csrp2;
  const cstats = sal + sn + eu + csrp;

  // COMMANDS
  const scc = weightedChoice([" -scc", ""], [1, 10]);
  const com = weightedChoice(
    [" -com 99999999999999999999999999", "", " -com 98989898989898989898989898"],
    [2, 1, 13]
  );
  const recskills = [
    "10",
    "6",
    "14",
    "19",
    "24",
    "26",
    "22",
    "12",
    "3",
    "28",
    "16",
    "11",
    "27",
    "13",
    "15",
    "5",
    "7",
    "8",
    "9",
    "23",
    "29",
  ];
  const rec1 = weightedChoice([" -rec1 28", ""], [1, 0]);
  const rec2 = weightedChoice([" -rec2 23", ""], [1, 0]);
  const rec3 = weightedChoice([" -rec3 " + choice(recskills), ""], [0, 1]);
  const rec4 = weightedChoice([" -rec4 " + choice(recskills), ""], [0, 1]);
  const commands = scc + com + rec1 + rec2 + rec3 + rec4;

  const party = sparty + swdtech + blitz + lores + rage + dance + cstats + commands + steal;

  // -----BATTLE-----
  const xpm = " -xpm " + weightedChoice([2, 3, 4], [1, 10, 1]);
  const gpm = " -gpm " + weightedChoice([4, 5, 6], [1, 10, 1]);
  const mpm = " -mpm " + weightedChoice([4, 5, 6], [1, 10, 1]);
  const nxppd = weightedChoice([" -nxppd", ""], [13, 1]);
  const xpmpgp = xpm + gpm + mpm + nxppd;

  // BOSSES
  const bb = weightedChoice([" -bbr", " -bbs", ""], [1, 13, 1]);
  const bmbd = weightedChoice([" -drloc mix", ""], [0, 1]);
  const srp3 = weightedChoice([" -srp3", ""], [0, 1]);
  const bnds = weightedChoice([" -bnds", ""], [1, 13]);
  const be = weightedChoice([" -be", ""], [1, 0]);
  const bnu = weightedChoice([" -bnu", ""], [10, 1]);
  const bosses = bb + bmbd + srp3 + bnds + be + bnu;

  // BOSS AI
  const dgne = weightedChoice([" -dgne", ""], [1, 0]);
  const wnz = weightedChoice([" -wnz", ""], [1, 0]);
  const mmnu = weightedChoice([" -mmnu", ""], [1, 0]);
  const cmd = weightedChoice([" -cmd", ""], [1, 0]);
  const b_ai = dgne + wnz + mmnu + cmd;

  // SCALING
  const scale_opt = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
  const lspf = " -lsced " + weightedChoice(scale_opt, [0, 1, 1, 10, 2, 1, 0, 0, 0, 0]);
  const lsaf = " -lsa " + weightedChoice(scale_opt, [0, 13, 1, 0, 0, 0, 0, 0, 0, 0]);
  const lshf = " -lsh " + weightedChoice(scale_opt, [0, 13, 1, 0, 0, 0, 0, 0, 0, 0]);
  const lstf = " -lst " + weightedChoice(scale_opt, [0, 1, 5, 10, 1, 0, 0, 0, 0, 0]);
  const hmpf = " -hmced " + weightedChoice(scale_opt, [0, 1, 1, 10, 2, 1, 0, 0, 0, 0]);
  const hmaf = " -hma " + weightedChoice(scale_opt, [0, 13, 1, 0, 0, 0, 0, 0, 0, 0]);
  const hmhf = " -hmh " + weightedChoice(scale_opt, [0, 13, 1, 0, 0, 0, 0, 0, 0, 0]);
  const hmtf = " -hmt " + weightedChoice(scale_opt, [0, 1, 5, 10, 1, 0, 0, 0, 0, 0]);
  const xgpf = " -xgced " + weightedChoice(scale_opt, [0, 1, 1, 10, 2, 1, 0, 0, 0, 0]);
  const xgaf = " -xga " + weightedChoice(scale_opt, [0, 13, 1, 0, 0, 0, 0, 0, 0, 0]);
  const xghf = " -xgh " + weightedChoice(scale_opt, [0, 13, 1, 0, 0, 0, 0, 0, 0, 0]);
  const xgtf = " -xgt " + weightedChoice(scale_opt, [0, 1, 5, 10, 1, 0, 0, 0, 0, 0]);
  const asrf = " -asr " + weightedChoice(scale_opt, [0, 0, 1, 10, 2, 1, 0, 0, 0, 0]);
  const asef = " -ase " + weightedChoice(scale_opt, [0, 0, 1, 10, 2, 1, 0, 0, 0, 0]);

  const lscale = weightedChoice([lspf, lsaf, lshf, lstf, ""], [15, 2, 2, 1, 0]);
  const hmscale = weightedChoice([hmpf, hmaf, hmhf, hmtf, ""], [15, 2, 2, 1, 0]);
  const xgscale = weightedChoice([xgpf, xgaf, xghf, xgtf, ""], [15, 2, 2, 1, 0]);
  const ascale = weightedChoice([asrf, asef, ""], [1, 13, 0]);
  const msl = " -msl " + randint(40, 60);
  const sfb = weightedChoice([" -sfb", ""], [0, 1]);
  const sed = weightedChoice([" -sed", ""], [13, 1]);
  const scaling = lscale + hmscale + xgscale + ascale + msl + sfb + sed;

  // ENCOUNTERS
  const renc = weightedChoice(["", " -res", " -rer " + randint(0, 10)], [1, 10, 10]);
  const fenc = weightedChoice(["", " -fer " + randint(0, 10)], [1, 13]);
  const escr = " -escr 100";
  const encounters = renc + fenc + escr;

  const battle = bosses + b_ai + scaling + encounters + xpmpgp;

  // -----MAGIC-----
  // ESPERS
  const esr1 = randint(1, 3);
  const esr2 = randint(esr1, 5);
  const esr = " -esr " + esr1 + " " + esr2;
  const ess = weightedChoice(["", esr, " -esrr", " -ess", " -essrr", " -esrt"], [1, 13, 2, 2, 2, 3]);
  const ebonus = weightedChoice(["", " -ebr " + randint(67, 100), " -ebs"], [1, 10, 2]);
  const emprp1 = randint(75, 100);
  const emprp2 = randint(emprp1, 125);
  const emprv1 = randint(25, 75);
  const emprv2 = randint(emprv1, 99);
  const emprp = " -emprp " + emprp1 + " " + emprp2;
  const emprv = " -emprv " + emprv1 + " " + emprv2;
  const emp = weightedChoice(["", emprp, emprv, " -emps"], [1, 10, 1, 3]);
  const eer1 = randint(6, 12);
  const eer2 = randint(eer1, 12);
  const eer = " -eer " + eer1 + " " + eer2;
  const eebr = " -eebr " + randint(6, 12);
  const eeq = weightedChoice([eer, eebr, ""], [1, 1, 15]);
  const ems = weightedChoice(["", " -ems"], [13, 1]);
  const espers = ess + ebonus + emp + eeq + ems;

  // NATURAL MAGIC
  const nm1 = weightedChoice(["", " -nm1 random"], [0, 1]);
  const nm2 = weightedChoice(["", " -nm2 random"], [0, 1]);
  const rnl1 = weightedChoice(["", " -rnl1"], [0, 1]);
  const rnl2 = weightedChoice(["", " -rnl2"], [0, 1]);
  const rns1 = weightedChoice(["", " -rns1"], [0, 1]);
  const rns2 = weightedChoice(["", " -rns2"], [0, 1]);
  const m_indicator = weightedChoice(["", " -nmmi"], [0, 1]);
  const nmagic = nm1 + nm2 + rnl1 + rnl2 + rns1 + rns2 + m_indicator;

  const magic = espers + nmagic;

  // -----ITEMS-----
  // STARTING GOLD/ITEMS
  const gp = " -gp " + randint(0, 20000);
  const smc = " -smc 3";
  const sws = " -sws " + randint(0, 7);
  const sfd = " -sfd " + randint(0, 7);
  const sto = " -sto " + randint(0, 4);
  const s_inv = gp + smc + sfd + sto + sws;

  // ITEMS
  const ier1 = randint(7, 14);
  const ier2 = randint(ier1, 14);
  const ier = " -ier " + ier1 + " " + ier2;
  const iebr = " -iebr " + randint(7, 14);
  const ieor = " -ieor " + randint(33, 100);
  const iesr = " -iesr " + randint(33, 100);
  const iequip = weightedChoice(["", ier, iebr, ieor, iesr], [1, 1, 1, 13, 1]);
  const ierr1 = randint(7, 14);
  const ierr2 = randint(ierr1, 14);
  const ierr = " -ierr " + ierr1 + " " + ierr2;
  const ierbr = " -ierbr " + randint(7, 14);
  const ieror = " -ieror " + randint(33, 100);
  const iersr = " -iersr " + randint(33, 100);
  const requip = weightedChoice(["", ierr, ierbr, ieror, iersr], [1, 1, 1, 13, 1]);
  const csb1 = randint(1, 32);
  const csb2 = randint(csb1, 32);
  const csb = " -csb " + csb1 + " " + csb2;
  const mca = weightedChoice([" -mca", ""], [1, 0]);
  const stra = weightedChoice([" -stra", ""], [1, 0]);
  const saw = weightedChoice([" -saw", ""], [1, 0]);
  const equips = iequip + requip + csb + mca + stra + saw;

  // SHOPS
  const sisr = " -sisr " + randint(20, 40);
  const shopinv = weightedChoice(["", sisr, " -sirt", " -sie"], [1, 13, 3, 0]);
  const sprv1 = randint(0, 65535);
  const sprv2 = randint(sprv1, 65535);
  const sprp1 = randint(75, 100);
  const sprp2 = randint(sprp1, 125);
  const sprv = " -sprv " + sprv1 + " " + sprv2;
  const sprp = " -sprp " + sprp1 + " " + sprp2;
  const shopprices = weightedChoice(["", sprv, sprp], [1, 2, 15]);
  const ssf = weightedChoice(["", " -ssf4", " -ssf8", " -ssf0"], [13, 1, 1, 0]);
  const sdm = " -sdm " + randint(4, 5);
  const npi = weightedChoice(["", " -npi"], [0, 1]);
  const snbr = weightedChoice(["", " -snbr"], [13, 1]);
  const snes = weightedChoice(["", " -snes"], [13, 1]);
  const snsb = weightedChoice(["", " -snsb"], [13, 1]);
  const shops = shopinv + shopprices + ssf + sdm + npi + snbr + snes + snsb;

  // CHESTS
  const ccontents = weightedChoice(["", " -ccrt", " -cce", " -ccsr " + randint(20, 40)], [1, 3, 0, 13]);
  const cms = weightedChoice(["", " -cms"], [0, 1]);
  const chests = ccontents + cms;

  const items = s_inv + equips + shops + chests;

  // -----OTHER-----
  // COLISEUM
  const coper = randint(45, 85);
  const crper = randint(45, 85);
  const co = " -cor " + coper;
  const cr = " -crr " + crper;
  const crvr1 = randint(30, 50);
  const crvr2 = randint(crvr1, 75);
  const visible = weightedChoice(["", " -crvr " + crvr1 + " " + crvr2], [0, 1]);
  const rmenu = weightedChoice(["", " -crm"], [1, 13]);
  const colo = co + cr + visible + rmenu;

  // AUCTION HOUSE
  const ari = weightedChoice(["", " -ari"], [0, 1]);
  const anca = weightedChoice(["", " -anca"], [0, 1]);
  const adeh = weightedChoice(["", " -adeh"], [0, 1]);
  const ah = ari + anca + adeh;

  // MISC
  const asprint = weightedChoice(["", " -move as"], [0, 1]);
  const ond = weightedChoice(["", " -ond"], [0, 1]);
  const rr = weightedChoice(["", " -rr"], [0, 1]);
  const scan = weightedChoice(["", " -scan"], [1, 0]);
  const etimers = weightedChoice(["", " -etr", " -etn"], [5, 1, 0]);
  const ychoices = [
    " -ymascot",
    " -ycreature",
    " -yimperial",
    " -ymain",
    " -yreflect",
    " -ystone",
    " -ysketch",
    " -yrandom",
    " -yremove",
    "",
  ];
  const ychoice = weightedChoice(ychoices, [1, 1, 1, 1, 1, 1, 1, 1, 1, 13]);
  const flashes = choice(["", " -frm", " -frw"]);
  const misc = asprint + ond + rr + scan + etimers + ychoice + flashes;

  // CHALLENGES
  const nmc = weightedChoice(["", " -nmc"], [1, 5]);
  const nee = weightedChoice(["", " -nee"], [13, 1]);
  const nil = weightedChoice(["", " -nil"], [1, 5]);
  const nfps = weightedChoice(["", " -nfps"], [0, 1]);
  const nu = weightedChoice(["", " -nu"], [1, 10]);
  const nfp = weightedChoice(["", " -nfce"], [13, 1]);
  const pd = weightedChoice(["", " -pd"], [1, 0]);
  const challenges = nmc + nee + nil + nfps + nu + nfp + pd;

  // BUG FIXES
  const fs = weightedChoice(["", " -fs"], [0, 1]);
  const fe = weightedChoice(["", " -fe"], [0, 1]);
  const fvd = weightedChoice(["", " -fvd"], [0, 1]);
  const fr = weightedChoice(["", " -fr"], [0, 1]);
  const fj = weightedChoice(["", " -fj"], [0, 1]);
  const fbs = weightedChoice(["", " -fbs"], [0, 1]);
  const fedc = weightedChoice(["", " -fedc"], [0, 1]);
  const bugfixes = fs + fe + fvd + fr + fj + fbs + fedc;

  const other = colo + ah + challenges + misc + bugfixes;

  const flagset = game + party + battle + magic + items + other;
  return flagset;
}

export function generateChaos(): string {
  // -----GAME-----
  // SETTINGS
  const mode = weightedChoice(["-open", "-cg"], [1, 7]);
  const slog = weightedChoice(["", " -sl"], [13, 1]);
  const settings = mode + slog;

  // KEFKA'S TOWER & STATUE SKIP
  const ktcr1 = randint(3, 9);
  const ktcr2 = randint(ktcr1, 12);
  const kter1 = randint(5, 14);
  const kter2 = randint(kter1, 16);
  const ktdr1 = randint(1, 6);
  const ktdr2 = randint(ktdr1, 6);
  const stcr1 = randint(4, 10);
  const stcr2 = randint(stcr1, 13);
  const ster1 = randint(6, 15);
  const ster2 = randint(ster1, 17);
  const stdr1 = randint(2, 7);
  const stdr2 = randint(stdr1, 7);
  const stno = weightedChoice([true, false], [4, 1]);

  let kt = "";
  if (stno) {
    kt = " -oa 2.2.2.2." + [ktcr1, ktcr2, "4", kter1, kter2, "6", ktdr1, ktdr2].join(".");
  } else {
    kt = " -oa 2.2.2.2." + [ktcr1, ktcr2, "4", kter1, kter2, "6", ktdr1, ktdr2].join(".");
    kt += " -ob 3.2.2.2." + [stcr1, stcr2, "4", ster1, ster2, "6", stdr1, stdr2].join(".");
  }

  let objectives = choice([
    " -oc 0.1.1.1.r",
    " -oc 0.1.1.1.r -od 0.1.1.1.r",
    " -oc 0.1.1.1.r -od 0.1.1.1.r -oe 0.1.1.1.r",
    " -oc 0.1.1.1.r -od 0.1.1.1.r -oe 0.1.1.1.r -of 0.1.1.1.r",
  ]);
  objectives += " -og 59.1.1.1.r";
  const game = settings + kt + objectives;

  // -----PARTY-----
  // STARTING PARTY
  const sc1 = choice([" -sc1 random", " -sc1 randomngu"]);
  const sc2 = choice([" -sc2 random", " -sc2 randomngu"]);
  const sc3 = weightedChoice([" -sc3 random", " -sc3 randomngu", ""], [1, 1, 5]);
  let sc4 = "";
  if (sc3 === "") {
    sc4 = weightedChoice([" -sc3 random", " -sc3 randomngu", ""], [1, 1, 10]);
  } else {
    sc4 = weightedChoice([" -sc4 random", " -sc4 randomngu", ""], [1, 1, 10]);
  }
  const slevel = weightedChoice(["", " -stl " + randint(3, 9)], [10, 1]);
  const sparty = sc1 + sc2 + sc3 + sc4 + slevel;

  // SWORDTECHS
  const fst = weightedChoice([" -fst", ""], [1, 0]);
  const sel = weightedChoice([" -sel", ""], [1, 3]);
  const swdtech = fst + sel;

  // BLITZES
  const brl = weightedChoice([" -brl", ""], [5, 1]);
  const bel = weightedChoice([" -bel", ""], [1, 5]);
  const blitz = brl + bel;

  // LORES
  const slr1 = randint(0, 12);
  const slr2 = randint(slr1, 16);
  const slrr = " -slr " + slr1 + " " + slr2;
  const slr = weightedChoice([slrr, ""], [5, 1]);
  const lmprp1 = randint(25, 125);
  const lmprp2 = randint(lmprp1, 175);
  const lmprv1 = randint(10, 60);
  const lmprv2 = randint(lmprv1, 80);
  const lmprp = " -lmprp " + lmprp1 + " " + lmprp2;
  const lmprv = " -lmprv " + lmprv1 + " " + lmprv2;
  const loremp = weightedChoice(["", " -lmps", lmprp, lmprv], [1, 3, 5, 3]);
  const lel = weightedChoice([" -lel", ""], [13, 1]);
  const lores = slr + loremp + lel;

  // RAGES
  const srr1 = randint(0, 25);
  const srr2 = randint(srr1, 50);
  const srr = " -srr " + srr1 + " " + srr2;
  const srages = weightedChoice(["", srr], [1, 10]);
  const rnl = weightedChoice([" -rnl", ""], [1, 0]);
  const rnc = weightedChoice([" -rnc", ""], [10, 1]);
  const rage = srages + rnl + rnc;

  // DANCES
  const sdr1 = randint(0, 4);
  const sdr2 = randint(sdr1, 6);
  const sdr = " -sdr " + sdr1 + " " + sdr2;
  const das = weightedChoice([" -das", ""], [1, 0]);
  const dda = weightedChoice([" -dda", ""], [1, 0]);
  const dns = weightedChoice([" -dns", ""], [1, 0]);
  const d_el = weightedChoice([" -del", ""], [1, 13]);
  const dance = sdr + das + dda + dns + d_el;

  // SKETCH & CONTROL
  const scis = choice([" -scis", ""]);

  // STEAL CHANCES
  const steal = choice(["", " -sch", " -sch", " -sca", " -sca", " -sca"]);

  // CHARACTERS
  const sal = weightedChoice([" -sal", ""], [7, 1]);
  const sn = weightedChoice([" -sn", ""], [1, 7]);
  const eu = weightedChoice([" -eu", ""], [7, 1]);
  const csrp1 = randint(50, 120);
  const csrp2 = randint(csrp1, 160);
  const csrp = " -csrp " + csrp1 + " " + csrp2;
  const cstats = sal + sn + eu + csrp;

  // COMMANDS
  const scc = weightedChoice([" -scc", ""], [1, 5]);
  const com = weightedChoice(
    [" -com 99999999999999999999999999", "", " -com 98989898989898989898989898"],
    [7, 1, 7]
  );
  const recskills = [
    "10",
    "6",
    "14",
    "19",
    "24",
    "26",
    "22",
    "12",
    "3",
    "28",
    "16",
    "11",
    "27",
    "13",
    "15",
    "5",
    "7",
    "8",
    "9",
    "23",
    "29",
  ];
  const rec1 = weightedChoice([" -rec1 28", ""], [10, 1]);
  const rec2 = weightedChoice([" -rec2 23", ""], [7, 1]);
  const rec3 = weightedChoice([" -rec3 " + choice(recskills), ""], [1, 10]);
  const rec4 = weightedChoice([" -rec4 " + choice(recskills), ""], [1, 10]);
  const rec5 = weightedChoice([" -rec5 " + choice(recskills), ""], [1, 10]);
  const commands = scc + com + rec1 + rec2 + rec3 + rec4 + rec5;

  const party = sparty + swdtech + blitz + lores + rage + dance + cstats + commands + steal + scis;

  // -----BATTLE-----
  const xpm = " -xpm " + weightedChoice([2, 3, 4, 5, 6], [2, 10, 6, 3, 1]);
  const gpm = " -gpm " + weightedChoice([3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 10, 6, 3, 2, 1, 1]);
  const mpm = " -mpm " + weightedChoice([3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 10, 6, 3, 2, 1, 1]);
  const nxppd = weightedChoice([" -nxppd", ""], [7, 1]);
  const xpmpgp = xpm + gpm + mpm + nxppd;

  // BOSSES
  const bb = weightedChoice([" -bbr", " -bbs", ""], [5, 10, 1]);
  let bmbd = " -drloc " + weightedChoice(["original", "shuffle", "mix"], [1, 5, 1]);
  bmbd += " -stloc " + weightedChoice(["original", "shuffle", "mix"], [1, 2, 5]);
  const srp3 = weightedChoice([" -srp3", ""], [1, 10]);
  const bnds = weightedChoice([" -bnds", ""], [1, 8]);
  const be = weightedChoice([" -be", ""], [13, 1]);
  const bnu = weightedChoice([" -bnu", ""], [10, 1]);
  const bosses = bb + bmbd + srp3 + bnds + be + bnu;

  // BOSS AI
  const dgne = weightedChoice([" -dgne", ""], [10, 1]);
  const wnz = weightedChoice([" -wnz", ""], [10, 1]);
  const mmnu = weightedChoice([" -mmnu", ""], [13, 1]);
  const cmd = weightedChoice([" -cmd", ""], [1, 0]);
  const b_ai = dgne + wnz + mmnu + cmd;

  // SCALING
  const scale_opt = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
  const lspf = " -lsced " + weightedChoice(scale_opt, [0, 1, 1, 10, 5, 3, 1, 0, 0, 0]);
  const lsaf = " -lsa " + weightedChoice(scale_opt, [0, 10, 3, 2, 1, 0, 0, 0, 0, 0]);
  const lshf = " -lsh " + weightedChoice(scale_opt, [0, 10, 3, 2, 1, 0, 0, 0, 0, 0]);
  const lstf = " -lst " + weightedChoice(scale_opt, [0, 1, 5, 10, 1, 0, 0, 0, 0, 0]);
  const hmpf = " -hmced " + weightedChoice(scale_opt, [0, 1, 1, 10, 5, 3, 1, 0, 0, 0]);
  const hmaf = " -hma " + weightedChoice(scale_opt, [0, 10, 3, 2, 1, 0, 0, 0, 0, 0]);
  const hmhf = " -hmh " + weightedChoice(scale_opt, [0, 10, 3, 2, 1, 0, 0, 0, 0, 0]);
  const hmtf = " -hmt " + weightedChoice(scale_opt, [0, 1, 5, 10, 1, 0, 0, 0, 0, 0]);
  const xgpf = " -xgced " + weightedChoice(scale_opt, [0, 1, 1, 10, 5, 3, 1, 0, 0, 0]);
  const xgaf = " -xga " + weightedChoice(scale_opt, [0, 10, 3, 2, 1, 0, 0, 0, 0, 0]);
  const xghf = " -xgh " + weightedChoice(scale_opt, [0, 10, 3, 2, 1, 0, 0, 0, 0, 0]);
  const xgtf = " -xgt " + weightedChoice(scale_opt, [0, 1, 5, 10, 1, 0, 0, 0, 0, 0]);
  const asrf = " -asr " + weightedChoice(scale_opt, [0, 0, 3, 10, 2, 1, 0, 0, 0, 0]);
  const asef = " -ase " + weightedChoice(scale_opt, [0, 0, 3, 10, 2, 1, 0, 0, 0, 0]);

  const lscale = weightedChoice([lspf, lsaf, lshf, lstf, ""], [7, 2, 2, 1, 0]);
  const hmscale = weightedChoice([hmpf, hmaf, hmhf, hmtf, ""], [7, 2, 2, 1, 0]);
  const xgscale = weightedChoice([xgpf, xgaf, xghf, xgtf, ""], [7, 2, 2, 1, 0]);
  const ascale = weightedChoice([asrf, asef, ""], [1, 7, 0]);
  const msl = " -msl " + randint(45, 80);
  const sfb = weightedChoice([" -sfb", ""], [0, 1]);
  const sed = weightedChoice([" -sed", ""], [7, 1]);
  const scaling = lscale + hmscale + xgscale + ascale + msl + sfb + sed;

  // ENCOUNTERS
  const renc = weightedChoice(["", " -res", " -rer " + randint(0, 33)], [1, 10, 10]);
  const fenc = weightedChoice(["", " -fer " + randint(0, 33)], [1, 10]);
  const escr = " -escr " + randint(75, 100);
  const encounters = renc + fenc + escr;

  const battle = bosses + b_ai + scaling + encounters + xpmpgp;

  // -----MAGIC-----
  // ESPERS
  const esr1 = randint(1, 3);
  const esr2 = randint(esr1, 5);
  const esr = " -esr " + esr1 + " " + esr2;
  const ess = weightedChoice(["", esr, " -esrr", " -ess", " -essrr", " -esrt"], [1, 7, 2, 2, 2, 3]);
  const ebonus = weightedChoice(["", " -ebr " + randint(67, 100), " -ebs"], [1, 7, 3]);
  const emprp1 = randint(50, 125);
  const emprp2 = randint(emprp1, 150);
  const emprv1 = randint(50, 99);
  const emprv2 = randint(emprv1, 120);
  const eer1 = randint(3, 8);
  const eer2 = randint(eer1, 10);
  const emprp = " -emprp " + emprp1 + " " + emprp2;
  const emprv = " -emprv " + emprv1 + " " + emprv2;
  const emp = weightedChoice(["", emprp, emprv, " -emps"], [1, 7, 3, 3]);
  const eer = " -eer " + eer1 + " " + eer2;
  const eebr = " -eebr " + randint(3, 9);
  const eeq = weightedChoice([eer, eebr, ""], [1, 2, 7]);
  const ems = weightedChoice(["", " -ems"], [7, 1]);
  let espers = ess + ebonus + emp + eeq + ems;
  const stespr1 = randint(1, 2);
  const stespr2 = randint(stespr1, 4);
  const stesp = choice(["", " -stesp " + stespr1 + " " + stespr2]);
  espers += stesp;

  // NATURAL MAGIC
  const nm1 = weightedChoice(["", " -nm1 random"], [1, 10]);
  const nm2 = weightedChoice(["", " -nm2 random"], [1, 10]);
  const rnl1 = weightedChoice(["", " -rnl1"], [0, 1]);
  const rnl2 = weightedChoice(["", " -rnl2"], [0, 1]);
  const rns1 = weightedChoice(["", " -rns1"], [0, 1]);
  const rns2 = weightedChoice(["", " -rns2"], [0, 1]);
  const m_indicator = weightedChoice(["", " -nmmi"], [0, 1]);
  let nmagic = nm1 + nm2 + rnl1 + rnl2 + rns1 + rns2 + m_indicator;
  const mmprp1 = randint(50, 125);
  const mmprp2 = randint(emprp1, 150);
  const mmprv1 = randint(1, 50);
  const mmprv2 = randint(mmprv1, 99);
  let mmp = choice([
    "",
    " -mmps",
    " -mmprv " + mmprv1 + " " + mmprv2,
    " -mmprp " + mmprp1 + " " + mmprp2,
  ]);
  mmp += weightedChoice(["", " -u254"], [10, 1]);
  nmagic += mmp;

  const magic = espers + nmagic;

  // -----ITEMS-----
  // STARTING GOLD/ITEMS
  const gp = " -gp " + randint(0, 100000);
  const smc = " -smc " + weightedChoice(["1", "2", "3"], [1, 2, 7]);
  const sws = " -sws " + randint(0, 10);
  const sfd = " -sfd " + randint(0, 10);
  const sto = " -sto " + randint(0, 6);
  const s_inv = gp + smc + sfd + sto + sws;

  // ITEMS
  const ier1 = randint(4, 8);
  const ier2 = randint(ier1, 10);
  const ier = " -ier " + ier1 + " " + ier2;
  const iebr = " -iebr " + randint(4, 10);
  const ieor = " -ieor " + randint(15, 75);
  const iesr = " -iesr " + randint(15, 75);
  const iequip = weightedChoice(["", ier, iebr, ieor, iesr], [1, 2, 2, 7, 2]);
  const ierr1 = randint(4, 8);
  const ierr2 = randint(ierr1, 10);
  const ierr = " -ierr " + ierr1 + " " + ierr2;
  const ierbr = " -ierbr " + randint(4, 10);
  const ieror = " -ieror " + randint(15, 75);
  const iersr = " -iersr " + randint(15, 75);
  const requip = weightedChoice(["", ierr, ierbr, ieror, iersr], [1, 2, 2, 7, 2]);
  const csb1 = randint(1, 32);
  const csb2 = randint(csb1, 32);
  const csb = " -csb " + csb1 + " " + csb2;
  const mca = weightedChoice([" -mca", ""], [13, 1]);
  const stra = weightedChoice([" -stra", ""], [1, 0]);
  const saw = weightedChoice([" -saw", ""], [1, 0]);
  const equips = iequip + requip + csb + mca + stra + saw;

  // SHOPS
  const sisr = " -sisr " + randint(10, 80);
  const shopinv = weightedChoice(["", sisr, " -sirt", " -sie"], [3, 10, 5, 1]);
  const sprv1 = randint(0, 65535);
  const sprv2 = randint(sprv1, 65535);
  const sprp1 = randint(25, 125);
  const sprp2 = randint(sprp1, 175);
  const sprv = " -sprv " + sprv1 + " " + sprv2;
  const sprp = " -sprp " + sprp1 + " " + sprp2;
  const shopprices = weightedChoice(["", sprv, sprp], [1, 2, 7]);
  const ssf = weightedChoice(["", " -ssf4", " -ssf8", " -ssf0"], [7, 1, 1, 0]);
  const sdm = " -sdm " + randint(3, 5);
  const npi = weightedChoice(["", " -npi"], [1, 13]);
  const snbr = weightedChoice(["", " -snbr"], [7, 1]);
  const snes = weightedChoice(["", " -snes"], [7, 1]);
  const snsb = weightedChoice(["", " -snsb"], [7, 1]);
  const shops = shopinv + shopprices + ssf + sdm + npi + snbr + snes + snsb;

  // CHESTS
  const ccontents = weightedChoice(
    ["", " -ccrt", " -cce", " -ccsr " + randint(10, 80)],
    [1, 6, 1, 13]
  );
  const cms = weightedChoice(["", " -cms"], [1, 13]);
  const chests = ccontents + cms;

  const items = s_inv + equips + shops + chests;

  // -----CUSTOM-----
  const wmhc = choice(["", " -wmhc"]);

  // -----OTHER-----
  // COLISEUM
  const coper = randint(45, 85);
  const crper = randint(45, 85);
  const co = " -cor " + coper;
  const cr = " -crr " + crper;
  const crvr1 = randint(20, 80);
  const crvr2 = randint(crvr1, 150);
  const visible = weightedChoice(["", " -crvr " + crvr1 + " " + crvr2], [1, 10]);
  const rmenu = weightedChoice(["", " -crm"], [1, 13]);
  const colo = co + cr + visible + rmenu;

  // AUCTION HOUSE
  const ari = weightedChoice(["", " -ari"], [0, 1]);
  const anca = weightedChoice(["", " -anca"], [0, 1]);
  const adeh = weightedChoice(["", " -adeh"], [1, 13]);
  const ah = ari + anca + adeh;

  // MISC
  const asprint = " -move " + choice(["as", "bd", "ssbd"]);
  const ond = weightedChoice(["", " -ond"], [1, 13]);
  const rr = weightedChoice(["", " -rr"], [1, 13]);
  const scan = weightedChoice(["", " -scan"], [13, 1]);
  const etimers = weightedChoice(["", " -etr", " -etn"], [2, 3, 1]);
  const ychoices = [
    " -ymascot",
    " -ycreature",
    " -yimperial",
    " -ymain",
    " -yreflect",
    " -ystone",
    " -ysketch",
    " -yrandom",
    " -yremove",
    "",
  ];
  const ychoice = weightedChoice(ychoices, [1, 1, 1, 1, 1, 1, 1, 1, 2, 10]);
  const flashes = choice(["", " -frm", " -frw"]);
  const warp = choice(["", " -warp"]);
  const misc = asprint + ond + rr + scan + etimers + ychoice + flashes + warp;

  // CHALLENGES
  const nmc = weightedChoice(["", " -nmc"], [1, 5]);
  const nee = weightedChoice(["", " -nee"], [7, 1]);
  const nil = weightedChoice(["", " -nil"], [6, 4]);
  const nfps = weightedChoice(["", " -nfps"], [1, 13]);
  let nu = "";
  if (magic.includes("-u254")) {
    nu = "";
  } else {
    nu = weightedChoice(["", " -nu"], [1, 13]);
  }
  const rls = weightedChoice(
    ["", " -rls all", " -rls grey", " -rls black", " -rls white"],
    [13, 1, 1, 1, 1]
  );
  const nfp = weightedChoice(["", " -nfce"], [7, 1]);
  const pd = weightedChoice(["", " -pd"], [13, 1]);
  const challenges = nmc + nee + nil + nfps + nu + nfp + pd + rls;

  // BUG FIXES
  const fs = weightedChoice(["", " -fs"], [0, 1]);
  const fe = weightedChoice(["", " -fe"], [1, 13]);
  const fvd = weightedChoice(["", " -fvd"], [1, 13]);
  const fr = weightedChoice(["", " -fr"], [1, 13]);
  const fj = weightedChoice(["", " -fj"], [0, 1]);
  const fbs = weightedChoice(["", " -fbs"], [1, 13]);
  const fedc = weightedChoice(["", " -fedc"], [0, 1]);
  const fc = weightedChoice(["", " -fc"], [1, 13]);
  const bugfixes = fs + fe + fvd + fr + fj + fbs + fedc + fc;

  const other = colo + ah + challenges + misc + bugfixes;

  const flagset = game + party + battle + magic + items + other + wmhc;
  return flagset;
}

export function generateTrueChaos(): string {
  // -----GAME-----
  // SETTINGS
  const mode = choice(["-open", "-cg"]);
  const slog = choice([" -sl", ""]);
  const settings = mode + slog;

  // KEFKA'S TOWER & STATUE SKIP
  const ktcr1 = randint(3, 14);
  const ktcr2 = randint(ktcr1, 14);
  const kter1 = randint(1, 27);
  const kter2 = randint(kter1, 27);
  const ktdr1 = randint(1, 8);
  const ktdr2 = randint(ktdr1, 8);
  const stcr1 = randint(3, 14);
  const stcr2 = randint(stcr1, 14);
  const ster1 = randint(1, 24);
  const ster2 = randint(ster1, 24);
  const stdr1 = randint(1, 8);
  const stdr2 = randint(stdr1, 8);
  const stno = choice([true, false]);

  let kt = "";
  if (stno) {
    kt = " -oa 2.2.2.2." + [ktcr1, ktcr2, "4", kter1, kter2, "6", ktdr1, ktdr2].join(".");
  } else {
    kt = " -oa 2.2.2.2." + [ktcr1, ktcr2, "4", kter1, kter2, "6", ktdr1, ktdr2].join(".");
    kt += " -ob 3.2.2.2." + [stcr1, stcr2, "4", ster1, ster2, "6", stdr1, stdr2].join(".");
  }

  const objectivesList = [
    "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y"
  ];
  let objectives = "";
  for (const x of objectivesList) {
    if (choice([true, false])) {
      objectives += " -o" + x + " 0.1.1.1.r";
    }
  }

  const game = settings + kt + objectives;

  // -----PARTY-----
  // STARTING PARTY
  const scValues = [choice(["random", "randomngu"])];
  for (let idx = 0; idx < 3; idx++) {
    if (Math.random() < 0.5) {
      scValues.push(choice(["random", "randomngu"]));
    }
  }
  const scFlags = scValues.map((val, idx) => ` -sc${idx + 1} ${val}`);
  const sparty = scFlags.join("");

  // SWORDTECHS
  const fst = choice([" -fst", ""]);
  const sel = choice([" -sel", ""]);
  const swdtech = fst + sel;

  // BLITZES
  const brl = choice([" -brl", ""]);
  const bel = choice([" -bel", ""]);
  const blitz = brl + bel;

  // LORES
  const slr1 = randint(0, 24);
  const slr2 = randint(slr1, 24);
  const slrr = " -slr " + slr1 + " " + slr2;
  const slr = choice([slrr, ""]);
  const lmprp1 = randint(0, 200);
  const lmprp2 = randint(lmprp1, 200);
  const lmprv1 = randint(0, 99);
  const lmprv2 = randint(lmprv1, 99);
  const lmprp = " -lmprp " + lmprp1 + " " + lmprp2;
  const lmprv = " -lmprv " + lmprv1 + " " + lmprv2;
  const loremp = choice(["", " -lmps", lmprp, lmprv]);
  const lel = choice([" -lel", ""]);
  const lores = slr + loremp + lel;

  // RAGES
  const srr1 = randint(0, 255);
  const srr2 = randint(srr1, 255);
  const srr = " -srr " + srr1 + " " + srr2;
  const srages = choice([srr, ""]);
  const rnl = choice([" -rnl", ""]);
  const rnc = choice([" -rnc", ""]);
  const rage = srages + rnl + rnc;

  // DANCES
  const sdr1 = randint(0, 8);
  const sdr2 = randint(sdr1, 8);
  const sdr = " -sdr " + sdr1 + " " + sdr2;
  const das = choice([" -das", ""]);
  const dda = choice([" -dda", ""]);
  const dns = choice([" -dns", ""]);
  const d_el = choice([" -del", ""]);
  const dance = sdr + das + dda + dns + d_el;

  // STEAL CHANCES
  const steal = choice(["", " -sch", " -sca"]);

  // CHARACTERS
  const sal = choice([" -sal", ""]);
  const sn = choice([" -sn", ""]);
  const eu = choice([" -eu", ""]);
  const csrp1 = randint(0, 200);
  const csrp2 = randint(csrp1, 200);
  const csrp = " -csrp " + csrp1 + " " + csrp2;
  const cstats = sal + sn + eu + csrp;

  // COMMANDS
  const skills = [
    "10", "06", "14", "19", "24", "26", "22", "12", "03", "28", "16", "11", "27", "13", "15", "05", "07", "08", "09", "23", "97", "98", "99", "00", "29"
  ];
  const nmskills = [
    "10", "06", "14", "19", "24", "26", "22", "12", "28", "16", "11", "27", "13", "15", "05", "07", "08", "09", "23", "97", "98", "99", "00", "29"
  ];
  const recskills = [
    "10", "06", "14", "19", "24", "26", "22", "12", "03", "28", "16", "11", "27", "13", "15", "05", "07", "08", "09", "23", "29"
  ];
  const scc = choice([" -scc", ""]);
  let mcount = 0;
  let ccount = 0;
  let coms = "";
  while (mcount === 0 && ccount < 13) {
    const rc = choice(skills);
    if (rc === "03") {
      mcount += 1;
    }
    ccount += 1;
    coms += rc;
  }
  if (coms.length < 26) {
    while (ccount < 13) {
      ccount += 1;
      coms += choice(nmskills);
    }
  }
  const com = " -com " + coms;
  const rec1 = choice(["", " -rec1 " + choice(recskills)]);
  const rec2 = choice(["", " -rec2 " + choice(recskills)]);
  const rec3 = choice(["", " -rec3 " + choice(recskills)]);
  const rec4 = choice(["", " -rec4 " + choice(recskills)]);
  const rec5 = choice(["", " -rec5 " + choice(recskills)]);
  const commands = scc + com + rec1 + rec2 + rec3 + rec4 + rec5;

  const party = sparty + swdtech + blitz + lores + rage + dance + cstats + commands + steal;

  // -----BATTLE-----
  const iList: number[] = [];
  const jList: number[] = [];
  for (let k = 1; k <= 255; k++) {
    iList.push(k);
    jList.push(Math.pow(0.96, k));
  }
  const xpm = " -xpm " + weightedChoice(iList, jList);
  const gpm = " -gpm " + weightedChoice(iList, jList);
  const mpm = " -mpm " + weightedChoice(iList, jList);
  const nxppd = choice([" -nxppd", ""]);
  const xpmpgp = xpm + gpm + mpm + nxppd;

  // BOSSES
  const bb = choice([" -bbr", " -bbs", ""]);
  const bmbd = choice([" -drloc mix", ""]);
  const srp3 = choice([" -srp3", ""]);
  const bnds = choice([" -bnds", ""]);
  const be = choice([" -be", ""]);
  const bnu = choice([" -bnu", ""]);
  const bosses = bb + bmbd + srp3 + bnds + be + bnu;

  // BOSS AI
  const dgne = choice([" -dgne", ""]);
  const wnz = choice([" -wnz", ""]);
  const mmnu = choice([" -mmnu", ""]);
  const cmd = choice([" -cmd", ""]);
  const b_ai = dgne + wnz + mmnu + cmd;

  // SCALING
  const scale_opt = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
  const lspf = " -lsced " + choice(scale_opt);
  const lsaf = " -lsa " + choice(scale_opt);
  const lshf = " -lsh " + choice(scale_opt);
  const lstf = " -lst " + choice(scale_opt);
  const hmpf = " -hmced " + choice(scale_opt);
  const hmaf = " -hma " + choice(scale_opt);
  const hmhf = " -hmh " + choice(scale_opt);
  const hmtf = " -hmt " + choice(scale_opt);
  const xgpf = " -xgced " + choice(scale_opt);
  const xgaf = " -xga " + choice(scale_opt);
  const xghf = " -xgh " + choice(scale_opt);
  const xgtf = " -xgt " + choice(scale_opt);
  const asrf = " -asr " + choice(scale_opt);
  const asef = " -ase " + choice(scale_opt);

  const lscale = choice([lspf, lsaf, lshf, lstf, ""]);
  const hmscale = choice([hmpf, hmaf, hmhf, hmtf, ""]);
  const xgscale = choice([xgpf, xgaf, xghf, xgtf, ""]);
  const ascale = choice([asrf, asef, ""]);
  const msl = " -msl " + randint(3, 99);
  const sfb = choice([" -sfb", ""]);
  const sed = choice([" -sed", ""]);
  const scaling = lscale + hmscale + xgscale + ascale + msl + sfb + sed;

  // ENCOUNTERS
  const renc = choice(["", " -res", " -rer " + randint(0, 100)]);
  const fenc = choice(["", " -fer " + randint(0, 100)]);
  const escr = " -escr " + randint(0, 100);
  const encounters = renc + fenc + escr;

  const battle = bosses + b_ai + scaling + encounters + xpmpgp;

  // -----MAGIC-----
  // ESPERS
  const esr1 = randint(1, 5);
  const esr2 = randint(esr1, 5);
  const esr = " -esr " + esr1 + " " + esr2;
  const ess = choice(["", esr, " -esrr", " -ess", " -essrr", " -esrt"]);
  const ebonus = choice(["", " -ebr " + randint(0, 100), " -ebs"]);
  const emprp1 = randint(0, 200);
  const emprp2 = randint(emprp1, 200);
  const emprv1 = randint(1, 128);
  const emprv2 = randint(emprv1, 128);
  const eer1 = randint(0, 12);
  const eer2 = randint(eer1, 12);
  const emprp = " -emprp " + emprp1 + " " + emprp2;
  const emprv = " -emprv " + emprv1 + " " + emprv2;
  const emp = choice(["", emprp, emprv, " -emps"]);
  const eer = " -eer " + eer1 + " " + eer2;
  const eebr = " -eebr " + randint(0, 12);
  const eeq = choice([eer, eebr, ""]);
  const ems = choice(["", " -ems"]);
  const espers = ess + ebonus + emp + eeq + ems;

  // NATURAL MAGIC
  const nm1 = choice(["", " -nm1 random"]);
  const nm2 = choice(["", " -nm2 random"]);
  const rnl1 = choice(["", " -rnl1"]);
  const rnl2 = choice(["", " -rnl2"]);
  const rns1 = choice(["", " -rns1"]);
  const rns2 = choice(["", " -rns2"]);
  const m_indicator = choice(["", " -nmmi"]);
  const nmagic = nm1 + nm2 + rnl1 + rnl2 + rns1 + rns2 + m_indicator;

  const magic = espers + nmagic;

  // -----ITEMS-----
  // STARTING GOLD/ITEMS
  const gp = " -gp " + randint(0, 999999);
  const smc = " -smc " + randint(0, 3);
  const sws = " -sws " + randint(0, 10);
  const sfd = " -sfd " + randint(0, 10);
  const sto = " -sto " + randint(0, 8);
  const s_inv = gp + smc + sfd + sto + sws;

  // ITEMS
  const ier1 = randint(0, 14);
  const ier2 = randint(ier1, 14);
  const ier = " -ier " + ier1 + " " + ier2;
  const iebr = " -iebr " + randint(0, 14);
  const ieor = " -ieor " + randint(0, 100);
  const iesr = " -iesr " + randint(0, 100);
  const iequip = choice(["", ier, iebr, ieor, iesr]);
  const ierr1 = randint(0, 14);
  const ierr2 = randint(ierr1, 14);
  const ierr = " -ierr " + ierr1 + " " + ierr2;
  const ierbr = " -ierbr " + randint(0, 14);
  const ieror = " -ieror " + randint(0, 100);
  const iersr = " -iersr " + randint(0, 100);
  const requip = choice(["", ierr, ierbr, ieror, iersr]);
  const csb1 = randint(1, 256);
  const csb2 = randint(csb1, 256);
  const csb = " -csb " + csb1 + " " + csb2;
  const mca = choice([" -mca", ""]);
  const stra = choice([" -stra", ""]);
  const saw = choice([" -saw", ""]);
  const equips = iequip + requip + csb + mca + stra + saw;

  // SHOPS
  const sisr = " -sisr " + randint(0, 100);
  const shopinv = choice(["", sisr, " -sirt", " -sie"]);
  const sprv1 = randint(0, 65535);
  const sprv2 = randint(sprv1, 65535);
  const sprp1 = randint(0, 200);
  const sprp2 = randint(sprp1, 200);
  const sprv = " -sprv " + sprv1 + " " + sprv2;
  const sprp = " -sprp " + sprp1 + " " + sprp2;
  const shopprices = choice(["", sprv, sprp]);
  const ssf = choice(["", " -ssf4", " -ssf8", " -ssf0"]);
  const sdm = " -sdm " + randint(0, 5);
  const npi = choice(["", " -npi"]);
  const snbr = choice(["", " -snbr"]);
  const snes = choice(["", " -snes"]);
  const snsb = choice(["", " -snsb"]);
  const shops = shopinv + shopprices + ssf + sdm + npi + snbr + snes + snsb;

  // CHESTS
  const ccontents = choice([
    "", " -ccrt", " -cce", " -ccsr " + randint(0, 100)
  ]);
  const cms = choice(["", " -cms"]);
  const chests = ccontents + cms;

  const items = s_inv + equips + shops + chests;

  // -----OTHER-----
  // COLISEUM
  const coper = randint(0, 100);
  const crper = randint(0, 100);
  const co = " -cor " + coper;
  const cr = " -crr " + crper;
  const crvr1 = randint(0, 255);
  const crvr2 = randint(crvr1, 255);
  const visible = choice(["", " -crvr " + crvr1 + " " + crvr2]);
  const rmenu = choice(["", " -crm"]);
  const colo = co + cr + visible + rmenu;

  // AUCTION HOUSE
  const ari = choice(["", " -ari"]);
  const anca = choice(["", " -anca"]);
  const adeh = choice(["", " -adeh"]);
  const ah = ari + anca + adeh;

  // MISC
  const asprint = choice(["", " -move as"]);
  const ond = choice(["", " -ond"]);
  const rr = choice(["", " -rr"]);
  const scan = choice(["", " -scan"]);
  const etimers = choice(["", " -etr", " -etn"]);
  const ychoices = [
    " -ymascot", " -ycreature", " -yimperial", " -ymain", " -yreflect", " -ystone", " -ysketch", " -yrandom", " -yremove", ""
  ];
  const ychoice = choice(ychoices);
  const flashes = choice(["", " -frm", " -frw"]);
  const misc = asprint + ond + rr + scan + etimers + ychoice + flashes;

  // CHALLENGES
  const nmc = choice(["", " -nmc"]);
  const nee = choice(["", " -nee"]);
  const nil = choice(["", " -nil"]);
  const nfps = choice(["", " -nfce"]);
  const nu = choice(["", " -nu"]);
  const nfp = choice(["", " -nfp"]);
  const pd = choice(["", " -pd"]);
  const challenges = nmc + nee + nil + nfps + nu + nfp + pd;

  // BUG FIXES
  const fs = choice(["", " -fs"]);
  const fe = choice(["", " -fe"]);
  const fvd = choice(["", " -fvd"]);
  const fr = choice(["", " -fr"]);
  const fj = choice(["", " -fj"]);
  const fbs = choice(["", " -fbs"]);
  const fedc = choice(["", " -fedc"]);
  const bugfixes = fs + fe + fvd + fr + fj + fbs + fedc;

  const other = colo + ah + challenges + misc + bugfixes;

  const flagset = game + party + battle + magic + items + other;
  return flagset;
}
