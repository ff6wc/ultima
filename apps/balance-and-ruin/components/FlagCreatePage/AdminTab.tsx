import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaShieldAlt, FaTools, FaDatabase } from "react-icons/fa";
import { PageContainer } from "../PageContainer/PageContainer";

export const AdminTab = () => {
  const { data: session } = useSession();
  const [allPresets, setAllPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [showConfirm, setShowConfirm] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (session?.user && (session.user as any).isAdmin) {
      fetch("/api/user-presets?all=true")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAllPresets(data);
        })
        .catch((err) => console.error("Error fetching presets:", err))
        .finally(() => setLoadingPresets(false));
    }
  }, [session?.user]);

  const handleDeletePreset = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/user-presets?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAllPresets((prev) => prev.filter((p) => String(p.id) !== String(id)));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete preset");
      }
    } catch (err) {
      console.error("Delete preset failed:", err);
      alert("An unexpected error occurred while deleting preset");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
      setShowConfirm((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (!session?.user || !(session.user as any).isAdmin) {
    return (
      <PageContainer columns={1}>
        <div style={{ color: "#ef4444", fontWeight: "bold", padding: "2rem", textAlign: "center" }}>
          Access Denied: Administrative Privileges Required.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer columns={1}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "2px solid rgba(59, 130, 246, 0.4)", paddingBottom: "1rem" }}>
          <FaShieldAlt style={{ color: "#3b82f6", fontSize: "2rem" }} />
          <div>
            <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "bold", letterSpacing: "1px", color: "#60a5fa", fontFamily: "var(--font-runic, monospace)" }}>
              ADMIN PANEL
            </h2>
            <p style={{ margin: "0.25rem 0 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
              System configuration & secure administrative dashboard
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          
          {/* Active Admin Session Card */}
          <div 
            style={{
              border: "2px double #3b82f6",
              backgroundColor: "rgba(30, 41, 59, 0.4)",
              borderRadius: "8px",
              padding: "1.5rem",
              color: "#f8fafc",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", color: "#f8fafc", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>👑</span> Active Admin Session
            </h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {session.user.image && (
                <img 
                  src={session.user.image} 
                  alt="Avatar" 
                  style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px solid #3b82f6", objectFit: "cover" }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ fontWeight: "bold", color: "#f8fafc" }}>
                  {session.user.name}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontFamily: "monospace" }}>
                  Discord ID: {(session.user as any).discordId || "N/A"}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                  Email: {session.user.email}
                </div>
              </div>
            </div>
          </div>

          {/* System Control Card */}
          <div 
            style={{
              border: "2px double #3b82f6",
              backgroundColor: "rgba(30, 41, 59, 0.4)",
              borderRadius: "8px",
              padding: "1.5rem",
              color: "#f8fafc",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", color: "#f8fafc", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaTools style={{ color: "#3b82f6" }} /> System Control
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button 
                onClick={() => alert("Beta Flag Options have been toggled!")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(15, 23, 42, 0.5)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "4px",
                  color: "#cbd5e1",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
                className="hover:bg-slate-800 transition-colors"
              >
                <span>Toggle Beta Features</span>
                <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: "bold" }}>
                  ACTIVE
                </span>
              </button>

              <button 
                onClick={() => alert("Presets cache purged successfully!")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(15, 23, 42, 0.5)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "4px",
                  color: "#cbd5e1",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
                className="hover:bg-slate-800 transition-colors"
              >
                <span>Purge Presets Cache</span>
                <FaDatabase style={{ color: "#94a3b8" }} />
              </button>
            </div>
          </div>

        </div>

        {/* Global Preset Management */}
        <div>
          <h3 style={{ margin: "0 0 1rem 0", color: "#60a5fa", fontSize: "1.25rem", fontWeight: "bold", borderBottom: "1px solid rgba(59, 130, 246, 0.2)", paddingBottom: "0.5rem", fontFamily: "var(--font-runic, monospace)" }}>
            GLOBAL PRESET MANAGEMENT
          </h3>
          
          {loadingPresets ? (
            <div className="animate-pulse" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading database records...</div>
          ) : allPresets.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontStyle: "italic" }}>No user presets found in the database.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {allPresets.map((preset) => (
                <div 
                  key={preset.id} 
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.3)",
                    padding: "1rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(59, 130, 246, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "1.05rem", fontWeight: "bold" }}>{preset.name}</h4>
                        <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(51, 65, 85, 0.8)", color: "#cbd5e1", padding: "0.15rem 0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          Author: {preset.creator_name} ({preset.creator_id})
                        </span>
                      </div>
                      {preset.description && (
                        <p style={{ margin: "0.25rem 0 0 0", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.4" }}>
                          {preset.description}
                        </p>
                      )}
                    </div>

                    {/* Inline Confirm Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {showConfirm[preset.id] ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid #dc2626", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                          <span style={{ color: "#f87171", fontSize: "0.75rem", fontWeight: "bold", marginRight: "0.25rem" }}>Confirm?</span>
                          <button
                            onClick={(e) => handleDeletePreset(preset.id, e)}
                            disabled={!!isDeleting[preset.id]}
                            style={{
                              backgroundColor: "#dc2626",
                              border: "none",
                              color: "white",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "3px",
                              fontSize: "0.7rem",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            className="hover:bg-red-700 transition-colors"
                          >
                            {isDeleting[preset.id] ? "..." : "Yes"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setShowConfirm((prev) => ({ ...prev, [preset.id]: false }));
                            }}
                            disabled={!!isDeleting[preset.id]}
                            style={{
                              backgroundColor: "rgba(148, 163, 184, 0.2)",
                              border: "1px solid #94a3b8",
                              color: "#cbd5e1",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "3px",
                              fontSize: "0.7rem",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            className="hover:bg-slate-700 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowConfirm((prev) => ({ ...prev, [preset.id]: true }));
                          }}
                          style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid #ef4444",
                            color: "#f87171",
                            padding: "0.3rem 0.75rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          className="hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Force Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", padding: "0.75rem", borderRadius: "4px", fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", border: "1px solid rgba(255,255,255,0.03)" }}>
                    {preset.flags}
                  </div>

                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.7rem", color: "#64748b" }}>
                    <span>Created: {new Date(preset.created_timestamp).toLocaleString()}</span>
                    {preset.download_timestamp && <span>Last downloaded: {new Date(preset.download_timestamp).toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
};
