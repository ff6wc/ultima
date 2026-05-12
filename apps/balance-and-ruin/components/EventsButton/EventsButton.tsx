import { ButtonLink } from "@ff6wc/ui";
import { cva } from "cva";
import { HiFlag } from "react-icons/hi";

const button = cva(["w-fit max-w-[500px] min-h-[50px] inline-flex items-center gap-3"]);

export const EventsButton = () => {
  return (
    <ButtonLink className={button()} href="/events" variant="primary">
      <HiFlag size={28} className="text-white" />
      <div className="flex flex-col items-start">
        <div className="font-bold">Events</div>
      </div>
    </ButtonLink>
  );
};
