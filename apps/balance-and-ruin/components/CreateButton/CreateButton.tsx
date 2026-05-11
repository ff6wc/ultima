import { ButtonLink } from "@ff6wc/ui";
import { cva } from "cva";
import { HiSparkles } from "react-icons/hi";

const button = cva(["w-fit max-w-[500px] min-h-[70px] inline-flex items-center gap-4"]);

export const CreateButton = () => {
  return (
    <ButtonLink className={button()} href="/create" variant="primary">
      <HiSparkles size={36} className="text-white-400" />
      <div className="flex flex-col items-start">
        <div className="font-bold">Create</div>
      </div>
    </ButtonLink>
  );
};
