import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(location.state?.conv_id || null);
  const [data, setData] = useState(null);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  const loadConvs = async () => {
    const r = await api.get("/conversations");
    setConvs(r.data);
    if (!activeId && r.data.length > 0) setActiveId(r.data[0].conv_id);
  };
  const loadMsgs = async (cid) => {
    const r = await api.get(`/conversations/${cid}/messages`);
    setData(r.data);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => { loadConvs(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (activeId) loadMsgs(activeId); }, [activeId]);
  useEffect(() => {
    if (!activeId) return;
    const id = setInterval(() => loadMsgs(activeId), 5000);
    return () => clearInterval(id);
  }, [activeId]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    try {
      await api.post(`/conversations/${activeId}/messages`, { text: text.trim() });
      setText("");
      loadMsgs(activeId); loadConvs();
    } catch (err) { /* ignore */ }
  };

  const otherName = (c) => {
    const otherId = c.participants.find((p) => p !== user?.user_id);
    return c.participant_names?.[otherId] || "User";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-6" data-testid="messages-title">Messages</h1>
      <div className="bg-white border border-border rounded-md grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-h-[60vh] overflow-hidden">
        <div className={`md:col-span-1 border-r border-border ${activeId ? "hidden md:block" : ""}`} data-testid="conv-list">
          {convs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500"><MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />No conversations yet.</div>
          ) : convs.map((c) => (
            <button key={c.conv_id} onClick={() => setActiveId(c.conv_id)} className={`w-full text-left p-4 border-b border-border hover:bg-slate-50 transition ${activeId === c.conv_id ? "bg-blue-50/50 border-l-2 border-l-[#1E3A8A]" : ""}`} data-testid={`conv-${c.conv_id}`}>
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9"><AvatarFallback className="bg-[#1E3A8A] text-white text-xs">{otherName(c).split(" ").map((p) => p[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 truncate">{otherName(c)}</div>
                  <div className="text-xs text-slate-500 truncate">{c.last_message}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 ml-12 truncate">re: {c.item_title}</div>
            </button>
          ))}
        </div>

        <div className={`md:col-span-2 lg:col-span-3 flex flex-col ${!activeId ? "hidden md:flex" : ""}`}>
          {!data ? (
            <div className="flex-1 grid place-items-center text-sm text-slate-500">Select a conversation</div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <div className="font-display font-semibold text-slate-900">{otherName(data.conversation)}</div>
                  <div className="text-xs text-slate-500">re: {data.conversation.item_title}</div>
                </div>
                <button onClick={() => setActiveId(null)} className="md:hidden text-sm text-[#1E3A8A]">Back</button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50" data-testid="messages-pane">
                {data.messages.map((m) => {
                  const mine = m.sender_id === user?.user_id;
                  return (
                    <div key={m.msg_id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-md px-4 py-2 ${mine ? "bg-[#1E3A8A] text-white" : "bg-white border border-border text-slate-900"}`}>
                        <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                        <div className={`text-[10px] mt-1 ${mine ? "text-blue-200" : "text-slate-400"}`}>{new Date(m.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="p-3 border-t border-border flex gap-2 bg-white">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" data-testid="message-input" />
                <Button type="submit" className="bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="send-message-btn"><Send className="w-4 h-4" /></Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
