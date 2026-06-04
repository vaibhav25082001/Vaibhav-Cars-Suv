export default function Card({ title, action, children, className = "" }) {
  return <section className={`glass rounded-xl p-5 shadow-gold ${className}`}>
    {(title || action) && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-vaibhav-gold">{title}</h2>{action}</div>}
    {children}
  </section>;
}
