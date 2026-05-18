import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, CATEGORIES, LOCATIONS } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { toast } from "sonner";
import { Upload, X, EyeOff } from "lucide-react";

export default function ReportItem() {
  const { type } = useParams(); // 'lost' or 'found'
  const isLost = type === "lost";
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    item_date: new Date().toISOString().slice(0, 10),
    reward: "",
    handover_status: "with_finder",
    images: [],
    is_anonymous: false,
  });

  const onFiles = async (files) => {
    const arr = Array.from(files).slice(0, 4 - form.images.length);
    const reads = await Promise.all(arr.map((f) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    })));
    setForm((p) => ({ ...p, images: [...p.images, ...reads] }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.location) { toast.error("Please select category and location"); return; }
    setSubmitting(true);
    try {
    const r = await api.post("/items", {
      ...form,
      type
    });
    toast.success(`${isLost ? "Lost" : "Found"} item reported${r.data.matches_found ? ` · ${r.data.matches_found} possible match(es) found!` : ""}`);
    navigate(`/items/${r.data.item.item_id}`);
  } catch (err) {
    toast.error(err.response?.data?.detail || "Failed to submit");
  } finally { setSubmitting(false); }
};

return (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 fade-in">
    <div className="mb-6">
      <span className={`inline-block text-xs font-bold uppercase tracking-[0.2em] px-2 py-1 rounded ${isLost ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
        {isLost ? "Report Lost" : "Report Found"}
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3" data-testid="report-title">
        {isLost ? "Tell us what you lost" : "Help return a found item"}
      </h1>
      <p className="text-sm text-slate-600 mt-2">Share clear details so the right person can find this report.</p>
    </div>

    <form onSubmit={submit} className="bg-white border border-border rounded-md p-6 space-y-5" data-testid="report-form">
      <div>
        <Label htmlFor="title">Item name *</Label>
        <Input id="title" required placeholder="e.g., Black wallet, Casio FX-991 calculator" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" data-testid="field-title" />
      </div>
      <div>
        <Label htmlFor="desc">Description *</Label>
        <Textarea id="desc" required rows={4} placeholder="Distinctive features, brand, color, contents…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" data-testid="field-description" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="mt-1" data-testid="field-category"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Campus location *</Label>
          <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
            <SelectTrigger className="mt-1" data-testid="field-location"><SelectValue placeholder="Where on campus" /></SelectTrigger>
            <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={form.item_date} onChange={(e) => setForm({ ...form, item_date: e.target.value })} className="mt-1" data-testid="field-date" />
        </div>
        {isLost ? (
          <div>
            <Label htmlFor="reward">Reward (optional)</Label>
            <Input id="reward" placeholder="e.g., ₹500" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} className="mt-1" data-testid="field-reward" />
          </div>
        ) : (
          <div>
            <Label>Handover status</Label>
            <Select value={form.handover_status} onValueChange={(v) => setForm({ ...form, handover_status: v })}>
              <SelectTrigger className="mt-1" data-testid="field-handover"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="with_finder">Still with me</SelectItem>
                <SelectItem value="handed_to_admin">Handed to Admin</SelectItem>
                <SelectItem value="returned_to_owner">Returned to Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label>Images (up to 4)</Label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {form.images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 hover:bg-white" data-testid={`remove-image-${i}`}>
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {form.images.length < 4 && (
            <label className="aspect-square rounded-md border-2 border-dashed border-slate-300 grid place-items-center cursor-pointer hover:border-[#1E3A8A] hover:bg-blue-50/50 transition-colors" data-testid="upload-trigger">
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              <div className="text-center text-slate-500">
                <Upload className="w-5 h-5 mx-auto" />
                <span className="text-xs mt-1 block">Add image</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {!isLost && (
        <div className="bg-blue-50/60 border border-blue-100 rounded-md p-4 flex items-start gap-3" data-testid="anonymous-section">
          <div className="w-9 h-9 rounded-md bg-white border border-blue-200 grid place-items-center flex-shrink-0">
            <EyeOff className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="anon-toggle" className="font-semibold text-slate-900 cursor-pointer">Post anonymously</Label>
              <Switch id="anon-toggle" checked={form.is_anonymous} onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })} data-testid="anonymous-toggle" />
            </div>
            <p className="text-xs text-slate-600 mt-1">Your name will be shown as <strong>"Anonymous Finder"</strong>. The owner can still chat with you privately. Only the institute admin can see your identity.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)} data-testid="cancel-btn">Cancel</Button>
        <Button type="submit" disabled={submitting} className="bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="submit-btn">
          {submitting ? "Submitting…" : `Submit ${isLost ? "Lost" : "Found"} Report`}
        </Button>
      </div>
    </form>
  </div>
);
}
