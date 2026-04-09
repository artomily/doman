type BadgeVariant = "safe" | "warning" | "danger" | "unknown";

const variants: Record<BadgeVariant, string> = {
  safe: "bg-green-500/20 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  danger: "bg-red-500/20 text-red-400 border-red-500/30",
  unknown: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export function Badge({
  variant = "unknown",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function TrustScoreBadge({
  score,
  className = "",
}: {
  score: number;
  className?: string;
}) {
  const variant: BadgeVariant =
    score >= 70 ? "safe" : score >= 40 ? "warning" : "danger";
  const label = score >= 70 ? "Safe" : score >= 40 ? "Caution" : "Danger";

  return (
    <Badge variant={variant} className={className}>
      {score}/100 · {label}
    </Badge>
  );
}
