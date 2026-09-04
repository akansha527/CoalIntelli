import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import {
  LayoutDashboard, Search, FileText, TrendingUp, Settings,
  Mountain, Upload, ChevronRight, CheckCircle2, Clock, Database,
  FileSearch, ShieldCheck, ArrowUpRight, Link2, Trash2, X, Download,
  AlertCircle, Bell, Users, Building2, MapPin, Layers, Activity,
  Filter, Plus, AlertTriangle, Check, UserCheck, Eye, RefreshCw, Globe,
  FileSpreadsheet, Loader2
} from "lucide-react";

// Original Color System
const INK = "#1E2A28";
const PAPER = "#F3F0E7";
const CARD = "#FFFFFF";
const OCHRE = "#C1793A";
const OCHRE_DEEP = "#8F5527";
const TEAL = "#2F6E62";
const BORDER = "#E4E0D3";
const TEXT_MUTED = "#767C74";
const RED = "#B2482F";

const font = {
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

// Navigation Items
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "search", label: "Search & Q&A", icon: Search },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "trends", label: "Topics & trends", icon: TrendingUp },
  { id: "geo", label: "Geo Intelligence", icon: MapPin },
  { id: "alerts", label: "Alerts & Notifications", icon: Bell },
  { id: "psus", label: "PSUs & Subsidiaries", icon: Building2 },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

// ---------- Seed Data ----------

const initialDocuments = [
  { id: "d1", name: "CIL Annual Report 2024-25.pdf", type: "Annual report", org: "CIL", year: "2024-25", uploaded: "12 Aug 2026", size: "8.4 MB" },
  { id: "d2", name: "CMPDI Geological Survey — Talcher.pdf", type: "Survey", org: "CMPDI", year: "2024-25", uploaded: "10 Aug 2026", size: "3.1 MB" },
  { id: "d3", name: "SECL Mine Safety Audit Q1.xlsx", type: "Audit", org: "SECL", year: "2025-26", uploaded: "05 Aug 2026", size: "620 KB" },
  { id: "d4", name: "MCL Exploration Drilling Log.pdf", type: "Field data", org: "MCL", year: "2024-25", uploaded: "29 Jul 2026", size: "1.8 MB" },
  { id: "d5", name: "NCL Overburden Ratio Report.pdf", type: "Report", org: "NCL", year: "2024-25", uploaded: "22 Jul 2026", size: "970 KB" },
];

const initialFacts = [
  { id: "f1", docId: "d1", docName: "CIL Annual Report 2024-25.pdf", org: "CIL", year: "2024-25", metric: "Production",
    answer: "CIL production in FY 2024-25 was 781.056 MT, up from 755.613 MT the previous year.",
    location: "Page 95 · Table 12.1", keywords: ["production", "output", "mt", "tonnes", "cil", "produced"] },
  { id: "f2", docId: "d2", docName: "CMPDI Geological Survey — Talcher.pdf", org: "CMPDI", year: "2024-25", metric: "Exploration",
    answer: "142 exploratory boreholes were drilled across the Talcher coalfield during FY 2024-25, a 12% increase over the previous cycle.",
    location: "Page 41 · Section 4.2", keywords: ["exploration", "boreholes", "drilling", "talcher", "coalfield", "drilled"] },
  { id: "f3", docId: "d3", docName: "SECL Mine Safety Audit Q1.xlsx", org: "SECL", year: "2025-26", metric: "Safety",
    answer: "The Q1 safety audit recorded 0.24 reportable accidents per 100,000 man-hours, below the departmental threshold of 0.35.",
    location: "Sheet 2 · Row 18", keywords: ["safety", "accident", "accidents", "incident", "audit", "man-hours"] },
  { id: "f4", docId: "d4", docName: "MCL Exploration Drilling Log.pdf", org: "MCL", year: "2024-25", metric: "Quality",
    answer: "Average gross calorific value (GCV) across sampled seams was 3,800 kcal/kg, consistent with grade G9 classification.",
    location: "Page 12 · Table 3", keywords: ["quality", "gcv", "calorific", "grade", "seam", "seams"] },
  { id: "f5", docId: "d5", docName: "NCL Overburden Ratio Report.pdf", org: "NCL", year: "2024-25", metric: "Environment",
    answer: "The overburden ratio for NCL opencast mines was 2.85 cubic metres per tonne, within the approved environmental clearance limit.",
    location: "Page 7 · Table 1", keywords: ["overburden", "environment", "opencast", "ratio", "clearance", "ncl"] },
];

const productionData = [
  { year: "2021-22", mt: 622 },
  { year: "2022-23", mt: 703 },
  { year: "2023-24", mt: 755.6 },
  { year: "2024-25", mt: 781.1 },
];

const topicColors = { Production: OCHRE, Exploration: TEAL, Quality: "#9BA88E", Safety: "#D9A15E", Environment: "#6C8C82" };

const trendData = [
  { year: "2021-22", exploration: 40, safety: 22 },
  { year: "2022-23", exploration: 48, safety: 27 },
  { year: "2023-24", exploration: 55, safety: 31 },
  { year: "2024-25", exploration: 63, safety: 29 },
];

const initialAlerts = [
  { id: "a1", title: "High value discrepancy detected in NCL Production Report 2025", time: "10 min ago", severity: "high", category: "Discrepancy", doc: "NCL Production Report 2025.pdf", read: false },
  { id: "a2", title: "New document selected SECL Annual Aspect 2024-25.pdf", time: "30 min ago", severity: "info", category: "Ingestion", doc: "SECL Annual Aspect 2024-25.pdf", read: false },
  { id: "a3", title: "System backup completed successfully", time: "2 hours ago", severity: "success", category: "System", doc: "Automated System Log", read: true },
  { id: "a4", title: "Methane concentration anomaly flagged in Jharia deep seam", time: "3 hours ago", severity: "warning", category: "Safety", doc: "BCCL Safety Sensor Log Q2", read: false },
  { id: "a5", title: "Environmental Clearance renewal required for Talcher Block B", time: "5 hours ago", severity: "warning", category: "Compliance", doc: "MCL Environmental Filing 2025", read: true },
];

const subsidiariesData = [
  { id: "secl", code: "SECL", name: "South Eastern Coalfields Ltd", hq: "Bilaspur, CG", target: 185, production: 178.5, mines: 68, leader: "Dr. B.K. Sharma", status: "Optimal", esgScore: "94%" },
  { id: "mcl", code: "MCL", name: "Mahanadi Coalfields Ltd", hq: "Sambalpur, Odisha", target: 195, production: 193.2, mines: 42, leader: "Smt. R. Patnaik", status: "Exceeding", esgScore: "96%" },
  { id: "ncl", code: "NCL", name: "Northern Coalfields Ltd", hq: "Singrauli, MP", target: 135, production: 136.1, mines: 10, leader: "Er. V.K. Singh", status: "Exceeding", esgScore: "92%" },
  { id: "ccl", code: "CCL", name: "Central Coalfields Ltd", hq: "Ranchi, Jharkhand", target: 88, production: 84.8, mines: 46, leader: "Shri A.K. Roy", status: "Near Target", esgScore: "90%" },
  { id: "ecl", code: "ECL", name: "Eastern Coalfields Ltd", hq: "Sanctoria, WB", target: 52, production: 48.2, mines: 75, leader: "Shri P.S. Mishra", status: "Attention", esgScore: "87%" },
  { id: "bccl", code: "BCCL", name: "Bharat Coking Coal Ltd", hq: "Dhanbad, Jharkhand", target: 42, production: 41.0, mines: 36, leader: "Dr. S.K. Dutta", status: "Optimal", esgScore: "89%" },
  { id: "wcl", code: "WCL", name: "Western Coalfields Ltd", hq: "Nagpur, MS", target: 67, production: 64.3, mines: 58, leader: "Shri M.K. Reddy", status: "Near Target", esgScore: "91%" },
  { id: "cmpdi", code: "CMPDI", name: "Central Mine Planning & Design Inst.", hq: "Ranchi, Jharkhand", target: 0, production: 0, mines: 7, leader: "Shri R.K. Jain", status: "Planning Arm", esgScore: "98%" },
];

const geoLocations = [
  { id: "g1", name: "Jayant Opencast Mine", org: "NCL", lat: 24.1167, lng: 82.6500, type: "production", capacity: "25 MTPA", grade: "G8", status: "Active", overburden: "2.8 m³/t", state: "Madhya Pradesh" },
  { id: "g2", name: "Gevra Opencast Mine", org: "SECL", lat: 22.3333, lng: 82.5833, type: "production", capacity: "45 MTPA", grade: "G10", status: "Active", overburden: "2.1 m³/t", state: "Chhattisgarh" },
  { id: "g3", name: "Dipka Mine", org: "SECL", lat: 22.3167, lng: 82.5500, type: "production", capacity: "35 MTPA", grade: "G11", status: "Active", overburden: "2.4 m³/t", state: "Chhattisgarh" },
  { id: "g4", name: "Talcher Deep Exploration Block", org: "MCL", lat: 20.9500, lng: 85.2167, type: "exploration", capacity: "Est. 800 MT", grade: "G9", status: "Survey Phase", overburden: "N/A", state: "Odisha" },
  { id: "g5", name: "Kusmunda OCP", org: "SECL", lat: 22.3500, lng: 82.6167, type: "production", capacity: "50 MTPA", grade: "G10", status: "Active", overburden: "2.0 m³/t", state: "Chhattisgarh" },
  { id: "g6", name: "Jharia Coking Coal Block IV", org: "BCCL", lat: 23.7500, lng: 86.4167, type: "exploration", capacity: "Est. 350 MT", grade: "W-II Coking", status: "Under Audit", overburden: "N/A", state: "Jharkhand" },
  { id: "g7", name: "Jharsuguda Coal Washery #2", org: "MCL", lat: 21.8500, lng: 84.0167, type: "washery", capacity: "10 MTPA", grade: "Washed G7", status: "Operational", overburden: "N/A", state: "Odisha" },
  { id: "g8", name: "Singrauli Rail Siding Hub", org: "NCL", lat: 24.2000, lng: 82.7000, type: "infrastructure", capacity: "18 Rakes/Day", grade: "Infra", status: "Active", overburden: "N/A", state: "Madhya Pradesh" },
  { id: "g9", name: "Rajmahal Opencast Mine", org: "ECL", lat: 25.0500, lng: 87.5333, type: "production", capacity: "17 MTPA", grade: "G12", status: "Active", overburden: "3.1 m³/t", state: "Jharkhand" },
  { id: "g10", name: "Piparwar Mine", org: "CCL", lat: 23.6500, lng: 85.0333, type: "production", capacity: "14 MTPA", grade: "G10", status: "Active", overburden: "2.6 m³/t", state: "Jharkhand" },
  { id: "g11", name: "Wani Coalfield", org: "WCL", lat: 20.0500, lng: 78.9500, type: "production", capacity: "12 MTPA", grade: "G9", status: "Active", overburden: "2.9 m³/t", state: "Maharashtra" },
  { id: "g12", name: "Kothagudem Mining Block", org: "SCCL", lat: 17.5000, lng: 80.6167, type: "exploration", capacity: "15 MTPA", grade: "G8", status: "Active", overburden: "2.3 m³/t", state: "Telangana" },
];

const initialUsers = [
  { id: "u1", name: "CMPDI Officer", email: "officer.cmpdi@coal.gov.in", role: "CMPDI Officer", org: "CMPDI", status: "Active", avatar: "CO", permissions: ["Full Read", "AI Search", "Geo Maps", "Report Generation"] },
  { id: "u2", name: "Rajesh Kumar", email: "r.kumar@ncl.gov.in", role: "Mining Analyst", org: "NCL", status: "Active", avatar: "RK", permissions: ["Data Extractor", "View Reports", "Audit Logs"] },
  { id: "u3", name: "Sunita Rao", email: "s.rao@secl.gov.in", role: "Environmental Auditor", org: "SECL", status: "Active", avatar: "SR", permissions: ["Ecology Reports", "Geo Intelligence", "Alerts Manager"] },
  { id: "u4", name: "Amitabh Sen", email: "a.sen@ccl.gov.in", role: "Subsidiary Admin", org: "CCL", status: "Active", avatar: "AS", permissions: ["Full Access - CCL", "User Management"] },
];

// ---------- Search Engine ----------

function runSearch(query, facts) {
  const tokens = query.toLowerCase().replace(/[^a-z0-9\s-]/g, "").split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let best = null;
  let bestScore = 0;
  for (const fact of facts) {
    const haystack = [fact.metric, fact.org, fact.docName, ...fact.keywords].join(" ").toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (t.length < 3) continue;
      if (haystack.includes(t)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = fact;
    }
  }
  if (!best || bestScore === 0) return null;
  const confidence = Math.min(98, 62 + bestScore * 9);
  return { fact: best, confidence, matchedTerms: bestScore };
}

// ---------- UI Building Blocks ----------

function StatCard({ label, value, delta, icon: Icon }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: font.body, fontSize: 13, color: TEXT_MUTED }}>{label}</span>
        <Icon size={16} color={OCHRE} strokeWidth={1.8} />
      </div>
      <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 600, color: INK, marginTop: 10 }}>{value}</div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
          <ArrowUpRight size={13} color={TEAL} />
          <span style={{ fontFamily: font.mono, fontSize: 12, color: TEAL }}>{delta}</span>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 34, height: 19, borderRadius: 999, border: "none", cursor: "pointer",
        background: on ? TEAL : "#D8D3C4", position: "relative", flexShrink: 0, padding: 0,
        transition: "background 0.15s ease",
      }}
    >
      <div style={{
        width: 15, height: 15, borderRadius: "50%", background: "#fff", position: "absolute",
        top: 2, left: on ? 17 : 2, transition: "left 0.15s ease",
      }} />
    </button>
  );
}

function Sidebar({ active, setActive, docCount, activeUser, onSwitchRole }) {
  return (
    <div style={{ width: 232, minWidth: 232, background: INK, height: "100%", padding: "22px 14px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 26px 8px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: OCHRE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mountain size={18} color={INK} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: "#F3F0E7", lineHeight: 1.1 }}>CoalIntelli</div>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: "#8FA39C", letterSpacing: 0.4 }}>SIH26023</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px",
                borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? "rgba(193,121,58,0.16)" : "transparent",
                color: isActive ? "#F3F0E7" : "#9BA79F",
                fontFamily: font.body, fontSize: 13, fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? `2px solid ${OCHRE}` : "2px solid transparent",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={15} strokeWidth={1.8} />
                {item.label}
              </span>
              {item.id === "documents" && (
                <span style={{ fontFamily: font.mono, fontSize: 10.5, color: "#8FA39C" }}>{docCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: OCHRE, color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>
            {activeUser.avatar}
          </div>
          <div>
            <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: "#F3F0E7" }}>{activeUser.name}</div>
            <div style={{ fontFamily: font.body, fontSize: 10, color: "#8FA39C" }}>{activeUser.role}</div>
          </div>
        </div>
        <button
          onClick={onSwitchRole}
          style={{
            width: "100%", padding: "5px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent", color: "#9BA79F", fontSize: 11, cursor: "pointer", fontFamily: font.body
          }}
        >
          Switch Role
        </button>
      </div>
    </div>
  );
}

function TopBar({ title, subtitle, onOpenUploadModal }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
      <div>
        <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>{title}</h1>
        <p style={{ fontFamily: font.body, fontSize: 13.5, color: TEXT_MUTED, margin: "4px 0 0 0" }}>{subtitle}</p>
      </div>
      <div>
        <button
          onClick={onOpenUploadModal}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9,
            background: INK, color: "#F3F0E7", border: "none", cursor: "pointer",
            fontFamily: font.body, fontSize: 13, fontWeight: 500, boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          <Upload size={14} /> Upload document
        </button>
      </div>
    </div>
  );
}

// ---------- 1. ORIGINAL DASHBOARD VIEW ----------

function DashboardView({ documents, facts, queriesAsked, reportsGenerated, onGenerateReport, onOpenUploadModal }) {
  return (
    <div>
      <TopBar title="Dashboard" subtitle="Geological, mining and reporting overview across CIL subsidiaries" onOpenUploadModal={onOpenUploadModal} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total documents" value={documents.length.toLocaleString()} delta={`${facts.length} facts indexed`} icon={FileText} />
        <StatCard label="Reports generated" value={reportsGenerated} delta="Click generate below" icon={FileSearch} />
        <StatCard label="Queries answered" value={queriesAsked} delta="This session" icon={Search} />
        <StatCard label="Data points extracted" value={(facts.length * 240000).toLocaleString()} delta="Verified & traceable" icon={Database} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontFamily: font.display, fontSize: 14.5, fontWeight: 600, color: INK, marginBottom: 4 }}>
            CIL production trend
          </div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: TEXT_MUTED, marginBottom: 8 }}>Million tonnes, year on year</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={productionData} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={BORDER} vertical={false} />
              <XAxis dataKey="year" tick={{ fontFamily: font.mono, fontSize: 11, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis tick={{ fontFamily: font.mono, fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: font.body, fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}` }} />
              <Line type="monotone" dataKey="mt" stroke={OCHRE} strokeWidth={2.5} dot={{ r: 4, fill: OCHRE }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT SIDE OF OVERVIEW PRESERVED */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontFamily: font.display, fontSize: 14.5, fontWeight: 600, color: INK, marginBottom: 4 }}>
            Facts by topic
          </div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: TEXT_MUTED, marginBottom: 8 }}>Live count from indexed documents</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={Object.entries(
                  facts.reduce((acc, f) => ({ ...acc, [f.metric]: (acc[f.metric] || 0) + 1 }), {})
                ).map(([name, value]) => ({ name, value }))}
                dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={2}
              >
                {facts.length > 0 && Object.keys(
                  facts.reduce((acc, f) => ({ ...acc, [f.metric]: true }), {})
                ).map((name, i) => <Cell key={i} fill={topicColors[name] || "#C9C4B3"} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: font.body, fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}` }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: font.display, fontSize: 14.5, fontWeight: 600, color: INK }}>
            Recent documents
          </div>
          <button
            onClick={onGenerateReport}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8,
              background: PAPER, border: `1px solid ${BORDER}`, cursor: "pointer",
              fontFamily: font.body, fontSize: 12.5, color: INK,
            }}
          >
            <Download size={13} /> Generate summary report
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Document", "Type", "Organization", "Year", "Uploaded"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontFamily: font.body, fontSize: 11.5, color: TEXT_MUTED, fontWeight: 500, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.slice(0, 6).map((d) => (
              <tr key={d.id}>
                <td style={{ fontFamily: font.body, fontSize: 13, color: INK, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{d.name}</td>
                <td style={{ fontFamily: font.body, fontSize: 13, color: TEXT_MUTED, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{d.type}</td>
                <td style={{ fontFamily: font.mono, fontSize: 12, color: TEXT_MUTED, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{d.org}</td>
                <td style={{ fontFamily: font.mono, fontSize: 12, color: TEXT_MUTED, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{d.year}</td>
                <td style={{ fontFamily: font.body, fontSize: 12.5, color: TEXT_MUTED, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{d.uploaded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- REAL LEAFLET MAP COMPONENT ----------

function LeafletGeoMap({ selectedLocation, setSelectedLocation, layers }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapType, setMapType] = useState("satellite");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 82.5],
        zoom: 6,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === "satellite") {
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18,
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      }).addTo(map);
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
    }
  }, [mapType]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    geoLocations.forEach((loc) => {
      if (!layers[loc.type]) return;

      const isSelected = selectedLocation && selectedLocation.id === loc.id;
      const color = loc.type === "production" ? OCHRE : loc.type === "exploration" ? TEAL : loc.type === "washeries" ? "#9BA88E" : "#D9A15E";

      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: color,
        color: "#FFFFFF",
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <div style="font-weight: bold; color: ${INK}; font-size: 13px;">${loc.name}</div>
          <div style="color: ${OCHRE_DEEP}; font-size: 11px; margin-top: 2px;">${loc.org} Subsidiary (${loc.state})</div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 6px 0;" />
          <div><strong>Capacity:</strong> ${loc.capacity}</div>
          <div><strong>Grade:</strong> ${loc.grade}</div>
          <div><strong>Status:</strong> <span style="color:${TEAL}">${loc.status}</span></div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        setSelectedLocation(loc);
      });

      markersRef.current.push(marker);
    });
  }, [layers, selectedLocation, setSelectedLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 10, overflow: "hidden" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />

      <div style={{
        position: "absolute", top: 12, right: 12, zIndex: 500,
        background: "rgba(30, 42, 40, 0.9)", borderRadius: 8, padding: 4, display: "flex", gap: 4
      }}>
        <button
          onClick={() => setMapType("satellite")}
          style={{
            border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer",
            background: mapType === "satellite" ? OCHRE : "transparent",
            color: mapType === "satellite" ? INK : "#F3F0E7",
            fontFamily: font.mono, fontSize: 11, fontWeight: mapType === "satellite" ? 600 : 400
          }}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType("osm")}
          style={{
            border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer",
            background: mapType === "osm" ? OCHRE : "transparent",
            color: mapType === "osm" ? INK : "#F3F0E7",
            fontFamily: font.mono, fontSize: 11, fontWeight: mapType === "osm" ? 600 : 400
          }}
        >
          Street Map
        </button>
      </div>

      <div style={{
        position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", zIndex: 500,
        background: "rgba(30, 42, 40, 0.92)", borderRadius: 8, padding: "6px 16px", display: "flex", gap: 18,
        fontFamily: font.mono, fontSize: 11, color: "#F3F0E7", boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>
        <span><strong style={{ color: OCHRE }}>145</strong> Mines</span>
        <span><strong style={{ color: TEAL }}>60</strong> Exploration</span>
        <span><strong style={{ color: "#D9A15E" }}>78</strong> Infra</span>
        <span><strong style={{ color: "#9BA88E" }}>36</strong> Washeries</span>
      </div>
    </div>
  );
}

// ---------- 2. FEATURE: GEO INTELLIGENCE WITH WORKING MAP ----------

function GeoIntelligenceView({ onOpenUploadModal }) {
  const [selectedLocation, setSelectedLocation] = useState(geoLocations[0]);
  const [layers, setLayers] = useState({ production: true, exploration: true, infrastructure: true, washeries: true });

  return (
    <div>
      <TopBar title="Geo Intelligence" subtitle="Spatial map of Indian coalfield lease areas, mines, and infrastructure" onOpenUploadModal={onOpenUploadModal} />

      <div style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: 14, height: 500 }}>
        <div style={{ background: INK, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: font.display, fontSize: 14.5, color: "#F3F0E7", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <Globe size={16} color={OCHRE} /> Live Mining GIS Map (OpenStreetMap & Satellite)
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {Object.keys(layers).map(k => (
                <button
                  key={k}
                  onClick={() => setLayers(prev => ({ ...prev, [k]: !prev[k] }))}
                  style={{
                    fontFamily: font.mono, fontSize: 10.5, padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                    background: layers[k] ? OCHRE : "#2A3835", color: layers[k] ? INK : "#9BA79F"
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <LeafletGeoMap
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              layers={layers}
            />
          </div>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontFamily: font.display, fontSize: 14.5, fontWeight: 600, color: INK, marginBottom: 12 }}>
            Mine Inspector
          </div>
          {selectedLocation && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: PAPER, padding: 12, borderRadius: 9 }}>
                <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, color: INK }}>{selectedLocation.name}</div>
                <div style={{ fontFamily: font.mono, fontSize: 11, color: OCHRE_DEEP, marginTop: 2 }}>
                  {selectedLocation.org} Subsidiary · {selectedLocation.state}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontFamily: font.body, fontSize: 12 }}>
                <div style={{ border: `1px solid ${BORDER}`, padding: 8, borderRadius: 6 }}>
                  <div style={{ color: TEXT_MUTED }}>Capacity</div>
                  <div style={{ fontFamily: font.mono, fontWeight: 600, color: INK }}>{selectedLocation.capacity}</div>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, padding: 8, borderRadius: 6 }}>
                  <div style={{ color: TEXT_MUTED }}>Grade</div>
                  <div style={{ fontFamily: font.mono, fontWeight: 600, color: INK }}>{selectedLocation.grade}</div>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, padding: 8, borderRadius: 6 }}>
                  <div style={{ color: TEXT_MUTED }}>Status</div>
                  <div style={{ fontFamily: font.mono, fontWeight: 600, color: TEAL }}>{selectedLocation.status}</div>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, padding: 8, borderRadius: 6 }}>
                  <div style={{ color: TEXT_MUTED }}>Overburden</div>
                  <div style={{ fontFamily: font.mono, fontWeight: 600, color: INK }}>{selectedLocation.overburden}</div>
                </div>
              </div>
              <div style={{ border: `1px solid ${BORDER}`, padding: 10, borderRadius: 6, fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                <div style={{ fontWeight: 600, color: INK, marginBottom: 2 }}>GPS Coordinates</div>
                <div style={{ fontFamily: font.mono }}>Lat: {selectedLocation.lat}° N, Lng: {selectedLocation.lng}° E</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- 3. FEATURE: ALERTS & NOTIFICATIONS ----------

function AlertsNotificationsView({ alerts, setAlerts, onOpenUploadModal }) {
  const [filter, setFilter] = useState("All");
  const filtered = alerts.filter(a => filter === "All" || a.category === filter);

  return (
    <div>
      <TopBar title="Alerts & Notifications" subtitle="Real-time system alerts, document discrepancies and safety triggers" onOpenUploadModal={onOpenUploadModal} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All", "Discrepancy", "Safety", "Ingestion", "Compliance", "System"].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "6px 12px", borderRadius: 999, border: `1px solid ${filter === cat ? OCHRE : BORDER}`,
              background: filter === cat ? "#F6E9DA" : CARD, cursor: "pointer",
              fontFamily: font.body, fontSize: 12, color: filter === cat ? OCHRE_DEEP : TEXT_MUTED,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(a => (
          <div key={a.id} style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <AlertTriangle size={18} color={a.severity === "high" ? RED : OCHRE} />
              <div>
                <div style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 500, color: INK }}>{a.title}</div>
                <div style={{ fontFamily: font.mono, fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{a.doc} · {a.time}</div>
              </div>
            </div>
            <button
              onClick={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, read: true } : x))}
              style={{
                padding: "5px 10px", borderRadius: 6, border: `1px solid ${BORDER}`,
                background: a.read ? PAPER : CARD, color: a.read ? TEXT_MUTED : INK,
                fontFamily: font.body, fontSize: 11.5, cursor: "pointer"
              }}
            >
              {a.read ? "Resolved" : "Mark as read"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- 4. FEATURE: PSUs & SUBSIDIARIES ----------

function PSUsSubsidiariesView({ onOpenUploadModal }) {
  return (
    <div>
      <TopBar title="PSUs & Subsidiaries" subtitle="Performance matrix and annual target monitoring across CIL subsidiaries" onOpenUploadModal={onOpenUploadModal} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {subsidiariesData.map(sub => (
          <div key={sub.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: INK }}>{sub.code}</div>
                <div style={{ fontFamily: font.body, fontSize: 12, color: TEXT_MUTED }}>{sub.name}</div>
              </div>
              <span style={{ fontFamily: font.mono, fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "#F6E9DA", color: OCHRE_DEEP }}>
                {sub.status}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12, fontFamily: font.body, fontSize: 12 }}>
              <div>
                <div style={{ color: TEXT_MUTED }}>Target</div>
                <div style={{ fontFamily: font.mono, fontWeight: 600, color: INK }}>{sub.target} MT</div>
              </div>
              <div>
                <div style={{ color: TEXT_MUTED }}>Actual Output</div>
                <div style={{ fontFamily: font.mono, fontWeight: 600, color: TEAL }}>{sub.production} MT</div>
              </div>
              <div>
                <div style={{ color: TEXT_MUTED }}>Active Mines</div>
                <div style={{ fontFamily: font.mono, fontWeight: 600, color: INK }}>{sub.mines}</div>
              </div>
              <div>
                <div style={{ color: TEXT_MUTED }}>ESG Score</div>
                <div style={{ fontFamily: font.mono, fontWeight: 600, color: OCHRE }}>{sub.esgScore}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- 5. FEATURE: USERS & ROLES ----------

function UsersRolesView({ users, activeUser, setActiveUser, onOpenUploadModal }) {
  return (
    <div>
      <TopBar title="Users & Roles" subtitle="Role-Based Access Control (RBAC) and user management" onOpenUploadModal={onOpenUploadModal} />

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font.body, fontSize: 13 }}>
          <thead>
            <tr>
              {["User", "Email", "Role", "Organization", "Action"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: 11.5, color: TEXT_MUTED, fontWeight: 500, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: "12px 0", color: INK, fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>{u.name}</td>
                <td style={{ padding: "12px 0", color: TEXT_MUTED, borderBottom: `1px solid ${BORDER}` }}>{u.email}</td>
                <td style={{ padding: "12px 0", color: TEAL, fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>{u.role}</td>
                <td style={{ padding: "12px 0", fontFamily: font.mono, color: TEXT_MUTED, borderBottom: `1px solid ${BORDER}` }}>{u.org}</td>
                <td style={{ padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <button
                    onClick={() => setActiveUser(u)}
                    style={{
                      padding: "4px 10px", borderRadius: 6, border: `1px solid ${BORDER}`,
                      background: activeUser.id === u.id ? "#F6E9DA" : CARD,
                      color: activeUser.id === u.id ? OCHRE_DEEP : INK,
                      fontSize: 11.5, cursor: "pointer", fontFamily: font.body
                    }}
                  >
                    {activeUser.id === u.id ? "Active Persona" : "Switch to User"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- ORIGINAL SEARCH VIEW ----------

function SearchView({ facts, onQuery, history, onOpenUploadModal }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const runQuery = (q) => {
    const text = (q !== undefined ? q : query).trim();
    if (!text) return;
    setQuery(text);
    setLoading(true);
    setResult(null);
    setNotFound(false);
    setTimeout(() => {
      const found = runSearch(text, facts);
      onQuery(text, !!found);
      if (found) {
        setResult(found);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 500);
  };

  const suggestions = ["What was CIL production in FY 2024-25?", "How many boreholes were drilled in Talcher?", "What was the overburden ratio at NCL?"];

  return (
    <div>
      <TopBar title="Search & Q&A" subtitle="Ask a question across every ingested report — every answer is traced to its source" onOpenUploadModal={onOpenUploadModal} />

      <div style={{ background: INK, borderRadius: 14, padding: 20, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runQuery()}
            placeholder="What was CIL production in FY 2024-25?"
            style={{
              flex: 1, padding: "12px 14px", borderRadius: 9, border: "none",
              background: "#2A3835", color: "#F3F0E7", fontFamily: font.body, fontSize: 14, outline: "none",
            }}
          />
          <button onClick={() => runQuery()} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "0 18px", borderRadius: 9,
            background: OCHRE, color: INK, border: "none", cursor: "pointer",
            fontFamily: font.body, fontSize: 13.5, fontWeight: 600,
          }}>
            <Search size={14} /> Ask
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {Array.from(new Set(facts.map((f) => f.metric))).map((f) => (
            <button
              key={f}
              onClick={() => runQuery(f)}
              style={{
                fontFamily: font.mono, fontSize: 11, color: "#9BA79F", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 999, padding: "4px 10px", background: "transparent", cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ fontFamily: font.body, fontSize: 13, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} /> Searching across {facts.length} indexed facts…
        </div>
      )}

      {notFound && !loading && (
        <div style={{ background: "#FBEDE7", border: `1px solid #E6C9B8`, borderRadius: 14, padding: "18px 20px", display: "flex", gap: 12 }}>
          <AlertCircle size={18} color={RED} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: font.body, fontSize: 13.5, color: INK, fontWeight: 500, marginBottom: 3 }}>No confident match found</div>
            <div style={{ fontFamily: font.body, fontSize: 12.5, color: TEXT_MUTED }}>
              None of the indexed documents contain enough matching terms for "{query}". Try rephrasing, or upload a document that covers this topic.
            </div>
          </div>
        </div>
      )}

      {result && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CheckCircle2 size={16} color={TEAL} />
              <span style={{ fontFamily: font.body, fontSize: 12, color: TEAL, fontWeight: 500 }}>Answer generated with evidence</span>
            </div>
            <p style={{ fontFamily: font.display, fontSize: 18, fontWeight: 500, color: INK, lineHeight: 1.5, margin: "0 0 18px 0" }}>
              {result.fact.answer}
            </p>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
              <div style={{ fontFamily: font.body, fontSize: 12, color: TEXT_MUTED, marginBottom: 10 }}>Resolution steps</div>
              {[
                `Identify entity (${result.fact.org}) and metric (${result.fact.metric})`,
                "Search across ingested documents",
                `Match ${result.matchedTerms} term${result.matchedTerms === 1 ? "" : "s"} against indexed facts`,
                "Validate and fetch the supporting source",
                "Generate answer with evidence",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.mono, fontSize: 10, color: OCHRE_DEEP }}>{i + 1}</div>
                  <span style={{ fontFamily: font.body, fontSize: 12.5, color: INK }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Link2 size={15} color={OCHRE_DEEP} />
              <span style={{ fontFamily: font.body, fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>Source evidence</span>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 13.5, color: INK, fontWeight: 500 }}>{result.fact.docName}</div>
            <div style={{ fontFamily: font.mono, fontSize: 11.5, color: TEXT_MUTED, marginTop: 3 }}>{result.fact.location}</div>

            <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={15} color={TEAL} />
                <span style={{ fontFamily: font.body, fontSize: 12, color: TEXT_MUTED }}>Confidence score</span>
              </div>
              <span style={{ fontFamily: font.mono, fontSize: 15, color: TEAL, fontWeight: 600 }}>{result.confidence}%</span>
            </div>
            <div style={{ height: 5, background: PAPER, borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${result.confidence}%`, background: TEAL, borderRadius: 999, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      )}

      {!result && !notFound && !loading && (
        <div>
          <div style={{ fontFamily: font.body, fontSize: 13, color: TEXT_MUTED, marginBottom: 10 }}>Try one of these:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => runQuery(s)}
                style={{
                  textAlign: "left", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 9,
                  padding: "10px 14px", fontFamily: font.body, fontSize: 13, color: INK, cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- ORIGINAL DOCUMENTS VIEW ----------

function DocumentsView({ documents, onDelete, onOpenUploadModal }) {
  const [filter, setFilter] = useState("");

  const filtered = documents.filter((d) =>
    (d.name + d.org + d.type + d.year).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Documents" subtitle="Every scanned PDF, spreadsheet and report, ingested and indexed" onOpenUploadModal={onOpenUploadModal} />

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by name, organization or type"
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 9, border: `1px solid ${BORDER}`,
          background: CARD, fontFamily: font.body, fontSize: 13, color: INK, outline: "none", marginBottom: 16, boxSizing: "border-box",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {filtered.map((d) => (
          <div key={d.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px", display: "flex", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={17} color={OCHRE_DEEP} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontFamily: font.body, fontSize: 13.5, color: INK, fontWeight: 500, marginBottom: 4, wordBreak: "break-word" }}>{d.name}</div>
                <button
                  onClick={() => onDelete(d.id)}
                  aria-label={`Remove ${d.name}`}
                  style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, flexShrink: 0, padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: font.mono, fontSize: 10.5, color: OCHRE_DEEP, background: "#F6E9DA", padding: "2px 8px", borderRadius: 999 }}>{d.type}</span>
                <span style={{ fontFamily: font.mono, fontSize: 10.5, color: TEXT_MUTED }}>{d.org} · {d.year} · {d.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- ORIGINAL TRENDS VIEW ----------

function TrendsView({ onOpenUploadModal }) {
  const [metric, setMetric] = useState("both");

  return (
    <div>
      <TopBar title="Topics & trends" subtitle="How report themes have shifted across years" onOpenUploadModal={onOpenUploadModal} />

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ id: "both", label: "Both" }, { id: "exploration", label: "Exploration only" }, { id: "safety", label: "Safety only" }].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setMetric(opt.id)}
            style={{
              padding: "7px 13px", borderRadius: 999, border: `1px solid ${metric === opt.id ? OCHRE : BORDER}`,
              background: metric === opt.id ? "#F6E9DA" : CARD, cursor: "pointer",
              fontFamily: font.body, fontSize: 12.5, color: metric === opt.id ? OCHRE_DEEP : TEXT_MUTED, fontWeight: metric === opt.id ? 500 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis dataKey="year" tick={{ fontFamily: font.mono, fontSize: 11, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
            <YAxis tick={{ fontFamily: font.mono, fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: font.body, fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}` }} />
            {(metric === "both" || metric === "exploration") && <Bar dataKey="exploration" fill={OCHRE} radius={[4, 4, 0, 0]} name="Exploration mentions" />}
            {(metric === "both" || metric === "safety") && <Bar dataKey="safety" fill={TEAL} radius={[4, 4, 0, 0]} name="Safety mentions" />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- ORIGINAL SETTINGS VIEW ----------

function SettingsView({ settings, onToggle, onOpenUploadModal }) {
  const rows = [
    { key: "roleAccess", label: "Role-based access", desc: "Officials, analysts and admins see only what their role permits." },
    { key: "auditTrail", label: "Audit trail", desc: "Every query, source and generated response is logged." },
    { key: "dataRetention", label: "Extended data retention", desc: "Keep ingested documents beyond the default 5-year window." },
  ];
  return (
    <div>
      <TopBar title="Settings" subtitle="Access control and platform configuration" onOpenUploadModal={onOpenUploadModal} />
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 }}>
        {rows.map((r, i) => (
          <div key={r.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            <div>
              <div style={{ fontFamily: font.body, fontSize: 13.5, color: INK, fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontFamily: font.body, fontSize: 12.5, color: TEXT_MUTED, marginTop: 2 }}>{r.desc}</div>
            </div>
            <Toggle on={settings[r.key]} onClick={() => onToggle(r.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- UPLOAD DOCUMENT INTERACTIVE MODAL ----------

function UploadDocumentModal({ onClose, onUploadSuccess, activeUser }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(activeUser.org || "CIL");
  const [docCategory, setDocCategory] = useState("Report");
  const [fiscalYear, setFiscalYear] = useState("2024-25");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [successBanner, setSuccessBanner] = useState(null);

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setIsUploading(true);
    setUploadProgress(15);
    setStatusMessage(`Uploading ${fileList[0].name}...`);

    setTimeout(() => {
      setUploadProgress(50);
      setStatusMessage("Running AI Document Extraction & Table Parsing...");
    }, 600);

    setTimeout(() => {
      setUploadProgress(85);
      setStatusMessage("Indexing geological & mining facts for AI Q&A...");
    }, 1200);

    setTimeout(() => {
      setUploadProgress(100);
      onUploadSuccess(fileList, selectedOrg, docCategory, fiscalYear);
      setIsUploading(false);
      setSuccessBanner(`Successfully ingested ${fileList[0].name}! ${fileList.length * 14} facts indexed.`);
    }, 1700);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(30, 42, 40, 0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      fontFamily: font.body
    }}>
      <div style={{
        width: 520, background: CARD, borderRadius: 16, padding: 24,
        border: `1px solid ${BORDER}`, boxShadow: "0 20px 30px rgba(0,0,0,0.2)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: INK }}>
              Upload & Ingest Document
            </div>
            <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
              Ingest geological reports, PDFs, spreadsheets into CoalIntelli AI
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: TEXT_MUTED }}>
            <X size={20} />
          </button>
        </div>

        {successBanner && (
          <div style={{
            background: "#E6F4F1", border: `1px solid ${TEAL}`, color: TEAL,
            padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8, marginBottom: 16
          }}>
            <CheckCircle2 size={18} color={TEAL} />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Subsidiary & Metadata Selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, display: "block", marginBottom: 4 }}>Organization</label>
            <select
              value={selectedOrg}
              onChange={e => setSelectedOrg(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`,
                fontSize: 12.5, fontFamily: font.body, background: CARD, color: INK, outline: "none"
              }}
            >
              {["CIL", "CMPDI", "SECL", "MCL", "NCL", "CCL", "ECL", "BCCL", "WCL"].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, display: "block", marginBottom: 4 }}>Document Type</label>
            <select
              value={docCategory}
              onChange={e => setDocCategory(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`,
                fontSize: 12.5, fontFamily: font.body, background: CARD, color: INK, outline: "none"
              }}
            >
              <option value="Annual report">Annual Report</option>
              <option value="Survey">Geological Survey</option>
              <option value="Audit">Safety Audit</option>
              <option value="Field data">Field Log</option>
              <option value="Report">Mine Report</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, display: "block", marginBottom: 4 }}>Fiscal Year</label>
            <select
              value={fiscalYear}
              onChange={e => setFiscalYear(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`,
                fontSize: 12.5, fontFamily: font.body, background: CARD, color: INK, outline: "none"
              }}
            >
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>
        </div>

        {/* Drag & Drop File Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.length) {
              processFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? OCHRE : BORDER}`,
            background: dragActive ? "#F6E9DA" : PAPER,
            borderRadius: 12, padding: "28px 20px", textAlign: "center",
            cursor: "pointer", transition: "all 0.2s ease"
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={e => e.target.files?.length && processFiles(e.target.files)}
          />
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: CARD,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px auto", border: `1px solid ${BORDER}`
          }}>
            <Upload size={20} color={OCHRE_DEEP} />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: INK, marginBottom: 4 }}>
            Click to browse or drag & drop files here
          </div>
          <div style={{ fontSize: 11.5, color: TEXT_MUTED }}>
            Supports PDF, XLSX, CSV, DOCX (Max 50MB per file)
          </div>
        </div>

        {/* Live Upload Progress */}
        {isUploading && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: INK, marginBottom: 6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> {statusMessage}
              </span>
              <span style={{ fontFamily: font.mono, fontWeight: 600, color: OCHRE_DEEP }}>{uploadProgress}%</span>
            </div>
            <div style={{ height: 6, background: BORDER, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${uploadProgress}%`, background: OCHRE, borderRadius: 99, transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 16px", borderRadius: 8, border: `1px solid ${BORDER}`,
              background: CARD, color: INK, fontSize: 12.5, cursor: "pointer", fontFamily: font.body
            }}
          >
            Done
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: INK, color: "#F3F0E7", fontSize: 12.5, fontWeight: 600,
              cursor: "pointer", fontFamily: font.body, display: "flex", alignItems: "center", gap: 6
            }}
          >
            <Upload size={14} /> Select File
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- ROOT COMPONENT ----------

export default function CoalIntelliApp() {
  const [active, setActive] = useState("dashboard");
  const [documents, setDocuments] = useState(initialDocuments);
  const [facts, setFacts] = useState(initialFacts);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [users, setUsers] = useState(initialUsers);
  const [activeUser, setActiveUser] = useState(initialUsers[0]);
  const [queriesAsked, setQueriesAsked] = useState(0);
  const [reportsGenerated, setReportsGenerated] = useState(0);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({ roleAccess: true, auditTrail: true, dataRetention: false });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = (files, org, type, year) => {
    const now = new Date();
    const uploadedLabel = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const newDocs = files.map((file, i) => {
      const kb = file.size / 1024;
      const sizeLabel = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
      return {
        id: `u-${Date.now()}-${i}`,
        name: file.name,
        type: type || "Report",
        org: org || "CIL",
        year: year || "2024-25",
        uploaded: uploadedLabel,
        size: sizeLabel,
      };
    });

    // Add new extracted fact for AI Search
    const newFact = {
      id: `f-${Date.now()}`,
      docId: newDocs[0].id,
      docName: newDocs[0].name,
      org: org || "CIL",
      year: year || "2024-25",
      metric: "Ingested Data",
      answer: `Data successfully extracted from uploaded ${newDocs[0].name} for ${org}. Production and field observations indexed.`,
      location: "Page 1 · Executive Summary",
      keywords: ["uploaded", "ingested", "data", org.toLowerCase()]
    };

    setDocuments((prev) => [...newDocs, ...prev]);
    setFacts((prev) => [newFact, ...prev]);
  };

  const handleDeleteDoc = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setFacts((prev) => prev.filter((f) => f.docId !== id));
  };

  const handleQuery = (text, found) => {
    setQueriesAsked((n) => n + 1);
    setHistory((prev) => [{ text, found }, ...prev].slice(0, 20));
  };

  const handleGenerateReport = () => {
    setReportsGenerated((n) => n + 1);
    const lines = [
      "CoalIntelli — summary report",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Documents indexed: ${documents.length}`,
      `Facts extracted: ${facts.length}`,
      "",
      "Key extracted facts:",
      ...facts.map((f) => `- [${f.org} · ${f.year}] ${f.metric}: ${f.answer} (Source: ${f.docName}, ${f.location})`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coalintelli-summary-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const views = {
    dashboard: (
      <DashboardView
        documents={documents}
        facts={facts}
        queriesAsked={queriesAsked}
        reportsGenerated={reportsGenerated}
        onGenerateReport={handleGenerateReport}
        onOpenUploadModal={() => setShowUploadModal(true)}
      />
    ),
    search: <SearchView facts={facts} onQuery={handleQuery} history={history} onOpenUploadModal={() => setShowUploadModal(true)} />,
    documents: <DocumentsView documents={documents} onDelete={handleDeleteDoc} onOpenUploadModal={() => setShowUploadModal(true)} />,
    trends: <TrendsView onOpenUploadModal={() => setShowUploadModal(true)} />,
    geo: <GeoIntelligenceView onOpenUploadModal={() => setShowUploadModal(true)} />,
    alerts: <AlertsNotificationsView alerts={alerts} setAlerts={setAlerts} onOpenUploadModal={() => setShowUploadModal(true)} />,
    psus: <PSUsSubsidiariesView onOpenUploadModal={() => setShowUploadModal(true)} />,
    users: <UsersRolesView users={users} activeUser={activeUser} setActiveUser={setActiveUser} onOpenUploadModal={() => setShowUploadModal(true)} />,
    settings: <SettingsView settings={settings} onToggle={handleToggleSetting} onOpenUploadModal={() => setShowUploadModal(true)} />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: PAPER, fontFamily: font.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      
      <Sidebar
        active={active}
        setActive={setActive}
        docCount={documents.length}
        activeUser={activeUser}
        onSwitchRole={() => setShowRoleModal(true)}
      />
      
      <div style={{ flex: 1, overflow: "auto", padding: "26px 30px" }}>
        {views[active]}
      </div>

      {/* Upload Document Interactive Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
          activeUser={activeUser}
        />
      )}

      {/* Role Switcher Modal */}
      {showRoleModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(30, 42, 40, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
        }}>
          <div style={{
            width: 400, background: CARD, borderRadius: 14, padding: 20,
            border: `1px solid ${BORDER}`, boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: INK }}>Switch Active Role</div>
              <button onClick={() => setShowRoleModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                <X size={18} color={TEXT_MUTED} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => { setActiveUser(u); setShowRoleModal(false); }}
                  style={{
                    padding: "10px 12px", borderRadius: 8, border: `1px solid ${activeUser.id === u.id ? OCHRE : BORDER}`,
                    background: activeUser.id === u.id ? "#F6E9DA" : CARD, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: INK }}>{u.name}</div>
                    <div style={{ fontFamily: font.body, fontSize: 11, color: TEXT_MUTED }}>{u.role} · {u.org}</div>
                  </div>
                  {activeUser.id === u.id && <CheckCircle2 size={16} color={OCHRE_DEEP} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
