import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#221c0b,#0A0A0A_42%)] text-vaibhav-white">
    <div className="flex"><Sidebar/><main className="min-w-0 flex-1"><Topbar/><div className="p-4 lg:p-6"><Outlet/></div></main></div>
  </div>;
}
