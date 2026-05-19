import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  FaShieldAlt,
  FaTools,
  FaDatabase,
  FaSearch,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPlus,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { PageContainer } from "../PageContainer/PageContainer";
import { FlagPreset } from "~/types/preset";

type AdminTabProps = {
  apiPresets?: Record<string, FlagPreset>;
};

export const AdminTab = ({ apiPresets }: AdminTabProps) => {
  const { data: session } = useSession();
  
  // Local state for all database records
  const [allPresets, setAllPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  
  // UI states
  const [adminSearch, setAdminSearch] = useState("");
  const [adminSortField, setAdminSortField] = useState<"name" | "author" | "created_at">("name");
  const [adminSortDir, setAdminSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  
  const [showConfirm, setShowConfirm] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Pagination / Page Limit for performance with ~400 presets
  const [visibleCount, setVisibleCount] = useState(50);
  
  const [adminExpandedPresets, setAdminExpandedPresets] = useState<Record<string, boolean>>({});
  
  // Tags Administration
  const [cannedTags, setCannedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<{old: string, new: string} | null>(null);

  // User Administration
  const [usersDb, setUsersDb] = useState<any[]>([]);
  const isSuperadmin = !!(session?.user as any)?.isSuperadmin;

  const isAdmin = !!(session?.user as any)?.isAdmin || isSuperadmin;

  const fetchPresets = () => {
    setLoadingPresets(true);
    fetch(`/api/user-presets?all=true&t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllPresets(data);
      })
      .catch((err) => console.error("Error fetching presets:", err))
      .finally(() => setLoadingPresets(false));
  };

  const fetchTags = () => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCannedTags(data);
      })
      .catch((e) => console.error("Error fetching tags:", e));
  };

  const fetchUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsersDb(data);
      })
      .catch((e) => console.error("Error fetching users:", e));
  };

  useEffect(() => {
    if (session?.user && isAdmin) {
      fetchPresets();
      fetchTags();
      fetchUsers();
    }
  }, [session?.user, isAdmin]);

  // Combine database presets and API presets, merging overrides in real-time
  const mergedPresets = useMemo(() => {
    const apiArray = Object.values(apiPresets || {});
    
    // Create a map of db overrides by lowercase name for easy lookup
    const dbMap = new Map<string, any>();
    allPresets.forEach((p) => {
      if (p.name && p.creator_id === "override") {
        dbMap.set(p.name.toLowerCase(), p);
      }
    });

    const combined: any[] = [];
    const processedDbNames = new Set<string>();

    // 1. Process all API presets and merge overrides
    apiArray.forEach((apiPreset) => {
      const dbOverride = dbMap.get(apiPreset.name.toLowerCase());
      if (dbOverride) {
        processedDbNames.add(apiPreset.name.toLowerCase());
        
        // Skip if marked as deleted in database
        if (dbOverride.deleted) {
          return;
        }

        // Merge properties, using database overrides
        combined.push({
          ...apiPreset,
          id: dbOverride.id || apiPreset.name, // Use database id if it exists, else name
          tags: dbOverride.tags || apiPreset.tags || [],
          official: dbOverride.official !== undefined 
            ? dbOverride.official 
            : (apiPreset.official || (dbOverride.tags && dbOverride.tags.includes("official"))),
          creator_name: apiPreset.creator_name || apiPreset.creator || "Community",
          creator_id: apiPreset.creator_id || "community",
          created_timestamp: apiPreset.created_at || new Date().toISOString(),
          isApiPreset: true,
          dbRecord: dbOverride
        });
      } else {
        combined.push({
          ...apiPreset,
          id: apiPreset.name, // If no db record yet, identify by name
          tags: apiPreset.tags || [],
          official: !!apiPreset.official,
          creator_name: apiPreset.creator_name || apiPreset.creator || "Community",
          creator_id: apiPreset.creator_id || "community",
          created_timestamp: apiPreset.created_at || new Date().toISOString(),
          isApiPreset: true
        });
      }
    });

    // 2. Process remaining database presets (pure user presets or custom database presets)
    allPresets.forEach((dbPreset) => {
      const lowercaseName = dbPreset.name ? dbPreset.name.toLowerCase() : "";
      if (!processedDbNames.has(lowercaseName)) {
        // Skip if marked deleted
        if (dbPreset.deleted) return;

        combined.push({
          id: dbPreset.id,
          name: dbPreset.name,
          description: dbPreset.description || "",
          flags: dbPreset.flags || "",
          tags: dbPreset.tags || [],
          official: !!dbPreset.official || (Array.isArray(dbPreset.tags) && dbPreset.tags.includes("official")),
          creator_name: dbPreset.creator_name || "Unknown",
          creator_id: dbPreset.creator_id || "unknown",
          created_timestamp: dbPreset.created_timestamp || new Date().toISOString(),
          download_timestamp: dbPreset.download_timestamp,
          isApiPreset: false
        });
      }
    });

    return combined;
  }, [apiPresets, allPresets]);

  // Filtering based on search
  const filteredPresets = useMemo(() => {
    const term = adminSearch.toLowerCase().trim();
    if (!term) return mergedPresets;
    
    return mergedPresets.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(term);
      const descMatch = (p.description || "").toLowerCase().includes(term);
      const creatorMatch = (p.creator_name || p.creator || "").toLowerCase().includes(term);
      const tagMatch = (p.tags || []).some((t: string) => t.toLowerCase().includes(term));
      return nameMatch || descMatch || creatorMatch || tagMatch;
    });
  }, [mergedPresets, adminSearch]);

  // Sorting
  const sortedPresets = useMemo(() => {
    const sorted = [...filteredPresets];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (adminSortField === "name") {
        cmp = (a.name || "").localeCompare(b.name || "");
      } else if (adminSortField === "author") {
        cmp = (a.creator_name || "").localeCompare(b.creator_name || "");
      } else if (adminSortField === "created_at") {
        cmp = new Date(a.created_timestamp || 0).getTime() - new Date(b.created_timestamp || 0).getTime();
      }
      return adminSortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredPresets, adminSortField, adminSortDir]);

  // Actions
  const handleAdminDeletePreset = async (preset: any) => {
    const isMultiSelected = Object.keys(selectedIds).filter(id => selectedIds[id]).length > 1;
    if (isMultiSelected && selectedIds[preset.id]) {
      return handleBulkDelete(preset.id);
    }

    setIsDeleting(prev => ({ ...prev, [preset.id]: true }));
    const identifier = preset.isApiPreset ? { name: preset.name } : { id: preset.id };
    
    try {
      const res = await fetch("/api/user-presets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identifier)
      });
      if (res.ok) {
        setShowConfirm(prev => ({ ...prev, [preset.id]: false }));
        if (selectedIds[preset.id]) {
          setSelectedIds(prev => ({ ...prev, [preset.id]: false }));
        }
        fetchPresets();
      } else {
        alert("Failed to delete preset.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred deleting preset.");
    } finally {
      setIsDeleting(prev => ({ ...prev, [preset.id]: false }));
    }
  };

  const handleSaveTags = async (preset: any, tagsArray: string[]) => {
    try {
      const res = await fetch("/api/user-presets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: preset.isApiPreset ? undefined : preset.id,
          name: preset.name,
          tags: tagsArray
        })
      });
      
      if (res.ok) {
        fetchPresets();
      } else {
        alert("Failed to save tags");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving tags");
    }
  };

  const handleBulkDelete = async (confirmId?: string) => {
    const selectedPresets = mergedPresets.filter((p) => selectedIds[p.id]);
    if (selectedPresets.length === 0) return;
    
    if (confirmId) {
      setIsDeleting((prev) => ({ ...prev, [confirmId]: true }));
    } else {
      setIsBulkDeleting(true);
    }

    try {
      const ids = selectedPresets.filter((p) => !p.isApiPreset).map((p) => String(p.id));
      const names = selectedPresets.filter((p) => p.isApiPreset).map((p) => String(p.name));
      
      const res = await fetch("/api/user-presets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, names })
      });
      
      if (res.ok) {
        setSelectedIds({});
        setShowConfirm({});
        fetchPresets();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed bulk delete: ${errData.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert(`An error occurred: ${e}`);
    } finally {
      if (confirmId) {
        setIsDeleting((prev) => ({ ...prev, [confirmId]: false }));
      } else {
        setIsBulkDeleting(false);
      }
    }
  };

  const handleSelectAll = () => {
    const allSelected = sortedPresets.every((p) => selectedIds[p.id]);
    const next: Record<string, boolean> = {};
    let lastId: string | null = null;
    if (!allSelected) {
      sortedPresets.forEach((p) => {
        next[p.id] = true;
        lastId = p.id;
      });
    }
    setSelectedIds(next);
    if (lastId) setLastSelectedId(lastId);
  };

  const toggleAdminPreset = (id: string) => {
    setAdminExpandedPresets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 50);
  };

  if (!session?.user || !isAdmin) {
    return (
      <PageContainer columns={1}>
        <div style={{ color: "#ef4444", fontWeight: "bold", padding: "2rem", textAlign: "center" }}>
          Access Denied: Administrative Privileges Required.
        </div>
      </PageContainer>
    );
  }

  // Slice presets for lazy loading / pagination
  const visiblePresets = sortedPresets.slice(0, visibleCount);

  return (
    <PageContainer columns={1}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "2px solid rgba(239, 68, 68, 0.4)", paddingBottom: "1rem" }}>
          <FaShieldAlt style={{ color: "#ef4444", fontSize: "2rem" }} />
          <div>
            <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "bold", letterSpacing: "1px", color: "#f87171", fontFamily: "var(--font-runic, monospace)" }}>
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
              border: "2px double #ef4444",
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
                  style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px solid #ef4444", objectFit: "cover" }}
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
              border: "2px double #ef4444",
              backgroundColor: "rgba(30, 41, 59, 0.4)",
              borderRadius: "8px",
              padding: "1.5rem",
              color: "#f8fafc",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", color: "#f8fafc", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaTools style={{ color: "#ef4444" }} /> System Control
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
                  border: "1px solid rgba(239, 68, 68, 0.2)",
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

              {/* Purge Cache Button with Inline Confirmation */}
              {showConfirm["purge"] ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(239, 68, 68, 0.6)",
                    borderRadius: "4px",
                    color: "#cbd5e1",
                    fontSize: "0.85rem",
                    width: "100%",
                  }}
                >
                  <span style={{ color: "#f87171", fontWeight: "bold" }}>Confirm Purge?</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => {
                        fetchPresets();
                        setShowConfirm((prev) => ({ ...prev, purge: false }));
                        alert("Presets list refreshed and synced successfully!");
                      }}
                      style={{
                        backgroundColor: "#ef4444",
                        border: "none",
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                      className="hover:bg-red-600 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowConfirm((prev) => ({ ...prev, purge: false }))}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        border: "none",
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowConfirm((prev) => ({ ...prev, purge: true }))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
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
              )}
            </div>
          </div>

        </div>

        {/* Global Preset Management */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "4px double #ef4444",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(239, 68, 68, 0.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#f87171" }}>
              PRESETS - ADMIN
            </h2>
            <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#94a3b8" }}>
              Total: {mergedPresets.length} (Filtered: {sortedPresets.length})
            </span>
          </div>

          {/* Search Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1rem" }}>
            <FaSearch size={12} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search presets by name, author, tags, or description..."
              value={adminSearch}
              onChange={(e) => {
                setAdminSearch(e.target.value);
                setVisibleCount(50); // Reset visible count on search
              }}
              style={{ background: "none", border: "none", outline: "none", fontSize: "0.85rem", color: "#f8fafc", flex: 1, width: "100%" }}
            />
            {adminSearch && (
              <button
                onClick={() => {
                  setAdminSearch("");
                  setVisibleCount(50);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "0.85rem" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Controls & Select All */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase" }}>Sort:</span>
              {(["name", "author", "created_at"] as const).map((f) => {
                const active = adminSortField === f;
                const label = f === "name" ? "Name" : f === "author" ? "Author" : "Creation Date";
                return (
                  <button
                    key={f}
                    onClick={() => {
                      setAdminSortField(f);
                      setAdminSortDir(active && adminSortDir === "asc" ? "desc" : "asc");
                    }}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      border: active ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                      background: active ? "rgba(239,68,68,0.15)" : "transparent",
                      color: active ? "#f87171" : "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: active ? "bold" : "normal",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label} {active && (adminSortDir === "asc" ? <FaSortAmountUp style={{ display: "inline", marginLeft: "0.2rem" }} /> : <FaSortAmountDown style={{ display: "inline", marginLeft: "0.2rem" }} />)}
                  </button>
                );
              })}
            </div>

            {/* Bulk Actions UI */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button
                onClick={handleSelectAll}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#cbd5e1",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                className="hover:bg-slate-700 transition-colors"
              >
                {sortedPresets.every((p) => selectedIds[p.id]) ? "Deselect All" : "Select All"}
              </button>

              {Object.keys(selectedIds).filter((id) => selectedIds[id]).length > 0 && (
                <button
                  onClick={() => {
                    let confirmId = lastSelectedId && selectedIds[lastSelectedId] 
                      ? lastSelectedId 
                      : Object.keys(selectedIds).find(id => selectedIds[id]);
                    if (confirmId) {
                      setShowConfirm(prev => ({ ...prev, [confirmId]: true }));
                    }
                  }}
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid #ef4444",
                    color: "#f87171",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  className="hover:bg-red-500 hover:text-white transition-colors"
                >
                  <FaTrash size={10} />
                  <span>Delete ({Object.keys(selectedIds).filter((id) => selectedIds[id]).length})</span>
                </button>
              )}
            </div>
          </div>

          {loadingPresets && allPresets.length === 0 ? (
            <div className="animate-pulse" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading database presets...</div>
          ) : sortedPresets.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontStyle: "italic" }}>No matching presets found in system.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {visiblePresets.map((preset) => {
                const isExpanded = !!adminExpandedPresets[preset.id];
                const isSelected = !!selectedIds[preset.id];
                return (
                  <div
                    key={preset.id}
                    style={{
                      backgroundColor: isSelected ? "rgba(239, 68, 68, 0.05)" : "rgba(30, 41, 59, 0.6)",
                      padding: "0.75rem 1rem",
                      borderRadius: "6px",
                      border: isSelected ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, paddingRight: "1rem" }}>
                        {/* Bulk checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedIds((prev) => ({
                              ...prev,
                              [preset.id]: e.target.checked
                            }));
                            if (e.target.checked) {
                              setLastSelectedId(preset.id);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginRight: "0.75rem", cursor: "pointer", width: "16px", height: "16px" }}
                        />

                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", overflow: "hidden", flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "1rem", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {preset.name}
                          </h4>
                          <span style={{ color: "#94a3b8", fontSize: "0.8rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                            by {preset.creator_name || preset.creator || "Unknown"}
                          </span>
                          {preset.description && !isExpanded && (
                            <span style={{ color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>
                              - {preset.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Preset Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                        {showConfirm[preset.id] ? (
                          <>
                            <span style={{ color: "#f87171", fontSize: "0.8rem", fontWeight: "bold", marginRight: "0.25rem" }}>Confirm?</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleAdminDeletePreset(preset);
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
                              onClick={() => toggleAdminPreset(preset.id)}
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

                    {/* Tag Toggle Buttons Sub-Row */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem", paddingLeft: "1.75rem", alignItems: "center" }}>
                      {/* Official tag toggle */}
                      <button
                        onClick={() => {
                          const isOfficial = Array.isArray(preset.tags) && preset.tags.includes("official");
                          const nextTags = isOfficial
                            ? (preset.tags || []).filter((t: string) => t !== "official")
                            : [...(preset.tags || []), "official"];
                          handleSaveTags(preset, nextTags);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.7rem",
                          backgroundColor: preset.official ? "rgba(245, 158, 11, 0.25)" : "rgba(255,255,255,0.05)",
                          color: preset.official ? "#f59e0b" : "#64748b",
                          border: `1px solid ${preset.official ? "#f59e0b" : "rgba(255,255,255,0.15)"}`,
                          padding: "0.15rem 0.4rem",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          transition: "all 0.15s",
                        }}
                      >
                        ★ OFFICIAL
                      </button>

                      {/* Dynamic Canned Tags */}
                      {cannedTags.map(tag => {
                        const isActive = Array.isArray(preset.tags) && preset.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => {
                              const nextTags = isActive
                                ? (preset.tags || []).filter((t: string) => t !== tag)
                                : [...(preset.tags || []), tag];
                              handleSaveTags(preset, nextTags);
                            }}
                            style={{
                              fontSize: "0.7rem",
                              backgroundColor: isActive ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.05)",
                              color: isActive ? "#60a5fa" : "#64748b",
                              border: `1px solid ${isActive ? "#60a5fa" : "rgba(255, 255, 255, 0.15)"}`,
                              padding: "0.15rem 0.4rem",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              transition: "all 0.15s",
                            }}
                          >
                            {tag.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div style={{ marginTop: "0.75rem", borderTop: "1px dashed rgba(148, 163, 184, 0.2)", paddingTop: "0.75rem", paddingLeft: "1.75rem" }}>
                        {preset.description && (
                          <p style={{ color: "#cbd5e1", fontSize: "0.9rem", marginTop: 0, marginBottom: "0.75rem", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                            {preset.description}
                          </p>
                        )}
                        <div style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", padding: "0.75rem", borderRadius: "4px", fontSize: "0.8rem", color: "#cbd5e1", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", border: "1px solid rgba(255,255,255,0.05)" }}>
                          {preset.flags || "(No flags provided in external API)"}
                        </div>
                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>
                          <span>Created: {new Date(preset.created_timestamp).toLocaleDateString()}</span>
                          {preset.download_timestamp && <span>Downloaded: {new Date(preset.download_timestamp).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button for Pagination */}
          {sortedPresets.length > visibleCount && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
              <button
                onClick={handleLoadMore}
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  color: "#f87171",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                className="hover:bg-red-500 hover:text-white"
              >
                Load More Presets (+50)
              </button>
            </div>
          )}
        </div>

        {/* TAGS ADMINISTRATION */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "4px double #8b5cf6",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(139, 92, 246, 0.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#a78bfa" }}>
              TAGS ADMINISTRATION
            </h2>
            <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#94a3b8" }}>
              {cannedTags.length} Active Tags
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <input 
              type="text" 
              value={newTagName} 
              onChange={e => setNewTagName(e.target.value)} 
              placeholder="Enter new tag name..." 
              style={{ padding: "0.6rem 1rem", borderRadius: "4px", border: "1px solid rgba(139, 92, 246, 0.5)", background: "rgba(0,0,0,0.5)", color: "white", flexGrow: 1, outline: "none", fontSize: "0.9rem" }} 
            />
            <button 
              onClick={async () => {
                if(!newTagName.trim()) return;
                try {
                  const res = await fetch("/api/tags", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({tag: newTagName}) });
                  if (!res.ok) throw new Error(await res.text());
                  setNewTagName("");
                  fetchTags();
                } catch(e: any) {
                  alert(`Failed to add tag: ${e.message}`);
                }
              }}
              style={{ backgroundColor: "#8b5cf6", border: "none", color: "white", padding: "0.6rem 1.5rem", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "0.9rem" }}
              className="hover:bg-purple-600 transition-colors"
            >
              + Create Tag
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
            {cannedTags.length === 0 ? (
              <div style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.9rem" }}>No custom tags created yet.</div>
            ) : cannedTags.map(tag => (
              <div key={tag} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(30, 41, 59, 0.6)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                {editingTag?.old === tag ? (
                  <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                    <input type="text" value={editingTag.new} onChange={e => setEditingTag({ ...editingTag, new: e.target.value })} style={{ padding: "0.25rem", borderRadius: "3px", background: "rgba(0,0,0,0.5)", border: "1px solid white", color: "white", flexGrow: 1, minWidth: 0 }} />
                    <button onClick={async () => {
                      if (!editingTag.new.trim()) return;
                      try {
                        const res = await fetch("/api/tags", { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ oldTag: editingTag.old, newTag: editingTag.new }) });
                        if (!res.ok) throw new Error(await res.text());
                        setEditingTag(null);
                        fetchTags();
                        fetchPresets(); // Refresh presets since tags may have changed
                      } catch (e: any) {
                        alert(`Failed to rename tag: ${e.message}`);
                      }
                    }} style={{ color: "#10b981", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>Save</button>
                    <button onClick={() => setEditingTag(null)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontWeight: "bold", textTransform: "uppercase", color: "#ddd6fe", fontSize: "0.85rem" }}>{tag}</span>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button onClick={() => setEditingTag({old: tag, new: tag})} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }} className="hover:text-blue-400">Edit</button>
                      <button onClick={async () => {
                        if(confirm(`Are you sure you want to delete the tag "${tag}"? It will be removed from all presets.`)) {
                          try {
                            const res = await fetch("/api/tags", { method: "DELETE", headers: {"Content-Type": "application/json"}, body: JSON.stringify({tag}) });
                            if (!res.ok) throw new Error(await res.text());
                            fetchTags();
                            fetchPresets();
                          } catch (e: any) {
                            alert(`Failed to delete tag: ${e.message}`);
                          }
                        }
                      }} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }} className="hover:text-red-400">Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* USER ADMINISTRATION */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "4px double #10b981",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(16, 185, 129, 0.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#34d399" }}>
              USER ADMINISTRATION
            </h2>
            <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#94a3b8" }}>
              {usersDb.length} Registered Users
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", borderBottom: "2px solid rgba(16, 185, 129, 0.2)" }}>
                  <th style={{ padding: "0.75rem", color: "#6ee7b7" }}>User</th>
                  <th style={{ padding: "0.75rem", color: "#6ee7b7" }}>Discord ID</th>
                  <th style={{ padding: "0.75rem", color: "#6ee7b7" }}>Logins</th>
                  <th style={{ padding: "0.75rem", color: "#6ee7b7" }}>First Login</th>
                  <th style={{ padding: "0.75rem", color: "#6ee7b7" }}>Last Login</th>
                  <th style={{ padding: "0.75rem", color: "#6ee7b7" }}>Presets Owned</th>
                  {isSuperadmin && <th style={{ padding: "0.75rem", color: "#6ee7b7", textAlign: "center" }}>Role Control</th>}
                </tr>
              </thead>
              <tbody>
                {usersDb.map((user) => {
                  const ownedPresets = allPresets.filter(p => String(p.creator_id) === String(user.discordId)).length;
                  const isUserSuperadmin = ["451050854934511647", "197757429948219392"].includes(String(user.discordId));
                  
                  return (
                    <tr key={user.discordId} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="hover:bg-slate-800 transition-colors">
                      <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#f8fafc" }}>{user.name}</td>
                      <td style={{ padding: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>{user.discordId}</td>
                      <td style={{ padding: "0.75rem", color: "#cbd5e1" }}>{user.loginCount || 1}</td>
                      <td style={{ padding: "0.75rem", color: "#94a3b8" }}>{new Date(user.firstLogin).toLocaleDateString()}</td>
                      <td style={{ padding: "0.75rem", color: "#94a3b8" }}>{new Date(user.lastLogin).toLocaleDateString()}</td>
                      <td style={{ padding: "0.75rem", color: "#cbd5e1" }}>{ownedPresets}</td>
                      {isSuperadmin && (
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>
                          {isUserSuperadmin ? (
                            <span style={{ backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold" }}>SUPERADMIN</span>
                          ) : (
                            <button
                              onClick={async () => {
                                const newStatus = !user.isAdmin;
                                if(confirm(`Change ${user.name}'s role to ${newStatus ? 'Admin' : 'User'}?`)) {
                                  try {
                                    const res = await fetch("/api/users", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ discordId: user.discordId, isAdmin: newStatus })
                                    });
                                    if (!res.ok) throw new Error(await res.text());
                                    fetchUsers();
                                  } catch (e: any) {
                                    alert(`Failed to update role: ${e.message}`);
                                  }
                                }
                              }}
                              style={{
                                backgroundColor: user.isAdmin ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                color: user.isAdmin ? "#60a5fa" : "#94a3b8",
                                border: `1px solid ${user.isAdmin ? "rgba(59, 130, 246, 0.4)" : "rgba(255, 255, 255, 0.2)"}`,
                                padding: "0.2rem 0.6rem",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              className="hover:brightness-125"
                            >
                              {user.isAdmin ? "ADMIN" : "USER"}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
