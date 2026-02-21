import { useState, useEffect, useRef } from "react";

// ── CONFIGURATION — update these when deploying to GitHub ──────────────────────
const GOOGLE_SHEETS_CONFIG = {
  apiKey: "AIzaSyCcdVM9E499Vketlm7ReKeKCLjpjsvnTyU",
  spreadsheetId: "15BjVviB6RcHlGjg_Kc9-GSgea7RgXKEVWhO44XDJEDQ",
  range: "Directory!A2:F",
};

const CONTRACTORS_SHEET_CONFIG = {
  apiKey: "AIzaSyCcdVM9E499Vketlm7ReKeKCLjpjsvnTyU",
  spreadsheetId: "1IxhTXHK4ys6xiciBwvbBBeu-DFtD_1OCpuw1-d-QRYQ",
  range: "Contractors!A2:F",
};
// Paste your Apps Script Web App URL here after deploying the script
const CONTRACTORS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby1yzQZkdC_KplEPzHEMvRL9GesSTOdqC9Nv_TqNA3n98M1O5G2E02col6KKTj-fju50g/exec";
const BOARD_PASSWORD = "SAP2026"; // change before deploying!

const BOARD_CONTENT_CONFIG = {
  apiKey:        "AIzaSyCcdVM9E499Vketlm7ReKeKCLjpjsvnTyU",
  spreadsheetId: "1EMVVAN2rcgbYsbKo7BI2V4bHgn5NHHQREv3PbEa8e1w",
  announcementsRange: "Announcements!A2:D",
  eventsRange:        "Events!A2:F",
  todoRange:          "TodoList!A2:F",
};
// Paste your Board Content Apps Script URL here after deploying
const BOARD_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBN_4H7Yt567wApGQAFXyxozFwysG2PpaKDiNOOLeo4lxCI4_qQeXzGwaDD0LH3kKP/exec";
// Paste your Directory Apps Script Web App URL here after deploying
const DIRECTORY_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybEBISWuZwCrhQsEB5GGIfvmDwXT8YuJEzEeiddl-b1JGn0VRKkttp6BINeJkB8MCL/exec";

// ── NEIGHBORHOOD CENTER (Saint Andrews Park, Marietta GA) ──────────────────────
const NEIGHBORHOOD_CENTER = [33.96928, -84.39468];
const NEIGHBORHOOD_ZOOM   = 17;

// Street name → approximate lat/lng lookup for Saints Drive/Court addresses
const STREET_COORDS = {
  "saints drive": { lat: 33.96928, lngBase: -84.39520, lngStep: 0.00015 },
  "saints court": { lat: 33.96980, lngBase: -84.39430, lngStep: 0.00015 },
};

function getApproxCoords(address) {
  if (!address) return null;
  const lower = address.toLowerCase();
  const numMatch = address.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0]) : 900;
  for (const [street, data] of Object.entries(STREET_COORDS)) {
    if (lower.includes(street)) {
      const offset = ((num - 840) / 10) * data.lngStep;
      return [data.lat + (Math.random() * 0.0003 - 0.00015), data.lngBase - offset];
    }
  }
  return [NEIGHBORHOOD_CENTER[0] + (Math.random()*0.002-0.001),
          NEIGHBORHOOD_CENTER[1] + (Math.random()*0.002-0.001)];
}

// ── TABS ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",   label: "🏡 Dashboard" },
  { id: "directory",   label: "👥 Directory" },
  { id: "contractors", label: "🔨 Contractors" },
  { id: "newsletter",  label: "📰 Newsletter" },
  { id: "minutes",     label: "📋 Meeting Minutes" },
  { id: "board",       label: "🔒 Board" },
];



const SAMPLE_NEIGHBORS = [
  { id: 1, name: "The Johnson Family",   address: "101 Saint Andrews Dr", phone: "(404) 555-0101", email: "johnson@email.com" },
  { id: 2, name: "Maria & Tom Chen",     address: "103 Saint Andrews Dr", phone: "(404) 555-0102", email: "chenfamily@email.com" },
  { id: 3, name: "Robert Williams",      address: "105 Saint Andrews Dr", phone: "(404) 555-0103", email: "rwilliams@email.com" },
  { id: 4, name: "The Patel Family",     address: "107 Saint Andrews Dr", phone: "(404) 555-0104", email: "patels@email.com" },
  { id: 5, name: "Lisa & Mark Thompson", address: "109 Saint Andrews Dr", phone: "(404) 555-0105", email: "lmthompson@email.com" },
  { id: 6, name: "David Garcia",         address: "111 Saint Andrews Dr", phone: "(404) 555-0106", email: "dgarcia@email.com" },
];



const avatarGradients = [
  "linear-gradient(135deg,#2d5a3d,#4caf87)",
  "linear-gradient(135deg,#3a2d5a,#7c5be0)",
  "linear-gradient(135deg,#5a3a2d,#e09a3a)",
  "linear-gradient(135deg,#2d3a5a,#5b8dee)",
  "linear-gradient(135deg,#5a2d2d,#e05c5c)",
  "linear-gradient(135deg,#2d4a5a,#3ab8c9)",
];

// ── STYLES ─────────────────────────────────────────────────────────────────────
const S = {
  app:       { fontFamily:"Georgia,'Times New Roman',serif", background:"linear-gradient(135deg,#1a2332 0%,#243447 50%,#1e3a2f 100%)", minHeight:"100vh", color:"#e8e0d0" },
  header:    { background:"linear-gradient(90deg,#0f1e2e,#1a3a28)", borderBottom:"2px solid #c9a84c", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logoIcon:  { width:48, height:48, background:"linear-gradient(135deg,#c9a84c,#e8cc80)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:"0 4px 12px rgba(201,168,76,.4)" },
  logoTitle: { fontSize:20, fontWeight:"bold", color:"#c9a84c", letterSpacing:.5 },
  logoSub:   { fontSize:12, color:"#8faa9a", letterSpacing:2, textTransform:"uppercase" },
  badge:     { background:"#c9a84c", color:"#1a2332", padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:"bold", letterSpacing:1 },
  nav:       { display:"flex", gap:4, padding:"16px 32px", background:"rgba(0,0,0,.2)", borderBottom:"1px solid rgba(201,168,76,.2)", overflowX:"auto" },
  navBtn: a=>({ padding:"10px 20px", borderRadius:8, border:a?"1px solid #c9a84c":"1px solid transparent", background:a?"rgba(201,168,76,.15)":"transparent", color:a?"#c9a84c":"#8faa9a", cursor:"pointer", fontSize:14, fontFamily:"Georgia,serif", whiteSpace:"nowrap", transition:"all .2s" }),
  main:      { padding:32, maxWidth:1100, margin:"0 auto" },
  card:      { background:"rgba(255,255,255,.05)", border:"1px solid rgba(201,168,76,.2)", borderRadius:12, padding:24, marginBottom:20, backdropFilter:"blur(4px)" },
  cardTitle: { color:"#c9a84c", fontSize:18, marginBottom:16, fontWeight:"bold", borderBottom:"1px solid rgba(201,168,76,.2)", paddingBottom:10 },
  grid3:     { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 },
  statCard: a=>({ background:`linear-gradient(135deg,rgba(${a},.15),rgba(${a},.05))`, border:`1px solid rgba(${a},.3)`, borderRadius:10, padding:20, textAlign:"center" }),
  statNum:   { fontSize:36, fontWeight:"bold", color:"#e8e0d0", lineHeight:1 },
  statLabel: { fontSize:12, color:"#8faa9a", textTransform:"uppercase", letterSpacing:1, marginTop:6 },
  table:     { width:"100%", borderCollapse:"collapse" },
  th:        { textAlign:"left", padding:"10px 14px", background:"rgba(201,168,76,.1)", color:"#c9a84c", fontSize:12, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid rgba(201,168,76,.2)" },
  td:        { padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,.05)", fontSize:14, verticalAlign:"middle" },
  pill: c=>({ background:`${c}22`, color:c, border:`1px solid ${c}44`, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:"bold", display:"inline-block" }),
  btn:       { background:"linear-gradient(135deg,#c9a84c,#e8cc80)", color:"#1a2332", border:"none", padding:"10px 20px", borderRadius:8, cursor:"pointer", fontFamily:"Georgia,serif", fontWeight:"bold", fontSize:14, marginRight:8 },
  btnSm:     { background:"linear-gradient(135deg,#c9a84c,#e8cc80)", color:"#1a2332", border:"none", padding:"6px 12px", borderRadius:6, cursor:"pointer", fontFamily:"Georgia,serif", fontWeight:"bold", fontSize:12, marginRight:6 },
  btnOut:    { background:"transparent", color:"#c9a84c", border:"1px solid #c9a84c", padding:"10px 20px", borderRadius:8, cursor:"pointer", fontFamily:"Georgia,serif", fontSize:14 },
  btnOutSm:  { background:"transparent", color:"#c9a84c", border:"1px solid #c9a84c", padding:"5px 10px", borderRadius:6, cursor:"pointer", fontFamily:"Georgia,serif", fontSize:12, marginRight:6 },
  btnDanger: { background:"transparent", color:"#e05c5c", border:"1px solid #e05c5c", padding:"5px 10px", borderRadius:6, cursor:"pointer", fontFamily:"Georgia,serif", fontSize:12 },
  input:     { background:"rgba(255,255,255,.08)", border:"1px solid rgba(201,168,76,.3)", borderRadius:8, padding:"10px 14px", color:"#e8e0d0", fontFamily:"Georgia,serif", fontSize:14, width:"100%", boxSizing:"border-box", marginBottom:10 },
  select:    { background:"#243447", border:"1px solid rgba(201,168,76,.3)", borderRadius:8, padding:"10px 14px", color:"#e8e0d0", fontFamily:"Georgia,serif", fontSize:14, marginRight:8, cursor:"pointer" },
  textarea:  { background:"rgba(255,255,255,.08)", border:"1px solid rgba(201,168,76,.3)", borderRadius:8, padding:"10px 14px", color:"#e8e0d0", fontFamily:"Georgia,serif", fontSize:14, width:"100%", boxSizing:"border-box", minHeight:120, resize:"vertical", marginBottom:10 },
  secHead:   { fontSize:24, color:"#c9a84c", marginBottom:8, fontWeight:"bold" },
  secSub:    { color:"#8faa9a", marginBottom:24, fontSize:14 },
  tag:       { display:"inline-block", background:"rgba(201,168,76,.15)", color:"#c9a84c", border:"1px solid rgba(201,168,76,.3)", padding:"2px 8px", borderRadius:4, fontSize:11, marginRight:4 },
  infoRow:   { display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 },
  infoIcon:  { color:"#c9a84c", fontSize:14, marginTop:1, flexShrink:0 },
  codeBlock: { background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:14, fontFamily:"monospace", fontSize:12, color:"#a8d8b0", overflowX:"auto", marginTop:10 },
};

async function fetchContractors() {
  const { apiKey, spreadsheetId, range } = CONTRACTORS_SHEET_CONFIG;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("NETWORK_BLOCKED");
  }
  if (res.status === 403) throw new Error("API_KEY_ERROR");
  if (res.status === 404) throw new Error("SHEET_NOT_FOUND");
  if (!res.ok) throw new Error("SHEETS_ERROR");
  const data = await res.json();
  if (!data.values || data.values.length === 0) return [];
  // Map Sheet display names back to category IDs used in the portal
  const categoryMap = {
    "Painters":      "painters",
    "Roofers":       "roofers",
    "Plumbing":      "plumbing",
    "Electrical":    "electrical",
    "A/C & Heating": "ac_heating",
    "Realtors":      "realtors",
    "Landscaping":   "landscaping",
    "Others":        "others",
  };
  return data.values.map((row, i) => ({
    id: i + 1,
    category: categoryMap[row[0]] || "others",
    business:  row[1]||"",
    contact:   row[2]||"",
    phone:     row[3]||"",
    website:   row[4]||"",
    note:      row[5]||"",
  }));
}

async function fetchBoardContent(range) {
  const { apiKey, spreadsheetId } = BOARD_CONTENT_CONFIG;
  if (spreadsheetId === "YOUR_BOARD_CONTENT_SHEET_ID") throw new Error("NOT_CONFIGURED");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  let res;
  try { res = await fetch(url); } catch { throw new Error("NETWORK_BLOCKED"); }
  if (!res.ok) throw new Error("SHEETS_ERROR");
  const data = await res.json();
  return data.values || [];
}

// ── LEAFLET LOADER ────────────────────────────────────────────────────────────
function useLeaflet(onReady) {
  useEffect(() => {
    if (window.L) { onReady(window.L); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => onReady(window.L);
    document.head.appendChild(script);
  }, []);
}

const sheetsConfigured = () =>
  GOOGLE_SHEETS_CONFIG.apiKey !== "YOUR_API_KEY_HERE" &&
  GOOGLE_SHEETS_CONFIG.spreadsheetId !== "YOUR_SPREADSHEET_ID_HERE";

async function fetchFromSheets() {
  const { apiKey, spreadsheetId, range } = GOOGLE_SHEETS_CONFIG;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("NETWORK_BLOCKED");
  }
  if (res.status === 403) throw new Error("API_KEY_ERROR");
  if (res.status === 404) throw new Error("SHEET_NOT_FOUND");
  if (!res.ok) throw new Error("SHEETS_ERROR");
  const data = await res.json();
  if (!data.values || data.values.length === 0) return [];
  return data.values.map((row, i) => ({
    id: i + 1, name: row[0]||"", address: row[1]||"", lat: parseFloat(row[2])||null, lng: parseFloat(row[3])||null, phone: row[4]||"", email: row[5]||"",
  }));
}

// ── NEIGHBORHOOD MAP ──────────────────────────────────────────────────────────
function NeighborhoodMap({ neighbors, selectedId, onSelectPin }) {
  const mapRef    = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  useLeaflet(L => {
    if (leafletMap.current) return;
    const map = L.map(mapRef.current, {
      center: NEIGHBORHOOD_CENTER,
      zoom: NEIGHBORHOOD_ZOOM,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom gold pin icon
    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,#c9a84c,#e8cc80);
        border:2px solid #fff;
        transform:rotate(-45deg);
        box-shadow:0 2px 6px rgba(0,0,0,.4);
        cursor:pointer;
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    });

    const selectedIcon = L.divIcon({
      className: "",
      html: `<div style="
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,#4caf87,#2d9e6f);
        border:2px solid #fff;
        transform:rotate(-45deg);
        box-shadow:0 3px 10px rgba(76,175,135,.6);
        cursor:pointer;
      "></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -36],
    });

    neighbors.forEach(n => {
      const coords = (n.lat && n.lng) ? [n.lat, n.lng] : getApproxCoords(n.address);
      if (!coords) return;
      const marker = L.marker(coords, { icon: pinIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Georgia,serif;min-width:160px;">
            <div style="font-weight:bold;font-size:14px;color:#1a2332;margin-bottom:4px;">${n.name}</div>
            <div style="font-size:12px;color:#555;">📍 ${n.address}</div>
          </div>
        `, { maxWidth: 220 });
      marker.on("click", () => onSelectPin(n.id));
      markersRef.current[n.id] = { marker, coords, pinIcon, selectedIcon };
    });

    leafletMap.current = map;
  });

  // Highlight selected pin
  useEffect(() => {
    if (!leafletMap.current) return;
    Object.entries(markersRef.current).forEach(([id, {marker, pinIcon, selectedIcon}]) => {
      marker.setIcon(parseInt(id) === selectedId ? selectedIcon : pinIcon);
    });
    if (selectedId && markersRef.current[selectedId]) {
      const { coords, marker } = markersRef.current[selectedId];
      leafletMap.current.setView(coords, 18, { animate: true });
      marker.openPopup();
    }
  }, [selectedId]);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={S.cardTitle}>🗺️ Neighborhood Map</div>
      <div style={{ color:"#8faa9a", fontSize:13, marginBottom:12 }}>
        Click a neighbor card above to highlight their location on the map. Click a pin to see their name and address.
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        <div ref={mapRef} style={{
          flex:1, minWidth:300, height:420, borderRadius:12,
          border:"1px solid rgba(201,168,76,.3)",
          overflow:"hidden", zIndex:0,
        }} />
        <div style={{ width:200, display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{...S.card, marginBottom:0, padding:16}}>
            <div style={{color:"#c9a84c",fontWeight:"bold",fontSize:13,marginBottom:10}}>📍 Map Legend</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#e8cc80)",border:"1px solid #fff",flexShrink:0}}/>
              <span style={{color:"#8faa9a",fontSize:12}}>Neighbor</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:"linear-gradient(135deg,#4caf87,#2d9e6f)",border:"1px solid #fff",flexShrink:0}}/>
              <span style={{color:"#8faa9a",fontSize:12}}>Selected</span>
            </div>
          </div>
          <div style={{...S.card, marginBottom:0, padding:16}}>
            <div style={{color:"#c9a84c",fontWeight:"bold",fontSize:13,marginBottom:6}}>ℹ️ Note</div>
            <div style={{color:"#8faa9a",fontSize:11,lineHeight:1.6}}>
              Pin locations are approximate based on street addresses. Exact positions may vary slightly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EXPANDABLE CONTACT FORM ────────────────────────────────────────────────────
function ExpandableContactForm({ neighbors, onSubmit }) {
  const [open, setOpen]       = useState(false);
  const [mode, setMode]       = useState("add"); // "add" | "edit"
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [msg, setMsg]         = useState(null);
  const blankForm             = { name:"", address:"", phone:"", email:"" };
  const [form, setForm]       = useState(blankForm);

  const filteredNeighbors = neighbors.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.address.toLowerCase().includes(search.toLowerCase())
  );

  const selectNeighbor = (n) => {
    setSelected(n);
    setForm({ id: n.id, name: n.name, address: n.address, phone: n.phone, email: n.email });
    setSearch(n.name);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);

    if (DIRECTORY_SCRIPT_URL === "YOUR_DIRECTORY_SCRIPT_URL_HERE") {
      // No script connected — just update local view
      onSubmit(form, mode);
      setMsg({ type:"ok", text: mode === "add"
        ? "✅ Added locally! Connect the Directory Script to save permanently."
        : "✅ Updated locally! Connect the Directory Script to save permanently." });
      setForm(blankForm); setSelected(null); setSearch("");
      setSubmitting(false);
      setTimeout(() => setMsg(null), 5000);
      return;
    }

    try {
      const action = mode === "add" ? "submitAdd" : "submitEdit";
      const p = new URLSearchParams({
        action,
        name:         form.name,
        address:      form.address  || "",
        phone:        form.phone    || "",
        email:        form.email    || "",
        originalName: selected?.name || "",
      });
      const res  = await fetch(`${DIRECTORY_SCRIPT_URL}?${p}`);
      const json = await res.json();
      if (json.success) {
        setMsg({ type:"ok", text: mode === "add"
          ? "📬 Your request has been sent to the board for approval! It will appear in the directory once reviewed."
          : "📬 Your edit request has been sent to the board for approval! Changes will go live once reviewed." });
        setForm(blankForm); setSelected(null); setSearch("");
      } else {
        setMsg({ type:"err", text: "⚠️ Could not submit: " + json.error });
      }
    } catch {
      setMsg({ type:"err", text: "⚠️ Network error — please try again." });
    }
    setSubmitting(false);
    setTimeout(() => setMsg(null), 8000);
  };

  const handleModeSwitch = (m) => {
    setMode(m);
    setForm(blankForm);
    setSelected(null);
    setSearch("");
    setMsg(null);
  };

  return (
    <div style={{ marginBottom:20 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:"100%", padding:"14px 20px",
          background: open ? "rgba(201,168,76,.12)" : "rgba(255,255,255,.04)",
          border:`1px solid ${open ? "rgba(201,168,76,.5)" : "rgba(201,168,76,.2)"}`,
          borderRadius:10, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          fontFamily:"Georgia,serif", marginBottom: open ? 0 : 0,
          transition:"all .2s",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📝</span>
          <span style={{ color:"#c9a84c", fontWeight:"bold", fontSize:15 }}>Add or Update Your Contact Info</span>
        </div>
        <span style={{ color:"#c9a84c", fontSize:18, transition:"transform .2s", display:"inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>

      {/* Expandable panel */}
      {open && (
        <div style={{
          ...{background:"rgba(255,255,255,.03)", border:"1px solid rgba(201,168,76,.2)", borderTop:"none",
          borderRadius:"0 0 10px 10px", padding:"20px"},
        }}>
          {/* Mode switcher */}
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {[{id:"add",label:"➕ Add New Neighbor"},{id:"edit",label:"✏️ Edit My Info"}].map(m => (
              <button key={m.id} onClick={() => handleModeSwitch(m.id)} style={{
                padding:"9px 18px", borderRadius:8, cursor:"pointer",
                fontFamily:"Georgia,serif", fontSize:13, fontWeight:"bold",
                background: mode===m.id ? "linear-gradient(135deg,#c9a84c,#e8cc80)" : "rgba(255,255,255,.06)",
                color:      mode===m.id ? "#1a2332" : "#8faa9a",
                border:     mode===m.id ? "none" : "1px solid rgba(201,168,76,.2)",
              }}>{m.label}</button>
            ))}
          </div>

          {/* Edit mode — search to find neighbor */}
          {mode === "edit" && (
            <div style={{ marginBottom:16, position:"relative" }}>
              <div style={{ color:"#c9a84c", fontSize:12, marginBottom:4 }}>Search for your name</div>
              <input
                style={{ ...{width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(201,168,76,.3)",
                  background:"rgba(255,255,255,.06)", color:"#e8e0d0", fontSize:14,
                  fontFamily:"Georgia,serif", boxSizing:"border-box"} }}
                placeholder="Start typing your name or address..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); setForm(blankForm); }}
              />
              {/* Dropdown results */}
              {search.length > 1 && !selected && filteredNeighbors.length > 0 && (
                <div style={{
                  position:"absolute", top:"100%", left:0, right:0, zIndex:100,
                  background:"#1e2d3d", border:"1px solid rgba(201,168,76,.3)",
                  borderRadius:"0 0 8px 8px", maxHeight:200, overflowY:"auto",
                }}>
                  {filteredNeighbors.map(n => (
                    <div key={n.id} onClick={() => selectNeighbor(n)} style={{
                      padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,.06)",
                      color:"#e8e0d0", fontSize:13,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(201,168,76,.1)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      <strong>{n.name}</strong>
                      <span style={{ color:"#8faa9a", marginLeft:8, fontSize:12 }}>{n.address}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form fields — show for add always, or edit once neighbor selected */}
          {(mode === "add" || selected) && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {[
                  { label:"Full Name / Family Name", field:"name",    ph:"e.g. The Smith Family",       required:true },
                  { label:"Street Address",           field:"address", ph:"e.g. 851 Saints Drive",       required:false },
                  { label:"Phone Number",             field:"phone",   ph:"e.g. (404) 555-0100",         required:false },
                  { label:"Email Address",            field:"email",   ph:"e.g. family@email.com",       required:false },
                ].map(({ label, field, ph, required }) => (
                  <div key={field}>
                    <div style={{ color:"#c9a84c", fontSize:12, marginBottom:4 }}>
                      {label} {required && <span style={{color:"#e05c5c"}}>*</span>}
                    </div>
                    <input
                      style={{ width:"100%", padding:"10px 14px", borderRadius:8,
                        border:"1px solid rgba(201,168,76,.3)", background:"rgba(255,255,255,.06)",
                        color:"#e8e0d0", fontSize:14, fontFamily:"Georgia,serif", boxSizing:"border-box" }}
                      placeholder={ph}
                      value={form[field]}
                      onChange={e => setForm({...form, [field]: e.target.value})}
                    />
                  </div>
                ))}
              </div>

              {msg && (
                <div style={{
                  padding:"10px 14px", borderRadius:8, marginBottom:14, fontSize:13, fontWeight:"bold",
                  background: msg.type==="ok" ? "rgba(76,175,135,.1)" : "rgba(224,92,92,.1)",
                  border:     msg.type==="ok" ? "1px solid rgba(76,175,135,.4)" : "1px solid rgba(224,92,92,.4)",
                  color:      msg.type==="ok" ? "#4caf87" : "#e05c5c",
                }}>{msg.text}</div>
              )}

              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding:"10px 24px", borderRadius:8, cursor: submitting ? "not-allowed" : "pointer",
                    background:"linear-gradient(135deg,#c9a84c,#e8cc80)",
                    color:"#1a2332", fontWeight:"bold", fontSize:14,
                    fontFamily:"Georgia,serif", border:"none",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "⏳ Submitting..." : mode === "add" ? "📬 Submit for Approval" : "📬 Submit Changes"}
                </button>
                <button onClick={() => { setOpen(false); handleModeSwitch("add"); }} style={{
                  padding:"10px 18px", borderRadius:8, cursor:"pointer",
                  background:"transparent", border:"1px solid rgba(201,168,76,.3)",
                  color:"#8faa9a", fontSize:14, fontFamily:"Georgia,serif",
                }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ marginTop:16, padding:"10px 14px", borderRadius:8,
            background:"rgba(91,141,238,.06)", border:"1px solid rgba(91,141,238,.2)" }}>
            <div style={{ color:"#5b8dee", fontSize:12 }}>
              💡 All additions and edits go to the board for review before appearing in the directory. This keeps everyone's information accurate and up to date!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NEIGHBORHOOD DIRECTORY ─────────────────────────────────────────────────────
function NeighborhoodDirectory() {
  const [neighbors, setNeighbors] = useState(SAMPLE_NEIGHBORS);
  const [loading, setLoading]     = useState(false);
  const [sheetError, setSheetError] = useState(null);
  const [usingSheets, setUsingSheets] = useState(false);

  const [boardUnlocked, setBoardUnlocked] = useState(false);
  const [pwInput, setPwInput]   = useState("");
  const [pwError, setPwError]   = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData]   = useState({});
  const [showAdd, setShowAdd]     = useState(false);
  const [newN, setNewN]           = useState({ name:"", address:"", phone:"", email:"" });

  const [search, setSearch] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);

  const loadFromSheets = () => {
    setLoading(true); setSheetError(null); setUsingSheets(true);
    fetchFromSheets()
      .then(d => {
        if (d.length > 0) setNeighbors(d);
        setLoading(false);
      })
      .catch(e => {
        setUsingSheets(false);
        setSheetError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (sheetsConfigured()) loadFromSheets();
  }, []);

  const unlock = () => {
    if (pwInput === BOARD_PASSWORD) { setBoardUnlocked(true); setPwError(false); setPwInput(""); }
    else setPwError(true);
  };

  const startEdit = n => { setEditingId(n.id); setEditData({...n}); };
  const saveEdit  = () => { setNeighbors(neighbors.map(n => n.id===editingId ? {...editData} : n)); setEditingId(null); };
  const delNeighbor = id => { if(window.confirm("Remove this neighbor?")) setNeighbors(neighbors.filter(n=>n.id!==id)); };
  const addNeighbor = () => {
    if (!newN.name.trim()) return;
    setNeighbors([...neighbors, { ...newN, id: Date.now() }]);
    setNewN({ name:"", address:"", phone:"", email:"" }); setShowAdd(false);
  };

  const initials = name => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  const filtered = neighbors.filter(n =>
    [n.name, n.address, n.email, n.phone].some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={S.secHead}>👥 Neighborhood Directory</div>
      <div style={S.secSub}>Find and connect with your Saint Andrews Park neighbors.</div>

      {/* Neighborhood Map — top */}
      {!loading && neighbors.length > 0 && (
        <NeighborhoodMap
          neighbors={neighbors}
          selectedId={selectedPin}
          onSelectPin={id => setSelectedPin(id === selectedPin ? null : id)}
        />
      )}

      {/* ── Expandable Add / Edit Contact Section ── */}
      {neighbors.length > 0 && (
        <ExpandableContactForm neighbors={neighbors} onSubmit={(data, type) => {
          if (type === "add") {
            setNeighbors(prev => [...prev, { ...data, id: Date.now() }]);
          } else {
            setNeighbors(prev => prev.map(n => n.id === data.id ? { ...n, ...data } : n));
          }
        }} />
      )}

      {/* Google Sheets setup guide */}
      {!sheetsConfigured() && (
        <div style={{ ...S.card, background:"rgba(91,141,238,.07)", border:"1px solid rgba(91,141,238,.25)" }}>
          <div style={{ color:"#5b8dee", fontWeight:"bold", marginBottom:8 }}>📊 Connect Your Google Sheet</div>
          <div style={{ color:"#8faa9a", fontSize:13, marginBottom:10 }}>
            Create a Google Sheet with these column headers in row 1:&nbsp;
            <strong style={{color:"#e8e0d0"}}>Name | Address | Phone | Email</strong>
            &nbsp;— name the tab <code style={{color:"#c9a84c"}}>Directory</code>.
          </div>
          <div style={S.codeBlock}>{`// Update the config at the top of saphoa-hub.jsx:
const GOOGLE_SHEETS_CONFIG = {
  apiKey: "AIzaSy...",           // Google Cloud Console → Credentials
  spreadsheetId: "1BxiM...",    // from your Sheet's URL
  range: "Directory!A2:D",
};`}</div>
          <div style={{ marginTop:12, fontSize:12, color:"#8faa9a" }}>
            <strong style={{color:"#e8e0d0"}}>Quick steps:</strong> Google Cloud Console → Enable Sheets API → Create API Key → share your Sheet as "Anyone with the link can view."
          </div>
        </div>
      )}

      {sheetError && (
        <div style={{ ...S.card, border:"1px solid rgba(224,92,92,.3)", background:"rgba(224,92,92,.07)", marginBottom:16 }}>
          <div style={{color:"#e05c5c", fontWeight:"bold", marginBottom:6}}>
            {sheetError === "NETWORK_BLOCKED"
              ? "⚠️ Preview Environment Detected"
              : sheetError === "API_KEY_ERROR"
              ? "⚠️ API Key Error"
              : sheetError === "SHEET_NOT_FOUND"
              ? "⚠️ Sheet Not Found"
              : "⚠️ Could Not Connect to Google Sheets"}
          </div>
          <div style={{color:"#8faa9a", fontSize:13, marginBottom:10}}>
            {sheetError === "NETWORK_BLOCKED"
              ? "External network requests are blocked in this preview. The live directory will load correctly once deployed to GitHub Pages. Sample data is shown below."
              : sheetError === "API_KEY_ERROR"
              ? "Your API key was rejected. Make sure it is restricted to the Sheets API and your domains in Google Cloud Console."
              : sheetError === "SHEET_NOT_FOUND"
              ? "The Spreadsheet ID may be incorrect, or the Sheet is not shared publicly. Check your sharing settings."
              : "Unable to reach Google Sheets. Check your API key, Spreadsheet ID, and that the sheet tab is named 'Directory'."}
          </div>
          <button style={{...S.btnSm}} onClick={loadFromSheets}>↻ Retry</button>
        </div>
      )}

      {/* Controls row */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <input
          style={{ ...S.input, flex:1, minWidth:200, marginBottom:0 }}
          placeholder="🔍 Search by name, address, phone, or email..."
          value={search} onChange={e=>setSearch(e.target.value)}
        />
      </div>

      {/* Add form */}
      {boardUnlocked && showAdd && (
        <div style={S.card}>
          <div style={S.cardTitle}>➕ Add New Neighbor</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              {label:"Full Name / Family Name", field:"name",    ph:"e.g. The Smith Family"},
              {label:"Street Address",           field:"address", ph:"e.g. 113 Saint Andrews Dr"},
              {label:"Phone Number",             field:"phone",   ph:"e.g. (404) 555-0107"},
              {label:"Email Address",            field:"email",   ph:"e.g. smithfamily@email.com"},
            ].map(({label,field,ph})=>(
              <div key={field}>
                <div style={{color:"#c9a84c",fontSize:12,marginBottom:4}}>{label}</div>
                <input style={{...S.input,marginBottom:0}} placeholder={ph}
                  value={newN[field]} onChange={e=>setNewN({...newN,[field]:e.target.value})} />
              </div>
            ))}
          </div>
          <div style={{marginTop:16}}>
            <button style={S.btn} onClick={addNeighbor}>💾 Save Neighbor</button>
            <button style={S.btnOut} onClick={()=>{setShowAdd(false);setNewN({name:"",address:"",phone:"",email:""});}}>Cancel</button>
          </div>
        </div>
      )}

      {loading && <div style={{textAlign:"center",color:"#8faa9a",padding:40}}>⏳ Loading from Google Sheets...</div>}

      {/* Card grid */}
      {!loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:16, marginTop:8 }}>
          {filtered.map((n,idx) => (
            <div key={n.id}
              onClick={()=>{ if(editingId!==n.id) setSelectedPin(n.id===selectedPin?null:n.id); }}
              style={{
                background: selectedPin===n.id ? "rgba(76,175,135,.1)" : editingId===n.id ? "rgba(201,168,76,.09)" : "rgba(255,255,255,.05)",
                border: selectedPin===n.id ? "1px solid rgba(76,175,135,.5)" : editingId===n.id ? "1px solid rgba(201,168,76,.5)" : "1px solid rgba(201,168,76,.15)",
                borderRadius:12, padding:20, transition:"all .2s", cursor: editingId===n.id ? "default" : "pointer",
              }}>
              {editingId===n.id ? (
                <div>
                  <div style={{color:"#c9a84c",fontWeight:"bold",marginBottom:12}}>✏️ Editing Record</div>
                  {[{f:"name",l:"Name"},{f:"address",l:"Address"},{f:"phone",l:"Phone"},{f:"email",l:"Email"}].map(({f,l})=>(
                    <div key={f}>
                      <div style={{color:"#8faa9a",fontSize:11,marginBottom:3,textTransform:"uppercase"}}>{l}</div>
                      <input style={{...S.input,marginBottom:8}} value={editData[f]||""}
                        onChange={e=>setEditData({...editData,[f]:e.target.value})} />
                    </div>
                  ))}
                  <button style={S.btnSm} onClick={saveEdit}>💾 Save</button>
                  <button style={S.btnOutSm} onClick={()=>setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{
                      width:46, height:46, borderRadius:"50%",
                      background: avatarGradients[idx % avatarGradients.length],
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:17, fontWeight:"bold", color:"#fff",
                      boxShadow:"0 2px 8px rgba(0,0,0,.3)", flexShrink:0,
                    }}>
                      {initials(n.name)}
                    </div>
                    <div style={{fontWeight:"bold",fontSize:16,color:"#e8e0d0",lineHeight:1.3}}>{n.name}</div>
                  </div>
                  <div style={S.infoRow}><span style={S.infoIcon}>📍</span><span style={{color:"#8faa9a",fontSize:13}}>{n.address}</span></div>
                  <div style={S.infoRow}><span style={S.infoIcon}>📞</span>
                    <a href={`tel:${n.phone}`} style={{color:"#5b8dee",fontSize:13,textDecoration:"none"}}>{n.phone}</a>
                  </div>
                  <div style={S.infoRow}><span style={S.infoIcon}>✉️</span>
                    <a href={`mailto:${n.email}`} style={{color:"#5b8dee",fontSize:13,textDecoration:"none",wordBreak:"break-all"}}>{n.email}</a>
                  </div>
                  {boardUnlocked && (
                    <div style={{display:"flex",gap:8,marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                      <button style={S.btnOutSm} onClick={()=>startEdit(n)}>✏️ Edit</button>
                      <button style={S.btnDanger} onClick={()=>delNeighbor(n.id)}>🗑 Remove</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length===0 && (
            <div style={{gridColumn:"1/-1",textAlign:"center",color:"#8faa9a",padding:40}}>
              No neighbors match your search.
            </div>
          )}
        </div>
      )}

      {boardUnlocked && (
        <div style={{...S.card, marginTop:24, background:"rgba(91,141,238,.06)", border:"1px solid rgba(91,141,238,.2)"}}>
          <div style={{color:"#5b8dee",fontWeight:"bold",marginBottom:6}}>📊 Write-Back Note</div>
          <div style={{color:"#8faa9a",fontSize:13}}>
            Edits and additions here update the local view. To automatically push changes back to your Google Sheet,
            deploy a <strong style={{color:"#e8e0d0"}}>Google Apps Script Web App</strong> and wire it to the save/add functions.
            Your README will include a copy-paste script for this.
          </div>
        </div>
      )}

    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
function Dashboard({ onNavigate }) {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents]               = useState([]);

  useEffect(() => {
    fetchBoardContent(BOARD_CONTENT_CONFIG.announcementsRange)
      .then(rows => setAnnouncements(rows.map((r,i) => ({
        id:i, title:r[0]||"", message:r[1]||"", date:r[2]||"", status:r[3]||"Active"
      })).filter(a => a.status === "Active")))
      .catch(() => {});

    fetchBoardContent(BOARD_CONTENT_CONFIG.eventsRange)
      .then(rows => setEvents(rows.map((r,i) => ({
        id:i, title:r[0]||"", description:r[1]||"", date:r[2]||"", time:r[3]||"", location:r[4]||"", status:r[5]||"Active"
      })).filter(e => e.status === "Active")))
      .catch(() => {});
  }, []);

  const quickLinks = [
    { icon:"👥", label:"Neighborhood Directory", desc:"Find your neighbors' contact info",          tab:"directory" },
    { icon:"🔨", label:"Contractors",            desc:"Community-recommended home service pros",    tab:"contractors" },
    { icon:"📰", label:"Newsletter",             desc:"Read the latest community newsletter",       tab:"newsletter" },
    { icon:"📋", label:"Meeting Minutes",        desc:"View HOA board meeting notes",               tab:"minutes" },
  ];

  return (
    <div>
      <div style={S.secHead}>Welcome to Saint Andrews Park! 🏡</div>
      <div style={S.secSub}>Your community hub — everything you need, all in one place.</div>

      {/* Announcements — TOP */}
      <div style={S.card}>
        <div style={S.cardTitle}>📣 Community Announcements</div>
        {announcements.length === 0 ? (
          <div style={{color:"#8faa9a", fontSize:14, textAlign:"center", padding:"20px 0"}}>
            No announcements at this time. Check back soon! 😊
          </div>
        ) : announcements.map(a => (
          <div key={a.id} style={{padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
              <div style={{color:"#e8e0d0", fontWeight:"bold", fontSize:15}}>{a.title}</div>
              {a.date && <div style={{color:"#8faa9a", fontSize:12}}>{a.date}</div>}
            </div>
            <div style={{color:"#ccc5b5", fontSize:13, lineHeight:1.7}}>{a.message}</div>
          </div>
        ))}
      </div>

      {/* Events — SECOND */}
      <div style={S.card}>
        <div style={S.cardTitle}>📅 Upcoming Events</div>
        {events.length === 0 ? (
          <div style={{color:"#8faa9a", fontSize:14, textAlign:"center", padding:"20px 0"}}>
            No upcoming events scheduled. Stay tuned! 🎉
          </div>
        ) : events.map(e => (
          <div key={e.id} style={{
            padding:"14px 16px", borderRadius:10, marginBottom:10,
            background:"rgba(201,168,76,.06)", border:"1px solid rgba(201,168,76,.2)",
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8}}>
              <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:15}}>{e.title}</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {e.date && <span style={{...S.pill("#5b8dee"), fontSize:11}}>📅 {e.date}</span>}
                {e.time && <span style={{...S.pill("#4caf87"), fontSize:11}}>🕐 {e.time}</span>}
              </div>
            </div>
            {e.location && <div style={{color:"#8faa9a", fontSize:12, marginTop:4}}>📍 {e.location}</div>}
            {e.description && <div style={{color:"#ccc5b5", fontSize:13, marginTop:8, lineHeight:1.7}}>{e.description}</div>}
          </div>
        ))}
      </div>

      {/* Quick Links — BELOW */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, marginBottom:24}}>
        {quickLinks.map(l=>(
          <div key={l.tab}
            onClick={() => onNavigate(l.tab)}
            style={{...S.card, marginBottom:0, cursor:"pointer", transition:"all .2s", borderColor:"rgba(201,168,76,.3)"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#c9a84c"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.3)"}
          >
            <div style={{fontSize:36, marginBottom:12}}>{l.icon}</div>
            <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:16, marginBottom:6}}>{l.label}</div>
            <div style={{color:"#8faa9a", fontSize:13}}>{l.desc}</div>
            <div style={{marginTop:12, color:"#c9a84c", fontSize:12, fontWeight:"bold"}}>View →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NEWSLETTER ─────────────────────────────────────────────────────────────────
function Newsletter() {
  return (
    <div>
      <div style={S.secHead}>📰 Newsletter</div>
      <div style={S.secSub}>Stay tuned for updates from your Saint Andrews Park board!</div>
      <div style={{...S.card, textAlign:"center", padding:"60px 20px"}}>
        <div style={{fontSize:64, marginBottom:20}}>📰</div>
        <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:24, marginBottom:12}}>Coming Soon!</div>
        <div style={{color:"#8faa9a", fontSize:15, lineHeight:1.8, maxWidth:400, margin:"0 auto"}}>
          The Saint Andrews Park community newsletter is on its way. Check back soon for the latest news, updates, and highlights from your neighborhood! 🏡
        </div>
      </div>
    </div>
  );
}

// ── MEETING MINUTES ────────────────────────────────────────────────────────────
function MeetingMinutes() {
  return (
    <div>
      <div style={S.secHead}>📋 Meeting Minutes</div>
      <div style={S.secSub}>Board meeting records for Saint Andrews Park homeowners.</div>
      <div style={{...S.card, textAlign:"center", padding:"60px 20px"}}>
        <div style={{fontSize:64, marginBottom:20}}>📋</div>
        <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:24, marginBottom:12}}>Coming Soon!</div>
        <div style={{color:"#8faa9a", fontSize:15, lineHeight:1.8, maxWidth:400, margin:"0 auto"}}>
          Meeting minutes will be posted here after each board meeting. Stay engaged with what's happening in your community! 🏡
        </div>
      </div>
    </div>
  );
}

// ── CONTRACTORS DATA ──────────────────────────────────────────────────────────
const CONTRACTOR_CATEGORIES = [
  { id: "painters",     label: "Painters",          icon: "🎨" },
  { id: "roofers",      label: "Roofers",            icon: "🏠" },
  { id: "plumbing",     label: "Plumbing",           icon: "🔧" },
  { id: "electrical",   label: "Electrical",         icon: "⚡" },
  { id: "ac_heating",   label: "A/C & Heating",      icon: "❄️" },
  { id: "realtors",     label: "Realtors",           icon: "🏡" },
  { id: "landscaping",  label: "Landscaping",        icon: "🌿" },
  { id: "others",       label: "Others",             icon: "⭐" },
];

const SAMPLE_CONTRACTORS = [
  { id: 1, category:"painters",    business:"Atlanta Pro Painters",    contact:"John Smith",   phone:"(404) 555-0201", website:"atlantapropainters.com",  note:"Did our whole exterior — great work!" },
  { id: 2, category:"roofers",     business:"Saints Roofing Co.",       contact:"Mike Davis",   phone:"(770) 555-0301", website:"saintsroofing.com",        note:"Quick response after storm damage." },
  { id: 3, category:"plumbing",    business:"Peach State Plumbing",     contact:"Tom Greene",   phone:"(678) 555-0401", website:"peachstateplumbing.com",   note:"Fixed our water heater same day." },
  { id: 4, category:"ac_heating",  business:"Cool Breeze HVAC",         contact:"Sara Lee",     phone:"(404) 555-0501", website:"coolbreezehvac.com",       note:"Annual maintenance, very reliable." },
  { id: 5, category:"realtors",    business:"Marietta Home Group",      contact:"Lisa Park",    phone:"(770) 555-0601", website:"mariettahomegroup.com",    note:"Helped 3 families on our street!" },
  { id: 6, category:"landscaping", business:"Green Thumb Landscaping",  contact:"Carlos Ruiz",  phone:"(678) 555-0701", website:"greenthumbga.com",         note:"Weekly lawn care, very professional." },
];

// ── CONTRACTORS TAB ────────────────────────────────────────────────────────────
function Contractors() {
  const [contractors, setContractors] = useState(SAMPLE_CONTRACTORS);
  const [loading, setLoading]         = useState(false);
  const [sheetError, setSheetError]   = useState(null);
  const [usingSheets, setUsingSheets] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newC, setNewC] = useState({ category:"painters", business:"", contact:"", phone:"", website:"", note:"" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadContractors = () => {
    setLoading(true); setSheetError(null); setUsingSheets(true);
    fetchContractors()
      .then(d => {
        if (d.length > 0) setContractors(d);
        setLoading(false);
      })
      .catch(e => {
        setUsingSheets(false);
        setSheetError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => { loadContractors(); }, []);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const addContractor = async () => {
    if (!newC.business.trim()) return;
    // Optimistic UI update
    const tempId = Date.now();
    setContractors(prev => [...prev, { ...newC, id: tempId }]);
    setNewC({ category:"painters", business:"", contact:"", phone:"", website:"", note:"" });
    setShowAdd(false);
    setSaving(true); setSaveMsg(null);

    if (CONTRACTORS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
      setSaving(false);
      setSaveMsg({ type:"warn", text:"⚠️ Apps Script not connected — entry visible this session only." });
      return;
    }

    try {
      const res  = await fetch(CONTRACTORS_SCRIPT_URL, {
        method: "POST",
        body:   JSON.stringify({ action:"add", ...newC }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMsg({ type:"ok", text:"✅ Contractor saved to Google Sheets!" });
        // Reload from sheet to get clean server data
        setTimeout(() => loadContractors(), 1500);
      } else {
        setSaveMsg({ type:"err", text:"❌ Could not save to Sheet: " + json.error });
      }
    } catch {
      setSaveMsg({ type:"err", text:"❌ Network error — entry visible this session only." });
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 5000);
  };

  const removeContractor = async (id) => {
    const target = contractors.find(c => c.id === id);
    // Optimistic UI update
    setContractors(prev => prev.filter(c => c.id !== id));
    setConfirmDelete(null);

    if (!target || CONTRACTORS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") return;

    try {
      await fetch(CONTRACTORS_SCRIPT_URL, {
        method: "POST",
        body:   JSON.stringify({ action:"delete", business: target.business, category: target.category }),
      });
      // Reload to sync with sheet
      setTimeout(() => loadContractors(), 1500);
    } catch {
      // Silent fail — sheet will still have the row, reload will restore it
      loadContractors();
    }
  };

  const filtered = contractors.filter(c => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const matchSearch = [c.business, c.contact, c.phone, c.note].some(f =>
      f.toLowerCase().includes(search.toLowerCase())
    );
    return matchCat && matchSearch;
  });

  const catColors = {
    painters:    "#5b8dee",
    roofers:     "#e09a3a",
    plumbing:    "#3ab8c9",
    electrical:  "#f5c542",
    ac_heating:  "#7c5be0",
    realtors:    "#c9a84c",
    landscaping: "#4caf87",
    others:      "#8b9db5",
  };

  return (
    <div>
      <div style={S.secHead}>🔨 Contractor Directory</div>
      <div style={S.secSub}>Community-recommended contractors for home improvements. Add one you've used!</div>
      {sheetError && sheetError !== "NETWORK_BLOCKED" && (
        <div style={{ ...S.card, border:"1px solid rgba(224,92,92,.3)", background:"rgba(224,92,92,.07)", marginBottom:16 }}>
          <div style={{color:"#e05c5c", fontWeight:"bold", marginBottom:6}}>⚠️ Could Not Connect to Google Sheets</div>
          <div style={{color:"#8faa9a", fontSize:13, marginBottom:10}}>
            {sheetError === "API_KEY_ERROR" ? "API key rejected — check Google Cloud Console restrictions."
            : sheetError === "SHEET_NOT_FOUND" ? "Sheet not found — make sure it is shared as 'Anyone with the link can view'."
            : "Unable to reach Google Sheets. Showing sample data."}
          </div>
          <button style={{...S.btnSm}} onClick={loadContractors}>↻ Retry</button>
        </div>
      )}

      {saveMsg && (
        <div style={{
          ...S.card, marginBottom:16,
          background: saveMsg.type==="ok"   ? "rgba(76,175,135,.1)"  :
                      saveMsg.type==="warn" ? "rgba(224,154,58,.1)"  : "rgba(224,92,92,.1)",
          border:     saveMsg.type==="ok"   ? "1px solid rgba(76,175,135,.4)"  :
                      saveMsg.type==="warn" ? "1px solid rgba(224,154,58,.4)"  : "1px solid rgba(224,92,92,.4)",
          color:      saveMsg.type==="ok"   ? "#4caf87" :
                      saveMsg.type==="warn" ? "#e09a3a" : "#e05c5c",
          fontSize:13, fontWeight:"bold",
        }}>
          {saveMsg.text}
        </div>
      )}
      {loading && <div style={{textAlign:"center",color:"#8faa9a",padding:40}}>⏳ Loading contractors from Google Sheets...</div>}

      {/* Category filter pills */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        <button
          onClick={() => setActiveCategory("all")}
          style={{
            padding:"8px 16px", borderRadius:20, cursor:"pointer",
            fontFamily:"Georgia,serif", fontSize:13,
            background: activeCategory==="all" ? "linear-gradient(135deg,#c9a84c,#e8cc80)" : "rgba(255,255,255,.06)",
            color: activeCategory==="all" ? "#1a2332" : "#8faa9a",
            border: activeCategory==="all" ? "none" : "1px solid rgba(201,168,76,.2)",
            fontWeight: activeCategory==="all" ? "bold" : "normal",
          }}
        >
          All ({contractors.length})
        </button>
        {CONTRACTOR_CATEGORIES.map(cat => {
          const count = contractors.filter(c => c.category === cat.id).length;
          const active = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding:"8px 16px", borderRadius:20, cursor:"pointer",
              fontFamily:"Georgia,serif", fontSize:13,
              background: active ? `${catColors[cat.id]}33` : "rgba(255,255,255,.06)",
              color: active ? catColors[cat.id] : "#8faa9a",
              border: active ? `1px solid ${catColors[cat.id]}66` : "1px solid rgba(201,168,76,.2)",
              fontWeight: active ? "bold" : "normal",
            }}>
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search + Add button */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <input
          style={{ ...S.input, flex:1, minWidth:200, marginBottom:0 }}
          placeholder="🔍 Search contractors..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <button style={S.btn} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "✕ Cancel" : "+ Add Contractor"}
        </button>
      </div>

      {/* Add Contractor Form */}
      {showAdd && (
        <div style={{ ...S.card, border:"1px solid rgba(201,168,76,.4)" }}>
          <div style={S.cardTitle}>➕ Add a Contractor</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ color:"#c9a84c", fontSize:12, marginBottom:4 }}>Category</div>
              <select
                style={{ ...S.select, width:"100%", marginRight:0 }}
                value={newC.category}
                onChange={e => setNewC({...newC, category:e.target.value})}
              >
                {CONTRACTOR_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            {[
              { label:"Business Name *", field:"business", ph:"e.g. Atlanta Pro Painters" },
              { label:"Contact Person",  field:"contact",  ph:"e.g. John Smith" },
              { label:"Phone Number",    field:"phone",    ph:"e.g. (404) 555-0100" },
              { label:"Website",         field:"website",  ph:"e.g. example.com" },
            ].map(({label, field, ph}) => (
              <div key={field}>
                <div style={{ color:"#c9a84c", fontSize:12, marginBottom:4 }}>{label}</div>
                <input
                  style={{ ...S.input, marginBottom:0 }}
                  placeholder={ph}
                  value={newC[field]}
                  onChange={e => setNewC({...newC, [field]:e.target.value})}
                />
              </div>
            ))}
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ color:"#c9a84c", fontSize:12, marginBottom:4 }}>Neighbor Recommendation / Note</div>
              <input
                style={{ ...S.input, marginBottom:0 }}
                placeholder="e.g. Repainted our fence — great price and quality!"
                value={newC.note}
                onChange={e => setNewC({...newC, note:e.target.value})}
              />
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <button style={S.btn} onClick={addContractor}>💾 Save Contractor</button>
            <button style={S.btnOut} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Contractor Cards grouped by category */}
      {activeCategory === "all" ? (
        CONTRACTOR_CATEGORIES.map(cat => {
          const catItems = filtered.filter(c => c.category === cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} style={{ marginBottom:32 }}>
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                marginBottom:14, paddingBottom:8,
                borderBottom:`2px solid ${catColors[cat.id]}44`,
              }}>
                <span style={{ fontSize:22 }}>{cat.icon}</span>
                <span style={{ color: catColors[cat.id], fontWeight:"bold", fontSize:18 }}>{cat.label}</span>
                <span style={{ ...S.pill(catColors[cat.id]), marginLeft:4 }}>{catItems.length}</span>
              </div>
              <ContractorGrid items={catItems} catColor={catColors[cat.id]} onDelete={setConfirmDelete} />
            </div>
          );
        })
      ) : (
        <div>
          {(() => {
            const cat = CONTRACTOR_CATEGORIES.find(c => c.id === activeCategory);
            return (
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                marginBottom:14, paddingBottom:8,
                borderBottom:`2px solid ${catColors[activeCategory]}44`,
              }}>
                <span style={{ fontSize:22 }}>{cat.icon}</span>
                <span style={{ color: catColors[activeCategory], fontWeight:"bold", fontSize:18 }}>{cat.label}</span>
                <span style={{ ...S.pill(catColors[activeCategory]), marginLeft:4 }}>{filtered.length}</span>
              </div>
            );
          })()}
          <ContractorGrid items={filtered} catColor={catColors[activeCategory]} onDelete={setConfirmDelete} />
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", color:"#8faa9a", padding:40 }}>
          No contractors found. Be the first to add one! 🔨
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,.6)", display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:1000,
        }}>
          <div style={{ ...S.card, maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🗑</div>
            <div style={{ color:"#e8e0d0", fontWeight:"bold", marginBottom:8 }}>Remove this contractor?</div>
            <div style={{ color:"#8faa9a", fontSize:13, marginBottom:20 }}>
              This will remove them from the community list.
            </div>
            <button style={{ ...S.btn, marginRight:8 }} onClick={() => removeContractor(confirmDelete)}>Yes, Remove</button>
            <button style={S.btnOut} onClick={() => setConfirmDelete(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractorGrid({ items, catColor, onDelete }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
      {items.map(c => (
        <div key={c.id} style={{
          background:"rgba(255,255,255,.05)",
          border:`1px solid ${catColor}22`,
          borderRadius:12, padding:20,
          transition:"all .2s",
          position:"relative",
        }}>
          {/* Category color bar */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:3,
            background:`linear-gradient(90deg,${catColor},${catColor}44)`,
            borderRadius:"12px 12px 0 0",
          }} />

          <div style={{ fontWeight:"bold", fontSize:16, color:"#e8e0d0", marginBottom:10, marginTop:4 }}>
            {c.business}
          </div>

          {c.contact && (
            <div style={{ ...S.infoRow, marginBottom:6 }}>
              <span style={{ ...S.infoIcon, color: catColor }}>👤</span>
              <span style={{ color:"#8faa9a", fontSize:13 }}>{c.contact}</span>
            </div>
          )}
          {c.phone && (
            <div style={{ ...S.infoRow, marginBottom:6 }}>
              <span style={{ ...S.infoIcon, color: catColor }}>📞</span>
              <a href={`tel:${c.phone}`} style={{ color:"#5b8dee", fontSize:13, textDecoration:"none" }}>{c.phone}</a>
            </div>
          )}
          {c.website && (
            <div style={{ ...S.infoRow, marginBottom:6 }}>
              <span style={{ ...S.infoIcon, color: catColor }}>🌐</span>
              <a href={`https://${c.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer"
                style={{ color:"#5b8dee", fontSize:13, textDecoration:"none", wordBreak:"break-all" }}>
                {c.website}
              </a>
            </div>
          )}
          {c.note && (
            <div style={{
              marginTop:12, padding:"10px 12px",
              background:`${catColor}11`,
              border:`1px solid ${catColor}22`,
              borderRadius:8, fontSize:12,
              color:"#ccc5b5", lineHeight:1.6,
              fontStyle:"italic",
            }}>
              💬 "{c.note}"
            </div>
          )}


        </div>
      ))}
    </div>
  );
}

// ── BOARD TAB ──────────────────────────────────────────────────────────────────
function BoardTab() {
  const [unlocked, setUnlocked]   = useState(false);
  const [pwInput, setPwInput]     = useState("");
  const [pwError, setPwError]     = useState(false);
  const [activeSection, setActiveSection] = useState("announcements");

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [newAnn, setNewAnn]   = useState({ title:"", message:"" });
  const [annMsg, setAnnMsg]   = useState(null);

  // To Do state
  const [todos, setTodos]         = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newTodo, setNewTodo]     = useState({ text:"", priority:"medium", category:"board" });
  const [todoFilter, setTodoFilter] = useState("all");
  const [todoMsg, setTodoMsg]     = useState(null);

  const loadTodos = () => {
    setTodosLoading(true);
    fetchBoardContent(BOARD_CONTENT_CONFIG.todoRange)
      .then(rows => {
        setTodos(rows.map(r => ({
          id:       r[0] || "",
          text:     r[1] || "",
          category: r[2] || "board",
          priority: r[3] || "medium",
          done:     r[4] === "true",
          created:  r[5] || "",
        })));
        setTodosLoading(false);
      })
      .catch(() => setTodosLoading(false));
  };

  const notifyTodo = (type, text) => {
    setTodoMsg({ type, text });
    setTimeout(() => setTodoMsg(null), 4000);
  };

  const addTodo = async () => {
    if (!newTodo.text.trim()) return;
    const tempId = "temp_" + Date.now();
    const entry  = { id: tempId, ...newTodo, done: false };
    setTodos(prev => [entry, ...prev]);
    setNewTodo({ text:"", priority:"medium", category:"board" });
    try {
      const p   = new URLSearchParams({ action:"addTodo", text: entry.text, category: entry.category, priority: entry.priority });
      const res = await fetch(`${BOARD_SCRIPT_URL}?${p}`);
      const json = await res.json();
      if (json.success) {
        // Replace temp id with real sheet id
        setTodos(prev => prev.map(t => t.id === tempId ? { ...t, id: json.id } : t));
        notifyTodo("ok", "✅ Task saved to Google Sheets!");
      } else notifyTodo("warn", "⚠️ Could not save: " + json.error);
    } catch { notifyTodo("warn", "⚠️ Network error — task visible this session only."); }
  };

  const toggleTodo = async (id) => {
    setTodos(prev => prev.map(t => t.id===id ? {...t, done:!t.done} : t));
    try {
      const p   = new URLSearchParams({ action:"toggleTodo", id });
      await fetch(`${BOARD_SCRIPT_URL}?${p}`);
    } catch {}
  };

  const deleteTodo = async (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      const p   = new URLSearchParams({ action:"deleteTodo", id });
      await fetch(`${BOARD_SCRIPT_URL}?${p}`);
    } catch {}
  };

  const priorityConfig = {
    high:   { label:"High",   color:"#e05c5c" },
    medium: { label:"Medium", color:"#e09a3a" },
    low:    { label:"Low",    color:"#4caf87" },
  };

  const categoryConfig = {
    landscaping: { label:"Landscaping",      color:"#4caf87", icon:"🌿" },
    financial:   { label:"Financial",        color:"#5b8dee", icon:"💰" },
    social:      { label:"Social Committee", color:"#c9a84c", icon:"🎉" },
    board:       { label:"Board Task",       color:"#8b9db5", icon:"🏛️" },
  };

  // Events state
  const [events, setEvents]   = useState([]);
  const [newEvt, setNewEvt]   = useState({ title:"", description:"", date:"", time:"", location:"" });
  const [evtMsg, setEvtMsg]   = useState(null);

  const unlock = () => {
    if (pwInput === BOARD_PASSWORD) { setUnlocked(true); setPwError(false); setPwInput(""); }
    else setPwError(true);
  };

  useEffect(() => {
    if (!unlocked) return;
    fetchBoardContent(BOARD_CONTENT_CONFIG.announcementsRange)
      .then(rows => setAnnouncements(rows.map((r,i) => ({
        id:i+1, title:r[0]||"", message:r[1]||"", date:r[2]||"", status:r[3]||"Active"
      }))))
      .catch(() => {});

    fetchBoardContent(BOARD_CONTENT_CONFIG.eventsRange)
      .then(rows => setEvents(rows.map((r,i) => ({
        id:i+1, title:r[0]||"", description:r[1]||"", date:r[2]||"", time:r[3]||"", location:r[4]||"", status:r[5]||"Active"
      }))))
      .catch(() => {});

    loadTodos();
  }, [unlocked]);

  const notify = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter(null), 5000);
  };

  const addAnnouncement = async () => {
    if (!newAnn.title.trim() || !newAnn.message.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const entry = { id: Date.now(), ...newAnn, date: today, status:"Active" };
    setAnnouncements(prev => [entry, ...prev]);
    setNewAnn({ title:"", message:"" });

    if (BOARD_SCRIPT_URL === "YOUR_BOARD_SCRIPT_URL_HERE") {
      notify(setAnnMsg, "warn", "⚠️ Apps Script not connected — visible this session only.");
      return;
    }
    try {
      const p    = new URLSearchParams({ action:"addAnnouncement", title: entry.title, message: entry.message });
      const res  = await fetch(`${BOARD_SCRIPT_URL}?${p}`);
      const json = await res.json();
      notify(setAnnMsg, json.success ? "ok" : "warn",
        json.success ? "✅ Announcement saved to Google Sheets!" : "⚠️ Could not save: " + json.error);
    } catch {
      notify(setAnnMsg, "warn", "⚠️ Network error — visible this session only.");
    }
  };

  const deleteAnnouncement = async (id) => {
    const target = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));

    if (!target || BOARD_SCRIPT_URL === "YOUR_BOARD_SCRIPT_URL_HERE") {
      notify(setAnnMsg, "warn", "🗑 Removed from view. Delete the row in your Google Sheet too.");
      return;
    }
    try {
      const p    = new URLSearchParams({ action:"deleteAnnouncement", title: target.title });
      const res  = await fetch(`${BOARD_SCRIPT_URL}?${p}`);
      const json = await res.json();
      notify(setAnnMsg, json.success ? "ok" : "warn",
        json.success ? "🗑 Announcement deleted from Google Sheets!" : "⚠️ Removed from view — delete from Sheet manually.");
    } catch {
      notify(setAnnMsg, "warn", "⚠️ Network error — delete from Sheet manually.");
    }
  };

  const addEvent = async () => {
    if (!newEvt.title.trim() || !newEvt.date.trim()) return;
    const entry = { id: Date.now(), ...newEvt, status:"Active" };
    setEvents(prev => [entry, ...prev]);
    setNewEvt({ title:"", description:"", date:"", time:"", location:"" });

    if (BOARD_SCRIPT_URL === "YOUR_BOARD_SCRIPT_URL_HERE") {
      notify(setEvtMsg, "warn", "⚠️ Apps Script not connected — visible this session only.");
      return;
    }
    try {
      const p    = new URLSearchParams({ action:"addEvent", title: entry.title, description: entry.description, date: entry.date, time: entry.time, location: entry.location });
      const res  = await fetch(`${BOARD_SCRIPT_URL}?${p}`);
      const json = await res.json();
      notify(setEvtMsg, json.success ? "ok" : "warn",
        json.success ? "✅ Event saved to Google Sheets!" : "⚠️ Could not save: " + json.error);
    } catch {
      notify(setEvtMsg, "warn", "⚠️ Network error — visible this session only.");
    }
  };

  const deleteEvent = async (id) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));

    if (!target || BOARD_SCRIPT_URL === "YOUR_BOARD_SCRIPT_URL_HERE") {
      notify(setEvtMsg, "warn", "🗑 Removed from view. Delete the row in your Google Sheet too.");
      return;
    }
    try {
      const p    = new URLSearchParams({ action:"deleteEvent", title: target.title });
      const res  = await fetch(`${BOARD_SCRIPT_URL}?${p}`);
      const json = await res.json();
      notify(setEvtMsg, json.success ? "ok" : "warn",
        json.success ? "🗑 Event deleted from Google Sheets!" : "⚠️ Removed from view — delete from Sheet manually.");
    } catch {
      notify(setEvtMsg, "warn", "⚠️ Network error — delete from Sheet manually.");
    }
  };

  const StatusMsg = ({ msg }) => msg ? (
    <div style={{
      ...S.card, marginBottom:16,
      background: msg.type==="ok" ? "rgba(76,175,135,.1)" : "rgba(224,154,58,.1)",
      border:     msg.type==="ok" ? "1px solid rgba(76,175,135,.4)" : "1px solid rgba(224,154,58,.4)",
      color:      msg.type==="ok" ? "#4caf87" : "#e09a3a",
      fontSize:13, fontWeight:"bold",
    }}>{msg.text}</div>
  ) : null;

  if (!unlocked) return (
    <div>
      <div style={S.secHead}>🔒 Board Portal</div>
      <div style={S.secSub}>This area is for Saint Andrews Park board members only.</div>
      <div style={{...S.card, maxWidth:400, margin:"40px auto", textAlign:"center"}}>
        <div style={{fontSize:48, marginBottom:16}}>🔒</div>
        <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:18, marginBottom:8}}>Board Members Only</div>
        <div style={{color:"#8faa9a", fontSize:13, marginBottom:24}}>Enter your board password to access this area.</div>
        <input
          style={{...S.input, textAlign:"center", letterSpacing:4, fontSize:18}}
          type="password" placeholder="••••••••"
          value={pwInput}
          onChange={e=>{ setPwInput(e.target.value); setPwError(false); }}
          onKeyDown={e=>e.key==="Enter"&&unlock()}
        />
        {pwError && <div style={{color:"#e05c5c", fontSize:13, marginBottom:12}}>Incorrect password — try again.</div>}
        <button style={{...S.btn, width:"100%"}} onClick={unlock}>Unlock Board Portal</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:8}}>
        <div>
          <div style={S.secHead}>🏛️ Board Portal</div>
          <div style={S.secSub}>Manage community announcements and upcoming events.</div>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <span style={{...S.pill("#4caf87"), padding:"7px 14px"}}>🔓 Board Mode</span>
          <button style={S.btnOut} onClick={()=>setUnlocked(false)}>🔒 Lock</button>
        </div>
      </div>

      {/* Section switcher */}
      <div style={{display:"flex", gap:8, marginBottom:24, flexWrap:"wrap"}}>
        {[{id:"announcements",label:"📣 Announcements"},{id:"events",label:"📅 Events"},{id:"todo",label:"✅ To Do List"}].map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{
            padding:"10px 20px", borderRadius:8, cursor:"pointer",
            fontFamily:"Georgia,serif", fontSize:14, fontWeight:"bold",
            background: activeSection===s.id ? "linear-gradient(135deg,#c9a84c,#e8cc80)" : "rgba(255,255,255,.06)",
            color:      activeSection===s.id ? "#1a2332" : "#8faa9a",
            border:     activeSection===s.id ? "none" : "1px solid rgba(201,168,76,.2)",
          }}>{s.label}</button>
        ))}
      </div>

      {/* ── ANNOUNCEMENTS SECTION ── */}
      {activeSection === "announcements" && (
        <div>
          <StatusMsg msg={annMsg} />
          <div style={S.card}>
            <div style={S.cardTitle}>➕ New Announcement</div>
            <div style={{marginBottom:12}}>
              <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Title *</div>
              <input style={{...S.input, marginBottom:0}} placeholder="e.g. Road Closure Notice"
                value={newAnn.title} onChange={e=>setNewAnn({...newAnn,title:e.target.value})} />
            </div>
            <div style={{marginBottom:16}}>
              <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Message *</div>
              <textarea style={{...S.textarea, minHeight:100, marginBottom:0}}
                placeholder="Write your announcement here..."
                value={newAnn.message} onChange={e=>setNewAnn({...newAnn,message:e.target.value})} />
            </div>
            <button style={S.btn} onClick={addAnnouncement}>📣 Post Announcement</button>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>📋 Posted Announcements</div>
            {announcements.length === 0 ? (
              <div style={{color:"#8faa9a", fontSize:14, textAlign:"center", padding:"20px 0"}}>No announcements yet.</div>
            ) : announcements.map(a => (
              <div key={a.id} style={{padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{color:"#e8e0d0", fontWeight:"bold", marginBottom:4}}>{a.title}</div>
                    <div style={{color:"#ccc5b5", fontSize:13, lineHeight:1.7, marginBottom:4}}>{a.message}</div>
                    {a.date && <div style={{color:"#8faa9a", fontSize:11}}>Posted: {a.date}</div>}
                  </div>
                  <button onClick={()=>deleteAnnouncement(a.id)} style={{
                    background:"rgba(224,92,92,.1)", border:"1px solid rgba(224,92,92,.3)",
                    color:"#e05c5c", borderRadius:6, padding:"6px 12px",
                    cursor:"pointer", fontSize:12, flexShrink:0,
                  }}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EVENTS SECTION ── */}
      {activeSection === "events" && (
        <div>
          <StatusMsg msg={evtMsg} />
          <div style={S.card}>
            <div style={S.cardTitle}>➕ New Event</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12}}>
              <div style={{gridColumn:"1/-1"}}>
                <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Event Title *</div>
                <input style={{...S.input, marginBottom:0}} placeholder="e.g. Spring Community Cleanup"
                  value={newEvt.title} onChange={e=>setNewEvt({...newEvt,title:e.target.value})} />
              </div>
              <div>
                <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Date *</div>
                <input style={{...S.input, marginBottom:0}} type="date"
                  value={newEvt.date} onChange={e=>setNewEvt({...newEvt,date:e.target.value})} />
              </div>
              <div>
                <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Time</div>
                <input style={{...S.input, marginBottom:0}} placeholder="e.g. 10:00 AM"
                  value={newEvt.time} onChange={e=>setNewEvt({...newEvt,time:e.target.value})} />
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Location</div>
                <input style={{...S.input, marginBottom:0}} placeholder="e.g. Community Pool"
                  value={newEvt.location} onChange={e=>setNewEvt({...newEvt,location:e.target.value})} />
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Description</div>
                <textarea style={{...S.textarea, minHeight:80, marginBottom:0}}
                  placeholder="Tell neighbors what to expect..."
                  value={newEvt.description} onChange={e=>setNewEvt({...newEvt,description:e.target.value})} />
              </div>
            </div>
            <button style={S.btn} onClick={addEvent}>📅 Add Event</button>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>📋 Scheduled Events</div>
            {events.length === 0 ? (
              <div style={{color:"#8faa9a", fontSize:14, textAlign:"center", padding:"20px 0"}}>No events scheduled yet.</div>
            ) : events.map(e => (
              <div key={e.id} style={{
                padding:"14px 16px", borderRadius:10, marginBottom:10,
                background:"rgba(201,168,76,.06)", border:"1px solid rgba(201,168,76,.2)",
              }}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:15, marginBottom:6}}>{e.title}</div>
                    <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:6}}>
                      {e.date && <span style={{...S.pill("#5b8dee"), fontSize:11}}>📅 {e.date}</span>}
                      {e.time && <span style={{...S.pill("#4caf87"), fontSize:11}}>🕐 {e.time}</span>}
                    </div>
                    {e.location && <div style={{color:"#8faa9a", fontSize:12, marginBottom:4}}>📍 {e.location}</div>}
                    {e.description && <div style={{color:"#ccc5b5", fontSize:13, lineHeight:1.7}}>{e.description}</div>}
                  </div>
                  <button onClick={()=>deleteEvent(e.id)} style={{
                    background:"rgba(224,92,92,.1)", border:"1px solid rgba(224,92,92,.3)",
                    color:"#e05c5c", borderRadius:6, padding:"6px 12px",
                    cursor:"pointer", fontSize:12, flexShrink:0,
                  }}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{...S.card, background:"rgba(91,141,238,.06)", border:"1px solid rgba(91,141,238,.2)"}}>
            <div style={{color:"#5b8dee", fontWeight:"bold", marginBottom:6}}>📊 Reminder</div>
            <div style={{color:"#8faa9a", fontSize:13}}>
              {BOARD_SCRIPT_URL === "YOUR_BOARD_SCRIPT_URL_HERE"
                ? <>Apps Script not yet connected. Changes are <strong style={{color:"#e8e0d0"}}>session only</strong> — update your Google Sheet manually to persist data.</>
                : <>All additions and deletions are <strong style={{color:"#4caf87"}}>automatically saved</strong> to Google Sheets and visible to all neighbors instantly!</>}
            </div>
          </div>
        </div>
      )}

      {/* ── TO DO SECTION ── */}
      {activeSection === "todo" && (
        <div>
          {/* Add task */}
          <div style={S.card}>
            <div style={S.cardTitle}>➕ New Task</div>
            <div style={{marginBottom:12}}>
              <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Task *</div>
              <input
                style={{...S.input, marginBottom:0}}
                placeholder="e.g. Review insurance renewal"
                value={newTodo.text}
                onChange={e => setNewTodo({...newTodo, text:e.target.value})}
                onKeyDown={e => e.key==="Enter" && addTodo()}
              />
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:4}}>
              <div>
                <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Category</div>
                <select
                  style={{...S.select, marginBottom:0}}
                  value={newTodo.category}
                  onChange={e => setNewTodo({...newTodo, category:e.target.value})}
                >
                  <option value="landscaping">🌿 Landscaping</option>
                  <option value="financial">💰 Financial</option>
                  <option value="social">🎉 Social Committee</option>
                  <option value="board">🏛️ Board Task</option>
                </select>
              </div>
              <div>
                <div style={{color:"#c9a84c", fontSize:12, marginBottom:4}}>Priority</div>
                <select
                  style={{...S.select, marginBottom:0}}
                  value={newTodo.priority}
                  onChange={e => setNewTodo({...newTodo, priority:e.target.value})}
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
            <button style={{...S.btn, marginTop:14}} onClick={addTodo}>✅ Add Task</button>
          </div>

          {/* Status message */}
          {todoMsg && (
            <div style={{
              ...S.card, marginBottom:16,
              background: todoMsg.type==="ok" ? "rgba(76,175,135,.1)" : "rgba(224,154,58,.1)",
              border:     todoMsg.type==="ok" ? "1px solid rgba(76,175,135,.4)" : "1px solid rgba(224,154,58,.4)",
              color:      todoMsg.type==="ok" ? "#4caf87" : "#e09a3a",
              fontSize:13, fontWeight:"bold",
            }}>{todoMsg.text}</div>
          )}
          {todosLoading && <div style={{textAlign:"center", color:"#8faa9a", padding:20}}>⏳ Loading tasks...</div>}

          {/* Filter + stats */}
          <div style={{display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between"}}>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              {["all","active","done"].map(f => (
                <button key={f} onClick={()=>setTodoFilter(f)} style={{
                  padding:"7px 16px", borderRadius:20, cursor:"pointer",
                  fontFamily:"Georgia,serif", fontSize:13,
                  background: todoFilter===f ? "linear-gradient(135deg,#c9a84c,#e8cc80)" : "rgba(255,255,255,.06)",
                  color:      todoFilter===f ? "#1a2332" : "#8faa9a",
                  border:     todoFilter===f ? "none" : "1px solid rgba(201,168,76,.2)",
                  fontWeight: todoFilter===f ? "bold" : "normal",
                }}>
                  {f==="all" ? `All (${todos.length})` : f==="active" ? `Active (${todos.filter(t=>!t.done).length})` : `Done (${todos.filter(t=>t.done).length})`}
                </button>
              ))}
            </div>
            {todos.filter(t=>t.done).length > 0 && (
              <button onClick={async ()=>{
                setTodos(prev=>prev.filter(t=>!t.done));
                try { await fetch(`${BOARD_SCRIPT_URL}?action=clearCompleted`); } catch {}
              }} style={{
                background:"rgba(224,92,92,.1)", border:"1px solid rgba(224,92,92,.3)",
                color:"#e05c5c", borderRadius:6, padding:"6px 14px",
                cursor:"pointer", fontSize:12,
              }}>🗑 Clear Completed</button>
            )}
          </div>

          {/* Task list */}
          <div style={S.card}>
            {todos
              .filter(t => todoFilter==="all" ? true : todoFilter==="active" ? !t.done : t.done)
              .sort((a,b) => {
                const order = {high:0, medium:1, low:2};
                if (a.done !== b.done) return a.done ? 1 : -1;
                return order[a.priority] - order[b.priority];
              })
              .map(t => (
                <div key={t.id} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.06)",
                  opacity: t.done ? 0.5 : 1, transition:"opacity .2s",
                }}>
                  {/* Checkbox */}
                  <div
                    onClick={() => toggleTodo(t.id)}
                    style={{
                      width:22, height:22, borderRadius:6, flexShrink:0,
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      background: t.done ? "#4caf87" : "transparent",
                      border: t.done ? "2px solid #4caf87" : "2px solid rgba(255,255,255,.2)",
                      fontSize:13, transition:"all .2s",
                    }}
                  >{t.done ? "✓" : ""}</div>

                  {/* Text */}
                  <div style={{flex:1}}>
                    <span style={{
                      color:"#e8e0d0", fontSize:14,
                      textDecoration: t.done ? "line-through" : "none",
                    }}>{t.text}</span>
                  </div>

                  {/* Category badge */}
                  {t.category && categoryConfig[t.category] && (
                    <span style={{
                      fontSize:11, fontWeight:"bold", padding:"3px 10px", borderRadius:20,
                      background: `${categoryConfig[t.category].color}22`,
                      color: categoryConfig[t.category].color,
                      border: `1px solid ${categoryConfig[t.category].color}44`,
                      flexShrink:0,
                    }}>{categoryConfig[t.category].icon} {categoryConfig[t.category].label}</span>
                  )}

                  {/* Priority badge */}
                  <span style={{
                    fontSize:11, fontWeight:"bold", padding:"3px 10px", borderRadius:20,
                    background: `${priorityConfig[t.priority].color}22`,
                    color: priorityConfig[t.priority].color,
                    border: `1px solid ${priorityConfig[t.priority].color}44`,
                    flexShrink:0,
                  }}>{priorityConfig[t.priority].label}</span>

                  {/* Delete */}
                  <button onClick={()=>deleteTodo(t.id)} style={{
                    background:"transparent", border:"none",
                    color:"rgba(224,92,92,.3)", cursor:"pointer",
                    fontSize:16, flexShrink:0, transition:"color .2s",
                  }}
                    onMouseEnter={e=>e.target.style.color="#e05c5c"}
                    onMouseLeave={e=>e.target.style.color="rgba(224,92,92,.3)"}
                  >✕</button>
                </div>
              ))
            }
            {todos.filter(t => todoFilter==="all" ? true : todoFilter==="active" ? !t.done : t.done).length === 0 && (
              <div style={{color:"#8faa9a", fontSize:14, textAlign:"center", padding:"20px 0"}}>
                {todoFilter==="done" ? "No completed tasks yet. Keep going! 💪" : "All caught up! Great work. 🎉"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("dashboard");

  const render=()=>{switch(tab){
    case"dashboard":   return <Dashboard onNavigate={setTab}/>;
    case"directory":   return <NeighborhoodDirectory/>;
    case"contractors": return <Contractors/>;
    case"newsletter":  return <Newsletter/>;
    case"minutes":     return <MeetingMinutes/>;
    case"board":       return <BoardTab/>;
    default:           return null;
  }};
  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={S.logoIcon}>⛳</div>
          <div><div style={{...S.logoTitle, fontSize:26}}>Saint Andrews Park</div></div>
        </div>
        <div style={S.badge}>COMMUNITY PORTAL</div>
      </div>
      <div style={S.nav}>
        {TABS.map(t=><button key={t.id} style={S.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>
      <div style={S.main}>{render()}</div>
    </div>
  );
}
