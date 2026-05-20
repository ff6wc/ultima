import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { FlagCreatePage } from "~/components/FlagCreatePage/FlagCreatePage";
import { setRawFlags } from "~/state/flagSlice";
import { setObjectiveMetadata } from "~/state/objectiveSlice";
import { RawFlagMetadata, setSchema } from "~/state/schemaSlice";
import { makeStore } from "~/state/store";
import { ObjectiveMetadata } from "~/types/objectives";
import { FlagPreset } from "~/types/preset";
import { fetchWithTimeout } from "~/utils/fetchWithTimeout";

export type PageProps = {
  objectives: ObjectiveMetadata;
  presets: Record<string, FlagPreset>;
  schema: Record<string, RawFlagMetadata>;
};

const Create = () => {
  const [objectives, setObjectives] = useState(null);
  const [presets, setPresets] = useState(null);
  const [schema, setSchemaLocal] = useState(null);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    const store = makeStore();

    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/presets`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
        // TODO: figure out why this isn't having the desired effect -- it's defaulting to the startingFlags in flagSlice.ts -- a race condition?
        const preset = data["ultros league"];
        if (preset) {
          store.dispatch(setRawFlags(preset.flags));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch presets from API, trying fallback:", err);
        fetch("/metadata-fallback/presets.json")
          .then((res) => res.json())
          .then((data) => {
            setPresets(data);
            const preset = data["ultros league"];
            if (preset) {
              store.dispatch(setRawFlags(preset.flags));
            }
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback presets:", fallbackErr);
            setPresets({});
          });
      });

    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/metadata/flag`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        setSchemaLocal(data);
        store.dispatch(setSchema(data));
      })
      .catch((err) => {
        console.warn("Failed to fetch flag metadata from API, trying fallback:", err);
        fetch("/metadata-fallback/flag.json")
          .then((res) => res.json())
          .then((data) => {
            setSchemaLocal(data);
            store.dispatch(setSchema(data));
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback flag metadata:", fallbackErr);
          });
      });

    fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/metadata/objective`, {}, 2500)
      .then((res) => res.json())
      .then((data) => {
        setObjectives(data);
        store.dispatch(setObjectiveMetadata(data));
      })
      .catch((err) => {
        console.warn("Failed to fetch objective metadata from API, trying fallback:", err);
        fetch("/metadata-fallback/objective.json")
          .then((res) => res.json())
          .then((data) => {
            setObjectives(data);
            store.dispatch(setObjectiveMetadata(data));
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
      })
      .catch((err) => {
        console.warn("Failed to fetch version from API, trying fallback:", err);
        fetch("/metadata-fallback/wc.json")
          .then((res) => res.json())
          .then((data) => {
            const fetchedVersion = data["version"];
            setVersion(fetchedVersion);
          })
          .catch((fallbackErr) => {
            console.error("Failed to fetch fallback version:", fallbackErr);
          });
      });
  }, []);

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
    return <p>Loading...</p>;
  }
};

export default Create;
