import { cx } from "cva";
import styles from "./Button.module.css";

type BaseButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const buttonStyles = ({ disabled, size = 'default', variant = 'default', className }: { disabled?: boolean | null, size?: 'default' | 'small' | 'smallest' | null, variant?: 'default' | 'primary' | 'danger' | 'discord' | 'outline' | null, className?: string | null }) => {
  return cx(
    styles.button,
    disabled && styles.disabled,
    size === 'default' && styles.sizeDefault,
    size === 'small' && styles.sizeSmall,
    size === 'smallest' && styles.sizeSmallest,
    variant === 'default' && styles.variantDefault,
    variant === 'primary' && styles.variantPrimary,
    variant === 'danger' && styles.variantDanger,
    variant === 'discord' && styles.variantDiscord,
    variant === 'outline' && styles.variantOutline,
    className
  );
};

export type ButtonProps = BaseButtonProps & {
  children: React.ReactNode;
  size?: 'default' | 'small' | 'smallest';
  variant?: 'default' | 'primary' | 'danger' | 'discord' | 'outline';
};

export const Button = ({
  children,
  className,
  disabled,
  size,
  variant,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={buttonStyles({ disabled, size, variant, className })}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
