import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, CATEGORIES, LOCATIONS } from "../lib/api";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Search, MapPin, Calendar, Filter, X } from "lucide-react";

function ItemCard({ item }) {
  const isLost = item.type === "lost";
  const isClaimed = item.status !== "active";
  return (
    <Link to={`/items/${item._id}`} className={`group block bg-white border border-border rounded-md overflow-hidden hover:shadow-md hover:border-slate-300 transition-all ${isClaimed ? "opacity-60 grayscale-[0.4]" : ""}`} data-testid={`item-card-${item._id}`}>
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-300 text-5xl font-display">{item.title?.[0]?.toUpperCase() || "?"}</div>
        )}
        <Badge className={`absolute top-3 left-3 uppercase tracking-wider text-[10px] font-bold ${isLost ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}`}>
          {item.type}
        </Badge>
        {isClaimed && (
          <div className="absolute inset-0 bg-slate-900/40 grid place-items-center">
            <Badge className="bg-white text-slate-900 hover:bg-white text-xs uppercase tracking-wider px-3 py-1 font-bold">{item.status === "recovered" ? "✓ Recovered" : item.status}</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-[#1E3A8A]">{item.category}</span>
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
        <h3 className="font-display font-semibold text-slate-900 mt-1 line-clamp-1">{item.title}</h3>
        <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3"><MapPin className="w-3.5 h-3.5" /> {item.location}</div>
        {item.is_anonymous && <div className="text-[11px] text-slate-500 mt-1 italic">by Anonymous Finder</div>}
      </div>
    </Link>
  );
}

export default function Browse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: "", type: "all", category: "all", location: "all", status: "all" });

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/items", { params: filters });
      setItems(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const apply = (e) => { e?.preventDefault?.(); load(); };
  const reset = () => { setFilters({ q: "", type: "all", category: "all", location: "all", status: "all" }); setTimeout(load, 0); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E3A8A]">Campus reports</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Browse items</h1>
          <p className="text-sm text-slate-600 mt-1">{items.length} {items.length === 1 ? "item" : "items"} · campus-wide</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-[#EF4444] hover:bg-red-700"><Link to="/report/lost" data-testid="browse-cta-lost">Report Lost</Link></Button>
          <Button asChild className="bg-[#10B981] hover:bg-green-700"><Link to="/report/found" data-testid="browse-cta-found">Report Found</Link></Button>
        </div>
      </div>

      <form onSubmit={apply} className="bg-white border border-border rounded-md p-4 grid grid-cols-1 md:grid-cols-12 gap-3 mb-6" data-testid="filters-bar">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by keyword…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="pl-9" data-testid="filter-q" />
        </div>
        <div className="md:col-span-2">
          <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
            <SelectTrigger data-testid="filter-type"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="found">Found</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
            <SelectTrigger data-testid="filter-category"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Select value={filters.location} onValueChange={(v) => setFilters({ ...filters, location: v })}>
            <SelectTrigger data-testid="filter-location"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-12 flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={reset} data-testid="filter-reset"><X className="w-4 h-4 mr-1" /> Reset</Button>
          <Button type="submit" className="bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="filter-apply"><Filter className="w-4 h-4 mr-2" /> Apply filters</Button>
        </div>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white border border-border rounded-md aspect-[4/3] animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-border rounded-md p-12 text-center" data-testid="empty-state">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-display font-semibold text-slate-900 mt-3">No items found</h3>
          <p className="text-sm text-slate-600 mt-1">Try adjusting filters, or be the first to report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger" data-testid="items-grid">
          {items.map((it) => <ItemCard key={it.item_id} item={it} />)}
        </div>
      )}
    </div>
  );
}
