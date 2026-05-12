import { Link } from "../Link/Link";
import Image from "next/image";
import { buttonStyles } from "../Button/Button";
import { DISCORD_URL } from "@ff6wc/utils/constants";
import { cva } from "cva";

const button = cva(["w-fit max-w-[500px] min-h-[50px] inline-flex items-center justify-center px-4"]);
export const DiscordButton = ({ href = DISCORD_URL }: { href?: string }) => {
  return (
    <Link
      className={buttonStyles({
        className: button(),
        variant: "discord",
      })}
      href={href}
      target="_blank"
    >
      <Image
        alt="Join our Discord community"
        src="/discordwhite.svg"
        width={116}
        height={45}
      />
    </Link>
  );
};
