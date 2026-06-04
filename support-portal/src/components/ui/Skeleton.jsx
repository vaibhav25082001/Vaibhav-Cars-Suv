export default function Skeleton({ rows = 3 }) {
  return <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-white/10" />)}</div>;
}
