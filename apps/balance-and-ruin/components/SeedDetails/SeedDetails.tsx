import { useEffect, useState } from "react";
import { Button, Card } from "@ff6wc/ui";
import { HiClipboardCopy, HiCheck } from "react-icons/hi";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { SeedCard, SeedData } from "~/components/SeedCard/SeedCard";

export type SeedDetailsProps = {
  seedId: string;
};

export const SeedDetails = ({ seedId }: SeedDetailsProps) => {
  const [seed, setSeed] = useState<SeedData | null>(null);
  const [logWithFlags, setLogWithFlags] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (seed?.flags) {
      navigator.clipboard.writeText(seed.flags);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Flags Used
              </h3>
              <div className="flex flex-col gap-3 w-full">
                <textarea
                  className="w-full min-h-[150px] max-h-[300px] p-4 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg font-mono text-[0.9rem] text-[var(--text-input)] resize-y leading-relaxed focus:outline-none select-all shadow-inner"
                  readOnly
                  value={seed.flags}
                />
                <div className="flex justify-end mt-1">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className={`whitespace-nowrap flex items-center gap-2 transition-all duration-200 px-6 py-2 ${
                      copied
                        ? "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10"
                        : ""
                    }`}
                  >
                    {copied ? (
                      <HiCheck size={18} />
                    ) : (
                      <HiClipboardCopy size={18} />
                    )}
                    <span>{copied ? "Copied!" : "Copy Flags"}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardColumn>
      </Card>

      {seed && <SeedCard seed={seed} />}
    </div>
  );
};
