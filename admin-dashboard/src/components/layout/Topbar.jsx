import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";

export default function Topbar() {
  const { user, logout } = useAuth();
  return <header className="sticky top-0 z-20 border-b border-vaibhav-gold/20 bg-black/80 px-4 py-3 backdrop-blur">
    <div className="flex items-center justify-between">
      <div><p className="font-bold text-vaibhav-gold">VAIBHAV</p><p className="text-xs text-white/50">Premium operations console</p></div>
      <div className="flex items-center gap-3"><span className="text-sm text-white/70">{user?.name || user?.email || "Guest"}</span>{user && <Button variant="ghost" onClick={logout}>Logout</Button>}</div>
    </div>
  </header>;
}
