import Head from "next/head";
import { useEffect, useState } from "react";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { Footer } from "~/components/Footer/Footer";
import { Button, Card, CodeBlock, Input } from "@ff6wc/ui";
import { SeedCard, SeedData } from "~/components/SeedCard/SeedCard";
import { AppHeader } from "~/components/AppHeader/AppHeader";
import { HiClipboardCopy, HiCheck } from "react-icons/hi";

const REMOVE_FLAGS_FROM_LOG_REGEX = /\nFlags.+\n/g;

const SeedId = () => {
  const [seed, setSeed] = useState<SeedData | null>(null);
  const [logWithFlags, setLogWithFlags] = useState("");
  const [seedId, setSeedId] = useState("");
  const [copied, setCopied] = useState(false);
  const title = `FF6WC seed ${seedId}`;

  const handleCopy = () => {
    if (seed?.flags) {
      navigator.clipboard.writeText(seed.flags);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const seedIdParam = queryParameters.get("id");
    if (seedIdParam) {
      setSeedId(seedIdParam);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/seed/ff6wc/${seedIdParam}`;
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
      setLogWithFlags(
        "No id given; access this page with ?id=XYZ (where XYZ is a generated seed id)",
      );
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppHeader />
      <div className="flex flex-col gap-6 items-center px-12 py-6">
        <Card className="max-w-[1260px] w-full" title={"Log"}>
          <CardColumn>
            <CodeBlock className="!max-h-[900px] overflow-y-auto w-full col-span-full">
              {logWithFlags ? logWithFlags : "Loading..."}
            </CodeBlock>

            {seed && (
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-col gap-2 w-full col-span-full">
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Flags Used
                </h3>
                <div className="flex flex-row items-center gap-4 w-full">
                  <div className="flex-1">
                    <Input
                      className="font-mono text-xs w-full"
                      readOnly
                      value={seed.flags}
                      onChange={() => {}}
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className={`whitespace-nowrap flex items-center gap-2 transition-all duration-200 ${
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
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardColumn>
        </Card>

        {seed && <SeedCard seed={seed} />}
      </div>
      <Footer />
    </>
  );
};

export default SeedId;
