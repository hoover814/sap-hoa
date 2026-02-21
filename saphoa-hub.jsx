import { useState, useEffect, useRef } from "react";

// ── CONFIGURATION — update these when deploying to GitHub ──────────────────────
const GOOGLE_SHEETS_CONFIG = {
  apiKey: "AIzaSyCcdVM9E499Vketlm7ReKeKCLjpjsvnTyU",
  spreadsheetId: "15BjVviB6RcHlGjg_Kc9-GSgea7RgXKEVWhO44XDJEDQ",
  range: "Directory!A2:D",
};

const CONTRACTORS_SHEET_CONFIG = {
  apiKey: "AIzaSyCcdVM9E499Vketlm7ReKeKCLjpjsvnTyU",
  spreadsheetId: "1SIKmPyv8UnHPiv8Tc_0cxOMMFg-sWjM_",
  range: "Contractors!A2:F",
};
// Paste your Apps Script Web App URL here after deploying the script
const CONTRACTORS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_kQPd_v2GAtGbTSP1LLOpxmTM_eKSkPjDkJb4UpCmNLZovqlRk7xY-ed898h-01LP/exec";
const BOARD_PASSWORD = "SAP2026"; // change before deploying!

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
  return data.values.map((row, i) => ({
    id: i + 1,
    category: row[0]||"others",
    business:  row[1]||"",
    contact:   row[2]||"",
    phone:     row[3]||"",
    website:   row[4]||"",
    note:      row[5]||"",
  }));
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
    id: i + 1, name: row[0]||"", address: row[1]||"", phone: row[2]||"", email: row[3]||"",
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
      const coords = getApproxCoords(n.address);
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
      <div style={S.secSub}>
        {usingSheets ? "✅ Live data synced from Google Sheets." : sheetError === "NETWORK_BLOCKED" ? "👁 Preview mode — showing sample data. Live data loads on GitHub Pages." : "📋 Sample data shown."}
        {" "}<strong style={{color:"#c9a84c"}}>{neighbors.length}</strong> neighbors listed.
      </div>

      {/* Neighborhood Map — top */}
      {!loading && neighbors.length > 0 && (
        <NeighborhoodMap
          neighbors={neighbors}
          selectedId={selectedPin}
          onSelectPin={id => setSelectedPin(id === selectedPin ? null : id)}
        />
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
        {!boardUnlocked ? (
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <input
              style={{ ...S.input, width:160, marginBottom:0 }}
              type="password" placeholder="Board password"
              value={pwInput}
              onChange={e=>{ setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={e=>e.key==="Enter"&&unlock()}
            />
            <button style={S.btn} onClick={unlock}>🔓 Unlock Editing</button>
            {pwError && <span style={{color:"#e05c5c",fontSize:13}}>Incorrect password</span>}
          </div>
        ) : (
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{...S.pill("#4caf87"), padding:"7px 14px"}}>🔓 Board Mode</span>
            <button style={S.btn} onClick={()=>setShowAdd(!showAdd)}>+ Add Neighbor</button>
            <button style={S.btnOut} onClick={()=>setBoardUnlocked(false)}>🔒 Lock</button>
          </div>
        )}
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
function Dashboard() {
  const quickLinks = [
    { icon:"👥", label:"Neighborhood Directory", desc:"Find your neighbors' contact info", tab:"directory" },
    { icon:"📰", label:"Newsletter",             desc:"Read the latest community newsletter", tab:"newsletter" },
    { icon:"📋", label:"Meeting Minutes",        desc:"View HOA board meeting notes", tab:"minutes" },
  ];

  return (
    <div>
      <div style={S.secHead}>Welcome to Saint Andrews Park! 🏡</div>
      <div style={S.secSub}>Your community hub — everything you need, all in one place.</div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, marginBottom:24}}>
        {quickLinks.map(l=>(
          <div key={l.tab} style={{...S.card, marginBottom:0, cursor:"pointer", transition:"all .2s", borderColor:"rgba(201,168,76,.3)"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#c9a84c"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.3)"}
          >
            <div style={{fontSize:36, marginBottom:12}}>{l.icon}</div>
            <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:16, marginBottom:6}}>{l.label}</div>
            <div style={{color:"#8faa9a", fontSize:13}}>{l.desc}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>📣 Community Announcements</div>
        <div style={{color:"#8faa9a", fontSize:14, textAlign:"center", padding:"20px 0"}}>
          No announcements at this time. Check back soon! 😊
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>📅 Upcoming Events</div>
        <div style={{color:"#8faa9a", fontSize:14, textAlign:"center", padding:"20px 0"}}>
          No upcoming events scheduled. Stay tuned! 🎉
        </div>
      </div>
    </div>
  );
}

// ── NEWSLETTER ─────────────────────────────────────────────────────────────────
function Newsletter() {
  const [quarter,setQuarter]=useState("Q1 2025");
  const [secs,setSecs]=useState([
    {id:1,title:"Message from the Board",content:""},
    {id:2,title:"Upcoming Events",content:""},
    {id:3,title:"Community Updates",content:""},
    {id:4,title:"Reminders & Announcements",content:""},
  ]);
  const upd=(id,f,v)=>setSecs(secs.map(s=>s.id===id?{...s,[f]:v}:s));
  return (
    <div>
      <div style={S.secHead}>📰 Quarterly Newsletter Builder</div>
      <div style={S.secSub}>Draft and organize your community newsletter, section by section.</div>
      <div style={S.card}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:"#c9a84c",fontSize:14}}>Quarter / Edition:</span>
          <input style={{...S.input,width:180,marginBottom:0}} value={quarter} onChange={e=>setQuarter(e.target.value)} />
        </div>
      </div>
      {secs.map(s=>(
        <div key={s.id} style={S.card}>
          <input style={{...S.input,fontSize:16,fontWeight:"bold",color:"#c9a84c",background:"transparent",border:"none",borderBottom:"1px solid rgba(201,168,76,.3)",borderRadius:0,paddingLeft:0}}
            value={s.title} onChange={e=>upd(s.id,"title",e.target.value)} />
          <textarea style={S.textarea} placeholder={`Write the "${s.title}" content here...`}
            value={s.content} onChange={e=>upd(s.id,"content",e.target.value)} />
        </div>
      ))}
      <button style={S.btn} onClick={()=>setSecs([...secs,{id:Date.now(),title:"New Section",content:""}])}>+ Add Section</button>
      <div style={{...S.card,marginTop:24}}>
        <div style={S.cardTitle}>📄 Newsletter Preview — {quarter}</div>
        {secs.map(s=>s.content?(<div key={s.id} style={{marginBottom:20}}><div style={{color:"#c9a84c",fontWeight:"bold",marginBottom:6,fontSize:16}}>{s.title}</div><div style={{color:"#ccc5b5",fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{s.content}</div></div>):null)}
        {secs.every(s=>!s.content)&&<div style={{color:"#8faa9a",textAlign:"center"}}>Fill in sections above to see your newsletter preview here.</div>}
      </div>
    </div>
  );
}

// ── MEETING MINUTES ────────────────────────────────────────────────────────────
const blankMins=()=>({id:Date.now(),date:"",attendees:"",agenda:"",decisions:"",actionItems:"",nextMeeting:""});
function MeetingMinutes() {
  const [mins,setMins]=useState([blankMins()]);
  const [activeId,setActiveId]=useState(mins[0].id);
  const active=mins.find(m=>m.id===activeId);
  const upd=(f,v)=>setMins(mins.map(m=>m.id===activeId?{...m,[f]:v}:m));
  const addNew=()=>{const m=blankMins();setMins([m,...mins]);setActiveId(m.id);};
  const fields=[
    {label:"📅 Meeting Date",  f:"date",       ph:"e.g. March 15, 2025"},
    {label:"👥 Attendees",     f:"attendees",  ph:"List board members and residents present"},
    {label:"📌 Agenda Items",  f:"agenda",     ph:"Topics discussed..."},
    {label:"✅ Decisions Made",f:"decisions",  ph:"Key decisions approved or voted on..."},
    {label:"📝 Action Items",  f:"actionItems",ph:"Who is responsible for what..."},
    {label:"📅 Next Meeting",  f:"nextMeeting",ph:"Date of next meeting..."},
  ];
  return (
    <div>
      <div style={S.secHead}>📋 Meeting Minutes</div>
      <div style={S.secSub}>Record and reference all HOA board meeting minutes in one place.</div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        <div style={{minWidth:200}}>
          <button style={{...S.btn,width:"100%",marginBottom:12}} onClick={addNew}>+ New Meeting</button>
          {mins.map(m=>(
            <div key={m.id} onClick={()=>setActiveId(m.id)} style={{padding:"12px 16px",borderRadius:8,cursor:"pointer",marginBottom:6,background:m.id===activeId?"rgba(201,168,76,.15)":"rgba(255,255,255,.04)",border:m.id===activeId?"1px solid rgba(201,168,76,.4)":"1px solid transparent",color:m.id===activeId?"#c9a84c":"#8faa9a",fontSize:13}}>
              {m.date||"Untitled Meeting"}
            </div>
          ))}
        </div>
        <div style={{flex:1,minWidth:300}}>
          {active&&(
            <div style={S.card}>
              <div style={S.cardTitle}>Meeting Details</div>
              {fields.map(({label,f,ph})=>(
                <div key={f} style={{marginBottom:16}}>
                  <div style={{color:"#c9a84c",fontSize:13,marginBottom:6,fontWeight:"bold"}}>{label}</div>
                  <textarea style={{...S.textarea,minHeight:70,marginBottom:0}} placeholder={ph} value={active[f]} onChange={e=>upd(f,e.target.value)} />
                </div>
              ))}
            </div>
          )}
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
      <div style={S.secSub}>
        {usingSheets ? "✅ Live data synced from Google Sheets." : sheetError === "NETWORK_BLOCKED" ? "👁 Preview mode — showing sample data. Live data loads on GitHub Pages." : "📋 Sample data shown."}
        {" "}<strong style={{color:"#c9a84c"}}>{contractors.length}</strong> contractors listed.
      </div>
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

          <button
            onClick={() => onDelete(c.id)}
            style={{
              position:"absolute", top:12, right:12,
              background:"transparent", border:"none",
              color:"rgba(224,92,92,.4)", cursor:"pointer",
              fontSize:16, lineHeight:1,
              transition:"color .2s",
            }}
            onMouseEnter={e => e.target.style.color="#e05c5c"}
            onMouseLeave={e => e.target.style.color="rgba(224,92,92,.4)"}
            title="Remove contractor"
          >✕</button>
        </div>
      ))}
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("dashboard");

  const render=()=>{switch(tab){
    case"dashboard":   return <Dashboard/>;
    case"directory":   return <NeighborhoodDirectory/>;
    case"contractors": return <Contractors/>;
    case"newsletter":  return <Newsletter/>;
    case"minutes":     return <MeetingMinutes/>;
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
