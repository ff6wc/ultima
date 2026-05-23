import React, { useState, useEffect, useMemo } from "react";
import { useAppSession } from "~/hooks/useAppSession";
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

const narsheFetch = (path: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const url = `${backendUrl}/api/v1${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
};

type AdminTabProps = {
  apiPresets?: Record<string, FlagPreset>;
};

export const AdminTab = ({ apiPresets }: AdminTabProps) => {
  const { data: session } = useAppSession();
  
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
  const [visibleCount, setVisibleCount] = useState(10);
  
  const [adminExpandedPresets, setAdminExpandedPresets] = useState<Record<string, boolean>>({});
  
  // Tags Administration
  const [cannedTags, setCannedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<{old: string, new: string} | null>(null);

  const isSuperadmin = !!(session?.user as any)?.isSuperadmin;

  const isAdmin = !!(session?.user as any)?.isAdmin || isSuperadmin;

  const fetchPresets = () => {
    setLoadingPresets(true);
    narsheFetch(`/user-presets?all=true&t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllPresets(data);
      })
      .catch((err) => console.error("Error fetching presets:", err))
      .finally(() => setLoadingPresets(false));
  };

  const fetchTags = () => {
    narsheFetch("/tags")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCannedTags(data);
      })
      .catch((e) => console.error("Error fetching tags:", e));
  };

  useEffect(() => {
    if (session?.user && isAdmin) {
      fetchPresets();
      fetchTags();
    }
  }, [session?.user, isAdmin]);

  // Combine database presets and API presets, merging overrides in real-time
  const mergedPresets = useMemo(() => {
    const apiArray = Object.values(apiPresets || {});
    
    // Create a map of db overrides by lowercase name for easy lookup
    const dbMap = new Map<string, any>();
    allPresets.forEach((p) => {
      const name = p.preset_name || p.name;
      if (name && (p.owner_id === "override" || p.creator_id === "override")) {
        dbMap.set(name.toLowerCase(), p);
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
          official: dbOverride.is_official !== undefined
            ? dbOverride.is_official
            : (dbOverride.official !== undefined 
                ? dbOverride.official 
                : (apiPreset.official || (dbOverride.tags && dbOverride.tags.includes("official")))),
          creator_name: apiPreset.creator_name || apiPreset.creator || "Community",
          creator_id: apiPreset.creator_id || "community",
          created_timestamp: apiPreset.created_at || new Date().toISOString(),
          download_timestamp: dbOverride.download_timestamp,
          downloads: dbOverride.downloads,
          download_count: dbOverride.download_count,
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
    allPresets.forEach((dbPreset, index) => {
      const name = dbPreset.preset_name || dbPreset.name;
      const lowercaseName = name ? name.toLowerCase() : "";
      if (lowercaseName && !processedDbNames.has(lowercaseName)) {
        // Skip if marked deleted
        if (dbPreset.deleted) return;

        combined.push({
          id: dbPreset.id || name || `db-preset-${index}`,
          name: name,
          description: dbPreset.description || "",
          flags: dbPreset.flags || "",
          tags: dbPreset.tags || [],
          official: dbPreset.is_official !== undefined
            ? dbPreset.is_official
            : (!!dbPreset.official || (Array.isArray(dbPreset.tags) && dbPreset.tags.includes("official"))),
          creator_name: dbPreset.creator_name || dbPreset.owner_id || "Unknown",
          creator_id: dbPreset.owner_id || dbPreset.creator_id || "unknown",
          created_timestamp: dbPreset.created_at || dbPreset.created_timestamp || new Date().toISOString(),
          download_timestamp: dbPreset.download_timestamp,
          downloads: dbPreset.downloads,
          download_count: dbPreset.download_count,
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
      const res = await narsheFetch("/user-presets", {
        method: "DELETE",
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
      const res = await narsheFetch("/user-presets", {
        method: "PUT",
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
      
      const res = await narsheFetch("/user-presets", {
        method: "DELETE",
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
              border: "2px double #3b82f6",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
            className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          >
            <h3 className="text-slate-800 dark:text-slate-100" style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                <div className="text-slate-800 dark:text-slate-100" style={{ fontWeight: "bold" }}>
                  {session.user.name}
                </div>
                <div className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                  Discord ID: {(session.user as any).discordId || "N/A"}
                </div>
                <div className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.75rem" }}>
                  Email: {session.user.email}
                </div>
              </div>
            </div>
          </div>

          {/* System Control Card */}
          <div 
            style={{
              border: "2px double #3b82f6",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
            className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          >
            <h3 className="text-slate-800 dark:text-slate-100" style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span>Toggle Beta Features</span>
                <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-900/50" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: "bold" }}>
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
                    border: "1px solid rgba(239, 68, 68, 0.6)",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    width: "100%",
                  }}
                  className="bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-red-500/40"
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
                        border: "none",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                      className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
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
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <span>Purge Presets Cache</span>
                  <FaDatabase className="text-slate-400 dark:text-slate-500" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Global Preset Management */}
        <div
          style={{
            border: "4px double #ef4444",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            fontFamily: "var(--font-runic, monospace)",
          }}
          className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(239, 68, 68, 0.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#f87171" }}>
              PRESETS - ADMIN
            </h2>
            <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "1rem", fontWeight: "bold" }}>
              Total: {mergedPresets.length} (Filtered: {sortedPresets.length})
            </span>
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <FaSearch size={14} className="text-slate-400 dark:text-slate-500" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 10 }} />
            <input
              type="text"
              placeholder="Search presets by name, author, tags, or description..."
              value={adminSearch}
              onChange={(e) => {
                setAdminSearch(e.target.value);
                setVisibleCount(10); // Reset visible count on search
              }}
              style={{
                width: "100%",
                padding: "0.5rem 2.5rem 0.5rem 2.25rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "none"
              }}
              className="placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-red-500 dark:focus:border-red-500 transition-all border border-[var(--border-input)]"
            />
            {adminSearch && (
              <button
                onClick={() => {
                  setAdminSearch("");
                  setVisibleCount(10);
                }}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  lineHeight: 1,
                  zIndex: 10
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Controls & Select All */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" }}>Sort:</span>
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
                      border: active ? "1px solid #ef4444" : "1px solid var(--border-light, rgba(255,255,255,0.1))",
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
                  border: "1px solid var(--border-light, rgba(255, 255, 255, 0.1))",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
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
                      setShowConfirm(prev => ({ ...prev, [confirmId as string]: true }));
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
            <div className="animate-pulse text-slate-500 dark:text-slate-400" style={{ fontSize: "0.9rem" }}>Loading database presets...</div>
          ) : sortedPresets.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.9rem", fontStyle: "italic" }}>No matching presets found in system.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {visiblePresets.map((preset) => {
                const isExpanded = !!adminExpandedPresets[preset.id];
                const isSelected = !!selectedIds[preset.id];
                return (
                  <div
                    key={preset.id}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "6px",
                      border: isSelected ? "1px solid #ef4444" : "1px solid var(--border-light, rgba(255, 255, 255, 0.08))",
                    }}
                    className={isSelected ? "bg-red-500/5 dark:bg-red-500/10 text-slate-800 dark:text-slate-100" : "bg-slate-100 hover:bg-slate-200/50 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-100 transition-colors"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, paddingRight: "1rem" }}>
                        <div 
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              setSelectedIds((prev) => ({
                                ...prev,
                                [preset.id]: !isSelected
                              }));
                              if (!isSelected) {
                                setLastSelectedId(preset.id);
                              }
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIds((prev) => ({
                              ...prev,
                              [preset.id]: !isSelected
                            }));
                            if (!isSelected) {
                              setLastSelectedId(preset.id);
                            }
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all mr-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500
                            ${isSelected 
                              ? "bg-red-500 border-red-500 text-white shadow-sm" 
                              : "border-slate-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500 bg-white dark:bg-slate-900"
                            }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 fill-current stroke-current" viewBox="0 0 24 24">
                              <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" stroke="currentColor" fill="none" />
                            </svg>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", overflow: "hidden", flex: 1, minWidth: 0 }}>
                          <h4 className="text-slate-800 dark:text-slate-100" style={{ margin: 0, fontSize: "1rem", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {preset.name}
                          </h4>
                          <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.8rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                            by {preset.creator_name || preset.creator || "Unknown"}
                          </span>
                          {preset.description && !isExpanded && (
                            <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>
                              - {preset.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Preset Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: "bold", 
                            padding: "0.15rem 0.5rem", 
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                          className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                          title="Total downloads on site"
                        >
                          📥 {preset.downloads ?? preset.download_count ?? preset.dbRecord?.downloads ?? preset.dbRecord?.download_count ?? 0}
                        </span>
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
                                border: "1px solid #94a3b8",
                                padding: "0.25rem 0.6rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
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
                          backgroundColor: preset.official ? "rgba(245, 158, 11, 0.25)" : "transparent",
                          color: preset.official ? "#f59e0b" : "var(--text-sub, #64748b)",
                          border: `1px solid ${preset.official ? "#f59e0b" : "var(--border-light, rgba(255,255,255,0.15))"}`,
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
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const nextTags = isActive
                                ? (preset.tags || []).filter((t: string) => t !== tag)
                                : [...(preset.tags || []), tag];
                              handleSaveTags(preset, nextTags);
                            }}
                            style={{
                              fontSize: "0.7rem",
                              backgroundColor: isActive ? "rgba(59, 130, 246, 0.25)" : "transparent",
                              color: isActive ? "#60a5fa" : "var(--text-sub, #64748b)",
                              border: `1px solid ${isActive ? "#60a5fa" : "var(--border-light, rgba(255, 255, 255, 0.15))"}`,
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
                          <p className="text-slate-700 dark:text-slate-300" style={{ fontSize: "0.9rem", marginTop: 0, marginBottom: "0.75rem", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                            {preset.description}
                          </p>
                        )}
                        <div className="text-slate-800 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-950/60" style={{ padding: "0.75rem", borderRadius: "4px", fontSize: "0.8rem", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", border: "1px solid var(--border-light, rgba(255,255,255,0.05))" }}>
                          {preset.flags || "(No flags provided in external API)"}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400" style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem", fontWeight: "bold", flexWrap: "wrap" }}>
                          <span>Created: {new Date(preset.created_timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                          <span>Total Downloads: {preset.downloads ?? preset.download_count ?? preset.dbRecord?.downloads ?? preset.dbRecord?.download_count ?? 0}</span>
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

          {/* Load More Button for Pagination */}
          {sortedPresets.length > visibleCount && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
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
              <button
                onClick={() => setVisibleCount(sortedPresets.length)}
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid #3b82f6",
                  color: "#60a5fa",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                className="hover:bg-blue-600 hover:text-white"
              >
                Show All ({sortedPresets.length})
              </button>
            </div>
          )}
        </div>

        {/* TAGS ADMINISTRATION */}
        <div
          style={{
            border: "4px double #8b5cf6",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            padding: "2rem",
            fontFamily: "var(--font-runic, monospace)",
          }}
          className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(139, 92, 246, 0.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", color: "#a78bfa" }}>
              TAGS ADMINISTRATION
            </h2>
            <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: "1rem", fontWeight: "bold" }}>
              {cannedTags.length} Active Tags
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <input 
              type="text" 
              value={newTagName} 
              onChange={e => setNewTagName(e.target.value)} 
              placeholder="Enter new tag name..." 
              style={{ padding: "0.6rem 1rem", borderRadius: "4px", border: "1px solid rgba(139, 92, 246, 0.5)", flexGrow: 1, outline: "none", fontSize: "0.9rem" }} 
              className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button 
              onClick={async () => {
                if(!newTagName.trim()) return;
                try {
                  const res = await narsheFetch("/tags", { method: "POST", body: JSON.stringify({tag: newTagName}) });
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
              <div 
                key={tag} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "0.75rem 1rem", 
                  borderRadius: "6px", 
                }}
                className="bg-slate-100 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 border border-purple-200 dark:border-purple-900/30"
              >
                {editingTag?.old === tag ? (
                  <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                    <input 
                      type="text" 
                      value={editingTag.new} 
                      onChange={e => setEditingTag({ ...editingTag, new: e.target.value })} 
                      style={{ padding: "0.25rem", borderRadius: "3px", flexGrow: 1, minWidth: 0 }} 
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100" 
                    />
                    <button onClick={async () => {
                      if (!editingTag.new.trim()) return;
                      try {
                        const res = await narsheFetch("/tags", { method: "PUT", body: JSON.stringify({ oldTag: editingTag.old, newTag: editingTag.new }) });
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
                    <span className="text-purple-700 dark:text-purple-200" style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.85rem" }}>{tag}</span>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button onClick={() => setEditingTag({old: tag, new: tag})} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold" }} className="hover:text-blue-400">Edit</button>
                      <button onClick={async () => {
                        if(confirm(`Are you sure you want to delete the tag "${tag}"? It will be removed from all presets.`)) {
                          try {
                            const res = await narsheFetch("/tags", { method: "DELETE", body: JSON.stringify({tag}) });
                            if (!res.ok) throw new Error(await res.text());
                            fetchTags();
                            fetchPresets();
                          } catch (e: any) {
                            alert(`Failed to delete tag: ${e.message}`);
                          }
                        }
                      }} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold" }} className="hover:text-red-400">Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>



      </div>
    </PageContainer>
  );
};
