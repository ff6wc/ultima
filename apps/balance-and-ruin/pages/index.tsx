import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FlagCreatePage } from "~/components/FlagCreatePage/FlagCreatePage";
import { setRawFlags } from "~/state/flagSlice";
import { setObjectiveMetadata } from "~/state/objectiveSlice";
import { RawFlagMetadata, setSchema } from "~/state/schemaSlice";
import { ObjectiveMetadata } from "~/types/objectives";
import { FlagPreset } from "~/types/preset";
import { fetchWithTimeout } from "~/utils/fetchWithTimeout";

const normalizePresets = (data: any): Record<string, FlagPreset> => {
  if (!data) return {};
  const presetsArray = Array.isArray(data) ? data : Object.values(data);
  return presetsArray.reduce((acc: Record<string, FlagPreset>, p: any) => {
    if (p && p.name) {
      acc[p.name.toLowerCase()] = p;
    }
    return acc;
  }, {});
};

const HomeLandingPage = () => {
  const dispatch = useDispatch();
  const [objectives, setObjectives] = useState<ObjectiveMetadata | null>(null);
  const [presets, setPresets] = useState<Record<string, FlagPreset> | null>(null);
  const [schema, setSchemaLocal] = useState<Record<string, RawFlagMetadata> | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try to load initial values from localStorage cache for instant load
    try {
      const cachedObjectives = localStorage.getItem("cached_objectives");
      const cachedPresets = localStorage.getItem("cached_presets");
      const cachedSchema = localStorage.getItem("cached_schema");
      const cachedVersion = localStorage.getItem("cached_version");

      if (cachedObjectives) {
        const parsed = JSON.parse(cachedObjectives);
        setObjectives(parsed);
        dispatch(setObjectiveMetadata(parsed));
      }
      if (cachedPresets) {
        const parsed = normalizePresets(JSON.parse(cachedPresets));
        setPresets(parsed);
        const preset = parsed["ultros league"];
        if (preset) {
          dispatch(setRawFlags(preset.flags));
        }
      }
      if (cachedSchema) {
        const parsed = JSON.parse(cachedSchema);
        setSchemaLocal(parsed);
        dispatch(setSchema(parsed));
      }
      if (cachedVersion) {
        setVersion(JSON.parse(cachedVersion));
      }
    } catch (e) {
      console.warn("Failed to parse cached metadata:", e);
    }

    // 2. Fetch fresh data in the background (Stale-While-Revalidate)
    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/presets`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        const normalized = normalizePresets(data);
        setPresets(normalized);
        localStorage.setItem("cached_presets", JSON.stringify(normalized));
        const preset = normalized["ultros league"];
        if (preset) {
          dispatch(setRawFlags(preset.flags));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch presets from API:", err);
        setPresets((prev) => prev || {});
      });

    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/metadata/flag`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        setSchemaLocal(data);
        localStorage.setItem("cached_schema", JSON.stringify(data));
        dispatch(setSchema(data));
      })
      .catch((err) => {
        console.warn("Failed to fetch flag metadata from API, trying fallback:", err);
        fetch("/metadata-fallback/flag.json")
          .then((res) => res.json())
          .then((data) => {
            setSchemaLocal(data);
            localStorage.setItem("cached_schema", JSON.stringify(data));
            dispatch(setSchema(data));
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback flag metadata:", fallbackErr);
          });
      });

    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/metadata/objective`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        setObjectives(data);
        localStorage.setItem("cached_objectives", JSON.stringify(data));
        dispatch(setObjectiveMetadata(data));
      })
      .catch((err) => {
        console.warn("Failed to fetch objective metadata from API, trying fallback:", err);
        fetch("/metadata-fallback/objective.json")
          .then((res) => res.json())
          .then((data) => {
            setObjectives(data);
            localStorage.setItem("cached_objectives", JSON.stringify(data));
            dispatch(setObjectiveMetadata(data));
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback objective metadata:", fallbackErr);
          });
      });

    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/wc`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        const fetchedVersion = data["version"];
        setVersion(fetchedVersion);
        localStorage.setItem("cached_version", JSON.stringify(fetchedVersion));
      })
      .catch((err) => {
        console.warn("Failed to fetch version from API, trying fallback:", err);
        fetch("/metadata-fallback/wc.json")
          .then((res) => res.json())
          .then((data) => {
            const fetchedVersion = data["version"];
            setVersion(fetchedVersion);
            localStorage.setItem("cached_version", JSON.stringify(fetchedVersion));
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback version:", fallbackErr);
          });
      });
  }, [dispatch]);

  if (objectives && presets && schema && version) {
    return (
      <FlagCreatePage
        objectives={objectives}
        presets={presets}
        schema={schema}
        version={version}
      />
    );
  } else {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white font-outfit text-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="animate-pulse">Loading Worlds Collide...</p>
        </div>
      </div>
    );
  }
};

export default HomeLandingPage;
