import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { MapPin, Plus } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Profile() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => { (async () => { const r = await api.get("/items/mine"); setItems(r.data); })(); }, []);

  const lost = items.filter((i) => i.type === "lost");
  const found = items.filter((i) => i.type === "found");
  const closed = items.filter((i) => i.status !== "active");

  const Card = ({ item }) => (
    <Link to={`/items/${item.item_id}`} className="bg-white border border-border rounded-md p-4 flex gap-4 hover:border-slate-300 hover:shadow-sm transition" data-testid={`profile-item-${item.item_id}`}>
      <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
        {item.images?.[0] ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-slate-300">{item.title[0]}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] uppercase ${item.type === "lost" ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}`}>{item.type}</Badge>
          {item.status !== "active" && <Badge className="text-[10px] uppercase bg-slate-200 text-slate-700 hover:bg-slate-200">{item.status}</Badge>}
        </div>
        <h3 className="font-display font-semibold text-slate-900 mt-1.5 truncate">{item.title}</h3>
        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{item.location} · {new Date(item.created_at).toLocaleDateString()}</div>
      </div>
    </Link>
  );

  const list = (arr) => arr.length === 0 ? (
    <div className="bg-white border border-border rounded-md p-12 text-center text-sm text-slate-500" data-testid="profile-empty">No items here yet.</div>
  ) : <div className="grid sm:grid-cols-2 gap-3">{arr.map((i) => <Card key={i.item_id} item={i} />)}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="bg-white border border-border rounded-md p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-[#1E3A8A] text-white grid place-items-center font-display font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900" data-testid="profile-name">{user?.name}</h1>
            <p className="text-sm text-slate-600">{user?.email}</p>
            {user?.role === "admin" && <Badge className="mt-1 bg-[#F59E0B] text-slate-900 hover:bg-[#F59E0B]">Admin</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/report/lost" data-testid="profile-report-lost"><Plus className="w-4 h-4 mr-1" />Lost</Link></Button>
          <Button asChild className="bg-[#1E3A8A] hover:bg-[#1E40AF]"><Link to="/report/found" data-testid="profile-report-found"><Plus className="w-4 h-4 mr-1" />Found</Link></Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="lost" data-testid="tab-lost">Lost ({lost.length})</TabsTrigger>
          <TabsTrigger value="found" data-testid="tab-found">Found ({found.length})</TabsTrigger>
          <TabsTrigger value="closed" data-testid="tab-closed">Closed ({closed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">{list(items)}</TabsContent>
        <TabsContent value="lost" className="mt-4">{list(lost)}</TabsContent>
        <TabsContent value="found" className="mt-4">{list(found)}</TabsContent>
        <TabsContent value="closed" className="mt-4">{list(closed)}</TabsContent>
      </Tabs>
    </div>
  );
}
