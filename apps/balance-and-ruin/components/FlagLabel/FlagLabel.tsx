import { InputLabel } from "~/components/InputLabel/InputLabel";
import { HelperText } from "@ff6wc/ui";

export type FlagLabelProps = {
  helperText: React.ReactNode;
  flag: string;
  label: React.ReactNode;
  hideFlag?: boolean;
  className?: string;
  ghosts?: React.ReactNode[];
};

export const FlagLabel = ({
  helperText,
  flag,
  label,
  hideFlag,
  className = "",
  ghosts = [],
}: FlagLabelProps) => {
  return (
    <div className={`flex-grow wrap ${className}`}>
      <InputLabel flag={flag} htmlFor={flag} hideFlag={hideFlag}>
        {label}
      </InputLabel>
      <div className="grid">
        {ghosts.map((ghost, idx) => (
          <div
            key={idx}
            className="invisible row-start-1 col-start-1 pointer-events-none"
            aria-hidden="true"
          >
            <HelperText>{ghost}</HelperText>
          </div>
        ))}
        <div className="row-start-1 col-start-1">
          <HelperText>{helperText}</HelperText>
        </div>
      </div>
    </div>
  );
};
