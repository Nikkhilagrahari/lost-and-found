import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowRight, Search, ShieldCheck, MessageSquare, Bell, MapPin, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.pexels.com/photos/7972556/pexels-photo-7972556.jpeg)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 stagger">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1E3A8A] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-md" data-testid="hero-eyebrow">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]" /> Institute of Engineering &amp; Technology
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mt-6 leading-[1.05]" data-testid="hero-title">
              Lost something on campus?<br />
              <span className="text-[#1E3A8A]">Find it the smart way.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed" data-testid="hero-subtitle">
              A trusted lost &amp; found platform exclusively for the IET Gorakhpur community. Report, search, match and recover — securely within campus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-[#1E3A8A] hover:bg-[#1E40AF] h-12 px-6" onClick={() => navigate(user ? "/report/lost" : "/login")} data-testid="cta-report-lost">
                I lost something <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 border-slate-300" onClick={() => navigate(user ? "/report/found" : "/login")} data-testid="cta-report-found">
                I found something
              </Button>
              <Button size="lg" variant="ghost" className="h-12 px-6" onClick={() => navigate(user ? "/browse" : "/login")} data-testid="cta-browse">
                <Search className="w-4 h-4 mr-2" /> Browse items
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#10B981]" /> Institute email verified</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#1E3A8A]" /> Closed campus community</div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#1E3A8A]/5 rounded-md" />
              <div className="relative bg-white border border-border rounded-md overflow-hidden shadow-sm">
                <img src="https://images.pexels.com/photos/9243179/pexels-photo-9243179.jpeg" alt="Lost wallet" className="w-full h-72 object-cover" />
                <div className="p-5 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#EF4444]">Lost</span>
                    <span className="text-xs text-slate-500">2h ago</span>
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 mt-1">Black wallet with college ID</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1"><MapPin className="w-3.5 h-3.5" /> Main Library, 2nd Floor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E3A8A]">How it works</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3">Built for the IET Gorakhpur community</h2>
          <p className="text-slate-600 mt-3">Every feature designed with safety, simplicity and trust in mind.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border mt-12 border border-border rounded-md overflow-hidden">
          {[
            { icon: ShieldCheck, title: "Institute-only access", desc: "Only verified members with @ietgkp.edu emails can post or view items." },
            { icon: Search, title: "Smart search & filters", desc: "Find items by category, location (Library, Hostel, Lab) or date." },
            { icon: Bell, title: "Match notifications", desc: "Get notified instantly when a found item matches what you've lost." },
            { icon: MessageSquare, title: "Secure in-app chat", desc: "Connect with finder/owner without sharing personal contact details." },
            { icon: MapPin, title: "Campus locations", desc: "Tagged to real IET locations — hostels, labs, library and more." },
            { icon: Users, title: "Admin moderation", desc: "Institute authority oversees reports, claims and disputes." },
          ].map((f) => (
            <div key={f.title} className="bg-white p-7 hover:bg-slate-50 transition-colors" data-testid={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="w-10 h-10 rounded-md bg-[#1E3A8A]/8 grid place-items-center text-[#1E3A8A]">
                <f.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-slate-900 mt-4">{f.title}</h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1E3A8A] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Lost something today? Don't wait.</h2>
            <p className="text-blue-100 mt-2">Join your peers — recover items quickly and safely.</p>
          </div>
          <Button size="lg" className="bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 h-12 px-6 font-semibold" onClick={() => navigate("/login")} data-testid="cta-bottom">
            Sign in to get started <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
