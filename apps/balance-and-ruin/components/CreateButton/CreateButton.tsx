import { ButtonLink } from "@ff6wc/ui";
import { cva } from "cva";
import { HiSparkles } from "react-icons/hi";

const button = cva(["w-fit max-w-[500px] min-h-[50px] inline-flex items-center gap-3"]);

export const CreateButton = () => {
  return (
    <ButtonLink className={button()} href="/create" variant="primary">
      <HiSparkles size={28} className="text-white" />
      <div className="flex flex-col items-start">
        <div className="font-bold">Create</div>
      </div>
    </ButtonLink>
  );
};
