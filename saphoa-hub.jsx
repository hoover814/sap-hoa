import { useState, useEffect, useRef } from "react";

// ── RESPONSIVE HOOK ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    // Ensure proper viewport meta on mobile
    let meta = document.querySelector("meta[name=viewport]");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
    const fn = () => setMobile(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

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
const PORTAL_PASSWORD = "Saints26!";

const BOARD_CONTENT_CONFIG = {
  apiKey:        "AIzaSyCcdVM9E499Vketlm7ReKeKCLjpjsvnTyU",
  spreadsheetId: "1EMVVAN2rcgbYsbKo7BI2V4bHgn5NHHQREv3PbEa8e1w",
  announcementsRange: "Announcements!A2:D",
  eventsRange:        "Events!A2:F",
  todoRange:          "TodoList!A2:F",
  boardInfoRange:     "BoardInfo!A3:F10",
};
// Paste your Board Content Apps Script URL here after deploying
const BOARD_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBN_4H7Yt567wApGQAFXyxozFwysG2PpaKDiNOOLeo4lxCI4_qQeXzGwaDD0LH3kKP/exec";
const ARC_SCRIPT_URL   = "https://script.google.com/macros/s/AKfycbxEYB2-dlxJaz2YeZGkltkwgo43-LdpvNV1Vs0om7TLI9GRg2stBOJqALdNEIrv-8KZ/exec";
// Paste your Directory Apps Script Web App URL here after deploying
const DIRECTORY_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybEBISWuZwCrhQsEB5GGIfvmDwXT8YuJEzEeiddl-b1JGn0VRKkttp6BINeJkB8MCL/exec";

// ── NEIGHBORHOOD CENTER (Saint Andrews Park, Marietta GA) ──────────────────────
const NEIGHBORHOOD_CENTER = [33.96928, -84.39468];


// ── TABS ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",   label: "Dashboard" },
  { id: "directory",   label: "Directory" },
  { id: "contractors", label: "Contractors" },
  { id: "newsletter",  label: "Newsletter" },
  { id: "arc",         label: "ACR" },
  { id: "bylaws",      label: "Bylaws" },
  { id: "board",       label: "Board" },
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
  app:       { fontFamily:"Georgia,'Times New Roman',serif", background:"linear-gradient(135deg,#1a2332 0%,#243447 50%,#1e3a2f 100%)", minHeight:"100vh", color:"#e8e0d0", overflowX:"hidden", maxWidth:"100vw" },
  header:    { background:"linear-gradient(90deg,#0f1e2e,#1a3a28)", borderBottom:"2px solid #c9a84c", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, width:"100%", boxSizing:"border-box" },
  logoIcon:  { width:40, height:40, background:"linear-gradient(135deg,#c9a84c,#e8cc80)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:"0 4px 12px rgba(201,168,76,.4)" },
  logoTitle: { fontSize:20, fontWeight:"bold", color:"#c9a84c", letterSpacing:.5 },
  logoSub:   { fontSize:12, color:"#8faa9a", letterSpacing:2, textTransform:"uppercase" },
  badge:     { background:"#c9a84c", color:"#1a2332", padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:"bold", letterSpacing:1 },
  nav:       { display:"flex", gap:4, padding:"10px 12px", background:"rgba(0,0,0,.2)", borderBottom:"1px solid rgba(201,168,76,.2)", overflowX:"auto", WebkitOverflowScrolling:"touch" },
  navBtn: a=>({ padding:"7px 10px", borderRadius:8, border:a?"1px solid #c9a84c":"1px solid transparent", background:a?"rgba(201,168,76,.15)":"transparent", color:a?"#c9a84c":"#8faa9a", cursor:"pointer", fontSize:12, fontFamily:"Georgia,serif", whiteSpace:"nowrap", transition:"all .2s" }),
  main:      { padding:"20px 16px", maxWidth:1100, margin:"0 auto", overflowX:"hidden", width:"100%" },
  card:      { background:"rgba(255,255,255,.05)", border:"1px solid rgba(201,168,76,.2)", borderRadius:12, padding:"clamp(12px,3vw,22px)", marginBottom:16, backdropFilter:"blur(4px)" },
  cardTitle: { color:"#c9a84c", fontSize:18, marginBottom:16, fontWeight:"bold", borderBottom:"1px solid rgba(201,168,76,.2)", paddingBottom:10 },
  grid3:     { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:24 },
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
  secHead:   { fontSize:"clamp(18px,4vw,24px)", color:"#c9a84c", marginBottom:8, fontWeight:"bold" },
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
    id: i + 1, name: row[0]||"", address: row[1]||"", phone: row[4]||"", email: row[5]||"",
  }));
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
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10, marginBottom:16 }}>
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
      <div style={S.secHead}>Neighborhood Directory</div>
      <div style={S.secSub}>Find and connect with your Saint Andrews Park neighbors.</div>

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
          style={{ ...S.input, flex:1, minWidth:0, marginBottom:0 }}
          placeholder="🔍 Search by name, address, phone, or email..."
          value={search} onChange={e=>setSearch(e.target.value)}
        />
      </div>

      {/* Add form */}
      {boardUnlocked && showAdd && (
        <div style={S.card}>
          <div style={S.cardTitle}>➕ Add New Neighbor</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
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
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10, marginTop:8 }}>
          {filtered.map((n,idx) => (
            <div key={n.id}
              style={{
                background: editingId===n.id ? "rgba(201,168,76,.09)" : "rgba(255,255,255,.05)",
                border: editingId===n.id ? "1px solid rgba(201,168,76,.5)" : "1px solid rgba(201,168,76,.15)",
                borderRadius:12, padding:14, transition:"all .2s", cursor:"default",
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
                  <div style={{color:"#8faa9a",fontSize:13,marginBottom:6}}>{n.address}</div>
                  <div style={{marginBottom:6}}><a href={`tel:${n.phone}`} style={{color:"#5b8dee",fontSize:13,textDecoration:"none"}}>{n.phone}</a></div>
                  <div><a href={`mailto:${n.email}`} style={{color:"#5b8dee",fontSize:12,textDecoration:"none",wordBreak:"break-all"}}>{n.email}</a></div>
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
    { icon:"👥", label:"Neighborhood Directory",      desc:"Find your neighbors' contact info",          tab:"directory" },
    { icon:"🔨", label:"Contractors",                 desc:"Community-recommended home service pros",    tab:"contractors" },
    { icon:"🌳", label:"Architectural Change Request", desc:"Submit an Architectural Change Request",    tab:"arc" },
    { icon:"📰", label:"Newsletter",                  desc:"Read the latest community newsletter",       tab:"newsletter" },
    { icon:"📜", label:"Bylaws & Covenants",          desc:"Read and search our community covenants",    tab:"bylaws" },
  ];

  return (
    <div>
      <div style={S.secHead}>Welcome to Saint Andrews Park! 🏡</div>
      <div style={S.secSub}>Your community hub — everything you need, all in one place.</div>

      {/* Announcements — TOP */}
      <div style={S.card}>
        <div style={S.cardTitle}>Community Announcements</div>
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
        <div style={S.cardTitle}>Upcoming Events</div>
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
                {e.date && <span style={{...S.pill("#5b8dee"), fontSize:11}}>{e.date}</span>}
                {e.time && <span style={{...S.pill("#4caf87"), fontSize:11}}>🕐 {e.time}</span>}
              </div>
            </div>
            {e.location && <div style={{color:"#8faa9a", fontSize:12, marginTop:4}}>📍 {e.location}</div>}
            {e.description && <div style={{color:"#ccc5b5", fontSize:13, marginTop:8, lineHeight:1.7}}>{e.description}</div>}
          </div>
        ))}
      </div>

      {/* Quick Links — BELOW */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24}}>
        {quickLinks.map(l=>(
          <div key={l.tab}
            onClick={() => onNavigate(l.tab)}
            style={{...S.card, marginBottom:0, cursor:"pointer", transition:"all .2s", borderColor:"rgba(201,168,76,.3)", padding:"14px 16px"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#c9a84c"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.3)"}
          >

            <div style={{color:"#c9a84c", fontWeight:"bold", fontSize:14, marginBottom:4, lineHeight:1.3}}>{l.label}</div>
            <div style={{color:"#8faa9a", fontSize:12, lineHeight:1.5}}>{l.desc}</div>
            <div style={{marginTop:8, color:"#c9a84c", fontSize:11, fontWeight:"bold"}}>View →</div>
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
      <div style={S.secHead}>Newsletter</div>
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
      <div style={S.secHead}>Contractor Directory</div>
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
          style={{ ...S.input, flex:1, minWidth:0, marginBottom:0 }}
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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
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
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
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
  const [boardMembers, setBoardMembers]   = useState([]);

  useEffect(() => {
    fetchBoardContent(BOARD_CONTENT_CONFIG.boardInfoRange)
      .then(rows => setBoardMembers(rows
        .filter(r => r[5] === "Active")
        .map(r => ({ role: r[0]||"", name: r[1]||"", email: r[2]||"", phone: r[3]||"", photo: r[4]||"" }))
      ))
      .catch(() => {});
  }, []);

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
      {/* ── MEET THE BOARD ── */}
      <div style={{marginBottom:32}}>
        <div style={{...S.secHead, marginBottom:4}}>Meet Your Board</div>
        <div style={{...S.secSub, marginBottom:20}}>Your Saint Andrews Park HOA is run by volunteer homeowners who live right here in the community.</div>
        {boardMembers.length === 0 ? (
          <div style={{...S.card, textAlign:"center", color:"#8faa9a", fontSize:14, padding:"30px 20px"}}>
            Board member info coming soon! 🏡
          </div>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12}}>
            {boardMembers.map((m, i) => {
              const icons = {"President":"👑","Vice President":"🏛️","Treasurer":"💰","Secretary":"📋"};
              const icon = icons[m.role] || "🏡";
              return (
                <div key={i} style={{...S.card, marginBottom:0, textAlign:"center", padding:"24px 20px"}}>
                  <div style={{width:72, height:72, borderRadius:"50%", margin:"0 auto 14px",
                    background:"linear-gradient(135deg,#c9a84c,#e8cc80)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:32, border:"3px solid rgba(201,168,76,.3)", overflow:"hidden"}}>
                    {m.photo ? <img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : icon}
                  </div>
                  <div style={{background:"rgba(201,168,76,.12)", color:"#c9a84c", fontSize:11,
                    display:"inline-block", marginBottom:8, padding:"4px 12px", borderRadius:20,
                    border:"1px solid rgba(201,168,76,.3)", fontWeight:"bold", letterSpacing:.5
                  }}>{m.role}</div>
                  <div style={{color:"#e8e0d0", fontFamily:"Georgia,serif", fontWeight:"bold",
                    fontSize:16, marginBottom:6, lineHeight:1.3}}>
                    {m.name || "Board Member"}
                  </div>

                  <div style={{display:"flex", flexDirection:"column", gap:6}}>
                    {m.email && (
                      <a href={`mailto:${m.email}`} style={{color:"#c9a84c", fontSize:12, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                        ✉️ {m.email}
                      </a>
                    )}
                    {m.phone && (
                      <a href={`tel:${m.phone}`} style={{color:"#8faa9a", fontSize:12, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                        📞 {m.phone}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
      {/* ── MEET THE BOARD ── */}
      <div style={{marginBottom:32}}>
        <div style={{...S.secHead, marginBottom:4}}>Meet Your Board</div>
        <div style={{...S.secSub, marginBottom:20}}>Your Saint Andrews Park HOA is run by volunteer homeowners who live right here in the community.</div>
        {boardMembers.length === 0 ? (
          <div style={{...S.card, textAlign:"center", color:"#8faa9a", fontSize:14, padding:"30px 20px"}}>
            Board member info coming soon! 🏡
          </div>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12}}>
            {boardMembers.map((m, i) => {
              const icons = {"President":"👑","Vice President":"🏛️","Treasurer":"💰","Secretary":"📋"};
              const icon = icons[m.role] || "🏡";
              return (
                <div key={i} style={{...S.card, marginBottom:0, textAlign:"center", padding:"24px 20px"}}>
                  <div style={{width:72, height:72, borderRadius:"50%", margin:"0 auto 14px",
                    background:"linear-gradient(135deg,#c9a84c,#e8cc80)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:32, border:"3px solid rgba(201,168,76,.3)", overflow:"hidden"}}>
                    {m.photo ? <img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : icon}
                  </div>
                  <div style={{background:"rgba(201,168,76,.12)", color:"#c9a84c", fontSize:11,
                    display:"inline-block", marginBottom:8, padding:"4px 12px", borderRadius:20,
                    border:"1px solid rgba(201,168,76,.3)", fontWeight:"bold", letterSpacing:.5
                  }}>{m.role}</div>
                  <div style={{color:"#e8e0d0", fontFamily:"Georgia,serif", fontWeight:"bold",
                    fontSize:16, marginBottom:6, lineHeight:1.3}}>
                    {m.name || "Board Member"}
                  </div>

                  <div style={{display:"flex", flexDirection:"column", gap:6}}>
                    {m.email && (
                      <a href={`mailto:${m.email}`} style={{color:"#c9a84c", fontSize:12, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                        ✉️ {m.email}
                      </a>
                    )}
                    {m.phone && (
                      <a href={`tel:${m.phone}`} style={{color:"#8faa9a", fontSize:12, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                        📞 {m.phone}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                      {e.date && <span style={{...S.pill("#5b8dee"), fontSize:11}}>{e.date}</span>}
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

const COVENANTS_DATA = [
  {
    "title": "Preamble",
    "id": "preamble",
    "sections": [
      {
        "title": "",
        "content": "After recording, return to: Clifford A. Barshay, Esq. Schreeder, Wheeler & Flint, LLP 1600 Candler Building 127 Peachtree Street, N.E. Atlanta, GA 30303-1845 DECLARATION OF SAINT ANDREWS PARK SUBDIVISION AND SAINT ANDREWS PARK HOMEOWNERS ASSOCIATION, INC. THIS DECLARATION is made as of the 14th day of December, 1999 by EAGLE HICKS LOWER ROSWELL DEVELOPMENT, LLC, a Georgia limited liability company (hereinafter called the \"Declarant\"). WHEREAS, Declarant (or any person or entity who shall execute a consent hereto) owns all of the property (the \"Restricted Property\") more particularly described on Exhibit \"A\" attached hereto, known as Saint Andrews Park Subdivision and shown on that certain plat of survey (the \"Recorded Plat\") recorded on or about the date of the recording hereof in Cobb County, Georgia Records; and WHEREAS, Declarant deems it desirable to create the Association (as hereinafter defined) for the benefit of future residents of the Restricted Property; and WHEREAS, Declarant intends that every Owner (as,hereinafter defined) of a Residential Unit (as hereinafter defined) which is made subject to this Declaration shall automatically and by reason of such ownership, and by reason of this Declaration, become a member of the Association and subject to its valid rules and regulations and subject to the assessment by the Association pursuant hereto; NOW THEREFORE, the Declarant declares that the properties which are made subject to this Declaration pursuant to Article 2 hereof are and shall be held, transferred, sold, conveyed and occupied subject to the covenants and restrictions hereinafter set forth, all of which are for the purpose of enhancing and protecting the value, desirability and attractiveness of such property. Such covenants and restrictions are and shall be binding on all parties having and acquiring any or all right, title or interest in such property or any part thereof and shall inure to the benefit of each Owner thereof."
      }
    ]
  },
  {
    "title": "Article 1: Definitions",
    "id": "art1",
    "sections": [
      {
        "title": "",
        "content": "The following terms when used in this Declaration (unless the context shall clearly indicate to the contrary) shall have the following meaning: \"ARC\" or \"Architectural Review Committee\" shall refer to the architectural review committee established pursuant to Section 8.2 below. \"Association\" shall mean and refer to Saint Andrews Park Homeowners Association, Inc., a nonprofit corporation organized and existing under the laws of the State of Georgia. \"Association Documents\" shall mean and refer to the Articles of Incorporation and By-Laws of the Association as the same may be amended from time to time. \"Board\" shall refer to the Board of Directors of the Association. \"Common Benefit Area\" shall mean and refer to that portion of the Restricted Property identified on the Recorded Plat as Common Benefit Area, together with any other property and easements hereafter owned by the Association for the common use and benefit of the Owners and shall include property designated for public use until such time as the same is conveyed to and accepted by an appropriate governmental unit. \"Community\" shall refer to the subdivision that includes the real property that is made subject to tih s Declaration as the same may hereafter be supplemented. \"Community-Wide Standard\" shall mean the standard of conduct, maintenance, or other activity generally prevailing in the Community. Such standard may be more specifically determined by the Board of Directors of the As:::oi:iation. Such determination, however, must be consistent with the Community-Wide Standard originally established by the Declarant. \"Covenants and Restrictions\" shall mean and refer to all covenants, restrictions, easements and charges and liens set forth in this Declaration. \"Declarant\" shall mean Eagle Hicks Lower Roswell Development, L.L.C., a Georgia limited liability company and any successor to the rights of the Declarant under this Declaration. \"Georgia Property Owners' Association Act\" shall refer to the act by that name adopted in Georgia Laws 1994 at page 1879 codified as Article 6 of Chapter 3 of Title 44 of the Georgia Code as the same may be amended from time to time. \"Initiation Fee\" shall refer to the fee determined from time to time by the Board of Directors and which shall initially be $100.00. \"Manager\" shall mean and refer to any person with whom the Association contracts for the administration and operation of the Common Benefit Area. \"Mortgage\" shall mean any mortgage, security deed, deed of trust, and any and all other similar instruments used for the purpose of encumbering real property in the Community as security for the payment or satisfaction of an obligation. \"Mortgagee\" shall mean the holder of a Mortgage. \"Owner\" shall mean and refer to any Person (as hereinafter defined) who is or shall be a record owner by purchase, transfer, assignment or foreclosure of a fee or undivided fee interest in a Residential Unit (as hereinafter defined); provided, however, that any Person who holds such interest merely as security for the performance of an obligation shall not be an Owner. \"Person\" shall mean and refer to any natural person, corporation, partnership, limited partnership, limited liability company, trust, joint venture association or any other such entity. \"Restricted Property\" shall mean and refer to all real property subjected to this Declaration as set forth in Article 2 of this Declaration. \"Residential Units\" shall mean and refer to each single family detached house and/or each single lot of subdivided property intended for a single family detached house or any other equivalent form of residential building located on the Restricted Property."
      }
    ]
  },
  {
    "title": "Article 2: Property Subject to Declaration",
    "id": "art2",
    "sections": [
      {
        "title": "",
        "content": "PROPERTY SUBJECT TO DECLARATION; EFFECT THEREOF"
      },
      {
        "title": "Section 2. Property Owner's Association Act. The right is reserved pursuant to Section",
        "content": "12.4 below to submit this Declaration, the Restricted Property and the Association to the rights and benefits and restrictions of the Georgia Property Owners' Association Act by recording of a supplemental declaration. Reference in this Declaration to the standards or procedures of the Georgia Property Owners' Association Act shall not be deemed to subject this Declaration, the Restricted Property or the Association to the provisions thereof until the date specified in such supplementary declaration as may hereafter be recorded for such purpose. There is no undertaking by the Declarant or the Association to submit this Declaration, the Restricted Property or the Association to the provisions of the Georgia Property Owners' Association Act."
      }
    ]
  },
  {
    "title": "Article 3: Homeowners Association; Membership & Voting",
    "id": "art3",
    "sections": [
      {
        "title": "",
        "content": "THE HOMEOWNERS' ASSOCIATION; AUTOMATIC MEMBERSHIP AND VOTING RIGHTS THEREIN"
      },
      {
        "title": "Section3. Voting Rights.",
        "content": "Members shall be entitled to full voting privileges, subject to the right of the Declarant to appoint the members of the Association's Board until such time as the Declarant shall waive such right by notice in writing delivered to the Association, or such time as three-quarters (3 /4) of the Residential Units have been conveyed to Owners for occupancy (i.e. not for construction and sale), or on the 3 1st day of December, 2005, whichever shall first occur. Members shall be entitled to one vote for each Residential Unit in which they hold any interest required for membership under Section 2 of this Article 3. When more than one person holds an interest or interests in a Residential Unit, the vote for such Residential Unit shall be exercised as they among themselves determine, but in no event shall more than one vote be cast with respect to any such Residential Unit. In the event of disagreement among such persons and an attempt by two or more persons to cast a vote for such Residential Unit, such persons shall not be recognized in the vote with respect to such Residential Unit. A member may vote either in person or by a proxy executed in writing by the member or by his duly authorized attorney-in-fact. Any proxy must be in writing, signed by the Residential Unit owner (or owners as provided bel_ow) and submitted to the President prior to the meeting. If any Residential Unit is owned by a corporation, partnership, trustee or other entity or by a group of owners in any form of joint tenancy, the vote allocated to such Residential Unit shall be exercisable by such owner or owners only as provided by the Declaration as amended from time to time. Unless the holder of a valid proxy, a mere lessee of any Residential Unit shall have no right to vote and shall in no respect be deemed a member of the Association. The Declarant membership shall be a full voting membership, and shall be entitled to vote on all matters and all events with one vote for each Residential Unit in which it holds any interest. Regardless of its ownership of any Residential Unit, the consent of the Declarant shall be nevertheless required for certain matters as are specified in this Declaration and the Association Documents. The membership rights of the Declarant specifically include the right, during the time specified in Section 3.3(a), to appoint the directors of the Association."
      }
    ]
  },
  {
    "title": "Article 4: Common Benefit Area",
    "id": "art4",
    "sections": [
      {
        "title": "Section 2. Members' Easements of Enjoyment. Subject to the provisions contained in (a) through (g) of this Section, the use restrictions stated in Art",
        "content": "The right of the Declarant or its designees to the exclusive use of such portion of the Common Benefit Area as it, in the exercise of its sole discretion, may deem necessary or advisable, for, or as may be reasonably required, convenient or incidental to, the construction of improvements within the Restricted Property and Common Benefit Area, the sale of property contained in the Restricted Property including, but not limited to sales and business offices, storage areas, construction yards and signs. Such right of the Declarant shall and does exist notwithstanding any provision in this Declaration which might be construed to the contrary, and such right\u00b7 of the Declarant exists without affecting any member's obligation to pay assessment coming due during such period of time and without affecting the permanent charge and lien on any member's property in favor of the Association. The right of the Association upon approval of the Declarant (so long as it owns any of the Restricted Property) and the Owners of more than two-thirds (2/3) of the Residential Units (exclusive of Residential Units owned by the Declarant) and subject to applicable zoning ordinances to borrow money for the purpose of improving the Common Benefit Area and in aid thereof to mortgage or otherwise burden or encumber the Common Benefit Area. The Association shall not mortgage any portion of the Common Benefit Area if loss of title to the same would eliminate ingress and egress to any Residential Unit. In the event of a default upon any such mortgage or other burden or encumbrance, the lender shall then only have the right, To take possession of such Common Benefit Area (where such right of possession exists), To charge admission or other fees as a condition to continued enjoyment by the members, and If necessary, to open the enjoyment of the Common Benefit Area to persons other than members until the mortgage or other debt is satisfied, such rights being the exclusive remedy available to the lender; and at the time such mortgage or other debt is satisfied the title to and possession of the Common Benefit Area shall be returned to the Association, all rights or persons other than members shall terminate and all rights of members hereunder shall be fully restored; and The right of the Association to take such steps as are reasonably necessary to protect the Common Benefit Area against foreclosure; and The right of the Association, as provided in Section 5.7 below, to suspend the enjoyment of rights of any member for any period during which any assessment remains unpaid, and for such period as it considers appropriate for any infraction of its published rules and regulations; and The right of the Association to charge reasonable admission and other fees for the use of any facilities which may be constructed upon the Common Benefit Area; and The right of the Association at any time to transfer all or any part of Common Benefit Area if authorized by Declarant (so long as it owns any of the Restricted Property) and the Owners of more than two-thirds (2/3) of the vote of the Residential Units (exclusive of Residential Units owned by Declarant) except that consent of the Owners will not be required for exercise of the right granted to the Association in subsection 4.2(g) and no conveyance of Common Benefit Area shall deprive any Owner of any access to its Residential Units without consent of such Owner; and The right of the Association to grant such easements and rights-of-way to such utility companies or public agencies or authorities as it may deem necessary or desirable for the proper servicing and maintenance of the Common Benefit Area."
      }
    ]
  },
  {
    "title": "Article 5: Assessment",
    "id": "art5",
    "sections": [
      {
        "title": "Section 1. Creation of the Lien and Personal Obligation for Assessments. Each Owner, by acceptance of a deed or other conveyance for any Residential U",
        "content": "_(a)\tThe Initiation Fee; Annual assessments and charges; and Special assessments; such assessments to be fixed, established and collected from time to time as hereinafter provided."
      },
      {
        "title": "Section 2. Purpose of Assessment. The assessments levied under this Article 5 shall be",
        "content": "used exclusively for the purpose of promoting the recreation, health, safety and welfare of the members and, in particular, for the servicing, improvement and maintenance of the Common Benefit Area and facilities related thereto and related to the use and enjoyment of the Common Benefit Area, and for the maintenance of utilities, sidewalks, and roads owned by the Association and the entrance area or areas (the \"Entrance Areas\") and drainage areas, waterways, wetlands, and bodies of water in the Community (if any), including, but not limited to, the payment of taxes and insurance thereon and repair, replacement and additions thereto, and for the cost of labor, equipment, materials, management and supervision thereof."
      },
      {
        "title": "Section 3. Basis for Annual Assessments.",
        "content": "It shall be the duty of the Board of Directors to prepare a budget covering the estimated costs of operating the Association during the coming year, which shall include a determination of the Initiation Fee to be charged during the term of the budget and a capital reserve in accordance with a capital budget separately prepared. The Board shall cause the budget and notice of the assessments to be levied against each Residential Unit for the following year to be delivered to each member at least thirty (30) days prior to the end of the current fiscal year. The budget and the assessment shall become effective unless disapproved at a meeting by the Owners of more than two-thirds (2/3) of the Residential Units. Notwithstanding the foregoing, however, in the event the membership disapproves the proposed budget or the Board fails for any reason so to determine the budget for the succeeding year, then and until such time as a budget shall have been determined, as provided herein, the budget in effect for the then current year shall continue for the succeeding year. For so long as the Declarant has the authority to appoint t.1-ie directors of the Association, Declarant may: (i) advance funds to the Association sufficient to satisfy t.\u00bd.e deficit, if any, between the actual operating expenses of the Association (but specifically not including an allocation for capital reserves), and the sum of the annual, special and specific assessments collected by the Association in any fiscal year, and such advances shall be evidenced by promissory notes from\u00b7 the Association in favor of the Declarant; or (ii) cause the Association to borrow such amount from a commercial lending institution at the then prevailing rates for such a loan in the local area of the Community. The Declarant in its sole discretion may guarantee repayment of such loan, if required by the lending institution."
      },
      {
        "title": "Section 5. Equality of Assessment among Residential Units. Except as provided in this Section 5, no Residential Unit within the Restricted Property sh",
        "content": "any other Residential Unit within the Restricted Property except that, until such time as the right of the Declarant to appoint the Board shall expire in accordance with Section 3.3(a) of this Declaration, the Declarant may bear a greater or lesser assessment burden than other members while the Declarant may be subsidizing the Association in accordance with Section 3(b) of this Article. The Board shall have the power to specifically assess pursuant to this Section as, in its discretion, it shall deem appropriate. Failure of the Board to exercise its authority under this Section shall not be grounds for any action against the Association or the Board of Directors and shall not constitute a waiver of the Board's right to exercise its authority under this Section in the future with respect to any expenses, including an expense for which the Board has not previously exercised its authority under this Section. Fines levied pursuant to Section 12.6 of this Declaration and the costs of maintenance performed by the Association which the Owner is responsible for under Sections 4.1 and 9.22 of this Declaration shall be specific assessments. The Board may also specifically assess Owners for the following Association expenses (except for expenses incurred for maintenance and repair of items which are the maintenance responsibility of the Association as provided herein): Expenses of the Association which benefit less than all of the Residential Units may be specifically assessed equitably among all of the Residential Units which are benefited according to the benefit received. Expenses of the Association which benefit all Residential Units, but which do not provide an equal benefit to all Residential Units, may be assessed equitably among all Residential Units according to the benefit received."
      },
      {
        "title": "Section 6. Due Date of Initiation Fees and Annual Assessments.",
        "content": "The Association's Board of Directors shall send written notice of the annual assessment and the amount of such assessment to every member subject thereto at least thirty (30) days in advance of each annual assessment. Unless otherwise provided by the Association's Board of Directors, the entire amount of the annual assessment for each Residential Unit shall become due and payable to the Association on the first day of February each year and shall be paid to the Association without further notice from the Association; provided, however that in the event the Board .of Directors shall fail to send written notice of the annual assessment to members at least thirty (30) days prior to the annual assessment period the payment for the annual assessment shall not be due until thirty (30) days after such notice is given; the failure to notify thirty (30) days prior to the annual assessment period shall not however reduce the amount of the assessment due and payable. The annual assessment shall be established on a calendar year basis. The assessments provided for herein shall commence as to a Residential Unit subject to this Declaration and the first Initiation Fee shall be due on the fast day of the month following the earliest to occur of the following events: (i) the conveyance of the Residential Unit by Declarant to an owner or tenant for residential occupancy; or (ii) upon the conveyance of the Residential Unit by Declarant to an owner or tenant for residential occupancy; or (iii) upon the conveyance of the Residential Unit by a builder who purchased the land from Declarant for the purpose of erecting a dwelling thereon to an Owner or tenant for residential occupancy. The Initiation Fee shall be due on each transfer of a Residential Unit to a new Owner except for transfers that occur by will or intestacy or foreclosure of (or exercise of pow.er of sale or deed in lieu of foreclosure with respect to) any Mortgage. The first annual assessment (but not the Initiation Fee) for any Residential Unit shall be adjusted according to the number of months then remaining in that fiscal year after the Residential Unit first is subject to assessment. The Association shall, upon demand at any time, furnish to any prospective purchaser of a Residential Unit and to any member liable for any assessment a certificate in writing signed by an officer of the Association setting forth whether said assessment has been paid. A reasonable charge, as determined by the Board of Directors may be made for the issuance of these certificates. Such certificates shall be conclusive evidence of payment of any assessment therein stated to have been paid."
      },
      {
        "title": "Section 7. Nonpayment of Assessment: the Personal Obligation; the Lien; Remedies of the Association.",
        "content": "The Initiation Fee, annual and special assessments, together with interest thereon, late charges and the cost of the collection thereof shall be a continuing lien on the Residential Unit of the member. Such lien shall bind such property in the hands of the then member, his heirs, designees, personal representatives, successors and assigns. In addition, the personal obligation of the member to pay such assessments shall remain his personal obligation and shall also bind his successors in title upon transfer of his Residential Unit. Such transferring member shall nevertheless remain as fully obligated as before such transfer to pay to the Association any and all amounts which he was obligated to pay immediately preceding the transfer, and such member and such successors in title shall be jointly and severally liable with respect thereto, notwithstanding any agreement between such members and successors in title creating any indemnification of the member or any relationship of principal and surety as between themselves.If any Initiation Fee or assessment or installment thereof is not paid within fifteen(15) days after the due date, (i) the Association may impose a late charge equal to thegreater of$10.00 or ten percent (10%) of the amount of the assessment or installment not paid when due, (ii) such assessment or installment shall bear interest from the date of the delinquency at the greater of the highest rate permitted by the Georgia Property Owners' Association Act or ten percent (10%) per annum, and (iii) the Association may bring legal action against any current or prior member personally obligated to pay the same and foreclose its lien against such member's Residential Unit, in which event, interest, late charges, costs and reasonable attorney's fees actually incurred shall be added to the amount of such assessment or installment thereof as may then be due. Each Owner of a Residential Unit by acceptance of a deed or other conveyance of his or her property, invests in the Association or its agents the right and power to bring all actions against him or her personally for the collection of such charges as a debt and to foreclose the aforesaid lien in an appropriate proceeding in law or equity. The lien provided for in this Article 5 shall be in favor of the Association and shall be for the benefit of all other members. The Association acting on behalf of the other members shall have the power to bid at any foreclosure sale with a credit for the amount of the lien and to acquire, hold, lease, mortgage and convey the same. If the assessment is not paid within fifteen (15) days after the due date, the Board of Directors of the Association may also suspend the membership rights of the delinquent member, including the right to vote, the right of enjoyment in and to the Common Benefit Area and facilities thereon and the right to receive and enjoy such services and other benefits as may then be provided by the Association. Any such suspension shall not affect such member's obligation to pay assessments due during the period of such suspension and shall not affect the permanent charge and lien on such member's property in favor of the Association. No member may waive or otherwise escape liability for the assessment provided for herein by nonuse of the Common Benefit Area."
      },
      {
        "title": "Section 8. Subordination of Charges and Liens to Mortgages.",
        "content": "The liability of any Mortgagee for assessments shall be governed by this Declaration. The liens and permanent charges of all assessments and charges authorized herein (annual, special or otherwise) with respect to any Restricted Property is hereby made subordinate to the lien of any Mortgage placed on any portion of such property if, but only if all assessments and charges with respect to such property authorized herein having a due date on or prior to the date of the Mortgage as filed of record have been paid and the Mortgage is either (i) a first in priority Mortgage or (ii) a secondary purchase money Mortgage provided that neither the grantee nor any successor grantee of such secondary purchase money Mortgage conveyed the Residential Unit to the granter of such secondary purchase money Mortgage. The liens and permanent charges hereby subordinated are only such liens or charges as relate to assessments and charges authorized hereunder having a due date subsequent to the date such Mortgage is filed of record and prior the satisfaction, cancellation or foreclosure of such Mortgage or the sale or transfer of the mortgaged property pursuant to any proceeding in lieu of foreclosure or the sale or transfer of the mortgaged property pursuant to a sale under power contained in such Mortgage. Such subordination is merely a lien subordination and shall not relieve the owner of the mortgaged property of his personal obligation to pay all assessments and charges coming due at any time when he is the owner of such property; shall not relieve such property from the liens and permanent charges provided for herein (except to the extent a subordinated lien or permanent charge \u00b7is extinguished as a result of such subordination as against a Mortgagee or such Mortgagee's assignee or transferee by foreclosure or by sale under power); and no sale or transfer of such property to the Mortgagee or to any other person pursuant to a decree of foreclosure, or pursuant to any other proceeding in lieu of foreclosure or pursuant to a sale under power, shall relieve any existing or previous owner of such property of any personal,obligation or relieve such property or the then owner of such property from liability for any assessment or charges authorized hereunder which become due after such sale and transfer."
      }
    ]
  },
  {
    "title": "Article 6: Administration",
    "id": "art6",
    "sections": [
      {
        "title": "Section 4. Books and Records.",
        "content": "Inspection by Members and Mortgagees. This Declaration, the Bylaws, copies of rules and use restrictions, membership registers, books of account, and minutes of meetings of the members of the Board and of committees shall be made available for inspection and copying by any member of the Association or by the duly appointed representative of any member and by holders, insurers, or guarantors of any first Mortgage at any reasonable time and for a purpose reasonably related to such Person's interest as a member or holder, insurer, or guarantor of a first Mortgage at the office of the Association or at such other reasonable place as the Board shall prescribe. Rules for Inspection. The Board shall establish reasonable rules with respect to: (i) notice to be given to the custodian of the records; (ii) hours and days of the week when such an inspection may be made; and (iii)payment of the cost of reproducing copies of document (c ) Every director shall have the absolute right at any reasonable time to inspect all books, records and documents of the Association and the physical properties owned or controlled by the Association. The right of inspection by a director includes the right to make extra copies of documents at the reasonable expense of the Association."
      }
    ]
  },
  {
    "title": "Article 7: Insurance & Casualty Losses",
    "id": "art7",
    "sections": [
      {
        "title": "",
        "content": "INSURANCE AND CASUALTY LOSSES"
      },
      {
        "title": "Section 1. Association Insurance.",
        "content": "Required Coverages. The Association, acting through its Board or its duly authorized agent, shall obtain and continue in effect. the following types of insurance, if deemed necessary by the Board and reasonably available, or if not reasonably available, the most nearly equivalent coverages as are reasonably available: Blanket property insurance covering \"risks of direct physical loss\" on a \"special form\" basis (or comparable coverage by whatever name denominated) for all insurable improvements on the Common Benefit Area to the extent that it has assumed responsibility for maintenance, repair and/or replacement in the event of a casualty. If such coverage is not generally available at reasonable cost, then \"broad form\" coverage may be substituted. The Association shall have the authority to and interest in ensuring any property for which it has maintenance or repair responsibility, regardless of ownership.  All property insurance policies obtained by the Association shall have policy limits sufficient to cover the full replacement cost of the insured improvements; Commercial general liability insurance, insuring the Association and its members for damage or injury caused by the negligence of the Association or any of its members, employees, agent, or contractors while acting on its behalf. If generally available at reasonable cost, the commercial general liability coverage (including primary and any umbrella coverage) shall have a limit of at least $1,000,000.00 per occurrence with respect to bodily injury, personal injury, and property damage; Workers compensation insurance and employers liability insurance, if and to the extent required by law; Directors and officers liability coverage; Fidelity insurance covering all Persons responsible for handling Association funds in an amount determined in the Board's best business judgment but not less than an amount equal to one-sixth of the annual assessments on all Residential Units plus reserves on hand. Fidelity insurance policies shall contain a waiver of all defenses based upon the exclusion of Persons serving without compensation; and Such additional insurance as the Board, m its best business judgment, determines advisable. The Board is hereby authorized to contract with or otherwise arrange to obtain the insurance coverage required hereunder through the Declarant and to reimburse Declarant for the cost thereof, and Declarant shall be authorized, but not obligated, to purchase such insurance coverage for the benefit of the Association and the Owners upon Declarant and the Association agreeing upon the terms and conditions applicable to reimbursement by the Association for costs incurred by Declarant in obtaining such coverage. Notwithstanding anything contained in this Declaration to the contrary, the Board shall not be required to comply with the provisions of this Article if the Board \u00b7has contracted for or otherwise arranged to obtain the required insurance coverage through the Declarant. Policy Requirements. The Association shall periodically cause a review of the sufficiency of insurance coverage by one or more qualified Persons, at least one of whom must be familiar with insurable replacement costs in the metropolitan Atlanta, Georgia area, and the Board shall review the Association's insurance coverage at least annually. All Association policies shall provide for a certificate of insurance to be furnished to each member insured and to the Association. The policies may contain a reasonable deductible and the amount thereof shall not be subtracted from the face amount of the policy in determining whether the policy limits satisfy the requirements of Section 7. I. In the event of an insured loss, the deductible shall be treated as a common expense of the Association; provided, if the Board reasonably determines, after notice and a reasonable opportunity to be heard, that the loss is the result of the negligence or willful misconduct of one or more Owners, their guests, invitees, or lessees, then the Board may specifically assess the full amount of such deductible against such Owner(s) and their Residential Units pursuant to Section 5.5. Damage and Destruction. Immediately after damage or destruction to all or any part of the Community covered by insurance written in the name of the Association, the Board or its duly authorized agent shall file and adjust all insurance claims and, within sixty (60) days, obtain reliable and detailed estimates of the cost of repair or reconstruction. Repair or reconstruction, as used in this paragraph, means repairing or restoring the property to substantially the condition in which it existed prior to the damage, allowing for changes or improvements necessitated by changes in applicable building codes. Any damage to or destruction of the improvements on the Common Benefit Area shall be repaired or reconstructed unless the Declarant (while it owns any of the Restricted Property) and the Owners of at least three-quarters (3/4) of the vote of the Residential Units otherwise agree not to repair or reconstruct. If either the insurance proceeds or reliable and detailed estimates of the cost of repair or reconstruction, or both, are not available to the Association within such 60-day period, then the period shall be extended until such funds or information are available. However, such extension shall not exceed 60 additional days. No Mortgagee (except with respect to the Residential Unit for which it is the Owner) shall have the right to participate in the determination of whether the damage or destruction to the Common Benefit Area shall be repaired or reconstructed. If determined in the manner described above that the damage or destruction to improvements on the Common Benefit Area shall not be repaired or reconstructed and no alternative improvements are authorized, the affected property shall be cleared of all debris and ruins and thereafter shall be maintained by the Association in a neat and attractive, landscaped condition consistent with the Community Standard. Any insurance proceeds remaining after paying the costs of repair or reconstruction, or after such settlement as is necessary and appropriate, shall be retained by and for the benefit of the Association and placed in a capital improvements account. This is a covenant for the benefit of Mortgagees and may be enforced by the Mortgagee of any affected Residential Unit. If insurance proceeds are insufficient to cover the costs of repair or reconstruction, the board may, without a vote of the members, levy a special assessment to cover the shortfall."
      }
    ]
  },
  {
    "title": "Article 8: Architectural Standards",
    "id": "art8",
    "sections": [
      {
        "title": "Section 1. General. No structure shall be placed, erected, or installed for any Residential Unit, and no improvements (including staking, clearing, ex",
        "content": "No work subject to this Article shall commence unless and until plans and specifications showing at least the nature, kind, shape, height, materials, and location shall have been submitted in writing to and approved by the ARC. Any Owner may remodel, paint or redecorate the interior of structures on a Residential Unit without approval. However, modifications to the interior of screened porches, patios, and similar portions of a Residential Unit visible from outside the structures for the Residential Unit shall be subject to approval. No approval shall be required to repaint the exterior of a structure in accordance with the originally approved color scheme or to rebuild in accordance with originally approved plans and specifications. Dwellings shall meet or exceed the minimum square feet (heated living area) requirements established by the county zoning ordinance conditions for the Community. Any accessory building permitted for a Residential Unit shall be limited to one story in height. All dwellings constructed on any portion of the Community shall be designed by and built in accordance with the plans and specifications of a licensed architect and by a builder approved by the ARC taking into account financial stability and building experience, unless otherwise acceptable to the ARC, in its sole discretion. All plans and specifications shall be subject to review as provided herein. This Article shall not apply to the activities of the Declarant, nor to improvements to the Common Benefit Area by or on behalf of the Association. This Article may not \u00b7be amended without the Declarant's written consent so long as the Declarant owns any land subject to this Declaration."
      },
      {
        "title": "Section 2. Architectural Review.  Review of all applications for construction and",
        "content": "modifications under this Article shall be handled by the ARC using such subcommittees, if any, as the Board of Directors of the Association may authorize from time to time. Until the right granted to the Declarant to appoint the Association's Board in accordance with Article 3.3 shall expire, or such earlier time as the Declarant shall designate in writing, the Declarant shall have the right to appoint all members of the ARC. Upon the expiration or earlier surrender in writing of such right, the Board shall appoint the members of the ARC. Written design guidelines and procedures may be promulgated for the exercise of this review. The ARC may establish and charge reasonable fees for review of applications hereunder and may require such fees to be paid in full prior to review of any application. The Board may employ architects, engineers, or other Persons as it deems necessary to enable the ARC to perform its review. The ARC may, from time to time, delegate any of its rights or responsibilities hereunder to one or more duly licensed architects or other qualified Persons, which shall have full authority to act on behalf of the committee for all matters delegated. In reviewing each submission, the ARC may consider the quality of workmanship and design, harmony of external design with existing structures, and location in relation to surrounding structures, topography, and finish grade elevation, among other things. The ARC shall be the sole arbiter of such plans and may withhold approval for any reason, including purely aesthetic considerations, and it shall be entitled to stop any construction in violation of these restrictions. Each Owner acknowledges that opinions on aesthetic matters are subjective and may vary as ARC members change over time. In the event that the ARC fails to approve or to disapprove in writing any application within 45 days after submission of all information and materials reasonably requested, the application shall be deemed approved. However, no approval, whether expressly granted or deemed granted pursuant to the foregoing, shall be inconsistent with established design guidelines for the Community unless a variance has been granted in writing by the ARC. All work shall be completed within one year of commencement or such shorter period as the ARC may specify m the notice of approval. Work not completed within the stated time period will be subject to resubmission for new approval by the ARC under its then existing standards, which may differ from the standards employed for initial approval. As a condition of approval under this Section, each Owner and all successors-in-interest shall assume all responsibilities for maintenance, repair, replacement, and insurance to and on any change, modification, addition, or alteration. The ARC may require an Owner to acknowledge such responsibilities in a recordable written instrument. Any member of the Board or its representatives shall have the right, during reasonable hours and after reasonable notice, to enter upon any Residential Unit to verify compliance with these restrictive covenants. Such person or persons shall not be deemed guilty of trespass by reason of such entry. In addition to any other remedies available to the Association, in the event of noncompliance with this Section, the Board may, as provided in Section 12.6, record in the appropriate land records a notice of violation naming the violating Owner."
      },
      {
        "title": "Section 3. No Waiver of Future Approvals. Approval of proposals, plans and specifications, or drawings for any work done or proposed, or in connection",
        "content": "requiring approval, shall not be deemed to constitute a waiver of the right to withhold approval as to any similar proposals, plans and specifications, drawings, or other\u00b7 matters subsequently or additionally submitted for approval."
      }
    ]
  },
  {
    "title": "Article 9: Use Restrictions & Rules",
    "id": "art9",
    "sections": [
      {
        "title": "Section 4.\tVehicles.\t\tThe term \"vehicles\", as used herein, shall include, without limitation, motor homes, boats, trailers, motorcycles, minibikes, sc",
        "content": "No vehicle may be left upon any portion of the Community (except in a garage) for a period longer than five days if it is unlicensed or if it is in a condition such that it is incapable of being operated upon the public highways. After such five-day period, such vehicle shall be considered a nuisance and may be removed from the Community. Any towed vehicle, boat, recreational vehicle, motor homes, or mobile home regularly stored in the Community or temporarily kept in the Community, except if kept in a garage or other area designated by the Board, for periods longer than 24 hours each shall be considered a nuisance and may be\u00b7 removed from the Community. Trucks with mounted campers which are an Owner's or occupant's primary means of transportation shall not be considered recreational vehicles if they are used on a regular basis for transportation and the.camper is stored out of public view."
      },
      {
        "title": "Section 10. Prohibited Conditions. The following conditions, structures, or activities are prohibited within the Community unless prior approval in wr",
        "content": "dishes; (a)\tAntennas. No exterior antennas of any kind, including, without limitation, satellite Tree Removal. No living, healthy trees that are more than six inches in diameter at a point two feet above the ground shall be removed, and no flowering trees, including, without limitation, dogwood trees, regardless of their diameter, shall be removed; except for any trees, regardless of their diameter, that are located within fifteen (15) feet of a drainage area, a sidewalk, a residence, or a driveway or that must be removed due to damage posed to person or property or to ameliorate the effects of storm damage. Air-Conditioning Units. No window air-conditioning units shall be installed; Lighting. Exterior lighting visible from the street shall not be permitted except for (i) approved lighting as originally installed on a Residential Unit; (ii) one decorative post light (iii) street lights in conformity with an established street lighting program for the Community; (iv) seasonal decorative lights during the usual and common season; or (v) front house illumination of model homes. Artificial Vegetation, Exterior Sculpture, and Similar Items. No artificial vegetation shall be permitted on the exterior of any property. Exterior sculpture, fountains, flags, statuary, play equipment (including, without limitation, stationary or movable basketball goals), planters, gardens, window boxes and similar items must be approved by the ARC; Energy Conservation Equipment. No solar energy collector panels or attendant hardware or other energy conservation equipment shall be constructed or installed unless they are an integral and harmonious part of the architectural design of a structure, as determined in the sole discretion of the ARC; Clotheslines. No exterior clotheslines of any type shall be permitted upon any Residential Unit. Exterior Security Devices. No exterior security devices, including, without limitation, window bars or security doors, shall be permitted on any residence or Residential Unit. Signs placed on the Residential Unit or the exterior of the residence stating that such residence is protected by a security system shall not be deemed to constitute an exterior security device. Utility Lines. No overhead utility lines, including lines for cable television, shall be permitted within the Community, except for temporary lines as required during construction and lines installed by or at the request ofDeclarant. Underground Storage Tanks.  No underground storage tanks shall be permitted for any Residential Unit. Fences. No fence or fencing type barrier of any kind shall be placed, erected, allowed, or maintained upon any Residential Unit without the prior written consent of the ARC. Under no circumstances shall any fence be placed, erected, allowed, or maintained upon any Residential Unit closer to the street than the rear one-third of the residence located on the Residential Unit. Notwithstanding the foregoing, the Declarant shall have the right to erect fencing of any type, at any location, on any Residential Unit during the period that such Residential Unit is being used by Declarant as a model home. The Board shall have the right to erect fencing of any type considered appropriate or desirable by the Board at any location on the Common Benefit Area."
      },
      {
        "title": "Section 18. Entry Features and Boundary Fences. Owners shall not alter, remove or add improvements to any entry features or boundary fence constructed",
        "content": "- 22- ARC or the Board."
      },
      {
        "title": "Section 22. Owner's Responsibility. All maintenance of the Residential Unit and all structures, parking areas, landscaping, and other improvements the",
        "content": "(10) days after receipt of such notice within which to complete such maintenance, repair, or replacement, or, in the event that such maintenance, repair, or replacement is not capable of completion within a ten (10) day period, to commence such work which shall be completed within a reasonable time. If any Owner does not comply with the provisions hereof, the Association may provide any such maintenance, repair, or replacement at such Owner's sole cost and expense, and all costs shall be added to and become a part of the assessment to which such Owner is subject and shall become a lien against the Residential Unit."
      }
    ]
  },
  {
    "title": "Article 10: Mortgagee Provisions",
    "id": "art10",
    "sections": [
      {
        "title": "",
        "content": "The following provisions are for the benefit of holders of first Mortgages on Residential Units in the Community. The provisions of this Article apply to both this Declaration and to the Bylaws, notwithstanding any other provisions contained therein."
      },
      {
        "title": "Section 1. Notices of Action. Any institutional holder, insurer, or guarantor of a first Mortgage, who provides a written request to the Association (",
        "content": "any condemnation loss or any casualty loss which affects a material portion of the Common Benefit Area or which affects any Residential Unit on which there is a first Mortgage held, insured, or guaranteed by such eligible holder; any delinquency in the payment of assessments or charges owed by an Owner of a Residential Unit subject to the Mortgage of such eligible holder, where such delinquency has continued for a period of sixty (60) days; provided, however, notwithstanding this provision, any holder of a first Mortgage, upon request, is entitled to written notice from the Association of any default in the performance by the Owner of the encumbered Residential Unit of any obligation under the Declaration or Bylaws of the Association which is not cured within sixty (60) days; any lapse, cancellation, or material modification of any insurance policy maintained by the Association."
      }
    ]
  },
  {
    "title": "Article 12: Miscellaneous",
    "id": "art12",
    "sections": [
      {
        "title": "Section 4. Amendment. This Declaration may be amended as provided in this Section. Amendments to this Declaration shall become effective upon recordat",
        "content": "Bv Declarant. So long as Declarant owns a Residential Unit for sale in the CommlJ:1lity, it may unilaterally amend this Declaration to (a) bring any provision hereof into compliance with any applicable governmental statute, rule, regulation, or judicial determination; (b) enable any title insurance company to issue title insurance coverage; (c) if such amendment is required by an institutional or governmental lender or purchaser of Mortgage loans; or (d) if such amendment is necessary to enable any governmental agency or private insurance company to insure or guarantee Mortgage loans. However, any such amendment shall not adversely affect the title to any Owner's Residential Unit unless any such Residential Unit Owner shall consent thereto in writing. Further, so long as Declarant has the right unilaterally to appoint the directors of the Association as provided in Section 3.3(a), Declarant may unilaterally amend this Declaration for any other purpose; provided, however, any such amendment shall not materially adversely affect the substantive rights of any Owners hereunder, nor shall it adversely affect title to any Residential Unit without the consent of the affected Residential Unit Owner. By the Board. The Board, by two-thirds (2/3) vote of the directors, shall be authorized to amend this Declaration without the consent of the Owners, to submit the Community to the Georgia Property Owners' Association Act and to conform this Declaration to any mandatory provisions thereof. Any such amendment shall require the consent of the Declarant so long as the Declarant owns any property within the Community. By the Owners. This Declaration and the Articles of Incorporation of the Association may be amended upon the consent of the Owners of more than two-thirds (2/3) of the Residential Units and (so long as the Declarant owns any property for development and/or sale in the Community the consent of Declarant."
      },
      {
        "title": "Section 6. Enforcement. Each Owner and occupant shall comply strictly with the Bylaws, rules and regulations, and use restrictions, as they may be law",
        "content": "[REMAINDER OF THIS PAGE INTENTIONALLY LEFT BLANK] .\t' IN WITNESS WHEREOF, the Declarant has caused this Declaration to be executed as of the day and year first above written. Signed, sealed, and delivered\tEAGLE HICKS LOWER ROSWELL DEVELOPMENT, LLC a Georgia limited liability company By:Eagle Real Estate Advisors, Inc., its Manager B_y:\t fl.:......._: , -.......,.,.. ==._=:_==-=----- Title:_ _,_ c:::..l!..l.:.J.C:= ------ -29 -"
      }
    ]
  },
  {
    "title": "Exhibit A: Legal Description",
    "id": "exhibita",
    "sections": [
      {
        "title": "",
        "content": "LEGAL DESCRIPTION ALL THAT TRACT or parcel of land lying and being in Land Lots 213 and 214 of the 1st District, 2nd Section of Cobb County, Georgia and being more particularly described as follows: BEGINNING at a point on the southeastern right-of-way of Lower Roswell Road (a fifty (50) foot right of way) at the point where the southeastern right-of-way of Lower Roswell Road intersects the western right-of-way of Hyde Road (a fifty (50) foot right-of-way); thence running along the western right-of-way of Hyde Road S 01\u00b0l4'42\"W a distance of 445.60 feet to a point located on the line dividing Land Lots 213 and 214; thence continuing along the western right-of-way of Hyde Road S 31\u00b059'ST'E a distance of 32.90 feet to a point located on the eastern line of Land Lot 214; thence running along the eastern line of Land Lot 214 S 01\u00b028'44\"W a distance of 1136.90 feet to an iron, pin found located on the northeastern right-of-way of a 125 foot Georgia Power Company right-of-way; thence running alc:--.g the :-c:theastem boundary of said 125 foot Georgia Power Company right-of-way N 36\u00b026'40\"W a distance of 1,412.47 feet to an iron pin found located at the intersection of the northeastern line of said Georgia Power Company right-of-way and the southeastern right-of-way of Lower Roswell Road; thence running along the southeastern right-of-way of Lower Roswell Road N 61\u00b010'22\"E a distance of \" 982.40 feet to a point, said point being the POINT. OF.BEGINNiNG.."
      }
    ]
  }
];

// ── BYLAWS COMPONENT ─────────────────────────────────────────────────────────
// ── BYLAWS COMPONENT ─────────────────────────────────────────────────────────
function Bylaws() {
  const [query, setQuery]      = useState("");
  const [openArticle, setOpen] = useState(null);
  const [pdfOpen, setPdfOpen]  = useState(false);
  const PDF_URL = "/sap-hoa/Saint_Andrews_Park_Neighborhood_Covenants.pdf";

  const q = query.toLowerCase().trim();

  const highlight = (text) => {
    if (!q || q.length < 2) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === q
        ? <mark key={i} style={{ background:"rgba(201,168,76,.4)", color:"#e8e0d0", borderRadius:2, padding:"0 2px" }}>{part}</mark>
        : part
    );
  };

  const filtered = COVENANTS_DATA.map(article => {
    if (!q || q.length < 2) return { ...article, show: true, matchCount: 0 };
    const titleMatch = article.title.toLowerCase().includes(q);
    const matchingSections = article.sections.filter(s =>
      s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
    const show = titleMatch || matchingSections.length > 0;
    return { ...article, show, matchingSections: q ? matchingSections : article.sections, matchCount: matchingSections.length };
  });

  const totalMatches = filtered.reduce((sum, a) => sum + (a.matchCount || 0), 0);
  const hasQuery = q.length >= 2;

  return (
    <div style={{ maxWidth:860, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ ...S.card, background:"linear-gradient(135deg,rgba(26,35,50,.9),rgba(40,55,75,.9))", border:"2px solid rgba(201,168,76,.4)", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          
          <div style={{ flex:1 }}>
            <div style={{ ...S.secHead, marginBottom:4 }}>Bylaws & Covenants</div>
            <div style={{ color:"#8faa9a", fontSize:13 }}>
              Saint Andrews Park Declaration of Covenants & Restrictions
            </div>
          </div>
          <button onClick={() => setPdfOpen(!pdfOpen)} style={{ ...S.btn, whiteSpace:"nowrap" }}>
            {pdfOpen ? "⬆ Hide PDF" : "📄 View Full PDF"}
          </button>
          <a href={PDF_URL} download="Saint_Andrews_Park_Neighborhood_Covenants.pdf"
            style={{ ...S.btnOut, textDecoration:"none", whiteSpace:"nowrap", display:"inline-block" }}>
            ⬇ Download PDF
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      {pdfOpen && (
        <div style={{ ...S.card, padding:0, overflow:"hidden", marginBottom:24 }}>
          <iframe src={PDF_URL} style={{ width:"100%", height:600, border:"none", display:"block" }} title="SAP Covenants" />
        </div>
      )}

      {/* Search */}
      <div style={{ ...S.card, marginBottom:20 }}>
        <div style={{ ...S.cardTitle, marginBottom:12 }}>🔍 Search the Covenants</div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <input
            style={{ flex:1, padding:"11px 16px", borderRadius:8, background:"rgba(255,255,255,.07)", border:"1px solid rgba(201,168,76,.3)", color:"#e8e0d0", fontFamily:"Georgia,serif", fontSize:14, outline:"none", minWidth:0 }}
            placeholder="Search for fences, pets, trees, assessments, pools..."
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(null); }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setOpen(null); }} style={{ ...S.btnOut, padding:"10px 16px", fontSize:13 }}>
              ✕ Clear
            </button>
          )}
        </div>
        {hasQuery && (
          <div style={{ marginTop:10, color: totalMatches > 0 ? "#8faa9a" : "#c9a84c", fontSize:13 }}>
            {totalMatches > 0
              ? `✅ Found ${totalMatches} matching section${totalMatches !== 1 ? "s" : ""} across ${filtered.filter(a=>a.show && a.matchCount>0).length} article${filtered.filter(a=>a.show && a.matchCount>0).length !== 1 ? "s" : ""}`
              : `No matches found for "${query}" — try a different keyword`}
          </div>
        )}
        {!hasQuery && (
          <div style={{ marginTop:14 }}>
            <div style={{ color:"#8faa9a", fontSize:11, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Quick Searches</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {["fence","tree","pet","pool","vehicle","assessment","antenna","paint","lease","sign","basketball","solar"].map(kw => (
                <button key={kw} onClick={() => setQuery(kw)}
                  style={{ background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.2)", color:"#c9a84c", borderRadius:20, padding:"5px 14px", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Articles */}
      {filtered.filter(a => !hasQuery || a.show).map((article) => {
        const isOpen = openArticle === article.id || (hasQuery && article.matchCount > 0);
        const displaySections = hasQuery ? article.matchingSections : article.sections;
        return (
          <div key={article.id} style={{ ...S.card, marginBottom:12, padding:0, overflow:"hidden" }}>
            <div
              onClick={() => setOpen(isOpen && !hasQuery ? null : article.id)}
              style={{ padding:"16px 20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between",
                background: isOpen ? "rgba(201,168,76,.07)" : "transparent",
                borderBottom: isOpen ? "1px solid rgba(201,168,76,.15)" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.07)"}
              onMouseLeave={e => e.currentTarget.style.background = isOpen ? "rgba(201,168,76,.07)" : "transparent"}
            >
              <div>
                <div style={{ color:"#c9a84c", fontFamily:"Georgia,serif", fontWeight:"bold", fontSize:15 }}>
                  {highlight(article.title)}
                </div>
                {hasQuery && article.matchCount > 0 && (
                  <div style={{ color:"#8faa9a", fontSize:12, marginTop:2 }}>
                    {article.matchCount} matching section{article.matchCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <div style={{ color:"#c9a84c", fontSize:18, transition:"transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</div>
            </div>
            {isOpen && displaySections && displaySections.map((sec, si) => (
              <div key={si} style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                {sec.title && (
                  <div style={{ color:"#c9a84c", fontFamily:"Georgia,serif", fontWeight:"bold", fontSize:13, marginBottom:8 }}>
                    {highlight(sec.title)}
                  </div>
                )}
                <div style={{ color:"#b8c8b8", fontSize:13, lineHeight:1.8 }}>
                  {highlight(sec.content)}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Disclaimer */}
      <div style={{ ...S.card, marginTop:8 }}>
        <div style={{ color:"#8faa9a", fontSize:11, fontStyle:"italic", textAlign:"center" }}>
          ⚠️ This document is provided for reference only. For official interpretations or enforcement matters, please contact the HOA board. To request an architectural change, use the <strong style={{color:"#c9a84c"}}>ACR tab</strong>.
        </div>
      </div>

    </div>
  );
}


// ── ARC REQUEST ──────────────────────────────────────────────────────────────
function ARCRequest() {
  const CHANGE_TYPES = [
    "Fences",
    "Landscaping",
    "Recreational Equipment",
    "Structural Addition or Modification",
    "Tree Removal",
    "Exterior Repainting",
    "Decks, Pools, and Spas",
    "Other",
  ];

  const blank = {
    date: new Date().toLocaleDateString("en-US"),
    name: "", address: "", city: "Marietta", state: "Georgia", zip: "30068",
    phone: "", email: "",
    changeTypes: [],
    otherType: "",
    description: "",
  };
  const MAX_FILES = 5;
  const MAX_SIZE_MB = 10;

  const [form, setForm]       = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const upd = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const toggleType = (type) => {
    setForm(f => ({
      ...f,
      changeTypes: f.changeTypes.includes(type)
        ? f.changeTypes.filter(t => t !== type)
        : [...f.changeTypes, type],
    }));
  };

  // Convert a File object to base64
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.description.trim()) {
      setError("Please fill in Name, Address, and Description before submitting.");
      return;
    }
    if (form.changeTypes.length === 0) {
      setError("Please select at least one type of change.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const fields = {
      action:      "submitARC",
      date:        form.date,
      name:        form.name,
      address:     form.address,
      city:        form.city,
      state:       form.state,
      zip:         form.zip,
      phone:       form.phone,
      email:       form.email,
      changeTypes: form.changeTypes.join(", ") + (form.changeTypes.includes("Other") && form.otherType ? ` (${form.otherType})` : ""),
      description: form.description,
      submitted:   new Date().toLocaleString(),
    };

    try {
      // Convert attachments to base64 for upload to Google Drive
      const files = await Promise.all(
        attachments.map(async file => ({
          name:     file.name,
          mimeType: file.type || "application/octet-stream",
          data:     await fileToBase64(file),
        }))
      );

      await fetch(ARC_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ fields, files }),
      });

      setSubmitted(true);
      setForm(blank);
      setAttachments([]);
    } catch {
      setError("Submission failed. Please try again or contact the board directly.");
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 7,
    background: "rgba(255,255,255,.07)", border: "1px solid rgba(201,168,76,.25)",
    color: "#e8e0d0", fontFamily: "Georgia,serif", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { color: "#c9a84c", fontSize: 12, fontWeight: "bold", marginBottom: 4, display: "block" };
  const fieldWrap  = { marginBottom: 14 };

  if (submitted) return (
    <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <div style={{ color: "#e8e0d0", fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
        Request Submitted!
      </div>
      <div style={{ color: "#8faa9a", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
        Your Architectural Change Request has been sent to the ARC Committee.<br/>
        You will receive a written or electronic response <strong style={{color:"#c9a84c"}}>within 10 days</strong>.
      </div>
      <button style={S.btn} onClick={() => setSubmitted(false)}>Submit Another Request</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ ...S.card, background: "linear-gradient(135deg,rgba(26,35,50,.9),rgba(40,55,75,.9))", border: "2px solid rgba(201,168,76,.4)", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          
          <div>
            <div style={{ ...S.secHead, marginBottom: 4 }}>Architectural Change Request</div>

          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, color: "#ccc5b5", fontSize: 13, lineHeight: 1.7 }}>
          All sections of this form must be filled out completely. Upon receiving the Change Request, the HOA Board will review and send a written or electronic response. Requests will be reviewed and returned
          <strong style={{color:"#c9a84c"}}> no later than 10 days</strong> after receipt by the committee.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(224,92,92,.1)", border: "1px solid rgba(224,92,92,.3)", borderRadius: 8, color: "#e05c5c", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14 }}>

        {/* ── Left column: Homeowner Info ── */}
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 18 }}>👤 Homeowner Information</div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Date</label>
            <input style={inputStyle} value={form.date} onChange={e => upd("date", e.target.value)} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} placeholder="Full name" value={form.name} onChange={e => upd("name", e.target.value)} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Address *</label>
            <input style={inputStyle} placeholder="Street address" value={form.address} onChange={e => upd("address", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city} onChange={e => upd("city", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input style={inputStyle} value={form.state} onChange={e => upd("state", e.target.value)} />
            </div>
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Zip Code</label>
            <input style={inputStyle} value={form.zip} onChange={e => upd("zip", e.target.value)} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} placeholder="(770) 555-0100" value={form.phone} onChange={e => upd("phone", e.target.value)} />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>E-Mail</label>
            <input style={inputStyle} placeholder="your@email.com" value={form.email} onChange={e => upd("email", e.target.value)} />
          </div>
        </div>

        {/* ── Right column: Change Types ── */}
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 6 }}>📋 Type of Change</div>
          <div style={{ color: "#8faa9a", fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
            All changes checked below must include detailed descriptions in the area provided. Select all that apply.
          </div>

          {CHANGE_TYPES.map(type => (
            <div key={type}
              onClick={() => toggleType(type)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 8, marginBottom: 8,
                cursor: "pointer", userSelect: "none",
                background: form.changeTypes.includes(type) ? "rgba(201,168,76,.12)" : "rgba(255,255,255,.04)",
                border: form.changeTypes.includes(type) ? "1px solid rgba(201,168,76,.5)" : "1px solid rgba(255,255,255,.08)",
                transition: "all .15s",
              }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: form.changeTypes.includes(type) ? "2px solid #c9a84c" : "2px solid rgba(201,168,76,.3)",
                background: form.changeTypes.includes(type) ? "#c9a84c" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {form.changeTypes.includes(type) && <span style={{ color: "#1a2332", fontSize: 12, fontWeight: "bold", lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ color: form.changeTypes.includes(type) ? "#e8e0d0" : "#8faa9a", fontSize: 14 }}>{type}</span>
            </div>
          ))}

          {form.changeTypes.includes("Other") && (
            <div style={{ marginTop: 4, marginBottom: 8 }}>
              <label style={labelStyle}>Please describe "Other"</label>
              <input style={inputStyle} placeholder="Describe the change type..." value={form.otherType} onChange={e => upd("otherType", e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      <div style={{ ...S.card, marginTop: 20 }}>
        <div style={{ ...S.cardTitle, marginBottom: 6 }}>📝 Detailed Change Request Description *</div>
        <div style={{ color: "#8faa9a", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
          Please include as specific information as possible such as materials, colors, dimensions, etc.
          Include locations, drawings, pictures and descriptions to expedite the approval process.
        </div>
        <textarea
          style={{ ...inputStyle, minHeight: 160, resize: "vertical", lineHeight: 1.6 }}
          placeholder="Describe your planned change in detail..."
          value={form.description}
          onChange={e => upd("description", e.target.value)}
        />
      </div>

      {/* ── Attachments ── */}
      <div style={{ ...S.card, marginTop: 20 }}>
        <div style={{ ...S.cardTitle, marginBottom: 6 }}>📎 Attachments <span style={{color:"#8faa9a",fontWeight:"normal",fontSize:13}}>(optional)</span></div>
        <div style={{ color: "#8faa9a", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
          Attach photos, drawings, or supporting documents to help expedite the approval process.
          Up to {MAX_FILES} files, {MAX_SIZE_MB}MB each. Accepted: images, PDFs, Word docs.
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor="#c9a84c"; e.currentTarget.style.background="rgba(201,168,76,.08)"; }}
          onDragLeave={e => { e.currentTarget.style.borderColor="rgba(201,168,76,.25)"; e.currentTarget.style.background="rgba(255,255,255,.03)"; }}
          onDrop={e => {
            e.preventDefault();
            e.currentTarget.style.borderColor="rgba(201,168,76,.25)";
            e.currentTarget.style.background="rgba(255,255,255,.03)";
            const dropped = Array.from(e.dataTransfer.files);
            const valid = dropped.filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024);
            const combined = [...attachments, ...valid].slice(0, MAX_FILES);
            setAttachments(combined);
          }}
          style={{
            border: "2px dashed rgba(201,168,76,.25)", borderRadius: 10,
            padding: "28px 20px", textAlign: "center", cursor: "pointer",
            background: "rgba(255,255,255,.03)", transition: "all .2s",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
          <div style={{ color: "#e8e0d0", fontSize: 14, marginBottom: 4 }}>
            Drag & drop files here, or <span style={{color:"#c9a84c",textDecoration:"underline"}}>browse</span>
          </div>
          <div style={{ color: "#8faa9a", fontSize: 12 }}>
            Images, PDFs, Word docs · Max {MAX_SIZE_MB}MB per file · Up to {MAX_FILES} files
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={e => {
            const picked = Array.from(e.target.files).filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024);
            const combined = [...attachments, ...picked].slice(0, MAX_FILES);
            setAttachments(combined);
            e.target.value = "";
          }}
        />

        {/* File list */}
        {attachments.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {attachments.map((file, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 8, marginBottom: 8,
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,168,76,.15)",
              }}>
                <span style={{ fontSize: 20 }}>
                  {file.type.startsWith("image/") ? "🖼️" : file.type === "application/pdf" ? "📄" : "📝"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#e8e0d0", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
                  <div style={{ color: "#8faa9a", fontSize: 11 }}>{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button
                  onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                  style={{ background: "transparent", border: "none", color: "rgba(224,92,92,.5)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}
                  onMouseEnter={e => e.target.style.color="#e05c5c"}
                  onMouseLeave={e => e.target.style.color="rgba(224,92,92,.5)"}
                >×</button>
              </div>
            ))}
            <div style={{ color: "#8faa9a", fontSize: 12, marginTop: 4 }}>
              {attachments.length} of {MAX_FILES} files attached
            </div>
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <div style={{ marginTop: 20, display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <button
          style={{ ...S.btn, opacity: submitting ? .6 : 1, width:"100%" }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "⏳ Submitting..." : "📬 Submit Request"}
        </button>
        <div style={{ color: "#8faa9a", fontSize: 12, lineHeight: 1.5 }}>
          Your request will be reviewed by the HOA Board.<br/>
          A response will be sent within 10 days of receipt.
        </div>
      </div>


    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("dashboard");
  const [portalUnlocked, setPortalUnlocked] = useState(false);
  const [pwInput, setPwInput]     = useState("");
  const [pwError, setPwError]     = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const isMobile                  = useIsMobile();

  const unlock = () => {
    if (pwInput === PORTAL_PASSWORD) {
      setPortalUnlocked(true);
      setPwError(false);
      setPwInput("");
    } else {
      setPwError(true);
    }
  };

  const render = () => { switch(tab) {
    case"dashboard":   return <Dashboard onNavigate={setTab}/>;
    case"directory":   return <NeighborhoodDirectory/>;
    case"contractors": return <Contractors/>;
    case"newsletter":  return <Newsletter/>;
    case"arc":         return <ARCRequest/>;
    case"bylaws":      return <Bylaws/>;
    case"board":       return <BoardTab/>;
    default:           return null;
  }};

  // ── PORTAL LOGIN SCREEN ──
  const [helpOpen, setHelpOpen] = useState(false);

  if (!portalUnlocked) return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", position:"relative" }}>

      {/* Help button — top right */}
      <div style={{ position:"absolute", top:16, right:16, zIndex:10 }}>
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          style={{ background:"rgba(201,168,76,.12)", border:"1px solid rgba(201,168,76,.3)", color:"#c9a84c",
            borderRadius:8, padding:"8px 14px", fontSize:13, cursor:"pointer", fontFamily:"Georgia,serif",
            fontWeight:"bold", display:"flex", alignItems:"center", gap:6 }}>
          {helpOpen ? "✕ Close" : "❓ Need Help?"}
        </button>

        {/* Expandable help panel */}
        {helpOpen && (
          <div style={{ position:"absolute", right:0, top:44, width:"min(280px,85vw)", zIndex:20,
            background:"#1a2332", border:"1px solid rgba(201,168,76,.4)",
            borderRadius:12, padding:20, boxShadow:"0 8px 32px rgba(0,0,0,.8)" }}>
            <div style={{ color:"#c9a84c", fontWeight:"bold", fontSize:14, marginBottom:10, fontFamily:"Georgia,serif" }}>
              🔑 How to Get Access
            </div>
            <div style={{ color:"#8faa9a", fontSize:12, lineHeight:1.8, marginBottom:14 }}>
              The SAP Community Portal is for Saint Andrews Park residents only. To receive the community password:
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
              {[
                { step:"1", text:"Confirm you are a Saint Andrews Park homeowner or resident" },
                { step:"2", text:"Contact Jacob Harmon to request the password" },
                { step:"3", text:"You will receive the password by return email" },
              ].map(s => (
                <div key={s.step} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#c9a84c,#e8cc80)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:11,
                    fontWeight:"bold", color:"#1a2332", flexShrink:0, marginTop:1 }}>
                    {s.step}
                  </div>
                  <div style={{ color:"#b8c8b8", fontSize:12, lineHeight:1.6 }}>{s.text}</div>
                </div>
              ))}
            </div>
            <a href="mailto:jacobharmon18@gmail.com?subject=SAP Community Portal Access Request"
              style={{ display:"block", textAlign:"center", background:"linear-gradient(135deg,#c9a84c,#e8cc80)",
                color:"#1a2332", fontWeight:"bold", fontSize:13, padding:"10px 16px", borderRadius:8,
                textDecoration:"none", fontFamily:"Georgia,serif" }}>
              Email Jacob Harmon
            </a>
            <div style={{ color:"#8faa9a", fontSize:10, textAlign:"center", marginTop:8, fontStyle:"italic" }}>
              jacobharmon18@gmail.com
            </div>
          </div>
        )}
      </div>

      <div style={{ width:"100%", maxWidth:420, padding:"0 20px" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:64, marginBottom:16 }}>⛳</div>
          <div style={{ ...S.logoTitle, fontSize:28, textAlign:"center", marginBottom:6 }}>Saint Andrews Park</div>
          <div style={{ color:"#8faa9a", fontSize:15 }}>Homeowners Association</div>
        </div>
        {/* Login card */}
        <div style={{ ...S.card, textAlign:"center" }}>
          <div style={{ color:"#c9a84c", fontWeight:"bold", fontSize:18, marginBottom:8, fontFamily:"Georgia,serif" }}>
            🔐 Community Portal
          </div>
          <div style={{ color:"#8faa9a", fontSize:13, marginBottom:24, lineHeight:1.7 }}>
            This portal is for Saint Andrews Park residents only.<br/>
            Please enter the community password to continue.
          </div>
          <input
            style={{ ...S.input, textAlign:"center", letterSpacing:4, fontSize:18, marginBottom:12 }}
            type="password"
            placeholder="••••••••"
            value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === "Enter" && unlock()}
            autoFocus
          />
          {pwError && (
            <div style={{ color:"#e05c5c", fontSize:13, marginBottom:12 }}>
              Incorrect password — please try again.
            </div>
          )}
          <button style={{ ...S.btn, width:"100%", fontSize:15, padding:"13px 20px" }} onClick={unlock}>
            Enter Portal
          </button>
          <div style={{ color:"#8faa9a", fontSize:11, marginTop:16, fontStyle:"italic" }}>
            Don't have the password? Click <strong style={{color:"#c9a84c"}}>Need Help?</strong> in the top right.
          </div>
        </div>
      </div>
    </div>
  );

  const TAB_ICONS = {};

  // ── MAIN PORTAL ──
  return (
    <div style={S.app}>

      {/* ── HEADER ── */}
      <div style={{ ...S.header, padding:"12px 16px" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={S.logoIcon}>⛳</div>
          <div>
            <div style={{ ...S.logoTitle, fontSize: isMobile ? 17 : 22 }}>Saint Andrews Park</div>
            <div style={{ ...S.logoSub, fontSize:11 }}>Homeowners Association</div>
          </div>
        </div>
        {/* Right side — hamburger on mobile, badge + tabs on desktop */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {!isMobile && <div style={S.badge}>COMMUNITY PORTAL</div>}
          {/* Hamburger button — always visible */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"6px 8px",
              display:"flex", flexDirection:"column", gap:5, alignItems:"center", justifyContent:"center" }}
            aria-label="Menu"
          >
            {menuOpen ? (
              <span style={{ color:"#c9a84c", fontSize:22, lineHeight:1 }}>✕</span>
            ) : (
              <>
                <span style={{ display:"block", width:22, height:2, background:"#c9a84c", borderRadius:2 }} />
                <span style={{ display:"block", width:22, height:2, background:"#c9a84c", borderRadius:2 }} />
                <span style={{ display:"block", width:22, height:2, background:"#c9a84c", borderRadius:2 }} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── CURRENT TAB INDICATOR ── */}
      <div style={{ padding:"10px 16px", background:"rgba(0,0,0,.2)", borderBottom:"1px solid rgba(201,168,76,.2)",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ color:"#c9a84c", fontFamily:"Georgia,serif", fontSize:14, fontWeight:"bold" }}>
          {TABS.find(t=>t.id===tab)?.label}
        </span>
        <span style={{ color:"#8faa9a", fontSize:12 }}>Tap ☰ to navigate</span>
      </div>

      {/* ── SLIDE-IN MENU OVERLAY ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:40 }}
          />
          {/* Drawer */}
          <div style={{
            position:"fixed", top:0, right:0, bottom:0, width: isMobile ? "75vw" : 300,
            background:"linear-gradient(180deg,#0f1e2e 0%,#1a3a28 100%)",
            borderLeft:"2px solid rgba(201,168,76,.4)",
            zIndex:50, display:"flex", flexDirection:"column",
            boxShadow:"-8px 0 32px rgba(0,0,0,.5)",
            animation:"slideIn .25s ease-out",
          }}>
            {/* Drawer header */}
            <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(201,168,76,.2)",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ color:"#c9a84c", fontFamily:"Georgia,serif", fontWeight:"bold", fontSize:15 }}>
                Navigation
              </div>
              <button onClick={() => setMenuOpen(false)}
                style={{ background:"none", border:"none", color:"#8faa9a", fontSize:20, cursor:"pointer", padding:"2px 6px" }}>
                ✕
              </button>
            </div>

            {/* Nav items */}
            <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
              {TABS.map(t => (
                <button key={t.id}
                  onClick={() => { setTab(t.id); setMenuOpen(false); }}
                  style={{
                    display:"flex", alignItems:"center", gap:14, width:"100%",
                    padding:"14px 20px", background: tab===t.id ? "rgba(201,168,76,.12)" : "transparent",
                    border:"none", borderLeft: tab===t.id ? "3px solid #c9a84c" : "3px solid transparent",
                    color: tab===t.id ? "#c9a84c" : "#b8c8b8",
                    fontFamily:"Georgia,serif", fontSize:15, cursor:"pointer", textAlign:"left",
                    transition:"all .15s",
                  }}
                  onMouseEnter={e => { if(tab!==t.id) e.currentTarget.style.background="rgba(255,255,255,.05)"; }}
                  onMouseLeave={e => { if(tab!==t.id) e.currentTarget.style.background="transparent"; }}
                >
                  <span>{t.label}</span>
                  {tab===t.id && <span style={{ marginLeft:"auto", fontSize:12, color:"#c9a84c" }}>●</span>}
                </button>
              ))}
            </div>

            {/* Drawer footer */}
            <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(201,168,76,.15)" }}>
              <div style={{ color:"#8faa9a", fontSize:11, textAlign:"center" }}>
                Saint Andrews Park HOA · Marietta, GA
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ ...S.main, padding: isMobile ? "16px 12px" : "32px" }}>{render()}</div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        *, *::before, *::after {
          box-sizing: border-box;
          max-width: 100%;
        }
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
