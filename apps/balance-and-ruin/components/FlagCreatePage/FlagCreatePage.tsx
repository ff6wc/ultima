import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";
import { signIn, signOut } from "~/hooks/useAppSession";
import { useAppSession } from "~/hooks/useAppSession";
import styles from "./FlagCreatePage.module.css";
import Head from "next/head";

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false";
import React, { useEffect, useMemo, useState, useRef } from "react";

import type { IconType } from "react-icons";
import { BsStars } from "react-icons/bs";

interface AnimatedBoxProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AnimatedBox = ({ size = 22, className, ...props }: AnimatedBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleAnimate = () => {
      setIsOpen(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 800);
    };

    window.addEventListener("animate-preset-box", handleAnimate);
    return () => {
      window.removeEventListener("animate-preset-box", handleAnimate);
      clearTimeout(timer);
    };
  }, []);

  // Single lid: morph path matching the reference image's back-left hinge + tuck flap style
  const lidD = isOpen
    ? "M 1.8 3.5 L 7.5 1.2 L 9.5 -2.5 L 9.0 -3.2 L 3.3 -0.9 L 3.8 -0.2 Z"
    : "M 1.8 3.5 L 7.5 1.2 L 13.2 3.5 L 13.2 3.5 L 7.5 5.8 L 7.5 5.8 Z";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      {...props}
    >
      {/* Box bottom panels and outlines */}
      <path d="M 7.5 14.762 V 6.838 L 1 4.239 v 7.923 Z" />
      <path d="M 8.5 14.762 V 6.838 L 15 4.239 v 7.923 Z" />

      {/* Animating hingeing lid */}
      <path
        d={lidD}
        style={{
          transition: "d 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </svg>
  );
};
import {
  GiBrokenWall,
  GiDrinkMe,
  GiElectric,
  GiGladius,
  GiMagnifyingGlass,
  GiPaintBrush,
  GiRetroController,
  GiWizardStaff,
  GiSprout,
  GiCrossedSwords,
} from "react-icons/gi";
import {
  HiCog,
  HiOutlineViewList,
  HiUserGroup,
  HiOutlineQuestionMarkCircle,
  HiOutlineMoon,
  HiOutlineSun,
  HiCode,
  HiFlag,
  HiOutlineHome,
} from "react-icons/hi";
import { HiOutlineWrench } from "react-icons/hi2";
import {
  FaDiscord,
  FaBook,
  FaSearch,
  FaSlidersH,
  FaBolt,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { selectShowFlags, setShowFlags } from "~/state/settingsSlice";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { EventsTab } from "~/page-components/EventsTab";
import { SotwTab } from "~/page-components/SotwTab";
import { GenerateCard } from "~/components/GenerateCard/GenerateCard";
import { PageContainer } from "~/components/PageContainer/PageContainer";
import { Battle } from "~/page-components/Battle";
import { BetaPage } from "~/page-components/BetaPage";
import { Presets } from "~/page-components/Presets";
import { Commands } from "~/page-components/Commands";
import { Gameplay } from "~/page-components/Gameplay";
import { Graphics } from "~/page-components/Graphics";
import { Items } from "~/page-components/Items";
import { Magic } from "~/page-components/Magic";
import { Settings } from "~/page-components/Settings";
import { Objectives } from "~/page-components/Objectives";
import { Party } from "~/page-components/Party";
import { Home } from "~/page-components/Home";
import { useAdmin } from "~/hooks/useAdmin";
import { AdminTab } from "./AdminTab";
import { ProfileTab } from "./ProfileTab";
import { setObjectiveMetadata } from "~/state/objectiveSlice";
import { RawFlagMetadata, setSchema } from "~/state/schemaSlice";
import { ObjectiveMetadata } from "~/types/objectives";
import { FlagPreset } from "~/types/preset";
import { Switch } from "@ff6wc/ui";
import Image from "next/image";

type PageProps = {
  objectives: ObjectiveMetadata;
  presets: Record<string, FlagPreset>;
  schema: Record<string, RawFlagMetadata>;
  version: string;
};

type TabItem = {
  content?: React.ReactNode;
  label: string;
  Icon?: IconType;
  id: string;
  isAction?: boolean;
};

const TAB_TITLES_MAP: Record<string, string[]> = {
  home: ["Home", "Worlds Collide", "About"],
  presets: ["Presets", "Beta Presets", "Seed History"],
  objectives: ["Objectives", "Conditions", "Required Conditions", "Results"],
  party: ["Party Members", "Starting Party", "Starting Party Level"],
  commands: [
    "Blitz",
    "Excluded",
    "Commands",
    "Dance",
    "Lore",
    "Other",
    "Rage",
    "Sketch/Control",
    "Steal/Capture",
    "SwdTech",
    "Tools",
    "Fast SwdTech",
    "Everyone Learns",
    "Restore Retort Glitch",
    "Starting Tools",
    "Chance to Steal",
    "Fix Capture Bugs",
    "Steals & Drops",
    "Improved Sketch/Control",
    "Restore Sketch Glitch",
    "SwdTech Runic All",
    "Starting Rages",
    "No Leap",
    "No Charm",
  ],
  battle: [
    "Bosses",
    "Encounters",
    "Experience, Magic Points, Gold",
    "Scaling",
    "Level Scaling",
    "HP/MP Scaling",
    "Exp/GP Scaling",
    "Ability Scaling",
    "Scale Eight Dragons",
    "Scale Final Battles",
    "Boss Restoration",
    "Experience Multiplier",
    "Magic Points Multiplier",
    "Gold Multiplier",
    "Split Party Exp",
    "Boss Experience",
    "Random Encounters",
    "Fixed Encounters",
    "Escapable",
    "Dragon Battles",
    "Dragon Experience",
  ],
  magic: [
    "Espers",
    "Natural Magic",
    "Spells",
    "MP",
    "Learnable Spells",
    "Ultima",
    "Terra's Natural Magic",
    "Celes' Natural Magic",
    "Randomize Levels",
    "Randomize Spells",
    "Menu Indicator",
  ],
  items: [
    "Chests",
    "Coliseum",
    "Equipable Items",
    "Restrictions",
    "Other",
    "Shops",
    "Starting Gold/Items",
    "Cursed Shield Battles",
    "Stronger Atma Weapon",
    "Contents",
    "Price",
    "Sell Price",
    "Dried Meat",
    "No Breakable Rods",
    "Expensive Breakable Rods",
    "No Super Balls",
    "Expensive Super Balls",
    "No Priceless Items",
    "No Elemental Shields",
    "No Exp. Eggs",
    "No Illuminas",
    "Starting Gold",
    "Starting Moogle Charms",
    "Starting Warp Stones",
    "Starting Fenix Downs",
    "Equipment",
    "Relics",
    "Moogle Charms All",
    "Rewards Menu",
    "No Exp. Egg",
    "No Illumina",
    "MIAB Shuffled",
    "Random Monsters",
  ],
  misc: [
    "Auction House",
    "Challenges",
    "Checks",
    "Game Mode",
    "Other",
    "Movement",
    "No Free Characters/Espers",
    "Randomize Items",
    "Allow Chocobo/Airship",
    "Door Hint",
    "Max Espers",
    "Permadeath",
    "Normalize & Distort Boss Stats",
    "Add Phunbaba 3 to Boss Pool",
    "Ironmog Mode",
    "Y NPC",
    "Event Timers",
    "Original Name Display",
    "NPC Tips",
    "Accessibility",
    "Bug Fixes",
    "Boss Restoration",
    "Enemy Damage Counter",
    "Evade",
    "Boss Skip",
    "Vanish/Doom",
    "Jump",
    "Boss Battles",
    "Statue Battles",
    "Restore Marshal's Lobos",
    "Restore Undead Bosses",
    "Chadarnook Less Demon",
    "Doom Gaze Escapes",
    "MagiMaster Casts Ultima on Death",
    "Wrexsoul Casts Zinger",
    "Remove Flashes",
    "High-Contrast World Minimap",
    "Alternate Healing Text Color",
  ],
  Graphics: [
    "Character Sprites",
    "Sprite Palettes",
    "Other Sprites",
    "Palette",
  ],
  settings: [
    "In-Game Configurations",
    "Palettes",
    "Window Palettes",
    "RGB Color Sliders",
    "Message Speed",
    "Battle Speed",
    "Sound",
    "Cursor Memory",
    "Optimum Equip",
    "Wallpapers",
    "Wallpaper",
    "Spell Order",
    "Battle Mode",
    "Restore Defaults",
    "Page A",
    "Page B",
  ],
  beta: [
    "Beta",
    "Workshop",
    "Random Encounters",
    "Sketch/Control Improved Abilities",
    "Starting Junk",
  ],
};

const TargetWithArrow = ({
  size = 22,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="currentColor"
    {...props}
  >
    {/* Outer Ring */}
    <circle
      cx="50"
      cy="50"
      r="38"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
    />
    {/* Middle Ring */}
    <circle
      cx="50"
      cy="50"
      r="24"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
    />
    {/* Center Bullseye */}
    <circle cx="50" cy="50" r="10" fill="currentColor" />
    {/* Arrow Shaft (starts in center, extends to top right) */}
    <line
      x1="50"
      y1="50"
      x2="80"
      y2="20"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    {/* Arrow Fletching/Feathers */}
    <path
      d="M 74 26 L 88 12 L 84 8 L 70 22 Z M 78 22 L 92 8 L 88 4 L 74 18 Z"
      fill="currentColor"
    />
  </svg>
);

export const FlagCreatePage = ({
  objectives,
  presets,
  schema,
  version,
}: PageProps) => {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { data: session, status } = useAppSession();
  const logoSrc =
    theme === "dark" ? "/logo-transparent.png?v=2" : "/logo-light.png?v=2";
  const { isAdmin } = useAdmin();
  const [profileHovered, setProfileHovered] = useState(false);
  const [devAdminActive, setDevAdminActive] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDevAdminActive(localStorage.getItem("dev_admin_override") === "true");
    }
  }, []);
  const tabs: TabItem[] = useMemo(
    () =>
      [
        {
          label: "Home",
          id: "home",
          Icon: HiOutlineHome,
          content: <Home />,
        },
        {
          label: "Presets",
          id: "presets",
          Icon: AnimatedBox as any,
          content: <Presets presets={presets} />,
        },
        {
          label: "Objectives",
          id: "objectives",
          Icon: TargetWithArrow,
          content: <Objectives />,
        },
        {
          label: "Party",
          id: "party",
          Icon: HiUserGroup,
          content: <Party />,
        },
        {
          label: "Commands",
          id: "commands",
          Icon: GiWizardStaff,
          content: <Commands />,
        },
        {
          label: "Battle",
          id: "battle",
          Icon: GiCrossedSwords,
          content: <Battle />,
        },
        {
          label: "Magic",
          id: "magic",
          Icon: BsStars,
          content: <Magic />,
        },
        {
          label: "Items",
          id: "items",
          Icon: GiDrinkMe,
          content: <Items />,
        },
        {
          label: "Gameplay",
          id: "misc",
          Icon: GiRetroController,
          content: <Gameplay />,
        },
        {
          label: "Graphics",
          id: "Graphics",
          Icon: GiPaintBrush,
          content: <Graphics />,
        },
        {
          label: "Settings",
          id: "settings",
          Icon: FaSlidersH,
          content: <Settings presets={presets} />,
        },
        AUTH_ENABLED
          ? {
              label: "Profile",
              id: "profile",
              Icon: null,
              content: <ProfileTab />,
            }
          : null,
        /* process.env.NEXT_PUBLIC_ENABLE_BETA === "true"
          ? {
              label: "Beta",
              id: "beta",
              Icon: HiOutlineWrench,
              content: <BetaPage />,
            }
          : null, */
        {
          label: "Generate",
          id: "generate",
          Icon: FaBolt,
          content: (
            <PageContainer columns={1}>
              <GenerateCard />
            </PageContainer>
          ),
          isAction: true,
        },
        isAdmin
          ? {
              label: "Admin",
              id: "admin",
              Icon: FaShieldAlt,
              content: <AdminTab apiPresets={presets} />,
            }
          : null,
        {
          label: "Events",
          id: "events",
          Icon: HiFlag,
          content: <EventsTab />,
        },
        {
          label: "Seed of the Week",
          id: "sotw",
          Icon: GiSprout,
          content: <SotwTab />,
        },
      ].filter((z) => !!z) as TabItem[],
    [presets, isAdmin, logoSrc],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeTabId = tabs[selectedIndex]?.id;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const NAV_FLOW = useMemo(
    () => [
      "home",
      "presets",
      "objectives",
      "party",
      "commands",
      "battle",
      "magic",
      "items",
      "misc",
      "Graphics",
      "settings",
      "generate",
    ],
    [],
  );

  const currentFlowIndex = NAV_FLOW.indexOf(activeTabId);
  // Disables the Previous button on both the Home page (index 0) and the Presets page (index 1) as requested.
  const isPreviousDisabled = currentFlowIndex <= 1;
  const isNextDisabled = currentFlowIndex === -1 || activeTabId === "generate";

  const handlePrevious = () => {
    if (isPreviousDisabled) return;
    const prevTabId = NAV_FLOW[currentFlowIndex - 1];
    const idx = tabs.findIndex((t) => t.id === prevTabId);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    const nextTabId = NAV_FLOW[currentFlowIndex + 1];
    const idx = tabs.findIndex((t) => t.id === nextTabId);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const handleGenerate = () => {
    const idx = tabs.findIndex((t) => t.id === "generate");
    if (idx !== -1) setSelectedIndex(idx);
  };

  const mainContentRef = useRef<HTMLElement>(null);

  // Reset scroll position to top of main container whenever active tab index changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [selectedIndex]);

  // Swipe to open/close mobile sidebar drawer with real-time tracking (discord-style pull)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let activeDrag = false;
    const drawerWidth = 260; // matching CSS width

    const handleTouchStart = (e: TouchEvent) => {
      // ALWAYS reset state first to guarantee no stuck gestures!
      touchStartX = 0;
      touchStartY = 0;
      activeDrag = false;

      // Fail-Safe 3: Proactively clear manual styles on touchstart if sidebar is closed.
      // This guarantees that any stuck styles left behind from interrupted wiggles are cleared instantly on next screen contact.
      if (!sidebarOpen) {
        const sidebarEl = document.querySelector(
          `.${styles.sidebar}`,
        ) as HTMLElement;
        const backdropEl = document.querySelector(
          `.${styles.sidebarBackdrop}`,
        ) as HTMLElement;
        if (sidebarEl) sidebarEl.style.left = "";
        if (backdropEl) {
          backdropEl.classList.remove(styles.sidebarBackdropDragging);
          backdropEl.style.opacity = "";
        }
      }

      // Check if a dropdown is currently open (Fail-Safe 4)
      if (document.querySelector('[data-dropdown-open="true"]')) {
        return;
      }

      const target = e.target as HTMLElement;
      try {
        const element =
          target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
        if (element && typeof element.closest === "function") {
          // Skip swipe gesture if touching interactive controls or dropdown popups/options to prevent conflict (Fail-Safe 1)
          if (
            element.closest("input") ||
            element.closest("button") ||
            element.closest("select") ||
            element.closest("a") ||
            element.closest('[role="slider"]') ||
            element.closest('[class*="Slider"]') ||
            element.closest('[class*="slider"]') ||
            element.closest('[class*="menu"]') ||
            element.closest('[class*="option"]') ||
            element.closest('[class*="Option"]')
          ) {
            return;
          }
        }
      } catch (err) {
        console.warn("Touchstart closest check ignored:", err);
      }

      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX === 0) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;

      // Determine active drag if horizontal movement is dominant (Fail-Safe 2: increased threshold to 25px to prevent wiggle triggers)
      if (!activeDrag) {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 25) {
          if (!sidebarOpen && diffX > 0) {
            activeDrag = true;
          } else if (sidebarOpen && diffX < 0) {
            activeDrag = true;
          }
        }
      }

      if (activeDrag) {
        // Prevent default scrolling of parent content during pull
        if (e.cancelable) {
          e.preventDefault();
        }

        let newLeft = 0;
        if (!sidebarOpen) {
          // Closed -> Opening. Dragging right.
          newLeft = Math.min(0, -drawerWidth + diffX);
        } else {
          // Open -> Closing. Dragging left.
          newLeft = Math.max(-drawerWidth, diffX);
        }

        const percentOpen = (newLeft + drawerWidth) / drawerWidth; // 0 to 1

        const sidebarEl = document.querySelector(
          `.${styles.sidebar}`,
        ) as HTMLElement;
        const backdropEl = document.querySelector(
          `.${styles.sidebarBackdrop}`,
        ) as HTMLElement;

        if (sidebarEl) {
          sidebarEl.style.transition = "none";
          sidebarEl.style.left = `${newLeft}px`;
        }
        if (backdropEl) {
          backdropEl.classList.add(styles.sidebarBackdropDragging);
          backdropEl.style.opacity = `${percentOpen}`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX === 0) return;

      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartX;

      if (activeDrag) {
        const threshold = 100; // threshold in pixels to register transition
        let shouldOpen = sidebarOpen;

        if (!sidebarOpen) {
          shouldOpen = diffX > threshold;
        } else {
          shouldOpen = diffX >= -threshold;
        }

        const sidebarEl = document.querySelector(
          `.${styles.sidebar}`,
        ) as HTMLElement;
        const backdropEl = document.querySelector(
          `.${styles.sidebarBackdrop}`,
        ) as HTMLElement;

        if (sidebarEl) {
          sidebarEl.style.transition = "";
          sidebarEl.style.left = "";
        }
        if (backdropEl) {
          backdropEl.classList.remove(styles.sidebarBackdropDragging);
          backdropEl.style.opacity = "";
        }

        setSidebarOpen(shouldOpen);
      }
      touchStartX = 0;
      touchStartY = 0;
      activeDrag = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [sidebarOpen]);

  const dispatch = useDispatch();
  const showFlags = useSelector(selectShowFlags);

  const matchesSearch = (tabId: string) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (!normalizedSearch) return false;
    const titles = TAB_TITLES_MAP[tabId] || [];
    const labelMatch = tabs
      .find((t) => t.id === tabId)
      ?.label.toLowerCase()
      .includes(normalizedSearch);
    const titlesMatch = titles.some((title) =>
      title.toLowerCase().includes(normalizedSearch),
    );
    return !!(labelMatch || titlesMatch);
  };

  useEffect(() => {
    const customCSS = typeof CSS !== "undefined" ? (CSS as any) : null;
    const customHighlight =
      typeof window !== "undefined" ? (window as any).Highlight : null;

    const highlight = () => {
      // Protect React nodes: Skip manual DOM string manipulation entirely. If CSS Highlight
      // is unavailable, gracefully degrade rather than forcing intrusive, destructive edits.
      if (!customCSS?.highlights || !customHighlight) {
        return;
      }

      const query = searchQuery.trim().toLowerCase();

      try {
        // Clear previous search matches gracefully
        customCSS.highlights.delete("search-results");
      } catch (e) {}

      if (!query) return;

      const elements = document.querySelectorAll(
        '.WC-Card div[class*="heading"], label, span[class*="Label"], h1, h2, h3, h4, h5, h6',
      );
      const ranges: Range[] = [];

      const findRanges = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.nodeValue || "").toLowerCase();
          let start = 0;
          while ((start = text.indexOf(query, start)) !== -1) {
            const range = new Range();
            range.setStart(node, start);
            range.setEnd(node, start + query.length);
            ranges.push(range);
            start += query.length;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(findRanges);
        }
      };

      elements.forEach(findRanges);

      if (ranges.length > 0) {
        try {
          const searchHighlight = new customHighlight(...ranges);
          customCSS.highlights.set("search-results", searchHighlight);
        } catch (e) {
          console.error("Failed to construct CSS custom highlight:", e);
        }
      }
    };

    highlight();
    const timer1 = setTimeout(highlight, 50);
    const timer2 = setTimeout(highlight, 250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [searchQuery, selectedIndex]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as "light" | "dark";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const defaultTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(defaultTheme);
    if (defaultTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("app-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    dispatch(setSchema(schema));
    dispatch(setObjectiveMetadata(objectives));
  }, [dispatch, objectives, schema]);

  useEffect(() => {
    if (router.query.tab) {
      const idx = tabs.findIndex((t) => t.id === router.query.tab);
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    }
  }, [router.query.tab, tabs]);

  return (
    <>
      <Head>
        <title>FF6WC</title>
        <meta
          name="description"
          content="Final Fantasy VI open-world randomizer"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <style>{`
        ::highlight(search-results) {
          background-color: #facc15 !important;
          color: #000000 !important;
        }
      `}</style>
      <div className={styles.layout}>
        <Tab.Group
          selectedIndex={selectedIndex}
          onChange={(idx) => {
            setSelectedIndex(idx);
            setSidebarOpen(false);
          }}
        >
          <div
            className={`${styles.sidebarBackdrop} ${sidebarOpen ? styles.sidebarBackdropOpen : ""}`}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <aside
            className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
          >
            <button
              className={styles.closeSidebarBtn}
              onClick={() => setSidebarOpen(false)}
              title="Close Menu"
            >
              ✕
            </button>
            <div className={styles.sidebarHeader}>
              <div
                className={styles.logo}
                onClick={() => {
                  setSelectedIndex(0);
                  setSidebarOpen(false);
                }}
                style={{
                  position: "relative",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={logoSrc}
                    alt="Final Fantasy VI Randomizer"
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "auto",
                      maxHeight: "80px",
                    }}
                  />
                </div>
              </div>
            </div>

            <Tab.List className={styles.tabList}>
              {!AUTH_ENABLED ? null : (
                <>
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                      margin: "1.5rem 1rem 0.75rem 1rem",
                    }}
                  />
                  {status === "loading" ? (
                    <div
                      className={`${styles.tabItem} animate-pulse`}
                      style={{ opacity: 0.6, cursor: "wait" }}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-500 animate-pulse" />
                      <div className="h-4 bg-slate-500 rounded w-24" />
                    </div>
                  ) : session?.user ? (
                    <button
                      type="button"
                      className={`${styles.tabItem} ${activeTabId === "profile" ? styles.profileTabActive : ""}`}
                      onClick={() => {
                        const idx = tabs.findIndex((t) => t.id === "profile");
                        if (idx !== -1) {
                          setSelectedIndex(idx);
                          setSidebarOpen(false);
                        }
                      }}
                      title="View Profile"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-slate-700">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <FaDiscord color="white" size={14} />
                        )}
                      </div>
                      <span>{session.user.name || "Profile"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.discordLoginBtn}
                      onClick={() => signIn("discord")}
                    >
                      <FaDiscord size={22} />
                      <span>Login</span>
                    </button>
                  )}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                      margin: "0.75rem 1rem 0.75rem 1rem",
                    }}
                  />
                </>
              )}
              {tabs.map((tab) => {
                const isSideNavHidden = ["events", "sotw"].includes(tab.id);
                const isHighlighted = matchesSearch(tab.id);
                const isHidden = ["home", "profile"].includes(tab.id);

                return (
                  <Tab
                    key={tab.id}
                    className={`${isHidden ? "hidden" : tab.id === "admin" ? styles.adminBtn : tab.isAction ? styles.generateBtn : styles.tabItem} ${isHighlighted ? "bg-yellow-500/20 !text-yellow-400 border-l-4 border-yellow-400 font-bold" : ""} ${isSideNavHidden ? styles.mobileOnly : ""}`}
                  >
                    {tab.Icon && <tab.Icon size={22} />}
                    <span>{tab.label}</span>
                  </Tab>
                );
              })}
            </Tab.List>

            <div
              className={`${styles.mobileOnly} flex-col gap-1 border-t border-white/10 pt-4 mt-auto mb-4`}
            >
              <a
                href="https://wiki.ff6worldscollide.com/wiki/Main_Page"
                target="_blank"
                rel="noreferrer"
                className={styles.tabItem}
                style={{ margin: "0 1rem" }}
              >
                <FaBook size={22} />
                <span>WIKI</span>
              </a>
              <a
                href="https://discord.gg/5MPeng5"
                target="_blank"
                rel="noreferrer"
                className={styles.tabItem}
                style={{ margin: "0 1rem" }}
              >
                <FaDiscord size={22} />
                <span>DISCORD</span>
              </a>
            </div>

            <div className={styles.sidebarFooter}>
              <span>Version</span>
              <span className={styles.versionBadge}>
                {version ? `v${version}` : "Unknown"}
              </span>
            </div>
          </aside>

          {/* Main Content Area */}
          <main ref={mainContentRef} className={styles.mainContent}>
            {/* Top Bar */}
            <div className={styles.topBar}>
              <div
                className={styles.topBarLeft}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={styles.hamburgerBtn}
                  title="Open Navigation Menu"
                >
                  <FaBars size={22} />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm border border-slate-200 dark:border-slate-700"
                  title={
                    theme === "light" ? "Enable Dark Mode" : "Enable Light Mode"
                  }
                >
                  {theme === "light" ? (
                    <HiOutlineMoon size={22} />
                  ) : (
                    <HiOutlineSun size={22} className="text-yellow-400" />
                  )}
                </button>

                <button
                  onClick={() => dispatch(setShowFlags(!showFlags))}
                  className={`p-2 rounded-full transition-all flex items-center justify-center shadow-sm border ${showFlags ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800" : "bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-600 dark:text-neutral-300 border-slate-200 dark:border-slate-700"}`}
                  title={showFlags ? "Hide Flags" : "Show Flags"}
                >
                  <HiCode size={22} />
                </button>
              </div>

              <div className={styles.topBarLinks}>
                <button
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.id === "events");
                    if (idx !== -1) setSelectedIndex(idx);
                  }}
                  className={`${styles.topBarLink} ${activeTabId === "events" ? styles.topBarLinkActive : ""}`}
                >
                  <HiFlag size={20} />
                  <span>EVENTS</span>
                </button>
                <button
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.id === "sotw");
                    if (idx !== -1) setSelectedIndex(idx);
                  }}
                  className={`${styles.topBarLink} ${activeTabId === "sotw" ? styles.topBarLinkActive : ""}`}
                >
                  <GiSprout size={20} />
                  <span>SEED OF THE WEEK</span>
                </button>
                <a
                  href="https://wiki.ff6worldscollide.com/wiki/Main_Page"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.topBarLink}
                >
                  <FaBook size={20} />
                  <span>WIKI</span>
                </a>
                <a
                  href="https://discord.gg/5MPeng5"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.topBarLink}
                >
                  <FaDiscord size={20} />
                  <span>DISCORD</span>
                </a>
              </div>

              <div className={styles.searchBar}>
                <FaSearch color="#64748b" />
                <input
                  type="text"
                  placeholder="Search"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Clear search"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className={styles.pageContainer}>
              <Tab.Panels>
                {tabs.map(({ content, id }) => (
                  <Tab.Panel key={`tab-panel-${id}`}>{content}</Tab.Panel>
                ))}
              </Tab.Panels>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden grid grid-cols-3 items-center p-3.5 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
              <div className="justify-self-start">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isPreviousDisabled}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border select-none cursor-pointer ${
                    isPreviousDisabled
                      ? "bg-slate-800/40 border-slate-700/30 text-slate-500 cursor-not-allowed opacity-50"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 active:scale-95 text-slate-100 hover:text-white"
                  }`}
                >
                  <FaChevronLeft size={12} />
                  <span>Prev</span>
                </button>
              </div>

              <div className="justify-self-center">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border select-none cursor-pointer text-white active:scale-95"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--bg-generate-start) 0%, var(--bg-generate-end) 100%)",
                    borderColor: "var(--border-generate)",
                    boxShadow: "0 2px 10px var(--shadow-generate-hover)",
                  }}
                >
                  <FaBolt size={12} className="text-yellow-200" />
                  <span>Generate</span>
                </button>
              </div>

              <div className="justify-self-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border select-none cursor-pointer ${
                    isNextDisabled
                      ? "bg-slate-800/40 border-slate-700/30 text-slate-500 cursor-not-allowed opacity-50"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 active:scale-95 text-slate-100 hover:text-white"
                  }`}
                >
                  <span>Next</span>
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          </main>
        </Tab.Group>
      </div>

      {process.env.NEXT_PUBLIC_DEV_ADMIN_TOGGLE === "true" && (
        <button
          onClick={() => {
            const next = !devAdminActive;
            if (next) {
              localStorage.setItem("dev_admin_override", "true");
            } else {
              localStorage.removeItem("dev_admin_override");
            }
            setDevAdminActive(next);
            window.location.reload();
          }}
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1rem",
            borderRadius: "999px",
            border: `1px solid ${devAdminActive ? "#ef4444" : "#3b82f6"}`,
            background: devAdminActive
              ? "rgba(239, 68, 68, 0.9)"
              : "rgba(59, 130, 246, 0.9)",
            color: "white",
            fontSize: "0.8rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
          }}
          className="hover:scale-105 active:scale-95"
        >
          <FaShieldAlt size={14} />
          <span>Admin Bypass: {devAdminActive ? "ON" : "OFF"}</span>
        </button>
      )}
    </>
  );
};
