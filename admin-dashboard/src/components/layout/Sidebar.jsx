import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

const navItems = [{"label":"Overview","to":"/"},{"label":"Sales","to":"/salesanalytics"},{"label":"Inventory","to":"/inventory"},{"label":"Employees","to":"/employees"},{"label":"Customers","to":"/customers"},{"label":"Careers","to":"/careers"},{"label":"Finance","to":"/finance"},{"label":"Pipelines","to":"/pipelinemonitor"},{"label":"Reports","to":"/reportscenter"},{"label":"AI","to":"/aicommandcenter"},{"label":"Notifications","to":"/notifications"},{"label":"Settings","to":"/settings"}];

export default function Sidebar() {
  return <aside className="hidden min-h-screen w-72 border-r border-vaibhav-gold/20 bg-black/90 p-5 lg:block">
    <div className="mb-8">
      <p className="text-xl font-black text-vaibhav-gold">Admin Dashboard</p>
      <p className="text-xs uppercase tracking-[.3em] text-white/45">VAIBHAV Cars & SUV</p>
    </div>
    <nav className="space-y-2">{navItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-vaibhav-gold text-black" : "text-white/70 hover:bg-white/10"}`}><LayoutDashboard size={16}/>{item.label}</NavLink>)}</nav>
  </aside>;
}
