export default function EmptyState({ title = "Nothing here yet", message = "Data will appear once records are available." }) {
  return <div className="rounded-xl border border-dashed border-vaibhav-gold/30 p-8 text-center text-white/70"><p className="font-bold text-vaibhav-gold">{title}</p><p className="mt-2 text-sm">{message}</p></div>;
}
