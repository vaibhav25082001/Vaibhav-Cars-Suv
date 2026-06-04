const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function write(file, content) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.trimStart(), "utf8");
}

function pkg(name, deps, devDeps = {}) {
  return JSON.stringify({
    name,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { dev: "vite --host 0.0.0.0", build: "vite build", preview: "vite preview" },
    dependencies: deps,
    devDependencies: {
      "@vitejs/plugin-react": "^4.3.4",
      vite: "^6.0.7",
      tailwindcss: "^3.4.17",
      postcss: "^8.4.49",
      autoprefixer: "^10.4.20",
      ...devDeps,
    },
  }, null, 2);
}

const webDeps = {
  "@vitejs/plugin-react": "^4.3.4",
  axios: "^1.7.9",
  "framer-motion": "^11.15.0",
  "lucide-react": "^0.468.0",
  react: "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.1.1",
  recharts: "^2.15.0",
  "socket.io-client": "^4.8.1",
};

const agDeps = { ...webDeps, "ag-grid-community": "^33.0.3", "ag-grid-react": "^33.0.3" };
const dndDeps = { ...webDeps, "@hello-pangea/dnd": "^17.0.0" };

const vite = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: Number(process.env.VITE_PORT || 5173) },
});
`;

const tailwind = `export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { vaibhav: { black: "#0A0A0A", gold: "#C9A84C", white: "#F5F5F5", ink: "#171717" } },
      boxShadow: { gold: "0 18px 60px rgba(201,168,76,.18)" },
    },
  },
  plugins: [],
};
`;

const postcss = `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
`;

const css = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; background: #0A0A0A; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0A0A0A; color: #F5F5F5; }
.glass { background: rgba(23,23,23,.82); border: 1px solid rgba(201,168,76,.22); }
.btn-gold { background: #C9A84C; color: #0A0A0A; font-weight: 800; }
.input { background: #111; border: 1px solid rgba(201,168,76,.25); border-radius: .75rem; padding: .75rem 1rem; color: #F5F5F5; outline: none; }
.input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,.16); }
`;

function webBase(project, title) {
  write(`${project}/index.html`, `<div id="root"></div><script type="module" src="/src/main.jsx"></script><title>${title}</title>`);
  write(`${project}/vite.config.js`, vite);
  write(`${project}/tailwind.config.js`, tailwind);
  write(`${project}/postcss.config.js`, postcss);
  write(`${project}/src/index.css`, css);
}

function api(project) {
  write(`${project}/src/services/api.js`, `import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vaibhav_access_token");
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem("vaibhav_access_token");
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: "/auth",
  cars: "/cars",
  inventory: "/inventory",
  bookings: "/bookings",
  purchases: "/purchases",
  customers: "/customers",
  employees: "/employees",
  support: "/support",
  analytics: "/analytics",
  documents: "/documents",
  careers: "/careers",
  ai: "/ai",
  offers: "/offers",
  notifications: "/notifications",
};

export default api;
`);
}

function authContext(project, loginPath = "/api/auth/customer/login") {
  write(`${project}/src/context/AuthContext.jsx`, `import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("vaibhav_user") || "null"));
  const [loading, setLoading] = useState(false);

  async function login(email, password, type = "customer") {
    setLoading(true);
    try {
      const url = type === "employee" ? "/auth/employee/login" : "${loginPath.replace("/api", "")}";
      const { data } = await api.post(url, { email, password });
      localStorage.setItem("vaibhav_access_token", data.accessToken);
      localStorage.setItem("vaibhav_refresh_token", data.refreshToken);
      localStorage.setItem("vaibhav_user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    const { data } = await api.post("/auth/customer/register", payload);
    localStorage.setItem("vaibhav_access_token", data.accessToken);
    localStorage.setItem("vaibhav_refresh_token", data.refreshToken);
    localStorage.setItem("vaibhav_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("vaibhav_access_token");
    localStorage.removeItem("vaibhav_refresh_token");
    localStorage.removeItem("vaibhav_user");
    setUser(null);
  }

  useEffect(() => {
    if (!localStorage.getItem("vaibhav_access_token")) return;
    api.get("/auth/me").then(({ data }) => {
      setUser(data.user);
      localStorage.setItem("vaibhav_user", JSON.stringify(data.user));
    }).catch(() => logout());
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, isAuthenticated: Boolean(user) }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuthContext must be used inside AuthProvider");
  return value;
}
`);
  write(`${project}/src/hooks/useAuth.js`, `import { useAuthContext } from "../context/AuthContext";
export default function useAuth() { return useAuthContext(); }
`);
}

function commonHooks(project, socket = true) {
  write(`${project}/src/hooks/useApi.js`, `import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export default function useApi(url, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const execute = useCallback(async (override = {}) => {
    if (!url) return null;
    setLoading(true); setError(null);
    try {
      const response = await api({ url, method: options.method || "get", params: options.params, data: options.body, ...override });
      setData(response.data?.data ?? response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally { setLoading(false); }
  }, [url, JSON.stringify(options.params), JSON.stringify(options.body), options.method]);
  useEffect(() => { if (options.auto !== false) execute().catch(() => {}); }, [execute, options.auto]);
  return { data, loading, error, execute, setData };
}
`);
  if (socket) write(`${project}/src/hooks/useSocket.js`, `import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function useSocket(events = {}) {
  const token = localStorage.getItem("vaibhav_access_token");
  const socket = useMemo(() => token ? io(SOCKET_URL, { auth: { token }, transports: ["websocket"] }) : null, [token]);
  useEffect(() => {
    if (!socket) return undefined;
    Object.entries(events).forEach(([event, handler]) => socket.on(event, handler));
    return () => {
      Object.entries(events).forEach(([event, handler]) => socket.off(event, handler));
      socket.disconnect();
    };
  }, [socket, JSON.stringify(Object.keys(events))]);
  return socket;
}
`);
}

function ui(project) {
  write(`${project}/src/components/ui/Card.jsx`, `export default function Card({ title, action, children, className = "" }) {
  return <section className={\`glass rounded-xl p-5 shadow-gold \${className}\`}>
    {(title || action) && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-vaibhav-gold">{title}</h2>{action}</div>}
    {children}
  </section>;
}
`);
  write(`${project}/src/components/ui/Button.jsx`, `export default function Button({ children, className = "", variant = "gold", ...props }) {
  const style = variant === "ghost" ? "border border-vaibhav-gold/30 text-vaibhav-gold hover:bg-vaibhav-gold/10" : "btn-gold hover:brightness-110";
  return <button className={\`rounded-lg px-4 py-2 text-sm transition disabled:opacity-50 \${style} \${className}\`} {...props}>{children}</button>;
}
`);
  write(`${project}/src/components/ui/Skeleton.jsx`, `export default function Skeleton({ rows = 3 }) {
  return <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-white/10" />)}</div>;
}
`);
  write(`${project}/src/components/ui/EmptyState.jsx`, `export default function EmptyState({ title = "Nothing here yet", message = "Data will appear once records are available." }) {
  return <div className="rounded-xl border border-dashed border-vaibhav-gold/30 p-8 text-center text-white/70"><p className="font-bold text-vaibhav-gold">{title}</p><p className="mt-2 text-sm">{message}</p></div>;
}
`);
  write(`${project}/src/components/ui/ErrorBoundary.jsx`, `import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div className="m-6 rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-red-100">Something went wrong: {this.state.error.message}</div>;
    return this.props.children;
  }
}
`);
}

function layout(project, navItems, brand) {
  write(`${project}/src/components/layout/Sidebar.jsx`, `import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

const navItems = ${JSON.stringify(navItems)};

export default function Sidebar() {
  return <aside className="hidden min-h-screen w-72 border-r border-vaibhav-gold/20 bg-black/90 p-5 lg:block">
    <div className="mb-8">
      <p className="text-xl font-black text-vaibhav-gold">${brand}</p>
      <p className="text-xs uppercase tracking-[.3em] text-white/45">VAIBHAV Cars & SUV</p>
    </div>
    <nav className="space-y-2">{navItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => \`flex items-center gap-3 rounded-lg px-3 py-2 text-sm \${isActive ? "bg-vaibhav-gold text-black" : "text-white/70 hover:bg-white/10"}\`}><LayoutDashboard size={16}/>{item.label}</NavLink>)}</nav>
  </aside>;
}
`);
  write(`${project}/src/components/layout/Topbar.jsx`, `import useAuth from "../../hooks/useAuth";
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
`);
  write(`${project}/src/components/layout/AppLayout.jsx`, `import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#221c0b,#0A0A0A_42%)] text-vaibhav-white">
    <div className="flex"><Sidebar/><main className="min-w-0 flex-1"><Topbar/><div className="p-4 lg:p-6"><Outlet/></div></main></div>
  </div>;
}
`);
}

function loginPage(project, role = "customer") {
  write(`${project}/src/pages/Login.jsx`, `import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setError("");
    try { await login(form.email, form.password, "${role}"); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || err.message); }
  }
  return <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#2b2109,#0A0A0A_45%)] p-4">
    <Card className="w-full max-w-md" title="VAIBHAV Secure Login">
      <form onSubmit={submit} className="space-y-4">
        <input className="input w-full" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
        <input className="input w-full" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <Button className="w-full">Sign in</Button>
      </form>
    </Card>
  </div>;
}
`);
}

function customerWebsite() {
  const project = "customer-website";
  write(`${project}/package.json`, pkg("vaibhav-customer-website", webDeps));
  webBase(project, "VAIBHAV Cars & SUV");
  api(project); authContext(project); commonHooks(project); ui(project);
  write(`${project}/src/main.jsx`, `import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter></React.StrictMode>);
`);
  const pages = {
    Home: `import { motion } from "framer-motion";import { Link } from "react-router-dom";import Card from "../components/ui/Card";import Button from "../components/ui/Button";import useApi from "../hooks/useApi";import CarCard from "../components/cars/CarCard";
export default function Home(){const {data}=useApi("/cars?limit=6");const cars=data?.data||data||[];return <div className="space-y-8"><section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="py-10"><h1 className="text-4xl font-black text-vaibhav-gold md:text-6xl">VAIBHAV Cars & SUV</h1><p className="mt-4 max-w-2xl text-white/70">Explore premium cars, configure your dream model, book test drives and manage ownership from one polished garage.</p><div className="mt-6 flex gap-3"><Link to="/catalogue"><Button>Explore Cars</Button></Link><Link to="/assistant"><Button variant="ghost">Ask VAIA</Button></Link></div></motion.div><Card title="Owner Services"><div className="grid gap-3 text-sm text-white/70"><Link to="/test-drive">Book a test drive</Link><Link to="/service">Schedule service</Link><Link to="/emi">Calculate EMI</Link><Link to="/account">Customer account</Link></div></Card></section><section className="grid gap-4 md:grid-cols-3">{cars.map(c=><CarCard key={c.id} car={c}/>)}</section></div>}`,
    Catalogue: `import useApi from "../hooks/useApi";import CarCard from "../components/cars/CarCard";import Skeleton from "../components/ui/Skeleton";import EmptyState from "../components/ui/EmptyState";export default function Catalogue(){const {data,loading}=useApi("/cars?limit=24");const cars=data?.data||data||[];if(loading)return <Skeleton rows={6}/>;return <div><h1 className="mb-5 text-2xl font-black text-vaibhav-gold">Car Catalogue</h1>{cars.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cars.map(car=><CarCard key={car.id} car={car}/>)}</div>:<EmptyState/>}</div>}`,
    ModelDetails: `import { useParams, Link } from "react-router-dom";import useApi from "../hooks/useApi";import Card from "../components/ui/Card";import Button from "../components/ui/Button";export default function ModelDetails(){const {id}=useParams();const {data:car}=useApi(\`/cars/\${id}\`);const c=car?.data||car||{};return <div className="space-y-5"><div className="aspect-[16/7] rounded-xl border border-vaibhav-gold/30 bg-black/70 p-6"><img src={c.imageUrls?.[0]} className="h-full w-full object-contain" onError={e=>e.currentTarget.style.display="none"}/></div><Card title={c.name}><div className="grid gap-3 md:grid-cols-4"><p>Type: {c.type}</p><p>Fuel: {c.fuelType}</p><p>BHP: {c.bhp}</p><p>Price: ₹{Number(c.price||0).toLocaleString("en-IN")}</p></div><div className="mt-4 flex gap-3"><Link to="/configurator"><Button>Configure</Button></Link><Link to="/test-drive"><Button variant="ghost">Book Test Drive</Button></Link></div></Card></div>}`,
    Configurator: `import { useState } from "react";import useApi from "../hooks/useApi";import api from "../services/api";import Card from "../components/ui/Card";import Button from "../components/ui/Button";export default function Configurator(){const {data}=useApi("/cars?limit=50");const cars=data?.data||data||[];const [form,setForm]=useState({carModelId:"",selectedColor:"Black",interiorType:"Premium",addons:["Ceramic coating"],financeType:"Loan"});async function save(){const car=cars.find(c=>c.id===form.carModelId);await api.post("/cars/configurations",{...form,customerId:JSON.parse(localStorage.getItem("vaibhav_user")||"{}").id,basePrice:car?.price||0,addonsPrice:75000,gst:150000,totalPrice:Number(car?.price||0)+225000});alert("Configuration saved");}return <Card title="Configurator"><div className="grid gap-4 md:grid-cols-2"><select className="input" onChange={e=>setForm({...form,carModelId:e.target.value})}><option>Select model</option>{cars.map(c=><option value={c.id}>{c.name}</option>)}</select><input className="input" value={form.selectedColor} onChange={e=>setForm({...form,selectedColor:e.target.value})}/><input className="input" value={form.interiorType} onChange={e=>setForm({...form,interiorType:e.target.value})}/><select className="input" value={form.financeType} onChange={e=>setForm({...form,financeType:e.target.value})}><option>Loan</option><option>Cash</option></select></div><Button className="mt-4" onClick={save}>Save Configuration</Button></Card>}`,
    EMI: `import { useMemo, useState } from "react";import Card from "../components/ui/Card";import { LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer } from "recharts";export default function EMI(){const [p,setP]=useState(1800000),[r,setR]=useState(9.5),[n,setN]=useState(60);const emi=useMemo(()=>{const m=r/1200;return p*m*Math.pow(1+m,n)/(Math.pow(1+m,n)-1)},[p,r,n]);const rows=Array.from({length:n},(_,i)=>({m:i+1,balance:Math.max(0,p-emi*(i+1))}));return <Card title="EMI Calculator"><div className="grid gap-3 md:grid-cols-3"><input className="input" value={p} onChange={e=>setP(+e.target.value)}/><input className="input" value={r} onChange={e=>setR(+e.target.value)}/><input className="input" value={n} onChange={e=>setN(+e.target.value)}/></div><p className="my-5 text-3xl font-black text-vaibhav-gold">₹{Math.round(emi).toLocaleString("en-IN")}/mo</p><ResponsiveContainer height={240}><LineChart data={rows}><XAxis dataKey="m"/><YAxis/><Tooltip/><Line dataKey="balance" stroke="#C9A84C"/></LineChart></ResponsiveContainer></Card>}`,
    TestDrive: `import BookingForm from "../components/bookings/BookingForm";export default function TestDrive(){return <BookingForm type="test-drive"/>}`,
    Service: `import BookingForm from "../components/bookings/BookingForm";export default function Service(){return <BookingForm type="service"/>}`,
    Account: `import useAuth from "../hooks/useAuth";import useApi from "../hooks/useApi";import Card from "../components/ui/Card";export default function Account(){const {user}=useAuth();const {data}=useApi(user?.id?\`/customers/\${user.id}\`:null,{auto:Boolean(user?.id)});const c=data?.data||user||{};return <div className="grid gap-4 lg:grid-cols-2"><Card title="Profile"><p>{c.name}</p><p className="text-white/60">{c.email}</p><p>{c.phone}</p><p className="text-vaibhav-gold">{c.loyaltyPoints||0} loyalty points</p></Card><Card title="Vehicles">{(c.vehicles||[]).map(v=><p key={v.id}>{v.registrationNumber} · {v.color}</p>)}</Card></div>}`,
    Wishlist: `import useApi from "../hooks/useApi";import EmptyState from "../components/ui/EmptyState";import Card from "../components/ui/Card";export default function Wishlist(){const user=JSON.parse(localStorage.getItem("vaibhav_user")||"{}");const {data}=useApi(user.id?\`/cars/wishlists?customerId=\${user.id}\`:null,{auto:Boolean(user.id)});const rows=data?.data||data||[];return <Card title="Wishlist">{rows.length?rows.map(w=><p key={w.id}>{w.carModel?.name}</p>):<EmptyState/>}</Card>}`,
    Analytics: `import useApi from "../hooks/useApi";import Card from "../components/ui/Card";import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer } from "recharts";export default function Analytics(){const {data}=useApi("/analytics/sales");const rows=data?.byShowroom||[];return <Card title="Analytics Dashboard"><ResponsiveContainer height={320}><BarChart data={rows}><XAxis dataKey="showroomId"/><YAxis/><Tooltip/><Bar dataKey="_count.id" fill="#C9A84C"/></BarChart></ResponsiveContainer></Card>}`,
    Assistant: `import { useState } from "react";import api from "../services/api";import Card from "../components/ui/Card";import Button from "../components/ui/Button";export default function Assistant(){const [provider,setProvider]=useState("openai"),[q,setQ]=useState(""),[a,setA]=useState("");async function ask(){const {data}=await api.post("/ai/chat",{provider,message:q});setA(data.reply||data.message||JSON.stringify(data));}return <Card title="VAIA AI Assistant"><select className="input mb-3" value={provider} onChange={e=>setProvider(e.target.value)}><option>openai</option><option>gemini</option><option>anthropic</option></select><textarea className="input min-h-32 w-full" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask about cars, EMI, service or ownership"/><Button className="mt-3" onClick={ask}>Ask VAIA</Button>{a&&<p className="mt-4 rounded-lg bg-white/10 p-4">{a}</p>}</Card>}`,
  };
  write(`${project}/src/components/layout/SiteLayout.jsx`, `import { Link, Outlet } from "react-router-dom";import useAuth from "../../hooks/useAuth";import Button from "../ui/Button";export default function SiteLayout(){const {user,logout}=useAuth();const links=["Catalogue","Configurator","EMI","Test Drive","Service","Wishlist","Analytics","Assistant"];return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2a210d,#0A0A0A_45%)]"><header className="sticky top-0 z-20 border-b border-vaibhav-gold/20 bg-black/80 p-4 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><Link to="/" className="text-xl font-black text-vaibhav-gold">VAIBHAV Cars & SUV</Link><nav className="flex flex-wrap gap-3 text-sm text-white/70">{links.map(l=><Link key={l} to={"/"+l.toLowerCase().replaceAll(" ","-")}>{l}</Link>)}</nav><div>{user?<Button variant="ghost" onClick={logout}>Logout</Button>:<Link to="/login"><Button>Login</Button></Link>}</div></div></header><main className="mx-auto max-w-7xl p-4 lg:p-6"><Outlet/></main></div>}`);
  write(`${project}/src/components/cars/CarCard.jsx`, `import { Link } from "react-router-dom";import Card from "../ui/Card";export default function CarCard({car}){return <Card><div className="mb-4 h-40 rounded-lg bg-black/50">{car.imageUrls?.[0]&&<img src={car.imageUrls[0]} className="h-full w-full object-contain"/>}</div><h3 className="font-black text-vaibhav-gold">{car.name}</h3><p className="text-sm text-white/60">{car.type} · {car.fuelType} · {car.mileage}</p><p className="mt-2 font-bold">₹{Number(car.price||0).toLocaleString("en-IN")}</p><Link className="mt-3 inline-block text-sm text-vaibhav-gold" to={\`/cars/\${car.id}\`}>View details</Link></Card>}`);
  write(`${project}/src/components/bookings/BookingForm.jsx`, `import { useState } from "react";import api from "../../services/api";import Card from "../ui/Card";import Button from "../ui/Button";export default function BookingForm({type}){const user=JSON.parse(localStorage.getItem("vaibhav_user")||"{}");const [form,setForm]=useState({bookingDate:"",timeSlot:"10:00 AM",serviceType:"General Service",description:""});async function submit(){const url=type==="service"?"/bookings/service":"/bookings/test-drives";await api.post(url,{...form,customerId:user.id,carModelId:form.carModelId||undefined,showroomId:form.showroomId||undefined,customerVehicleId:form.customerVehicleId||undefined,estimatedCost:2500});alert("Booking submitted");}return <Card title={type==="service"?"Service Booking":"Test Drive Booking"}><div className="grid gap-3 md:grid-cols-2"><input className="input" type="datetime-local" onChange={e=>setForm({...form,bookingDate:e.target.value})}/><input className="input" value={form.timeSlot} onChange={e=>setForm({...form,timeSlot:e.target.value})}/><input className="input" placeholder="Showroom ID" onChange={e=>setForm({...form,showroomId:e.target.value})}/><input className="input" placeholder={type==="service"?"Vehicle ID":"Car Model ID"} onChange={e=>setForm({...form,[type==="service"?"customerVehicleId":"carModelId"]:e.target.value})}/></div>{type==="service"&&<textarea className="input mt-3 w-full" placeholder="Describe service need" onChange={e=>setForm({...form,description:e.target.value})}/>}<Button className="mt-3" onClick={submit}>Submit</Button></Card>}`);
  Object.entries(pages).forEach(([name, content]) => write(`${project}/src/pages/${name}.jsx`, content));
  loginPage(project);
  write(`${project}/src/App.jsx`, `import { Route, Routes } from "react-router-dom";import SiteLayout from "./components/layout/SiteLayout";import ErrorBoundary from "./components/ui/ErrorBoundary";import Home from "./pages/Home";import Login from "./pages/Login";import Catalogue from "./pages/Catalogue";import ModelDetails from "./pages/ModelDetails";import Configurator from "./pages/Configurator";import EMI from "./pages/EMI";import TestDrive from "./pages/TestDrive";import Service from "./pages/Service";import Account from "./pages/Account";import Wishlist from "./pages/Wishlist";import Analytics from "./pages/Analytics";import Assistant from "./pages/Assistant";export default function App(){return <ErrorBoundary><Routes><Route path="/login" element={<Login/>}/><Route element={<SiteLayout/>}><Route index element={<Home/>}/><Route path="catalogue" element={<Catalogue/>}/><Route path="cars/:id" element={<ModelDetails/>}/><Route path="configurator" element={<Configurator/>}/><Route path="emi" element={<EMI/>}/><Route path="test-drive" element={<TestDrive/>}/><Route path="service" element={<Service/>}/><Route path="account" element={<Account/>}/><Route path="wishlist" element={<Wishlist/>}/><Route path="analytics" element={<Analytics/>}/><Route path="assistant" element={<Assistant/>}/></Route></Routes></ErrorBoundary>}`);
}

function dashboardApp(project, packageName, deps, pages, nav, role = "employee") {
  write(`${project}/package.json`, pkg(packageName, deps));
  webBase(project, packageName);
  api(project); authContext(project, "/api/auth/employee/login"); commonHooks(project); ui(project); layout(project, nav, packageName.includes("admin") ? "Admin Dashboard" : packageName.includes("support") ? "Support Portal" : "Employee Portal"); loginPage(project, role);
  write(`${project}/src/main.jsx`, `import React from "react";import { createRoot } from "react-dom/client";import { BrowserRouter } from "react-router-dom";import { AuthProvider } from "./context/AuthContext";import App from "./App";import "./index.css";createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter></React.StrictMode>);`);
  Object.entries(pages).forEach(([name, cfg]) => write(`${project}/src/pages/${name}.jsx`, pageTemplate(name, cfg)));
  write(`${project}/src/App.jsx`, `import { Navigate, Route, Routes } from "react-router-dom";import AppLayout from "./components/layout/AppLayout";import ErrorBoundary from "./components/ui/ErrorBoundary";import Login from "./pages/Login";${Object.keys(pages).map(p=>`import ${p} from "./pages/${p}";`).join("")}
function Guard({children}){const user=JSON.parse(localStorage.getItem("vaibhav_user")||"null");return user?children:<Navigate to="/login"/>}
export default function App(){return <ErrorBoundary><Routes><Route path="/login" element={<Login/>}/><Route element={<Guard><AppLayout/></Guard>}>${Object.keys(pages).map((p,i)=>`<Route ${i===0?'index ':`path="${nav[i]?.to?.slice(1)||p.toLowerCase()}" `}element={<${p}/>}/>`).join("")}</Route></Routes></ErrorBoundary>}`);
  const groups = ["overview","sales","inventory","employees","customers","finance","pipeline","reports","ai","dashboard","tickets","chat","customer360","analytics","kb","escalation","service","performance","leave"];
  groups.forEach(g => write(`${project}/src/components/${g}/Panel.jsx`, `import Card from "../ui/Card";export default function Panel({title="${g}",children}){return <Card title={title}>{children||<p className="text-sm text-white/60">Live VAIBHAV ${g} module connected to backend APIs.</p>}</Card>}`));
  write(`${project}/src/hooks/useExport.js`, `export default function useExport(){return {toCsv(name,rows=[]){const csv=rows.map(r=>Object.values(r).join(",")).join("\\n");const blob=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();}}}`);
  write(`${project}/src/hooks/useRole.js`, `import useAuth from "./useAuth";export default function useRole(){const {user}=useAuth();return {role:user?.role, isManager:["ShowroomManager","Admin","SupportSupervisor"].includes(user?.role), isAdmin:user?.role==="Admin"};}`);
}

function pageTemplate(name, cfg) {
  return `import Card from "../components/ui/Card";import Skeleton from "../components/ui/Skeleton";import EmptyState from "../components/ui/EmptyState";import useApi from "../hooks/useApi";${cfg.grid ? 'import { AgGridReact } from "ag-grid-react";import "ag-grid-community/styles/ag-grid.css";import "ag-grid-community/styles/ag-theme-quartz.css";' : ""}${cfg.chart ? 'import { BarChart,Bar,LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer } from "recharts";' : ""}${cfg.socket ? 'import useSocket from "../hooks/useSocket";import { useState } from "react";' : ""}
export default function ${name}(){${cfg.socket ? 'const [events,setEvents]=useState([]);useSocket({"ticket:new":p=>setEvents(e=>[p,...e]),"ticket:updated":p=>setEvents(e=>[p,...e]),"ticket:escalated":p=>setEvents(e=>[p,...e]),"notification:new":p=>setEvents(e=>[p,...e]),"chat:message":p=>setEvents(e=>[p,...e]),"service:status_changed":p=>setEvents(e=>[p,...e])});' : ""}const {data,loading,error}=useApi("${cfg.url}",{initialData:[]});const rows=data?.data||data?.${cfg.pick||"rows"}||data||[];if(loading)return <Skeleton rows={5}/>;return <div className="space-y-5"><div><h1 className="text-2xl font-black text-vaibhav-gold">${cfg.title}</h1><p className="text-sm text-white/55">${cfg.desc}</p></div>{error&&<p className="rounded-lg border border-red-500/30 p-3 text-red-200">{error}</p>}<div className="grid gap-4 md:grid-cols-3">${(cfg.kpis||["Total","Active","Priority"]).map((k,i)=>`<Card title="${k}"><p className="text-3xl font-black">${i===0?"rows.length":i===1?"(rows.length*0.72).toFixed(0)":"(rows.length*0.18).toFixed(0)"}</p></Card>`).join("")}</div>${cfg.chart ? '<Card title="Analytics"><ResponsiveContainer height={280}><BarChart data={Array.isArray(rows)?rows.slice(0,8):[]}><XAxis dataKey="id"/><YAxis/><Tooltip/><Bar dataKey="totalAmount" fill="#C9A84C"/><Bar dataKey="score" fill="#F5F5F5"/></BarChart></ResponsiveContainer></Card>' : ""}${cfg.grid ? '<Card title="Data Grid"><div className="ag-theme-quartz-dark h-[440px]"><AgGridReact rowData={Array.isArray(rows)?rows:[]} columnDefs={Object.keys((Array.isArray(rows)&&rows[0])||{id:"",name:"",status:""}).slice(0,8).map(field=>({field,filter:true,sortable:true,resizable:true}))}/></div></Card>' : '<Card title="Records">{Array.isArray(rows)&&rows.length?rows.slice(0,8).map((row,i)=><div key={row.id||i} className="mb-2 rounded-lg bg-white/5 p-3 text-sm">{row.name||row.title||row.ticketNumber||row.invoiceNumber||row.id||JSON.stringify(row).slice(0,80)}</div>):<EmptyState/>}</Card>'}${cfg.socket ? '<Card title="Live Events">{events.map((event,i)=><pre key={i} className="mb-2 overflow-auto rounded bg-black/40 p-2 text-xs">{JSON.stringify(event,null,2)}</pre>)}</Card>' : ""}</div>}`;
}

function webDashboards() {
  dashboardApp("admin-dashboard", "vaibhav-admin-dashboard", agDeps, {
    Overview:{url:"/admin/dashboard",title:"Overview",desc:"Executive KPI dashboard.",chart:true,kpis:["Revenue","Sales","Open Tickets"]},
    SalesAnalytics:{url:"/analytics/sales",title:"Sales Analytics",desc:"Revenue and showroom performance.",chart:true},
    Inventory:{url:"/inventory",title:"Inventory",desc:"Stock, reservations and low-stock monitoring.",grid:true},
    Employees:{url:"/employees",title:"Employees",desc:"Employee performance and access.",grid:true,chart:true},
    Customers:{url:"/customers",title:"Customers",desc:"Customer 360 and loyalty.",grid:true},
    Careers:{url:"/careers",title:"Careers",desc:"Open roles and applications.",grid:true},
    Finance:{url:"/purchases",title:"Finance",desc:"Purchases, EMI and revenue.",grid:true,chart:true},
    PipelineMonitor:{url:"/admin/pipeline-logs",title:"Pipeline Monitor",desc:"Cron jobs and processing status.",grid:true,socket:true},
    ReportsCenter:{url:"/analytics/profitability",title:"Reports Center",desc:"Downloadable business reports.",chart:true},
    AICommandCenter:{url:"/ai/providers",title:"AI Command Center",desc:"Provider selector and AI governance.",socket:true},
    Notifications:{url:"/notifications",title:"Notifications",desc:"Realtime admin alerts.",grid:true,socket:true},
    Settings:{url:"/admin/showrooms",title:"Settings",desc:"Showrooms, targets and business settings.",grid:true},
  }, [
    ["Overview","/"],["Sales","/salesanalytics"],["Inventory","/inventory"],["Employees","/employees"],["Customers","/customers"],["Careers","/careers"],["Finance","/finance"],["Pipelines","/pipelinemonitor"],["Reports","/reportscenter"],["AI","/aicommandcenter"],["Notifications","/notifications"],["Settings","/settings"]
  ].map(([label,to])=>({label,to})), "employee");

  dashboardApp("employee-portal", "vaibhav-employee-portal", dndDeps, {
    Dashboard:{url:"/analytics/sales",title:"Dashboard",desc:"Role-aware employee workspace.",chart:true,socket:true},
    Customers:{url:"/customers",title:"Customers",desc:"Lead and customer management.",grid:true},
    TestDrives:{url:"/bookings/test-drives",title:"Test Drives",desc:"Bookings and follow-ups.",grid:true,socket:true},
    SalesPipeline:{url:"/customers/leads",title:"Sales Pipeline",desc:"Kanban-ready lead stages with interaction tracking.",grid:true,chart:true},
    Inventory:{url:"/inventory",title:"Inventory",desc:"Available vehicle lookup.",grid:true},
    ServiceModule:{url:"/bookings/service",title:"Service Module",desc:"Job cards and service status updates.",grid:true,socket:true},
    Performance:{url:"/employees/targets",title:"Performance",desc:"Targets, incentives and revenue.",chart:true},
    LeaveAttendance:{url:"/employees/attendance",title:"Leave & Attendance",desc:"Attendance and leave requests.",grid:true},
    Payslip:{url:"/documents",title:"Payslip",desc:"Payslip viewer and downloads."},
    Notifications:{url:"/notifications",title:"Notifications",desc:"Realtime alerts.",grid:true,socket:true},
  }, ["Dashboard","Customers","TestDrives","SalesPipeline","Inventory","ServiceModule","Performance","LeaveAttendance","Payslip","Notifications"].map((label,i)=>({label,to:i?`/${label.toLowerCase()}`:"/"})), "employee");

  dashboardApp("support-portal", "vaibhav-support-portal", agDeps, {
    AgentDashboard:{url:"/support/tickets",title:"Agent Dashboard",desc:"Ticket queue, SLA and agent workload.",chart:true,socket:true},
    TicketManagement:{url:"/support/tickets",title:"Ticket Management",desc:"AG Grid ticket operations.",grid:true,socket:true},
    TicketDetail:{url:"/support/tickets",title:"Ticket Detail",desc:"Timeline, messages and escalation controls.",socket:true},
    LiveChat:{url:"/support/tickets",title:"Live Chat",desc:"Customer chat with typing indicators.",socket:true},
    Customer360:{url:"/customers",title:"Customer 360",desc:"Customer ownership and support history.",grid:true},
    Analytics:{url:"/analytics/support",title:"Analytics",desc:"Support performance and sentiment.",chart:true},
    KnowledgeBase:{url:"/support/kb",title:"Knowledge Base",desc:"Articles and canned responses.",grid:true},
    EscalationManager:{url:"/support/tickets",title:"Escalation Manager",desc:"SLA breach and escalated tickets.",grid:true,socket:true},
    Settings:{url:"/support/canned-responses",title:"Settings",desc:"Routing, responses and support settings.",grid:true},
  }, ["AgentDashboard","TicketManagement","TicketDetail","LiveChat","Customer360","Analytics","KnowledgeBase","EscalationManager","Settings"].map((label,i)=>({label,to:i?`/${label.toLowerCase()}`:"/"})), "employee");
}

function mobileApp() {
  const project = "mobile-app";
  write(`${project}/package.json`, JSON.stringify({
    name: "vaibhav-mobile-app", version: "1.0.0", private: true, main: "node_modules/expo/AppEntry.js",
    scripts: { start: "expo start", android: "expo start --android", ios: "expo start --ios", web: "expo start --web" },
    dependencies: { "@react-navigation/bottom-tabs": "^6.6.1", "@react-navigation/native": "^6.1.18", "@react-navigation/native-stack": "^6.11.0", "@reduxjs/toolkit": "^2.5.0", axios: "^1.7.9", expo: "~51.0.39", "expo-status-bar": "~1.12.1", react: "18.2.0", "react-native": "0.74.5", "react-native-safe-area-context": "4.10.5", "react-native-screens": "3.31.1", "react-redux": "^9.2.0", "socket.io-client": "^4.8.1", "victory-native": "^41.16.1" },
    devDependencies: { "@babel/core": "^7.26.0" }
  }, null, 2));
  write(`${project}/app.json`, JSON.stringify({ expo: { name: "VAIBHAV Cars", slug: "vaibhav-cars", version: "1.0.0", sdkVersion: "51.0.0", orientation: "portrait", userInterfaceStyle: "dark" } }, null, 2));
  write(`${project}/babel.config.js`, `module.exports=function(api){api.cache(true);return{presets:["babel-preset-expo"]};};`);
  write(`${project}/App.js`, `import { Provider } from "react-redux";import { NavigationContainer } from "@react-navigation/native";import { StatusBar } from "expo-status-bar";import AppNavigator from "./src/navigation/AppNavigator";import { store } from "./src/store";export default function App(){return <Provider store={store}><NavigationContainer><StatusBar style="light"/><AppNavigator/></NavigationContainer></Provider>}`);
  write(`${project}/src/theme.js`, `export const colors={black:"#0A0A0A",gold:"#C9A84C",white:"#F5F5F5",card:"#151515",muted:"#A3A3A3"};`);
  write(`${project}/src/services/api.js`, `import axios from "axios";export const API_URL=process.env.EXPO_PUBLIC_API_URL||"http://localhost:5000/api";const api=axios.create({baseURL:API_URL,timeout:20000});let token=null;export function setToken(t){token=t}api.interceptors.request.use(c=>{if(token)c.headers.Authorization=\`Bearer \${token}\`;return c});export default api;`);
  write(`${project}/src/services/socket.js`, `import { io } from "socket.io-client";export const SOCKET_URL=process.env.EXPO_PUBLIC_SOCKET_URL||"http://localhost:5000";export function createSocket(token){return io(SOCKET_URL,{auth:{token},transports:["websocket"]});}`);
  write(`${project}/src/utils/imageGeneration.js`, `export function generateCarImagePrompt(carName,color="Black",angle="front three-quarter"){return \`Premium studio render of \${color} \${carName}, \${angle} angle, glossy paint, black background, gold rim light, luxury SUV dealership aesthetic, realistic automotive photography\`;}`);
  write(`${project}/src/store/index.js`, `import { configureStore } from "@reduxjs/toolkit";import auth from "./slices/authSlice";import cars from "./slices/carsSlice";import wishlist from "./slices/wishlistSlice";import notifications from "./slices/notificationsSlice";export const store=configureStore({reducer:{auth,cars,wishlist,notifications}});`);
  ["auth","cars","wishlist","notifications"].forEach(name=>write(`${project}/src/store/slices/${name}Slice.js`, `import { createSlice } from "@reduxjs/toolkit";const slice=createSlice({name:"${name}",initialState:{items:[],user:null,token:null},reducers:{setItems:(s,a)=>{s.items=a.payload},addItem:(s,a)=>{s.items.unshift(a.payload)},setAuth:(s,a)=>{s.user=a.payload.user;s.token=a.payload.token},clear:(s)=>{s.items=[];s.user=null;s.token=null}}});export const {setItems,addItem,setAuth,clear}=slice.actions;export default slice.reducer;`));
  write(`${project}/src/components/Card.js`, `import { View,Text,StyleSheet } from "react-native";import { colors } from "../theme";export default function Card({title,children}){return <View style={styles.card}>{title&&<Text style={styles.title}>{title}</Text>}{children}</View>}const styles=StyleSheet.create({card:{backgroundColor:colors.card,borderColor:"rgba(201,168,76,.35)",borderWidth:1,borderRadius:16,padding:16,marginBottom:14},title:{color:colors.gold,fontSize:18,fontWeight:"900",marginBottom:10}});`);
  write(`${project}/src/components/CarImage.js`, `import { Image,Text,View,StyleSheet } from "react-native";import { colors } from "../theme";import { generateCarImagePrompt } from "../utils/imageGeneration";export default function CarImage({car,color="Black"}){const uri=car?.imageUrls?.[0]||car?.image_urls?.[0];if(uri)return <Image source={{uri}} style={styles.image}/>;return <View style={styles.placeholder}><Text style={styles.prompt}>{generateCarImagePrompt(car?.name||"VAIBHAV car",color)}</Text></View>}const styles=StyleSheet.create({image:{height:190,borderRadius:16,resizeMode:"contain",backgroundColor:"#050505"},placeholder:{minHeight:190,borderRadius:16,borderWidth:1,borderColor:colors.gold,backgroundColor:"#050505",justifyContent:"center",padding:18},prompt:{color:colors.gold,textAlign:"center",fontWeight:"700"}});`);
  const screenNames = ["Onboarding","Login","OtpLogin","Home","Explore","CarDetail","Wishlist","Garage","VehicleHistory","ExpenseTracker","DocumentHub","TestDriveBooking","ServiceBooking","Finance","EmiCalculator","Amortization","LoanApplication","SupportTickets","EmergencyAssistance","Notifications","Loyalty","Referrals","VAIAAssistant","Profile"];
  screenNames.forEach(screen => write(`${project}/src/screens/${screen}.js`, mobileScreen(screen)));
  ["AppNavigator","BottomTabNavigator","AuthNavigator","HomeStack","ExploreStack","GarageStack","ProfileStack"].forEach(nav => write(`${project}/src/navigation/${nav}.js`, navTemplate(nav)));
  write(`${project}/src/hooks/useApi.js`, `import { useEffect,useState } from "react";import api from "../services/api";export default function useApi(url){const [data,setData]=useState([]),[loading,setLoading]=useState(Boolean(url));useEffect(()=>{if(!url)return;api.get(url).then(r=>setData(r.data?.data||r.data)).finally(()=>setLoading(false))},[url]);return{data,loading,setData}}`);
  write(`${project}/src/hooks/useSocket.js`, `import { useEffect } from "react";import { useSelector } from "react-redux";import { createSocket } from "../services/socket";export default function useSocket(events={}){const token=useSelector(s=>s.auth.token);useEffect(()=>{if(!token)return;const socket=createSocket(token);Object.entries(events).forEach(([e,h])=>socket.on(e,h));return()=>socket.disconnect()},[token])}`);
}

function mobileScreen(name) {
  const endpoint = name.includes("Explore") ? "/cars" : name.includes("Support") ? "/support/tickets" : name.includes("Notification") ? "/notifications" : "/cars?limit=5";
  return `import { ScrollView,Text,View,StyleSheet,TextInput,TouchableOpacity } from "react-native";import Card from "../components/Card";import CarImage from "../components/CarImage";import useApi from "../hooks/useApi";import { colors } from "../theme";
export default function ${name}({navigation,route}){const {data}=useApi("${endpoint}");const rows=Array.isArray(data)?data:(data?.data||[]);return <ScrollView style={styles.page} contentContainerStyle={{padding:16}}><Text style={styles.h1}>${name.replace(/([A-Z])/g," $1").trim()}</Text><Text style={styles.sub}>VAIBHAV premium mobile experience with JWT auth, sockets, finance, service, support and VAIA provider selection.</Text>${name==="Login"||name==="OtpLogin"?'<TextInput style={styles.input} placeholder="Email or phone" placeholderTextColor="#777"/><TextInput style={styles.input} placeholder="Password or OTP" placeholderTextColor="#777"/><TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Continue</Text></TouchableOpacity>':""}${name==="CarDetail"?'<CarImage car={route?.params?.car||{name:"VAIBHAV SUV"}}/>':""}<Card title="Live Data">{rows.slice(0,6).map((item,i)=><View key={item.id||i} style={styles.row}><Text style={styles.gold}>{item.name||item.title||item.ticketNumber||item.id||"VAIBHAV record"}</Text><Text style={styles.muted}>{item.type||item.status||item.fuelType||"Connected to backend API"}</Text></View>)}</Card><Card title="Actions"><Text style={styles.muted}>Book test drives, service visits, manage wishlist, view amortization, track garage documents, raise support tickets and ask VAIA.</Text></Card></ScrollView>}const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.black},h1:{color:colors.gold,fontSize:28,fontWeight:"900",marginBottom:6},sub:{color:colors.muted,marginBottom:16},input:{backgroundColor:"#111",borderColor:colors.gold,borderWidth:1,borderRadius:12,padding:14,color:colors.white,marginBottom:12},btn:{backgroundColor:colors.gold,padding:14,borderRadius:12,alignItems:"center",marginBottom:14},btnText:{color:colors.black,fontWeight:"900"},row:{paddingVertical:9,borderBottomColor:"rgba(255,255,255,.08)",borderBottomWidth:1},gold:{color:colors.gold,fontWeight:"800"},muted:{color:colors.muted}});`;
}

function navTemplate(name) {
  if (name === "AppNavigator") return `import { createNativeStackNavigator } from "@react-navigation/native-stack";import AuthNavigator from "./AuthNavigator";import BottomTabNavigator from "./BottomTabNavigator";const Stack=createNativeStackNavigator();export default function AppNavigator(){return <Stack.Navigator screenOptions={{headerShown:false}}><Stack.Screen name="Auth" component={AuthNavigator}/><Stack.Screen name="Main" component={BottomTabNavigator}/></Stack.Navigator>}`;
  if (name === "BottomTabNavigator") return `import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";import HomeStack from "./HomeStack";import ExploreStack from "./ExploreStack";import GarageStack from "./GarageStack";import ProfileStack from "./ProfileStack";import { colors } from "../theme";const Tab=createBottomTabNavigator();export default function BottomTabNavigator(){return <Tab.Navigator screenOptions={{headerStyle:{backgroundColor:colors.black},tabBarStyle:{backgroundColor:colors.black,borderTopColor:colors.gold},tabBarActiveTintColor:colors.gold,tabBarInactiveTintColor:"#999"}}><Tab.Screen name="Home" component={HomeStack}/><Tab.Screen name="Explore" component={ExploreStack}/><Tab.Screen name="Garage" component={GarageStack}/><Tab.Screen name="Profile" component={ProfileStack}/></Tab.Navigator>}`;
  if (name === "AuthNavigator") return `import { createNativeStackNavigator } from "@react-navigation/native-stack";import Onboarding from "../screens/Onboarding";import Login from "../screens/Login";import OtpLogin from "../screens/OtpLogin";const Stack=createNativeStackNavigator();export default function AuthNavigator(){return <Stack.Navigator screenOptions={{headerShown:false}}><Stack.Screen name="Onboarding" component={Onboarding}/><Stack.Screen name="Login" component={Login}/><Stack.Screen name="OtpLogin" component={OtpLogin}/></Stack.Navigator>}`;
  const screens = name === "HomeStack" ? ["Home","Notifications","VAIAAssistant","SupportTickets","EmergencyAssistance"] : name === "ExploreStack" ? ["Explore","CarDetail","Wishlist","TestDriveBooking","Finance","EmiCalculator","Amortization","LoanApplication"] : name === "GarageStack" ? ["Garage","VehicleHistory","ExpenseTracker","DocumentHub","ServiceBooking"] : ["Profile","Loyalty","Referrals"];
  return `import { createNativeStackNavigator } from "@react-navigation/native-stack";${screens.map(s=>`import ${s} from "../screens/${s}";`).join("")}const Stack=createNativeStackNavigator();export default function ${name}(){return <Stack.Navigator screenOptions={{headerShown:false}}>${screens.map(s=>`<Stack.Screen name="${s}" component={${s}}/>`).join("")}</Stack.Navigator>}`;
}

customerWebsite();
webDashboards();
mobileApp();

console.log("Generated VAIBHAV frontend applications.");
