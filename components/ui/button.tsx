import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.4)] transition-shadow",
  secondary:
    "border border-card-border text-foreground hover:bg-surface hover:border-accent/40",
  ghost: "text-muted hover:text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full transition-colors ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return <a className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  }

  return <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
