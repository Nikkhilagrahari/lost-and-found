import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { toast } from "sonner";
import { ShieldCheck, Mail, Lock, Hash, Calendar } from "lucide-react";

export default function Login() {
  const { loginWithPassword, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Student login state
  const [rollNo, setRollNo] = useState("");
  const [dob, setDob] = useState("");

  // Admin login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedDob = dob.split("-").reverse().join("-");
      const r = await api.post("/auth/student/login", {
      roll_number: rollNo.trim(),
      dob: formattedDob
      })
      if (r.data.token) localStorage.setItem("ietlf_token", r.data.token);
      setUser(r.data.user);
      toast.success(`Welcome, ${r.data.user.name}!`);
      navigate("/browse");
    } catch (err) {
      toast.error(
      typeof err?.response?.data?.detail === "string"
    ? err.response.data.detail
    : JSON.stringify(
        err?.response?.data?.detail || "Login failed"
      )
);
    } finally { setLoading(false); }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", {
  email: loginEmail.trim(),
  password: loginPw
});

if (res.data.token) {
  localStorage.setItem("ietlf_token", res.data.token);
}

setUser(res.data.user);

toast.success(`Welcome back, ${res.data.user.name}!`);

navigate("/admin");
    } catch (err) {
      toast.error(
      typeof err?.response?.data?.detail === "string"
    ? err.response.data.detail
    : JSON.stringify(
        err?.response?.data?.detail || "Login failed"
      )
);
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/browse";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 fade-in">
      {/* Left: branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#1E3A8A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md bg-white text-[#1E3A8A] grid place-items-center font-display font-bold text-lg">IET</div>
            <div>
              <div className="font-display font-bold text-base">Lost &amp; Found</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-blue-200">Gorakhpur University</div>
            </div>
          </div>
          <h2 className="font-display text-4xl font-bold mt-16 max-w-md leading-tight">A safer way to recover what's yours.</h2>
          <p className="text-blue-100 mt-4 max-w-md leading-relaxed">
            Sign in with your <strong className="text-white">institute roll number &amp; date of birth</strong> — the same details your administrators added to your IET profile.
          </p>
        </div>
        <div className="relative space-y-3 text-sm text-blue-100">
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verified institute members only</div>
          <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Secure in-app messaging</div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-5 sm:p-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold text-slate-900" data-testid="login-title">Welcome</h1>
          <p className="text-sm text-slate-600 mt-1">Sign in to access the IET Lost &amp; Found.</p>

          <Tabs defaultValue="student" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" data-testid="tab-student">Student</TabsTrigger>
              <TabsTrigger value="admin" data-testid="tab-admin">Admin / Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <form onSubmit={handleStudentLogin} className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="roll">Roll number</Label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="roll" required value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g., 2514750010114" className="pl-9 h-11" data-testid="student-rollno" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dob">Date of birth</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input id="dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="pl-9 h-11" data-testid="student-dob" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Use the DOB on record with the institute.</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="student-submit">
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
                <p className="text-xs text-slate-500 text-center">Not in the system? Ask your institute admin to register you.</p>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <Button onClick={handleGoogle} variant="outline" className="w-full h-11 mt-6 border-slate-300" data-testid="google-signin-btn">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c4.9 0 9.4-1.9 12.7-5l-5.9-4.8C29 35.3 26.6 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.1 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.7 2.1-2.1 3.9-4 5.1l5.9 4.8c-.4.4 6.3-4.6 6.3-14.4 0-1.2-.1-2.4-.4-3.5z"/></svg>
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" /><span className="text-xs text-slate-400 uppercase tracking-wider">or</span><div className="flex-1 h-px bg-border" />
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="login-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="admin@example.com" className="pl-9 h-11" data-testid="login-email" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="login-pw">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="login-pw" type="password" required value={loginPw} onChange={(e) => setLoginPw(e.target.value)} placeholder="••••••••" className="pl-9 h-11" data-testid="login-password" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="login-submit">
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
