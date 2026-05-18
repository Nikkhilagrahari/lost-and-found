import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Calendar, MapPin, User as UserIcon, Mail, MessageSquare, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [msg, setMsg] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("recovered");

  const load = async () => {
    const r = await api.get(`/items/${id}`);
    setItem(r.data);
    try {
      const m = await api.get(`/items/${id}/matches`);
      setMatches(m.data);
    } catch (e) { /* ignore */ }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (!item) return <div className="max-w-5xl mx-auto p-8 text-sm text-slate-500" data-testid="item-loading">Loading…</div>;

  const isOwner = user?.user_id === item.owner_id;
  const isLost = item.type === "lost";

  const sendContact = async () => {
    if (!msg.trim()) { toast.error("Write a message"); return; }
    try {
      const r = await api.post("/conversations", { item_id: item.item_id, other_user_id: item.owner_id, initial_message: msg.trim() });
      toast.success("Message sent");
      setContactOpen(false); setMsg("");
      navigate("/messages", { state: { conv_id: r.data.conv_id } });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to send");
    }
  };

  const updateStatus = async () => {
    try {
      await api.patch(`/items/${item.item_id}`, { status: newStatus });
      toast.success("Status updated");
      setStatusOpen(false);
      load();
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async () => {
    if (!window.confirm("Delete this report?")) return;
    try { await api.delete(`/items/${item.id}`); toast.success("Deleted"); navigate("/browse"); }
    catch (e) { toast.error("Failed"); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 mb-4" data-testid="back-btn"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white border border-border rounded-md overflow-hidden">
            <div className="aspect-[4/3] bg-slate-100 relative">
              {item.image?.[activeImg] ? (
                <img src={item.image[activeImg]} alt={item.title} className="w-full h-full object-contain" data-testid="item-main-image" />
              ) : (
                <div className="w-full h-full grid place-items-center text-slate-300 text-7xl font-display">{item.title?.[0]?.toUpperCase()}</div>
              )}
              <Badge className={`absolute top-4 left-4 uppercase tracking-wider text-xs font-bold ${isLost ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}`}>{item.type}</Badge>
            </div>
            {item.image?.length > 1 && (
              <div className="flex gap-2 p-3 border-t border-border overflow-x-auto">
                {item.image.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${i === activeImg ? "border-[#1E3A8A]" : "border-transparent"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {matches.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-xl font-bold text-slate-900">Possible matches</h2>
              <p className="text-sm text-slate-600">Items that might be related</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {matches.map((m) => (
                  <Link key={m.item_id} to={`/items/${m.item_id}`} className="bg-white border border-border rounded-md p-3 flex gap-3 hover:border-slate-300 hover:shadow-sm transition" data-testid={`match-${m.item_id}`}>
                    <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {m.image?.[0] && <img src={m.image[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <Badge className={`text-[10px] uppercase ${m.type === "lost" ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}`}>{m.type}</Badge>
                      <h4 className="font-semibold text-sm mt-1 truncate">{m.title}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{m.location}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-md p-6 sticky top-20">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-[#1E3A8A] uppercase tracking-[0.18em]">{item.category}</span>
              <span>{item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "No date"}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mt-2" data-testid="item-title">{item.title}</h1>
            <p className="text-slate-700 mt-3 whitespace-pre-wrap leading-relaxed" data-testid="item-description">{item.description}</p>

            <div className="space-y-2 mt-5 text-sm">
              <div className="flex items-center gap-2 text-slate-700"><MapPin className="w-4 h-4 text-slate-400" /> {item.location}</div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                {
                  item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "No date"
                }
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <div>
                  Reported by:
                  <span className="font-medium ml-1">
                    {item.reported_by_name || user?.name || "Anonymous"}
                  </span>


                </div>
              </div>
              {item.reward && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">Reward offered: <strong>{item.reward}</strong></div>}
              {item.handover_status && (
                <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded px-3 py-2">Status: <strong>{item.handover_status.replace(/_/g, " ")}</strong></div>
              )}
              {item.status !== "active" && <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 uppercase">{item.status}</Badge>}
            </div>

            {!isOwner && user && item.status === "active" && (
              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-6 bg-[#1E3A8A] hover:bg-[#1E40AF] h-11" data-testid="contact-owner-btn">
                    <MessageSquare className="w-4 h-4 mr-2" /> {isLost ? "I might have found this" : "This is mine"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Message {item.user_id}</DialogTitle></DialogHeader>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">For safety, share details that prove you are the {isLost ? "finder" : "owner"} (e.g., specific contents, marks, etc.).</p>
                    <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="Hi! I think I have your…" data-testid="contact-message-input" />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setContactOpen(false)}>Cancel</Button>
                    <Button onClick={sendContact} className="bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="send-contact-btn">Send message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {isOwner && (
              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Owner actions</p>
                <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
                  <DialogTrigger asChild><Button variant="outline" className="w-full" data-testid="update-status-btn">Update status</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Update status</DialogTitle></DialogHeader>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="recovered">Recovered</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <DialogFooter><Button onClick={updateStatus} className="bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="confirm-status-btn">Save</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={remove} data-testid="delete-item-btn"><Trash2 className="w-4 h-4 mr-2" /> Delete report</Button>
              </div>
            )}

            {!user && (
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-slate-700">
                <Mail className="w-4 h-4 inline mr-1 text-[#1E3A8A]" /> <Link to="/login" className="text-[#1E3A8A] font-semibold hover:underline">Sign in</Link> with your institute email to contact the reporter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
