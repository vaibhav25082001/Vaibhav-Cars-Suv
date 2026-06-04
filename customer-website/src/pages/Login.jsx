import { useState } from "react";
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
    try { await login(form.email, form.password, "customer"); navigate("/"); }
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
