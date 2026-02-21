import { useState, useEffect } from "react";

// ── CONFIGURATION — update these when deploying to GitHub ──────────────────────
const GOOGLE_SHEETS_CONFIG = {
  apiKey: "AIzaSyCcdVM9E499Vketlm7ReKeKCLjpjsvnTyU",
  spreadsheetId: "15BjVviB6RcHlGjg_Kc9-GSgea7RgXKEVWhO44XDJEDQ",
  range: "Directory!A2:D",
};
const BOARD_PASSWORD = "SAP2026"; // change before deploying!

// ── TABS ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",  label: "🏡 Dashboard" },
  { id: "directory",  label: "👥 Directory" },
  { id: "tasks",      label: "✅ Task Tracker" },
  { id: "newsletter", label: "📰 Newsletter" },
  { id: "minutes",    label: "📋 Meeting Minutes" },
  { id: "website",    label: "🌐 Website Tracker" },
];

const initialTasks = [
  { id: 1, text: "Replace personal emails with shared HOA email", priority: "High", status: "Todo", category: "Website" },
  { id: 2, text: "Add Quick-Link buttons to home page", priority: "High", status: "Todo", category: "Website" },
  { id: 3, text: "Embed Google Calendar on Events section", priority: "Medium", status: "Todo", category: "Website" },
  { id: 4, text: "Add board member role titles to Contact page", priority: "Medium", status: "Todo", category: "Website" },
  { id: 5, text: "Add neighborhood hero photo/banner", priority: "Low", status: "Todo", category: "Website" },
  { id: 6, text: "Add document descriptions on Forms & Bylaws page", priority: "Low", status: "Todo", category: "Website" },
];

const SAMPLE_NEIGHBORS = [
  { id: 1, name: "The Johnson Family",   address: "101 Saint Andrews Dr", phone: "(404) 555-0101", email: "johnson@email.com" },
  { id: 2, name: "Maria & Tom Chen",     address: "103 Saint Andrews Dr", phone: "(404) 555-0102", email: "chenfamily@email.com" },
  { id: 3, name: "Robert Williams",      address: "105 Saint Andrews Dr", phone: "(404) 555-0103", email: "rwilliams@email.com" },
  { id: 4, name: "The Patel Family",     address: "107 Saint Andrews Dr", phone: "(404) 555-0104", email: "patels@email.com" },
  { id: 5, name: "Lisa & Mark Thompson", address: "109 Saint Andrews Dr", phone: "(404) 555-0105", email: "lmthompson@email.com" },
  { id: 6, name: "David Garcia",         address: "111 Saint Andrews Dr", phone: "(404) 555-0106", email: "dgarcia@email.com" },
];

const priorityColor = { High: "#e05c5c", Medium: "#e09a3a", Low: "#4caf87" };
const statusColor   = { Todo: "#8b9db5", "In Progress": "#5b8dee", Done: "#4caf87" };

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
      <div style={S.secHead}>👥 Neighborhood Directory</div>
      <div style={S.secSub}>
        {usingSheets ? "✅ Live data synced from Google Sheets." : sheetError === "NETWORK_BLOCKED" ? "👁 Preview mode — showing sample data. Live data loads on GitHub Pages." : "📋 Sample data shown."}
        {" "}<strong style={{color:"#c9a84c"}}>{neighbors.length}</strong> neighbors listed.
      </div>

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
            <div key={n.id} style={{
              background: editingId===n.id ? "rgba(201,168,76,.09)" : "rgba(255,255,255,.05)",
              border: editingId===n.id ? "1px solid rgba(201,168,76,.5)" : "1px solid rgba(201,168,76,.15)",
              borderRadius:12, padding:20, transition:"all .2s",
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
function Dashboard({ tasks }) {
  const done=tasks.filter(t=>t.status==="Done").length,
        inp =tasks.filter(t=>t.status==="In Progress").length,
        todo=tasks.filter(t=>t.status==="Todo").length,
        high=tasks.filter(t=>t.priority==="High"&&t.status!=="Done").length;

  const siteChecks=[
    {label:"Replace personal emails with shared HOA address", s:"🔴 Pending"},
    {label:"Add Quick-Link buttons to home page",             s:"🔴 Pending"},
    {label:"Embed Google Calendar",                          s:"🟡 Planned"},
    {label:"Add board member role titles",                   s:"🟡 Planned"},
    {label:"Add neighborhood hero banner",                   s:"🟢 Backlog"},
  ];

  return (
    <div>
      <div style={S.secHead}>Welcome Back, Board! 👋</div>
      <div style={S.secSub}>Here's a snapshot of everything happening at Saint Andrews Park HOA.</div>
      <div style={S.grid3}>
        {[[todo,"Tasks To Do","201,168,76"],[inp,"In Progress","91,141,238"],[done,"Completed","76,175,135"],[high,"High Priority Open","224,92,92"]].map(([n,l,a])=>(
          <div key={l} style={S.statCard(a)}><div style={S.statNum}>{n}</div><div style={S.statLabel}>{l}</div></div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>📌 High Priority Tasks</div>
        {tasks.filter(t=>t.priority==="High"&&t.status!=="Done").length===0
          ? <p style={{color:"#4caf87"}}>🎉 All high priority tasks are complete!</p>
          : tasks.filter(t=>t.priority==="High"&&t.status!=="Done").map(t=>(
            <div key={t.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{t.text}</span><span style={S.tag}>{t.category}</span>
            </div>
          ))
        }
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>🌐 Website Enhancement Checklist</div>
        {siteChecks.map((c,i)=>(
          <div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:14}}>{c.label}</span>
            <span style={{fontSize:13,color:"#8faa9a"}}>{c.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TASK TRACKER ──────────────────────────────────────────────────────────────
function TaskTracker({ tasks, setTasks }) {
  const [newTask,setNewTask]=useState(""), [pri,setPri]=useState("Medium"), [cat,setCat]=useState("General");
  const add=()=>{if(!newTask.trim())return;setTasks([...tasks,{id:Date.now(),text:newTask,priority:pri,status:"Todo",category:cat}]);setNewTask("");};
  const cycle=id=>{const c={Todo:"In Progress","In Progress":"Done",Done:"Todo"};setTasks(tasks.map(t=>t.id===id?{...t,status:c[t.status]}:t));};
  const remove=id=>setTasks(tasks.filter(t=>t.id!==id));
  return (
    <div>
      <div style={S.secHead}>✅ Task Tracker</div>
      <div style={S.secSub}>Stay on top of everything the board needs to accomplish.</div>
      <div style={S.card}>
        <div style={S.cardTitle}>Add New Task</div>
        <input style={S.input} placeholder="What needs to get done?" value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} />
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select style={S.select} value={pri} onChange={e=>setPri(e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select>
          <select style={S.select} value={cat} onChange={e=>setCat(e.target.value)}><option>General</option><option>Website</option><option>Newsletter</option><option>Meeting</option><option>Finance</option><option>Events</option></select>
          <button style={S.btn} onClick={add}>+ Add Task</button>
        </div>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Task</th><th style={S.th}>Category</th><th style={S.th}>Priority</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
          <tbody>
            {tasks.map(t=>(
              <tr key={t.id}>
                <td style={{...S.td,textDecoration:t.status==="Done"?"line-through":"none",color:t.status==="Done"?"#5a7060":"#e8e0d0"}}>{t.text}</td>
                <td style={S.td}><span style={S.tag}>{t.category}</span></td>
                <td style={S.td}><span style={S.pill(priorityColor[t.priority])}>{t.priority}</span></td>
                <td style={S.td}><span style={S.pill(statusColor[t.status])}>{t.status}</span></td>
                <td style={S.td}>
                  <button onClick={()=>cycle(t.id)} style={{...S.btnOut,padding:"4px 10px",fontSize:12,marginRight:6}}>{t.status==="Done"?"↩ Undo":"→ Advance"}</button>
                  <button onClick={()=>remove(t.id)} style={{background:"transparent",border:"none",color:"#e05c5c",cursor:"pointer",fontSize:16}}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length===0&&<div style={{textAlign:"center",color:"#8faa9a",padding:24}}>No tasks yet — add one above! 🎉</div>}
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

// ── WEBSITE TRACKER ────────────────────────────────────────────────────────────
const WEB_ITEMS_INIT=[
  {id:1,item:"Replace personal emails with shared HOA email",  priority:"High",  status:"Todo",notes:"Create a shared Gmail or Google Group for social committee and photo submissions."},
  {id:2,item:"Add Quick-Link icon buttons to home page",        priority:"High",  status:"Todo",notes:"Bylaws, Architecture Form, Calendar, Vendor List, Contact Board"},
  {id:3,item:"Embed Google Calendar on Events section",         priority:"Medium",status:"Todo",notes:"Embed directly on the page if events are in Google Calendar."},
  {id:4,item:"Add board member role titles",                    priority:"Medium",status:"Todo",notes:"President, Secretary, Treasurer, etc. on Contact the Board page."},
  {id:5,item:"Add neighborhood hero photo/banner",              priority:"Low",   status:"Todo",notes:"Use a neighbor-submitted photo for authenticity."},
  {id:6,item:"Add document descriptions on Forms & Bylaws",     priority:"Low",   status:"Todo",notes:"Short sentence under each document explaining its purpose."},
  {id:7,item:"Move disclaimer to proper footer",                priority:"Low",   status:"Todo",notes:"Use Google Sites footer so it appears consistently on all pages."},
  {id:8,item:"Clarify 'Your Neighbors' page — rename it",       priority:"Low",   status:"Todo",notes:"Consider 'Community Directory' or 'Meet Your Neighbors'."},
];
function WebsiteTracker() {
  const [items,setItems]=useState(WEB_ITEMS_INIT);
  const cycle=id=>{const c={Todo:"In Progress","In Progress":"Done",Done:"Todo"};setItems(items.map(i=>i.id===id?{...i,status:c[i.status]}:i));};
  const done=items.filter(i=>i.status==="Done").length;
  return (
    <div>
      <div style={S.secHead}>🌐 Website Enhancement Tracker</div>
      <div style={S.secSub}>Track all UI/UX improvements for the Saint Andrews Park Google Site.</div>
      <div style={{...S.card,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:13,color:"#8faa9a",marginBottom:6}}>Overall Progress</div>
          <div style={{fontSize:22,color:"#c9a84c",fontWeight:"bold"}}>{done} / {items.length} Complete</div>
        </div>
        <div style={{flex:1,margin:"0 24px"}}>
          <div style={{background:"rgba(255,255,255,.1)",borderRadius:10,height:12,overflow:"hidden"}}>
            <div style={{width:`${(done/items.length)*100}%`,background:"linear-gradient(90deg,#c9a84c,#4caf87)",height:"100%",borderRadius:10,transition:"width .4s ease"}} />
          </div>
        </div>
        <div style={{color:"#4caf87",fontSize:18,fontWeight:"bold"}}>{Math.round((done/items.length)*100)}%</div>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Enhancement</th><th style={S.th}>Priority</th><th style={S.th}>Status</th><th style={S.th}>Notes</th><th style={S.th}>Action</th></tr></thead>
          <tbody>
            {items.map(i=>(
              <tr key={i.id}>
                <td style={{...S.td,textDecoration:i.status==="Done"?"line-through":"none",color:i.status==="Done"?"#5a7060":"#e8e0d0",maxWidth:220}}>{i.item}</td>
                <td style={S.td}><span style={S.pill(priorityColor[i.priority])}>{i.priority}</span></td>
                <td style={S.td}><span style={S.pill(statusColor[i.status])}>{i.status}</span></td>
                <td style={{...S.td,color:"#8faa9a",fontSize:12,maxWidth:240}}>{i.notes}</td>
                <td style={S.td}><button onClick={()=>cycle(i.id)} style={{...S.btnOut,padding:"4px 10px",fontSize:12}}>{i.status==="Done"?"↩ Undo":"→ Advance"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("dashboard");
  const [tasks,setTasks]=useState(initialTasks);
  const render=()=>{switch(tab){
    case"dashboard":  return <Dashboard tasks={tasks}/>;
    case"directory":  return <NeighborhoodDirectory/>;
    case"tasks":      return <TaskTracker tasks={tasks} setTasks={setTasks}/>;
    case"newsletter": return <Newsletter/>;
    case"minutes":    return <MeetingMinutes/>;
    case"website":    return <WebsiteTracker/>;
    default:          return null;
  }};
  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={S.logoIcon}>⛳</div>
          <div><div style={S.logoTitle}>Saint Andrews Park</div><div style={S.logoSub}>HOA Board Hub</div></div>
        </div>
        <div style={S.badge}>SECRETARY PORTAL</div>
      </div>
      <div style={S.nav}>
        {TABS.map(t=><button key={t.id} style={S.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>
      <div style={S.main}>{render()}</div>
    </div>
  );
}
