export function Card({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-card-border bg-card p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
