import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Package, CheckCircle2, Users, MessageSquare, TrendingUp, Trash2, UserPlus, Upload, GraduationCap } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";

const COLORS = ["#1E3A8A", "#F59E0B", "#10B981", "#EF4444", "#6366F1", "#06B6D4", "#84CC16", "#EC4899", "#8B5CF6", "#F97316"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ roll_number : "", name: "", dob: "", email: "", branch: "", year: "" });
  const [csvText, setCsvText] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  const load = async () => {
    const [s, i, u, st] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/items"),
      api.get("/admin/users"),
      api.get("/admin/students"),
    ]);
    setStats(s.data); setItems(i.data); setUsers(u.data); setStudents(st.data);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try { await api.delete(`/items/${id}`); toast.success("Deleted"); load(); } catch (e) { toast.error("Failed"); }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    setAddingStudent(true);
    try {
      await api.post("/admin/students", newStudent);
      toast.success(`Student ${newStudent.roll_number} added`);
      setNewStudent({ roll_number: "", name: "", dob: "", email: "", branch: "", year: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add student");
    } finally { setAddingStudent(false); }
  };

  const onCsvFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const uploadCsv = async () => {
    if (!csvText.trim()) { toast.error("Paste CSV or select a file first"); return; }
    setUploadingCsv(true);
    try {
      const r = await api.post("/admin/students/bulk", { csv: csvText });
      toast.success(`Added ${r.data.added} student(s); skipped ${r.data.skipped.length}`);
      setCsvText("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Bulk upload failed");
    } finally { setUploadingCsv(false); }
  };

  const removeStudent = async (roll_number) => {
    if (!window.confirm(`Remove student ${roll_number}?`)) return;
    try { await api.delete(`/admin/students/${encodeURIComponent(roll_number)}`); toast.success("Removed"); load(); } catch (e) { toast.error("Failed"); }
  };

  if (!stats) return <div className="p-8 text-sm text-slate-500" data-testid="admin-loading">Loading…</div>;

  const cards = [
    { label: "Total reports", value: stats.total_items, icon: Package, color: "#1E3A8A" },
    { label: "Lost", value: stats.lost, icon: TrendingUp, color: "#EF4444" },
    { label: "Found", value: stats.found, icon: CheckCircle2, color: "#10B981" },
    { label: "Recovered", value: stats.recovered, icon: CheckCircle2, color: "#10B981" },
    { label: "Active users", value: stats.active_users, icon: Users, color: "#1E3A8A" },
    { label: "Conversations", value: stats.conversations, icon: MessageSquare, color: "#F59E0B" },
  ];

  const typeData = [{ name: "Lost", value: stats.lost }, { name: "Found", value: stats.found }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E3A8A]">Control room</span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1" data-testid="admin-title">Admin Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Moderate reports, view analytics and manage users.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border border border-border rounded-md overflow-hidden mb-6" data-testid="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.label}</span>
              <c.icon className="w-4 h-4" style={{ color: c.color }} />
            </div>
            <div className="font-display text-2xl font-bold text-slate-900 mt-2">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-border rounded-md p-5">
          <h3 className="font-display font-semibold text-slate-900">By category</h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <BarChart data={stats.by_category}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-border rounded-md p-5">
          <h3 className="font-display font-semibold text-slate-900">Lost vs Found</h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {typeData.map((_, i) => <Cell key={i} fill={i === 0 ? "#EF4444" : "#10B981"} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items" data-testid="admin-tab-items">All Reports ({items.length})</TabsTrigger>
          <TabsTrigger value="students" data-testid="admin-tab-students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="users" data-testid="admin-tab-users">Users ({users.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="mt-4">
          <div className="bg-white border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Location</TableHead><TableHead>Reporter</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.item_id} data-testid={`admin-row-${it.item_id}`}>
                    <TableCell><Link to={`/items/${it.item_id}`} className="font-medium text-[#1E3A8A] hover:underline">{it.title}</Link></TableCell>
                    <TableCell><Badge className={`text-[10px] uppercase ${it.type === "lost" ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}`}>{it.type}</Badge></TableCell>
                    <TableCell className="text-sm">{it.category}</TableCell>
                    <TableCell className="text-sm">{it.location}</TableCell>
                    <TableCell className="text-sm">{it.owner_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] uppercase">{it.status}</Badge></TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(it.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(it.item_id)} className="text-red-600 hover:bg-red-50" data-testid={`admin-delete-${it.item_id}`}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="students" className="mt-4 space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-md p-5">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-4 h-4 text-[#1E3A8A]" />
                <h3 className="font-display font-semibold text-slate-900">Add a student</h3>
              </div>
              <form onSubmit={addStudent} className="grid sm:grid-cols-2 gap-3" data-testid="add-student-form">
                <div>
                  <Label htmlFor="s-roll">Roll number *</Label>
                  <Input id="s-roll" required value={newStudent.roll_number} onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })} placeholder="e.g., 2514750010114" className="mt-1" data-testid="student-form-roll" />
                </div>
                <div>
                  <Label htmlFor="s-name">Full name *</Label>
                  <Input id="s-name" required value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="mt-1" data-testid="student-form-name" />
                </div>
                <div>
                  <Label htmlFor="s-dob">Date of birth *</Label>
                  <Input id="s-dob" type="date" required value={newStudent.dob} onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })} className="mt-1" data-testid="student-form-dob" />
                </div>
                <div>
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} className="mt-1" data-testid="student-form-email" />
                </div>
                <div>
                  <Label htmlFor="s-branch">Branch</Label>
                  <Input id="s-branch" value={newStudent.branch} onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })} placeholder="e.g., CSE" className="mt-1" data-testid="student-form-branch" />
                </div>
                <div>
                  <Label htmlFor="s-year">Year</Label>
                  <Input id="s-year" value={newStudent.year} onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })} placeholder="e.g., 2nd" className="mt-1" data-testid="student-form-year" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={addingStudent} className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="student-form-submit">
                    {addingStudent ? "Adding…" : "Add student"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-border rounded-md p-5">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-4 h-4 text-[#1E3A8A]" />
                <h3 className="font-display font-semibold text-slate-900">Bulk upload via CSV</h3>
              </div>
              <p className="text-xs text-slate-600 mb-3">Format: <code className="bg-slate-100 px-1.5 py-0.5 rounded">roll_number,name,dob,email,branch,year</code> — one student per line. DOB can be <code>DD/MM/YYYY</code> or <code>YYYY-MM-DD</code>.</p>
              <input type="file" accept=".csv,text/csv,text/plain" onChange={(e) => onCsvFile(e.target.files?.[0])} className="text-xs mb-2" data-testid="csv-file-input" />
              <Textarea rows={6} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="2514750010114,Student One,14/09/2005,,CSE,2nd&#10;2514750010012,Student Two,10/03/2006,,CSE,2nd" className="font-mono text-xs" data-testid="csv-textarea" />
              <Button onClick={uploadCsv} disabled={uploadingCsv} className="w-full mt-3 bg-[#1E3A8A] hover:bg-[#1E40AF]" data-testid="csv-upload-btn">
                {uploadingCsv ? "Uploading…" : "Upload CSV"}
              </Button>
            </div>
          </div>

          <div className="bg-white border border-border rounded-md overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2 bg-slate-50">
              <GraduationCap className="w-4 h-4 text-[#1E3A8A]" />
              <h3 className="font-display font-semibold text-slate-900">Registered students ({students.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll no.</TableHead><TableHead>Name</TableHead><TableHead>DOB</TableHead><TableHead>Branch</TableHead><TableHead>Year</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-8">No students registered yet.</TableCell></TableRow>}
                  {students.map((s) => (
                    <TableRow key={s.roll_number} data-testid={`student-row-${s.roll_number}`}>
                      <TableCell className="font-mono text-sm">{s.roll_number}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-sm">{s.dob}</TableCell>
                      <TableCell className="text-sm">{s.branch || "—"}</TableCell>
                      <TableCell className="text-sm">{s.year || "—"}</TableCell>
                      <TableCell className="text-sm text-slate-600">{s.email || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => removeStudent(s.roll_number)} className="text-red-600 hover:bg-red-50" data-testid={`student-delete-${s.roll_number}`}><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <div className="bg-white border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Provider</TableHead><TableHead>Joined</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell><Badge className={u.role === "admin" ? "bg-[#F59E0B] text-slate-900 hover:bg-[#F59E0B]" : ""} variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge></TableCell>
                    <TableCell className="text-sm">{u.auth_provider}</TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
