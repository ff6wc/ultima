import { ButtonLink } from "@ff6wc/ui";
import { cva } from "cva";
import { HiCalendar } from "react-icons/hi";

const button = cva(["w-fit max-w-[500px] min-h-[50px] inline-flex items-center gap-3"]);

export const SotwButton = ({}: {}) => {
  return (
    <ButtonLink className={button()} href="/sotw" variant="primary">
      <HiCalendar size={28} className="text-white" />
      <div className="flex flex-col items-start">
        <div className="font-bold">Seed of the Week</div>
      </div>
    </ButtonLink>
  );
};
