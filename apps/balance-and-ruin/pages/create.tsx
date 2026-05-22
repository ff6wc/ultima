import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FlagCreatePage } from "~/components/FlagCreatePage/FlagCreatePage";
import { setRawFlags } from "~/state/flagSlice";
import { setRawObjectives } from "~/state/objectiveSlice";
import { setRawStartingItems } from "~/state/itemSlice";
import { setObjectiveMetadata } from "~/state/objectiveSlice";
import { RawFlagMetadata, setSchema } from "~/state/schemaSlice";
import { ObjectiveMetadata } from "~/types/objectives";
import { FlagPreset } from "~/types/preset";
import { fetchWithTimeout } from "~/utils/fetchWithTimeout";
import { normalizePresets } from "~/utils/presets";
import fallbackFlag from "~/public/metadata-fallback/flag.json";
import fallbackObjective from "~/public/metadata-fallback/objective.json";
import fallbackWc from "~/public/metadata-fallback/wc.json";
import fallbackPresets from "~/public/metadata-fallback/presets.json";


export type PageProps = {
  objectives: ObjectiveMetadata;
  presets: Record<string, FlagPreset>;
  schema: Record<string, RawFlagMetadata>;
};

const DecodeB64QueryStringParam  = (param: string) => {
  let base64 = param.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if necessary
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const buf = Buffer.from(base64, "base64")
  return buf.toString("utf-8")
}

const Create = () => {
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);
  const [objectives, setObjectives] = useState<ObjectiveMetadata>(fallbackObjective as any);
  const [presets, setPresets] = useState<Record<string, FlagPreset>>(normalizePresets(fallbackPresets));
  const [schema, setSchemaLocal] = useState<Record<string, RawFlagMetadata>>(fallbackFlag as any);
  const [version, setVersion] = useState<string>((fallbackWc as any).version || "1.4.3d");

  useEffect(() => {
    setIsMounted(true);
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
        console.warn("Failed to fetch presets from API, trying fallback fetch:", err);
        fetch("/metadata-fallback/presets.json")
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
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback presets:", fallbackErr);
            setPresets((prev) => prev || {});
          });
      });

    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/metadata/flag`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        setSchemaLocal(data);
        localStorage.setItem("cached_schema", JSON.stringify(data));
        dispatch(setSchema(data));
      })
      .catch((err) => {
        console.warn("Failed to fetch flag metadata from API, trying fallback fetch:", err);
        fetch("/metadata-fallback/flag.json")
          .then((res) => res.json())
          .then((data) => {
            setSchemaLocal(data);
            localStorage.setItem("cached_schema", JSON.stringify(data));
            dispatch(setSchema(data));
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback flag metadata, using hardcoded fallback:", fallbackErr);
            setSchemaLocal(fallbackFlag as any);
            localStorage.setItem("cached_schema", JSON.stringify(fallbackFlag));
            dispatch(setSchema(fallbackFlag as any));
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
        console.warn("Failed to fetch objective metadata from API, trying fallback fetch:", err);
        fetch("/metadata-fallback/objective.json")
          .then((res) => res.json())
          .then((data) => {
            setObjectives(data);
            localStorage.setItem("cached_objectives", JSON.stringify(data));
            dispatch(setObjectiveMetadata(data));
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback objective metadata, using hardcoded fallback:", fallbackErr);
            setObjectives(fallbackObjective as any);
            localStorage.setItem("cached_objectives", JSON.stringify(fallbackObjective));
            dispatch(setObjectiveMetadata(fallbackObjective as any));
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
        console.warn("Failed to fetch version from API, trying fallback fetch:", err);
        fetch("/metadata-fallback/wc.json")
          .then((res) => res.json())
          .then((data) => {
            const fetchedVersion = data["version"];
            setVersion(fetchedVersion);
            localStorage.setItem("cached_version", JSON.stringify(fetchedVersion));
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback version, using hardcoded fallback:", fallbackErr);
            const fetchedVersion = (fallbackWc as any).version || "1.4.3d";
            setVersion(fetchedVersion);
            localStorage.setItem("cached_version", JSON.stringify(fetchedVersion));
          });
      });

  }, [dispatch]);

  if (isMounted && objectives && presets && schema && version) {
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

export default Create;
