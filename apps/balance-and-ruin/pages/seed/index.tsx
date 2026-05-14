import { useEffect, useState } from "react";
import { FlagCreatePage } from "~/components/FlagCreatePage/FlagCreatePage";
import { setObjectiveMetadata } from "~/state/objectiveSlice";
import { setSchema } from "~/state/schemaSlice";
import { makeStore } from "~/state/store";

const SeedDetailsPage = () => {
  const [objectives, setObjectives] = useState(null);
  const [presets, setPresets] = useState(null);
  const [schema, setSchemaLocal] = useState(null);
  const [version, setVersion] = useState(null);
  const [seedId, setSeedId] = useState<string | null>(null);

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const seedIdParam = queryParameters.get("id");
    if (seedIdParam) {
      setSeedId(seedIdParam);
    }

    const store = makeStore();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/presets`)
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
      })
      .catch((err) => {
        console.warn("Failed to fetch presets:", err);
        setPresets({});
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metadata/flag`)
      .then((res) => res.json())
      .then((data) => {
        setSchemaLocal(data);
        store.dispatch(setSchema(data));
      })
      .catch((err) => {
        console.error("Failed to fetch flag metadata:", err);
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metadata/objective`)
      .then((res) => res.json())
      .then((data) => {
        setObjectives(data);
        store.dispatch(setObjectiveMetadata(data));
      })
      .catch((err) => {
        console.error("Failed to fetch objective metadata:", err);
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wc`)
      .then((res) => res.json())
      .then((data) => {
        const fetchedVersion = data["version"];
        setVersion(fetchedVersion);
      })
      .catch((err) => {
        console.error("Failed to fetch version:", err);
      });
  }, []);

  if (objectives && presets && schema && version && seedId) {
    return (
      <FlagCreatePage
        objectives={objectives}
        presets={presets}
        schema={schema}
        version={version}
        activeSeedId={seedId}
      />
    );
  } else if (seedId === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        <p className="p-6 bg-red-500/10 border border-red-500 text-red-400 rounded-lg font-medium">
          No seed ID provided in the URL query parameters (?id=XYZ).
        </p>
      </div>
    );
  } else {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-slate-300">
        <p className="text-lg font-medium animate-pulse">
          Loading Seed Details Frame...
        </p>
      </div>
    );
  }
};

export default SeedDetailsPage;
