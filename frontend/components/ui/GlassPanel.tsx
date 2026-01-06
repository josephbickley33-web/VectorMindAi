export function GlassPanel({ children, className }: any) {
  return (
    <div
      className={`p-4 rounded-xl bg-slate-950/40 border border-slate-800 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}
