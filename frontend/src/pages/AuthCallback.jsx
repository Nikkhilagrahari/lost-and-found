import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { navigate("/login"); return; }
    const session_id = m[1];
    (async () => {
      try {
        const r = await api.post("/auth/google/session", { session_id });
        if (r.data.token) localStorage.setItem("ietlf_token", r.data.token);
        setUser(r.data.user);
        toast.success(`Welcome, ${r.data.user.name}!`);
        navigate(r.data.user.role === "admin" ? "/admin" : "/browse", { replace: true });
      } catch (e) {
        toast.error(e.response?.data?.detail || "Authentication failed");
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen grid place-items-center" data-testid="auth-callback">
      <div className="text-sm text-slate-600">Completing sign-in…</div>
    </div>
  );
}
