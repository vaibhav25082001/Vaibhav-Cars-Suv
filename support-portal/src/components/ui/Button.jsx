export default function Button({ children, className = "", variant = "gold", ...props }) {
  const style = variant === "ghost" ? "border border-vaibhav-gold/30 text-vaibhav-gold hover:bg-vaibhav-gold/10" : "btn-gold hover:brightness-110";
  return <button className={`rounded-lg px-4 py-2 text-sm transition disabled:opacity-50 ${style} ${className}`} {...props}>{children}</button>;
}
