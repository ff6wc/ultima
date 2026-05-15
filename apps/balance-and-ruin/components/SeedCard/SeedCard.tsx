import { cx } from "cva";
import first from "lodash/first";
import { useEffect, useRef, useState } from "react";
import { base64ToByteArray } from "~/utils/base64ToByteArray";
import { isValidROM, removeHeader } from "~/utils/romUtils";
import { XDelta3Decoder } from "~/utils/xdelta3_decoder";
import JSZip from "jszip";
import { GenerateUpload } from "~/components/GenerateUpload/GenerateUpload";
import styles from "~/components/GenerateCard/GenerateCard.module.css";

export type SeedData = {
  created_at: number;
  created_by: string | null;
  description: string | null;
  flags: string;
  filename: string;
  hash: string;
  log: string;
  patch: string;
  seed_id: string;
  url: string;
  version: string;
};

export type SeedCardProps = {
  className?: string;
  seed: SeedData;
};

export const SeedCard = ({ className, seed }: SeedCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [romData, setRomData] = useState<string | null>(null);
  const [romName, setRomName] = useState("");
  const [romSelectError, setRomSelectError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasRomData = Boolean(romData);

  const ext = romName.slice(romName.length - 7, romName.length);
  const displayRomName = !romName
    ? ""
    : romName.length > 20
      ? romName.slice(0, 8).concat("...", ext)
      : romName;

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    const savedRomData = localStorage.getItem("rom_data");
    const savedRomName = localStorage.getItem("rom_name");

    if (savedRomData) {
      setRomData(savedRomData);
      setSuccess(true);
    }

    if (savedRomName) {
      setRomName(savedRomName);
    }
  }, [inputRef]);

  const generate = async () => {
    const { filename, patch, seed_id, log } = seed;
    const rom = romData as string;

    const patched = XDelta3Decoder.decode(
      base64ToByteArray(patch as string),
      base64ToByteArray(rom),
    );

    const jsz = new JSZip();
    let zip = jsz.file(`${filename}.smc`, patched, { binary: true });
    zip = jsz.file(`${filename}.txt`, log);
    zip.generateAsync({ type: "blob" }).then((content) => {
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(content);
      link.download = `${filename}.zip`;
      link.click();
    });
  };

  const clearRomValues = () => {
    localStorage.removeItem("rom_name");
    localStorage.removeItem("rom_data");
    setRomName("");
    setRomData(null);
    setSuccess(false);
    setRomSelectError(null);
  };

  const onRomSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = first(e.target.files);
    const reader = new FileReader();
    if (file) {
      reader.onload = async function () {
        let rom_data = new Uint8Array(reader.result as ArrayBuffer);
        rom_data = await removeHeader(rom_data);

        let result = await isValidROM(rom_data);
        if (!result.success) {
          setRomSelectError(`${result.message}`);
          return;
        }

        let data_string = "";
        let data_length = rom_data.byteLength;

        for (let i = 0; i < data_length; i++) {
          data_string += String.fromCharCode(rom_data[i]);
        }

        data_string = btoa(data_string);

        setSuccess(true);
        setRomSelectError(null);

        try {
          localStorage.setItem("rom_data", data_string);
          localStorage.setItem("rom_name", file.name);
          setRomData(data_string);
          setRomName(file.name);
        } catch (e) {
          return;
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className={cx(styles.container, className)}>
      <h2 className={styles.title}>Generate Your ROM</h2>

      <div className={styles.stepContainer}>
        <h3 className={styles.stepTitle}>
          Step 1: Verify the following flags and seed above are correct
        </h3>
        <textarea
          className={styles.textarea}
          readOnly
          value={seed.flags}
          placeholder="Selected flags will appear here..."
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.stepContainer}>
        <h3 className={styles.stepTitle}>Step 2: Provide Base ROM</h3>
        <GenerateUpload
          clearRomValues={clearRomValues}
          hasRomData={hasRomData}
          romName={romName}
          shortRomName={displayRomName}
          error={romSelectError}
          inputRef={inputRef}
          onRomSelect={onRomSelect}
          success={success}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.stepContainer}>
        <h3 className={styles.stepTitle}>Step 3: Click Generate!</h3>
        
        {!hasRomData && (
          <span className={styles.helperText}>
            This button will be disabled until a valid ROM is selected.
          </span>
        )}

        <button
          className={styles.generateButton}
          disabled={!hasRomData}
          onClick={generate}
        >
          Generate ROM
        </button>
      </div>
    </div>
  );
};

