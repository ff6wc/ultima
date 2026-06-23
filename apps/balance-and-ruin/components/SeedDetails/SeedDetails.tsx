import { useEffect, useRef, useState } from "react";
import { Card } from "@ff6wc/ui";
import { HiClipboardCopy, HiCheck, HiPlay } from "react-icons/hi";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { SeedData } from "~/components/SeedCard/SeedCard";
import first from "lodash/first";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import useSWRMutation from "swr/mutation";
import JSZip from "jszip";
import { useAppSession } from "~/hooks/useAppSession";
import { ArchipelagoYamlModal } from "~/components/ArchipelagoYamlModal/ArchipelagoYamlModal";
import { getGeneratingHtml } from "~/utils/generatingHtml";

export type SeedDetailsProps = {
  seedId: string;
};

type GenerateResponse = {
  filename: string;
  patch: string;
  seed_id: string;
  log: string;
};

export const SeedDetails = ({ seedId }: SeedDetailsProps) => {
  const [seed, setSeed] = useState<SeedData | null>(null);
  const [logWithFlags, setLogWithFlags] = useState("");
  const [copied, setCopied] = useState(false);
  const { data: session } = useAppSession();
  const [isArchipelagoModalOpen, setIsArchipelagoModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [romData, setRomData] = useState<string | null>(null);
  const [romName, setRomName] = useState("");
  const [errorState, setErrorState] = useState<string | null>(null);
  const [romSelectError, setRomSelectError] = useState<string | null>(null);
  const [isGeneratingExact, setIsGeneratingExact] = useState(false);

  const autoRollRef = useRef(false);

  const ext = romName.slice(romName.length - 7, romName.length);
  const displayRomName = !romName
    ? ""
    : romName.length > 20
      ? romName.slice(0, 8).concat("...", ext)
      : romName;

  const { executeRecaptcha } = useGoogleReCaptcha();

  // Pre-load ROM data cached in local storage
  useEffect(() => {
    const savedRomData = localStorage.getItem("rom_data");
    const savedRomName = localStorage.getItem("rom_name");
    if (savedRomData) {
      setRomData(savedRomData);
    }
    if (savedRomName) {
      setRomName(savedRomName);
    }
  }, []);

  const handleCopy = () => {
    if (seed?.flags) {
      navigator.clipboard.writeText(seed.flags);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearRomValues = () => {
    localStorage.removeItem("rom_name");
    localStorage.removeItem("rom_data");
    setRomName("");
    setRomData(null);
    setRomSelectError(null);
  };

  useEffect(() => {
    if (seedId) {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/seed/ff6wc/${seedId}`;
      fetch(url)
        .then((res) => res.json())
        .then(({ data: seed, errors }) => {
          if (seed) {
            setSeed(seed);
            setLogWithFlags(seed.log);
          } else {
            setLogWithFlags(`Error retrieving seed: ${errors}`);
          }
        });
    } else {
      setLogWithFlags("No id given.");
    }
  }, [seedId]);

  // API mutation definition for rolling a brand new seed
  const { trigger, isMutating } = useSWRMutation(
    ["/api/generate", seed?.flags],
    async (key, { arg }) => {
      const { flags, reCAPTCHA } = arg;
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate`,
        {
          body: JSON.stringify({ reCAPTCHA, flags }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      if (result.status !== 200) {
        const error = await result.text();
        throw new Error(`Error generating seed: ${error}`);
      }

      const data = await result.json();
      return data as GenerateResponse;
    },
  );

  const rollNewSeed = async (currentRomData: string) => {
    if (!seed?.flags || isMutating) {
      return;
    }
    setErrorState(null);

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(
        getGeneratingHtml(process.env.NEXT_PUBLIC_API_URL || ""),
      );
      newWindow.document.close();
    }

    let reCAPTCHA: string | null = null;
    try {
      if (!executeRecaptcha) {
        throw new Error(
          "reCAPTCHA validation engine is not loaded. Please check for script blockages.",
        );
      }
      reCAPTCHA = await executeRecaptcha("generate_seed");
      if (!reCAPTCHA) {
        throw new Error("Could not extract recaptcha confirmation payload.");
      }
    } catch (e) {
      if (newWindow) newWindow.close();
      setErrorState(
        `Validation Error: ${(e as Error).message || "Failed to verify recaptcha."}`,
      );
      return;
    }

    try {
      const generateResult = await trigger({ flags: seed.flags, reCAPTCHA });
      if (!generateResult) {
        throw new Error(
          "Generate script finished without producing a payload.",
        );
      }

      const { filename, patch, seed_id, log } = generateResult;

      const [{ XDelta3Decoder }, { base64ToByteArray }, { applyInGameConfig }] =
        await Promise.all([
          import("~/utils/xdelta3_decoder"),
          import("~/utils/base64ToByteArray"),
          import("~/utils/romUtils"),
        ]);

      // Perform standard base ROM patching stream using standard decoder logic
      const patched = XDelta3Decoder.decode(
        base64ToByteArray(patch),
        base64ToByteArray(currentRomData),
      );

      applyInGameConfig(patched);

      // Zip the components and release as file attachment stream
      const jsz = new JSZip();
      let zip = jsz.file(`${filename}.smc`, patched, { binary: true });
      zip = jsz.file(`${filename}.txt`, log);
      await zip.generateAsync({ type: "blob" }).then((content) => {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(content);
        link.download = `${filename}.zip`;
        link.click();
      });

      // Record seed in seedlist database
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const host =
          typeof window !== "undefined" ? window.location.hostname : "";
        const serverName =
          host === "ff6worldscollide.com"
            ? "ff6worldscollide.com"
            : "dev.ff6worldscollide.com";
        const shareUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/seed/?id=${seed_id}`
            : "";

        fetch(`${BACKEND_URL}/api/v1/seedlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            seed_type: (seed as any)?.seed_type || "ff6wc",
            share_url: shareUrl,
            server_name: serverName,
            flagstring: seed.flags,
          }),
        }).catch((err) =>
          console.error("Failed to record seed to seedlist database:", err),
        );
      } catch (e) {
        console.error("Failed to record seed to seedlist:", e);
      }

      // Pop out to the resulting seed details route natively
      if (newWindow) {
        newWindow.location.href = `/seed/?id=${seed_id}`;
      } else {
        window.open(`/seed/?id=${seed_id}`, "_blank");
      }
    } catch (err) {
      if (newWindow) newWindow.close();
      setErrorState((err as Error).message);
    }
  };

  const executeGenerateExact = async (currentRomData: string) => {
    if (!seed || isGeneratingExact) {
      return;
    }
    setIsGeneratingExact(true);
    setRomSelectError(null);

    try {
      const { filename, patch, log } = seed;

      const [{ XDelta3Decoder }, { base64ToByteArray }, { applyInGameConfig }] =
        await Promise.all([
          import("~/utils/xdelta3_decoder"),
          import("~/utils/base64ToByteArray"),
          import("~/utils/romUtils"),
        ]);

      // Perform standard base ROM patching stream using standard decoder logic
      const patched = XDelta3Decoder.decode(
        base64ToByteArray(patch as string),
        base64ToByteArray(currentRomData),
      );

      applyInGameConfig(patched);

      // Zip the components and release as file attachment stream
      const jsz = new JSZip();
      let zip = jsz.file(`${filename}.smc`, patched, { binary: true });
      zip = jsz.file(`${filename}.txt`, log);
      await zip.generateAsync({ type: "blob" }).then((content) => {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(content);
        link.download = `${filename}.zip`;
        link.click();
      });
    } catch (err) {
      setRomSelectError((err as Error).message);
    } finally {
      setIsGeneratingExact(false);
    }
  };

  const handleGenerateClick = () => {
    if (romData) {
      rollNewSeed(romData);
    } else {
      autoRollRef.current = true;
      inputRef.current?.click();
    }
  };

  const handleGenerateExactClick = () => {
    if (romData) {
      executeGenerateExact(romData);
    } else {
      inputRef.current?.click();
    }
  };

  const onRomSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = first(e.target.files);
    const reader = new FileReader();
    if (file) {
      reader.onload = async function () {
        let rom_data = new Uint8Array(reader.result as ArrayBuffer);
        const { removeHeader, isValidROM } = await import("~/utils/romUtils");
        rom_data = await removeHeader(rom_data);

        let result = await isValidROM(rom_data);
        if (!result.success) {
          setRomSelectError(`${result.message}`);
          autoRollRef.current = false;
          return;
        }

        let data_string = "";
        let data_length = rom_data.byteLength;

        for (let i = 0; i < data_length; i++) {
          data_string += String.fromCharCode(rom_data[i]);
        }

        data_string = btoa(data_string);
        setRomSelectError(null);

        try {
          localStorage.setItem("rom_data", data_string);
          localStorage.setItem("rom_name", file.name);
          setRomData(data_string);
          setRomName(file.name);

          // If the user clicked "Generate (New Seed)" without a ROM, automatically trigger rolling it.
          if (autoRollRef.current) {
            autoRollRef.current = false;
            await rollNewSeed(data_string);
          }
        } catch (e) {
          return;
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="w-full shadow-lg" title={"Log"}>
        <CardColumn>
          <textarea
            className="w-full min-h-[400px] max-h-[900px] p-6 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg font-mono text-[0.9rem] text-[var(--text-input)] resize-y leading-relaxed focus:outline-none select-all col-span-full shadow-inner overflow-y-auto"
            readOnly
            value={logWithFlags ? logWithFlags : "Loading..."}
          />

          {seed && (
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700 flex flex-col gap-3 w-full col-span-full">
              <div className="flex justify-between items-center w-full">
                <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Flags Used
                </h3>
                <button
                  onClick={handleCopy}
                  className={`whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-200 px-4 py-1.5 rounded-lg font-semibold font-sans text-xs border shadow-sm outline-none select-none active:scale-[0.98] ${
                    copied
                      ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-100"
                      : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {copied ? (
                    <HiCheck size={14} className="text-green-600" />
                  ) : (
                    <HiClipboardCopy
                      size={14}
                      className="text-slate-600 dark:text-slate-300"
                    />
                  )}
                  <span>{copied ? "Copied!" : "Copy Flags"}</span>
                </button>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <textarea
                  className="w-full min-h-[150px] max-h-[300px] p-4 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg font-mono text-[0.9rem] text-[var(--text-input)] resize-y leading-relaxed focus:outline-none select-all shadow-inner"
                  readOnly
                  value={seed.flags}
                />
              </div>
            </div>
          )}
        </CardColumn>
      </Card>

      {seed && (
        <Card className="w-full shadow-lg" title={"Generate"}>
          <CardColumn>
            <div className="flex flex-col gap-4 w-full col-span-full">
              {/* Step 1 */}
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Step 1: Verify the flags and seed above are correct
                </h4>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 w-full" />

              {/* Step 2 */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Step 2: Select v1.0 US ROM file by clicking the input below
                </h4>

                {romData ? (
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 bg-slate-50 dark:bg-slate-800/40 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                      Valid ROM
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300 flex-grow">
                      ROM named{" "}
                      <strong
                        className="font-mono underline text-slate-800 dark:text-white font-medium"
                        title={romName}
                      >
                        {displayRomName}
                      </strong>{" "}
                      was previously uploaded and validated. To select another
                      ROM, click Clear ROM.
                    </span>
                    <button
                      onClick={clearRomValues}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors active:scale-95 shadow-sm"
                    >
                      ✕ Clear ROM
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-slate-50 dark:bg-slate-800/40 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Waiting for ROM upload
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                        Once you have selected a valid ROM it will be reused for
                        future visits.
                      </span>
                    </div>
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="w-fit whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-200 px-4 py-2 rounded-lg font-bold font-sans text-xs text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm outline-none select-none"
                    >
                      Upload v1.0 US ROM file
                    </button>
                  </div>
                )}
                {romSelectError && (
                  <div className="text-red-500 dark:text-red-400 font-medium text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mt-1 self-start font-sans">
                    {romSelectError}
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 w-full" />

              {/* Step 3 */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Step 3: Click Generate!
                </h4>
                <div className="flex justify-between items-center flex-wrap gap-4 mt-1">
                  {/* Exact Generate Button */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleGenerateExactClick}
                      disabled={!romData || isGeneratingExact}
                      className="whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-200 px-8 py-3 rounded-lg font-bold font-sans text-base text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 dark:disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md outline-none select-none"
                    >
                      {isGeneratingExact ? "Generating..." : "Generate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsArchipelagoModalOpen(true)}
                      className="whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-200 px-6 py-3 rounded-lg font-bold font-sans text-base border border-indigo-500/50 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 active:scale-[0.98] shadow-md outline-none select-none"
                    >
                      Generate Archipelago YAML
                    </button>
                  </div>

                  {/* Copy Flags & New Seed Buttons (Right-aligned) */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {errorState && (
                      <span className="text-xs font-medium text-red-500 dark:text-red-400 bg-red-500/5 px-3 py-1.5 rounded border border-red-500/10">
                        {errorState}
                      </span>
                    )}

                    <button
                      onClick={handleGenerateClick}
                      disabled={isMutating}
                      className="whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-200 px-5 py-2.5 rounded-lg font-bold font-sans text-sm text-white bg-[#2c3859] hover:bg-[#1e293b] active:scale-[0.98] shadow-sm outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiPlay size={18} />
                      <span>
                        {isMutating ? "Rolling..." : "Roll Another Seed"}
                      </span>
                    </button>

                    <input
                      className="hidden"
                      id="rom_file_picker_inline"
                      ref={inputRef}
                      name="rom"
                      onChange={onRomSelect}
                      type="file"
                      accept=".smc,.sfc"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardColumn>
        </Card>
      )}
      <ArchipelagoYamlModal
        isOpen={isArchipelagoModalOpen}
        onClose={() => setIsArchipelagoModalOpen(false)}
        flags={seed?.flags || ""}
        presetName={seed?.seed_type || "ff6wc"}
        userName={session?.user?.name}
      />
    </div>
  );
};
