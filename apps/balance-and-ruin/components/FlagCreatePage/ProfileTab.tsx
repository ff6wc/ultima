import React, { useState, useEffect } from "react";
import { signOut, signIn } from "~/hooks/useAppSession";
import { useAppSession } from "~/hooks/useAppSession";
import { FaDiscord, FaShieldAlt, FaSignOutAlt, FaDice, FaBookmark, FaStar } from "react-icons/fa";
import { PageContainer } from "../PageContainer/PageContainer";

export const ProfileTab = () => {
  const { data: session, status } = useAppSession();
  const [userPresets, setUserPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [expandedPresets, setExpandedPresets] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState<Record<string, boolean>>({});

  // Usage stats from localStorage
  const [seedsGenerated, setSeedsGenerated] = useState(0);
  const [mostPlayedPreset, setMostPlayedPreset] = useState<string | null>(null);
  const [mostPlayedCount, setMostPlayedCount] = useState(0);

  const isAdmin = !!(session?.user as any)?.isAdmin;

  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem("seeds_generated") || "0", 10);
      setSeedsGenerated(isNaN(count) ? 0 : count);

      const playCounts: Record<string, number> = JSON.parse(
        localStorage.getItem("preset_play_counts") || "{}"
      );
      const entries = Object.entries(playCounts);
      if (entries.length > 0) {
        const [topName, topCount] = entries.reduce((best, curr) =>
          curr[1] > best[1] ? curr : best
        );
        setMostPlayedPreset(topName);
        setMostPlayedCount(topCount);
      }
    } catch (e) {}
  }, []);

  const togglePreset = (id: string) => setExpandedPresets((p) => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    if (session?.user) {
      const userDiscordId = (session.user as any)?.discordId;
      const token = localStorage.getItem("auth_token");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${backendUrl}/api/v1/user-presets?mine=true`, {
        headers: {
          "Authorization": `Bearer ${token}`,
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
    }
  }, [session?.user]);

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
          "Authorization": `Bearer ${token}`,
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

  if (status === "unauthenticated" || !session?.user) {
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

  const userDiscordId = (session.user as any)?.discordId;

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
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <FaDiscord size={40} color="#94a3b8" />
              )}
            </div>

            {/* Text info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexGrow: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#f1f5f9" }}>
                {session.user.name || "Discord User"}
              </div>
              {session.user.email && (
                <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  <strong>Email:</strong> {session.user.email}
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {/* Seeds Generated */}
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
                Seeds Generated
              </div>
              <div style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#f1f5f9", lineHeight: 1 }}>
                {seedsGenerated.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>total ROMs created</div>
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
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{mostPlayedCount} seed{mostPlayedCount !== 1 ? "s" : ""} generated</div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(59, 130, 246, 0.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#60a5fa" }}>
              MY SAVED PRESETS
            </h2>
            <span style={{ fontSize: "1rem", fontWeight: "bold", color: userPresets.length >= 50 ? "#ef4444" : "#94a3b8" }}>
              {userPresets.length} / 50
            </span>
          </div>
          
          {loadingPresets ? (
            <div className="animate-pulse" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading presets...</div>
          ) : userPresets.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontStyle: "italic" }}>
              You have not saved any presets yet. Generate a seed and click "Save as Preset" to see them here!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {userPresets.map((preset) => {
                const isExpanded = !!expandedPresets[preset.id];
                return (
                  <div key={preset.id} style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", overflow: "hidden", paddingRight: "1rem", flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "1rem", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>{preset.name}</h4>
                        {preset.description && !isExpanded && (
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>
                            - {preset.description}
                          </span>
                        )}
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
                        {preset.description && (
                          <p style={{ color: "#cbd5e1", fontSize: "0.9rem", marginTop: 0, marginBottom: "0.75rem", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                            {preset.description}
                          </p>
                        )}
                        <div style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", padding: "0.75rem", borderRadius: "4px", fontSize: "0.8rem", color: "#cbd5e1", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", border: "1px solid rgba(255,255,255,0.05)" }}>
                          {preset.flags}
                        </div>
                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>
                          <span>Created: {new Date(preset.created_at || preset.created_timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
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



      </div>
    </PageContainer>
  );
};
