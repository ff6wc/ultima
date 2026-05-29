import React, { useState, useEffect } from "react";
import { signOut, signIn } from "~/hooks/useAppSession";
import { useAppSession } from "~/hooks/useAppSession";
import { FaDiscord, FaShieldAlt, FaSignOutAlt, FaDice, FaBookmark, FaStar } from "react-icons/fa";
import { PageContainer } from "../PageContainer/PageContainer";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setRawFlags } from "~/state/flagSlice";

const getCleanPresetName = (seedType: string) => {
  if (!seedType) return "custom";
  let name = seedType.trim().toLowerCase();
  
  if (name.startsWith("preset_")) {
    name = name.slice(7);
  } else if (name.startsWith("preset")) {
    name = name.slice(6);
  }
  
  if (name === "true_chaos") {
    return "true chaos";
  }
  
  return name.split("_")[0];
};

const formatTruncatedDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const year = String(d.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  } catch (e) {
    return "";
  }
};

export const ProfileTab = () => {
  const { data: session, status } = useAppSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const devAdminOverride = isMounted && typeof window !== "undefined" && 
    (process.env.NEXT_PUBLIC_DEV_ADMIN_TOGGLE === "true" || process.env.NODE_ENV === "development") && 
    localStorage.getItem("dev_admin_override") === "true";

  const activeSession = React.useMemo(() => {
    return session || (devAdminOverride ? { user: { name: "Dev Admin", email: "dev-admin@localhost", discordId: "12345", image: null } } : null);
  }, [session, devAdminOverride]);

  const activeStatus = devAdminOverride ? "authenticated" : status;

  const [userPresets, setUserPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [expandedPresets, setExpandedPresets] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState<Record<string, boolean>>({});

  const [userSeeds, setUserSeeds] = useState<any[]>([]);
  const [loadingSeeds, setLoadingSeeds] = useState(true);
  const [expandedSeeds, setExpandedSeeds] = useState<Record<string, boolean>>({});
  const [totalSeedsCount, setTotalSeedsCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  // Usage stats from localStorage
  const [seedsGenerated, setSeedsGenerated] = useState(0);
  const [mostPlayedPreset, setMostPlayedPreset] = useState<string | null>(null);
  const [mostPlayedCount, setMostPlayedCount] = useState(0);

  const isAdmin = !!(activeSession?.user as any)?.isAdmin || devAdminOverride;

  const [sortBy, setSortBy] = useState<"name" | "date" | "downloaded">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedPresets = React.useMemo(() => {
    return [...userPresets].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        if (nameA < nameB) return sortDir === "asc" ? -1 : 1;
        if (nameA > nameB) return sortDir === "asc" ? 1 : -1;
        return 0;
      } else if (sortBy === "date") {
        const timeA = new Date(a.created_at || a.created_timestamp || 0).getTime();
        const timeB = new Date(b.created_at || b.created_timestamp || 0).getTime();
        return sortDir === "asc" ? timeA - timeB : timeB - timeA;
      } else {
        const timeA = new Date(a.download_timestamp || a.last_downloaded || 0).getTime();
        const timeB = new Date(b.download_timestamp || b.last_downloaded || 0).getTime();
        return sortDir === "asc" ? timeA - timeB : timeB - timeA;
      }
    });
  }, [userPresets, sortBy, sortDir]);

  const [seedSortBy, setSeedSortBy] = useState<"date" | "tag">("date");
  const [seedSortDir, setSeedSortDir] = useState<"asc" | "desc">("desc");

  const sortedSeeds = React.useMemo(() => {
    return [...userSeeds].sort((a, b) => {
      if (seedSortBy === "date") {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return seedSortDir === "asc" ? timeA - timeB : timeB - timeA;
      } else {
        const tagA = (a.seed_type || "").toLowerCase();
        const tagB = (b.seed_type || "").toLowerCase();
        if (tagA < tagB) return seedSortDir === "asc" ? -1 : 1;
        if (tagA > tagB) return seedSortDir === "asc" ? 1 : -1;
        
        // Fallback to date sorting if seed_type is identical
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return seedSortDir === "asc" ? timeA - timeB : timeB - timeA;
      }
    });
  }, [userSeeds, seedSortBy, seedSortDir]);

  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem("seeds_generated") || "0", 10);
      setSeedsGenerated(isNaN(count) ? 0 : count);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (userSeeds.length > 0) {
      const counts: Record<string, number> = {};
      
      userSeeds.forEach((seed) => {
        const seedType = seed.seed_type;
        const cleanName = getCleanPresetName(seedType);
        if (cleanName && cleanName !== "custom") {
          const capitalized = cleanName
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
            
          counts[capitalized] = (counts[capitalized] || 0) + 1;
        }
      });
      
      const entries = Object.entries(counts);
      if (entries.length > 0) {
        const [topName, topCount] = entries.reduce((best, curr) =>
          curr[1] > best[1] ? curr : best
        );
        setMostPlayedPreset(topName);
        setMostPlayedCount(topCount);
      } else {
        setMostPlayedPreset(null);
        setMostPlayedCount(0);
      }
    } else {
      setMostPlayedPreset(null);
      setMostPlayedCount(0);
    }
  }, [userSeeds]);

  const togglePreset = (id: string) => setExpandedPresets((p) => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    if (activeSession?.user) {
      if (devAdminOverride) {
        setLoadingPresets(false);
        setUserPresets([
          {
            id: "mock-preset-1",
            name: "Standard WC League",
            description: "Official Worlds Collide league flagset with standard progression and balanced rewards.",
            flags: "-cg -cont -open -sbn -sbs -sbt -sd1 -sd2 -sd3 -sd4 -sd5 -sd6 -sd7 -sd8 -sd9 -sd10",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            download_timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ["standard", "official"],
          },
          {
            id: "mock-preset-2",
            name: "Kefka's Toybox",
            description: "High chaos, random commands, natural magic, and stronger bosses. Pure fun!",
            flags: "-cg -cont -open -sbn -sbs -sbt -sd1 -sd2 -sd3 -sd4 -sd5 -sd6 -sd7 -sd8 -sd9 -sd10 -rc -nm -s",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            download_timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            tags: ["chaos"],
          },
          {
            id: "mock-preset-3",
            name: "True Chaos",
            description: "Every single randomizer setting turned up to maximum distortion.",
            flags: "-cg -cont -open -sbn -rc -nm -s -tc",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            download_timestamp: new Date().toISOString(),
            tags: ["true_chaos"],
          }
        ]);

        setLoadingSeeds(false);
        setLoadingCount(false);
        setTotalSeedsCount(42);
        setUserSeeds([
          {
            id: "8a7f92b4",
            seed_type: "standard",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            share_url: "http://localhost:3000/seed/?id=8a7f92b4",
            server_name: "dev.ff6worldscollide.com",
            seed: "192837465",
            hash: "Locke, Celes, Sabin, Edgar",
            flagstring: "-cg -cont -open -sbn -sbs -sbt -sd1 -sd2 -sd3 -sd4 -sd5 -sd6 -sd7 -sd8 -sd9 -sd10",
          },
          {
            id: "5c8d2f10",
            seed_type: "true_chaos",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            share_url: "http://localhost:3000/seed/?id=5c8d2f10",
            server_name: "dev.ff6worldscollide.com",
            seed: "998877665",
            hash: "Kefka, Terra, Shadow, Relm",
            flagstring: "-cg -cont -open -sbn -rc -nm -s -tc",
          },
          {
            id: "2e4b6d8a",
            seed_type: "custom",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            share_url: "http://localhost:3000/seed/?id=2e4b6d8a",
            server_name: "dev.ff6worldscollide.com",
            seed: "554433221",
            hash: "Cyan, Gau, Mog, Umaro",
            flagstring: "-cg -cont -open -sbn -sbs -sbt -sd1 -sd2",
          }
        ]);
        return;
      }

      const userDiscordId = (activeSession.user as any)?.discordId;
      const token = localStorage.getItem("auth_token");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      setLoadingPresets(true);
      fetch(`${backendUrl}/api/v1/user-presets?mine=true`, {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const mine = data
              .filter((p) => {
                const creatorId = p.owner_id || p.creator_id;
                return creatorId && String(creatorId) === String(userDiscordId);
              })
              .map((p, index) => {
                const presetName = p.preset_name || p.name || "";
                return {
                  ...p,
                  id: p.id || presetName || `user-preset-${index}`,
                  name: presetName,
                };
              });
            setUserPresets(mine);
          }
        })
        .catch((err) => console.error("Error fetching user presets:", err))
        .finally(() => setLoadingPresets(false));

      if (userDiscordId) {
        setLoadingSeeds(true);
        setLoadingCount(true);
        
        // 1. Fetch latest 100 seeds for the history section
        fetch(`${backendUrl}/api/v1/seedlist?creator_id=${userDiscordId}&limit=100`, {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setUserSeeds(data);
            }
          })
          .catch((err) => console.error("Error fetching user seeds:", err))
          .finally(() => setLoadingSeeds(false));

        // 2. Fetch the aggregate count of all seeds rolled
        fetch(`${backendUrl}/api/v1/seedlist/count?creator_id=${userDiscordId}`, {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && typeof data.count === "number") {
              setTotalSeedsCount(data.count);
            }
          })
          .catch((err) => console.error("Error fetching user seeds count:", err))
          .finally(() => setLoadingCount(false));
      } else {
        setLoadingSeeds(false);
        setLoadingCount(false);
      }
    }
  }, [activeSession?.user?.discordId, activeSession?.user?.email, devAdminOverride]);

  const handleDeletePreset = async (id: string, event?: React.MouseEvent, bypassConfirm = false) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as HTMLElement).blur();
    }

    if (isDeleting[id]) return;

    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("auth_token");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/v1/user-presets?id=${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setUserPresets((prev) => prev.filter((p) => String(p.id) !== String(id)));
        setShowConfirm((prev) => ({ ...prev, [id]: false }));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to delete preset: ${errData.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert(`An error occurred while deleting preset: ${e}`);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (activeStatus === "unauthenticated" || !activeSession?.user) {
    return (
      <PageContainer columns={1}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", gap: "1.5rem" }}>
          <div style={{ fontSize: "1.25rem", color: "#94a3b8", fontWeight: "bold" }}>
            Login required to access Presets Profile
          </div>
          <button
            onClick={() => signIn("discord")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              background: "linear-gradient(180deg, #5865F2 0%, #404eed 100%)",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              border: "1px solid #3b46c4",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              transition: "all 0.2s ease",
              fontSize: "1rem",
            }}
            className="hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(88,101,242,0.35),0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[0px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
          >
            <FaDiscord size={20} />
            <span>Login</span>
          </button>
        </div>
      </PageContainer>
    );
  }

  const userDiscordId = (activeSession.user as any)?.discordId;

  return (
    <PageContainer columns={1}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
        
        {/* User Status Main Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "4px double #3b82f6",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: "2px solid rgba(59, 130, 246, 0.4)",
              paddingBottom: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#60a5fa" }}>
              USER STATUS
            </h1>
            {isAdmin && (
              <span 
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.75rem",
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#f87171",
                  border: "1px solid #ef4444",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "9999px",
                  fontWeight: "bold",
                }}
              >
                <FaShieldAlt size={11} />
                ADMINISTRATOR
              </span>
            )}
          </div>

          {/* Profile details */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                border: "3px solid #3b82f6",
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(30, 41, 59, 0.5)",
              }}
            >
              {activeSession.user.image ? (
                <img
                  src={activeSession.user.image}
                  alt={activeSession.user.name || "Avatar"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <FaDiscord size={40} color="#94a3b8" />
              )}
            </div>

            {/* Text info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexGrow: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#f1f5f9" }}>
                {activeSession.user.name || "Discord User"}
              </div>
              {activeSession.user.email && (
                <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  <strong>Email:</strong> {activeSession.user.email}
                </div>
              )}
              {userDiscordId && (
                <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  <strong>Discord ID:</strong> <span style={{ fontFamily: "monospace" }}>{userDiscordId}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to sign out?")) {
                    signOut({ callbackUrl: "/" });
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  borderRadius: "4px",
                  color: "#f87171",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  padding: "0.5rem 1rem",
                  transition: "all 0.2s",
                }}
                className="hover:bg-red-500 hover:text-white"
              >
                <FaSignOutAlt />
                <span>SIGN OUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Usage Statistics Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "4px double #3b82f6",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
          }}
        >
          <div style={{ borderBottom: "2px solid rgba(59, 130, 246, 0.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#60a5fa" }}>
              USAGE STATISTICS
            </h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>
              Tracked locally in your browser
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {/* Seeds Rolled */}
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "8px",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#60a5fa", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <FaDice size={14} />
                Seeds Rolled
              </div>
              <div style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#f1f5f9", lineHeight: 1 }}>
                {loadingCount ? "…" : (totalSeedsCount ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>rolled on website & discord bot</div>
            </div>

            {/* Presets Saved */}
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "8px",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#60a5fa", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <FaBookmark size={14} />
                Presets Saved
              </div>
              <div style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#f1f5f9", lineHeight: 1 }}>
                {loadingPresets ? "…" : userPresets.length}
                <span style={{ fontSize: "1rem", color: "#64748b" }}> / 50</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>flag configurations saved</div>
            </div>

            {/* Most Played Preset */}
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "8px",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#60a5fa", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <FaStar size={14} />
                Most Played Preset
              </div>
              {mostPlayedPreset ? (
                <>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#f1f5f9", lineHeight: 1.2, wordBreak: "break-word" }}>
                    {mostPlayedPreset}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{mostPlayedCount} seed{mostPlayedCount !== 1 ? "s" : ""} (from last 100 rolled)</div>
                </>
              ) : (
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", lineHeight: 1.4 }}>
                  Generate seeds with a preset selected to track this
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Saved Presets Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "4px double #3b82f6",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(59, 130, 246, 0.4)", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#60a5fa" }}>
              MY SAVED PRESETS
            </h2>
            <span style={{ fontSize: "1rem", fontWeight: "bold", color: userPresets.length >= 50 ? "#ef4444" : "#94a3b8" }}>
              {userPresets.length} / 50
            </span>
          </div>

          {userPresets.length > 0 && !loadingPresets && (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#cbd5e1" }}>
              <span style={{ fontWeight: "bold", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.5px" }}>Sort By:</span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    if (sortBy === "name") {
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    } else {
                      setSortBy("name");
                      setSortDir("asc");
                    }
                  }}
                  style={{
                    backgroundColor: sortBy === "name" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 41, 59, 0.6)",
                    border: sortBy === "name" ? "1px solid #3b82f6" : "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "4px",
                    color: sortBy === "name" ? "#f8fafc" : "#94a3b8",
                    padding: "0.25rem 0.75rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-blue-500 hover:text-white"
                >
                  Name {sortBy === "name" && (sortDir === "asc" ? "▲" : "▼")}
                </button>
                <button
                  onClick={() => {
                    if (sortBy === "date") {
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    } else {
                      setSortBy("date");
                      setSortDir("desc");
                    }
                  }}
                  style={{
                    backgroundColor: sortBy === "date" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 41, 59, 0.6)",
                    border: sortBy === "date" ? "1px solid #3b82f6" : "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "4px",
                    color: sortBy === "date" ? "#f8fafc" : "#94a3b8",
                    padding: "0.25rem 0.75rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-blue-500 hover:text-white"
                >
                  Date Created {sortBy === "date" && (sortDir === "asc" ? "▲" : "▼")}
                </button>
                <button
                  onClick={() => {
                    if (sortBy === "downloaded") {
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    } else {
                      setSortBy("downloaded");
                      setSortDir("desc");
                    }
                  }}
                  style={{
                    backgroundColor: sortBy === "downloaded" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 41, 59, 0.6)",
                    border: sortBy === "downloaded" ? "1px solid #3b82f6" : "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "4px",
                    color: sortBy === "downloaded" ? "#f8fafc" : "#94a3b8",
                    padding: "0.25rem 0.75rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-blue-500 hover:text-white"
                >
                  Date Downloaded {sortBy === "downloaded" && (sortDir === "asc" ? "▲" : "▼")}
                </button>
              </div>
            </div>
          )}
          
          {loadingPresets ? (
            <div className="animate-pulse" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading presets...</div>
          ) : userPresets.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontStyle: "italic" }}>
              You have not saved any presets yet. Generate a seed and click &quot;Save as Preset&quot; to see them here!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sortedPresets.map((preset) => {
                const isExpanded = !!expandedPresets[preset.id];
                return (
                  <div key={preset.id} style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", paddingRight: "1rem", flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", overflow: "hidden", width: "100%" }}>
                          <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "1rem", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>{preset.name}</h4>
                          {preset.description && !isExpanded && (
                            <span style={{ color: "#94a3b8", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>
                              - {preset.description}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                          by {preset.creator_name || preset.creator || "You"} · {formatTruncatedDate(preset.created_at || preset.created_timestamp)}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                        {showConfirm[preset.id] ? (
                          <>
                            <span style={{ color: "#f87171", fontSize: "0.8rem", fontWeight: "bold", marginRight: "0.25rem" }}>Confirm?</span>
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleDeletePreset(preset.id, e, true);
                              }}
                              disabled={!!isDeleting[preset.id]}
                              style={{
                                backgroundColor: "#ef4444",
                                border: "none",
                                color: "#ffffff",
                                padding: "0.25rem 0.6rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                              className="hover:bg-red-600 transition-colors"
                            >
                              {isDeleting[preset.id] ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowConfirm((p) => ({ ...p, [preset.id]: false }));
                              }}
                              disabled={!!isDeleting[preset.id]}
                              style={{
                                backgroundColor: "rgba(148, 163, 184, 0.2)",
                                border: "1px solid #94a3b8",
                                color: "#cbd5e1",
                                padding: "0.25rem 0.6rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                              className="hover:bg-slate-700 transition-colors"
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => togglePreset(preset.id)}
                              style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.85rem", padding: 0, display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "bold" }}
                              className="hover:text-blue-400"
                            >
                              {isExpanded ? "▼ Hide" : "▶ Show"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowConfirm((p) => ({ ...p, [preset.id]: true }));
                              }}
                              style={{
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid #ef4444",
                                color: "#f87171",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                              className="hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div style={{ marginTop: "0.75rem", borderTop: "1px dashed rgba(148, 163, 184, 0.2)", paddingTop: "0.75rem" }}>
                        {preset.tags && preset.tags.length > 0 && (
                          <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                            {preset.tags.map((tag: string) => (
                              <span key={tag} style={{
                                fontSize: "0.7rem",
                                backgroundColor: "rgba(59, 130, 246, 0.2)",
                                color: "#60a5fa",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                padding: "0.05rem 0.4rem",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                textTransform: "capitalize",
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {preset.description && (
                          <p style={{ color: "#cbd5e1", fontSize: "0.9rem", marginTop: 0, marginBottom: "0.75rem", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                            {preset.description}
                          </p>
                        )}
                        <div style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", padding: "0.75rem", borderRadius: "4px", fontSize: "0.8rem", color: "#cbd5e1", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", border: "1px solid rgba(255,255,255,0.05)" }}>
                          {preset.flags}
                        </div>
                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>
                          <span>Created: {formatTruncatedDate(preset.created_at || preset.created_timestamp)}</span>
                          {preset.download_timestamp && (
                            <span>
                              Last Downloaded:{" "}
                              {new Date(preset.download_timestamp).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Generated Seeds Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "4px double #3b82f6",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(59, 130, 246, 0.4)", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#60a5fa" }}>
              MY GENERATED SEEDS
            </h2>
            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#94a3b8" }}>
              {loadingSeeds ? "…" : userSeeds.length} of {loadingCount ? "…" : (totalSeedsCount ?? 0)} Total
            </span>
          </div>

          {userSeeds.length > 0 && !loadingSeeds && (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#cbd5e1" }}>
              <span style={{ fontWeight: "bold", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.5px" }}>Sort By:</span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    if (seedSortBy === "date") {
                      setSeedSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    } else {
                      setSeedSortBy("date");
                      setSeedSortDir("desc");
                    }
                  }}
                  style={{
                    backgroundColor: seedSortBy === "date" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 41, 59, 0.6)",
                    border: seedSortBy === "date" ? "1px solid #3b82f6" : "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "4px",
                    color: seedSortBy === "date" ? "#f8fafc" : "#94a3b8",
                    padding: "0.25rem 0.75rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-blue-500 hover:text-white"
                >
                  Date Downloaded {seedSortBy === "date" && (seedSortDir === "asc" ? "▲" : "▼")}
                </button>
                <button
                  onClick={() => {
                    if (seedSortBy === "tag") {
                      setSeedSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    } else {
                      setSeedSortBy("tag");
                      setSeedSortDir("asc");
                    }
                  }}
                  style={{
                    backgroundColor: seedSortBy === "tag" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 41, 59, 0.6)",
                    border: seedSortBy === "tag" ? "1px solid #3b82f6" : "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "4px",
                    color: seedSortBy === "tag" ? "#f8fafc" : "#94a3b8",
                    padding: "0.25rem 0.75rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-blue-500 hover:text-white"
                >
                  Preset {seedSortBy === "tag" && (seedSortDir === "asc" ? "▲" : "▼")}
                </button>
              </div>
            </div>
          )}

          {loadingSeeds ? (
            <div className="animate-pulse" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading seeds...</div>
          ) : userSeeds.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontStyle: "italic" }}>
              You have not generated any seeds yet. Head over to the &quot;Generate&quot; tab and roll a seed!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sortedSeeds.map((seed, idx) => {
                const seedId = seed.id || `seed-${idx}`;
                const isExpanded = !!expandedSeeds[seedId];
                // format timestamp
                let formattedDate = "Unknown Date";
                if (seed.timestamp) {
                  try {
                    formattedDate = new Date(seed.timestamp).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch (e) {}
                }
                return (
                  <div key={seedId} style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", overflow: "hidden", flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "1rem", fontWeight: "bold", whiteSpace: "nowrap" }}>
                          #{seed.id}
                        </h4>
                        <span style={{
                          fontSize: "0.75rem",
                          backgroundColor: seed.seed_type !== "ff6wc" ? "rgba(59, 130, 246, 0.2)" : "rgba(148, 163, 184, 0.1)",
                          color: seed.seed_type !== "ff6wc" ? "#60a5fa" : "#94a3b8",
                          border: seed.seed_type !== "ff6wc" ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(148, 163, 184, 0.2)",
                          padding: "0.1rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "bold",
                        }}>
                          {seed.seed_type}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button
                          onClick={() => setExpandedSeeds(p => ({ ...p, [seedId]: !p[seedId] }))}
                          style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.85rem", padding: 0, display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "bold" }}
                          className="hover:text-blue-400"
                        >
                          {isExpanded ? "▼ Hide" : "▶ Show"}
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", marginTop: "0.25rem" }}>
                      Generated: {formattedDate}
                    </div>
                    
                    {isExpanded && (
                      <div style={{ marginTop: "0.75rem", borderTop: "1px dashed rgba(148, 163, 184, 0.2)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {seed.server_name && (
                          <div className="hidden md:block" style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                            <strong>Server/Host:</strong> <span style={{ fontFamily: "monospace" }}>{seed.server_name}</span>
                          </div>
                        )}
                        {seed.seed && (
                          <div className="hidden md:block" style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                            <strong>Seed Number:</strong> <span style={{ fontFamily: "monospace" }}>{seed.seed}</span>
                          </div>
                        )}
                        {seed.hash && (
                          <div className="hidden md:block" style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                            <strong>Sprite/Hash:</strong> <span style={{ fontFamily: "monospace" }}>{seed.hash}</span>
                          </div>
                        )}
                        {seed.flagstring && (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                              <strong style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Flags:</strong>
                              <button
                                onClick={() => {
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(seed.flagstring);
                                    alert("Flags copied to clipboard!");
                                  } else {
                                    alert("Clipboard access is not available in this browser/context.");
                                  }
                                }}
                                style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.75rem", padding: 0, fontWeight: "bold" }}
                                className="hidden md:block hover:text-blue-400"
                              >
                                Copy Flags
                              </button>
                            </div>
                            <div style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", padding: "0.75rem", borderRadius: "4px", fontSize: "0.8rem", color: "#cbd5e1", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", border: "1px solid rgba(255,255,255,0.05)" }}>
                              {seed.flagstring}
                            </div>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap", gap: "1rem" }}>
                          <button
                            onClick={() => {
                              dispatch(setRawFlags(seed.flagstring));
                              router.push("/create?tab=generate");
                            }}
                            style={{
                              backgroundColor: "#3b82f6",
                              border: "none",
                              color: "#ffffff",
                              padding: "0.4rem 1rem",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            className="hover:bg-blue-600 transition-colors"
                          >
                            Load Flags
                          </button>
                          {seed.share_url && (
                            <a
                              href={seed.share_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                border: "1px solid #3b82f6",
                                color: "#60a5fa",
                                padding: "0.4rem 1rem",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                fontWeight: "bold",
                                textDecoration: "none",
                                display: "inline-block",
                              }}
                              className="hover:bg-blue-500 hover:text-white transition-colors"
                            >
                              View Seed ↗
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
};
