import { useSelector } from "react-redux";
import { selectShowFlags } from "~/state/settingsSlice";
import { EMPTY_FLAG_VALUE } from "~/state/flagSlice";

export type InputLabelProps = {
  children: React.ReactNode;
  /** name of input */
  htmlFor: string;
  flag?: string;
} & React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>;

export const InputLabel = ({ children, htmlFor, flag, ...rest }: InputLabelProps) => {
  const showFlags = useSelector(selectShowFlags);
  const hasValidFlag = flag && flag !== EMPTY_FLAG_VALUE;

  return (
    <h4 className="text-sm font-medium flex items-baseline">
      <label {...rest} htmlFor={htmlFor}>
        {children}
        {showFlags && hasValidFlag && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">
            ({flag})
          </span>
        )}
      </label>
    </h4>
  );
};
