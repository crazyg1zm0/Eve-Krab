import { useState, useEffect } from "react";
import { api } from "./api/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── YOUR 10 P1 MATERIALS ─────────────────────────────────────────────────────
const MATERIALS = [
  { id: "reactive_metals",   name: "Reactive Metals",   typeId: 2398, planet: "Barren / Gas / Ice" },
  { id: "water",             name: "Water",             typeId: 3645, planet: "Barren / Oceanic / Ice" },
  { id: "electrolytes",      name: "Electrolytes",      typeId: 2390, planet: "Gas / Storm / Ice" },
  { id: "oxygen",            name: "Oxygen",            typeId: 3683, planet: "Gas / Ice / Storm" },
  { id: "chiral_structures", name: "Chiral Structures", typeId: 2401, planet: "Lava / Plasma" },
  { id: "toxic_metals",      name: "Toxic Metals",      typeId: 2400, planet: "Lava / Ice / Storm" },
  { id: "bacteria",          name: "Bacteria",          typeId: 2393, planet: "Barren / Oceanic / Temperate" },
  { id: "biofuels",          name: "Biofuels",          typeId: 2396, planet: "Barren / Oceanic / Temperate" },
  { id: "proteins",          name: "Proteins",          typeId: 2395, planet: "Temperate / Oceanic" },
  { id: "industrial_fibers", name: "Industrial Fibers", typeId: 2397, planet: "Temperate" },
];

// ─── FACTORY RECIPES — P1 cost per single factory run ─────────────────────────
// Each entry: one run on a 10-planet Wetware Mainframe factory setup
const FACTORY_RECIPES = {
  wetware_mainframe: {
    name: "Wetware Mainframe",
    typeId: 2876,
    p1PerRun: {
      reactive_metals:   23040,
      water:             23040,
      bacteria:          23040,
      toxic_metals:      15360,
      proteins:          15360,
      electrolytes:      15360,
      biofuels:           7680,
      chiral_structures:  7680,
      oxygen:             7680,
      industrial_fibers:     0,
    },
  },
  // Easy to add more P4s later e.g. broadcast_node, etc.
};

// ─── MOCK PRICES ──────────────────────────────────────────────────────────────
const MOCK_PRICES = {
  2410: { adj: 412,  avg: 418 },
  3645: { adj: 285,  avg: 291 },
  2390: { adj: 371,  avg: 378 },
  2399: { adj: 318,  avg: 324 },
  2401: { adj: 502,  avg: 509 },
  2400: { adj: 388,  avg: 395 },
  2393: { adj: 344,  avg: 350 },
  2397: { adj: 297,  avg: 303 },
  2395: { adj: 421,  avg: 429 },
  2396: { adj: 356,  avg: 362 },
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT_STOCK = {
  reactive_metals:   85400,
  water:             92100,
  electrolytes:      41200,
  oxygen:            38800,
  chiral_structures: 12300,
  toxic_metals:      29700,
  bacteria:          67400,
  biofuels:          44100,
  proteins:          18600,
  industrial_fibers: 31200,
};

const INIT_ALERTS = {
  reactive_metals:   46080,
  water:             46080,
  electrolytes:      30720,
  oxygen:            15360,
  chiral_structures: 15360,
  toxic_metals:      30720,
  bacteria:          46080,
  biofuels:          15360,
  proteins:          30720,
  industrial_fibers:     0,
};

const INIT_LOG = [
  { id:1,  type:"collect", entries:[{matId:"reactive_metals",qty:12000},{matId:"water",qty:14400},{matId:"bacteria",qty:11200}], note:"Char: Aura Prime — 3 planets", date:"2026-04-20T14:30:00Z" },
  { id:2,  type:"factory", recipe:"wetware_mainframe", runs:2, note:"Factory run #14",   date:"2026-04-19T09:00:00Z" },
  { id:3,  type:"collect", entries:[{matId:"electrolytes",qty:9800},{matId:"oxygen",qty:9400}],  note:"Char: Ghost Sigma — 2 planets", date:"2026-04-18T18:00:00Z" },
  { id:4,  type:"collect", entries:[{matId:"chiral_structures",qty:5600},{matId:"proteins",qty:6200}], note:"Char: Void Walker + Echo Null", date:"2026-04-17T11:00:00Z" },
  { id:5,  type:"factory", recipe:"wetware_mainframe", runs:3, note:"Factory run #13",   date:"2026-04-16T08:00:00Z" },
  { id:6,  type:"collect", entries:[{matId:"toxic_metals",qty:8800},{matId:"biofuels",qty:10200},{matId:"industrial_fibers",qty:7800}], note:"Char: Void Walker + Echo Null + Aura", date:"2026-04-15T16:00:00Z" },
  { id:7,  type:"adjust",  entries:[{matId:"oxygen",qty:-1200}], note:"Correction — miscounted", date:"2026-04-13T10:00:00Z" },
];

const CHART_DATA = [
  { day:"08 Apr", units:22400 }, { day:"09 Apr", units:18700 },
  { day:"10 Apr", units:31200 }, { day:"11 Apr", units:0 },
  { day:"12 Apr", units:28900 }, { day:"13 Apr", units:11400 },
  { day:"14 Apr", units:36100 }, { day:"15 Apr", units:41200 },
  { day:"16 Apr", units:28000 }, { day:"17 Apr", units:19800 },
  { day:"18 Apr", units:42400 }, { day:"19 Apr", units:55000 },
  { day:"20 Apr", units:37600 }, { day:"21 Apr", units:12400 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtISK = v => {
  if (v == null) return "—";
  const n = +v;
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return n.toFixed(0);
};
const fmtQty = v => {
  if (v == null || v === 0) return "0";
  const n = +v;
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return n.toLocaleString();
};
const fmtDate = iso => new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const matById = id => MATERIALS.find(m => m.id === id);

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --void:#050810;--deep:#070c18;--panel:#0b1220;--card:#0e1828;
  --b1:#1a3554;--b2:#1e4a7a;--b3:#2a6aaa;
  --acc:#00b4ff;--adim:#0070cc;--aglow:rgba(0,180,255,.12);
  --gold:#d4960a;--gdim:#8a6208;
  --grn:#00e676;--gdrk:#009944;
  --red:#ff3344;--rdim:#881122;
  --tp:#ddeeff;--ts:#6699bb;--tm:#2a4a6a;
  --hud:'Orbitron',sans-serif;--mono:'Share Tech Mono',monospace;--body:'Exo 2',sans-serif;
}
html,body{background:var(--void);color:var(--tp);font-family:var(--body);min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--deep)}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
input,select,textarea{
  font-family:var(--body);background:var(--deep);border:1px solid var(--b1);
  color:var(--tp);padding:7px 10px;border-radius:3px;outline:none;transition:border-color .15s;width:100%;font-size:13px;
}
input:focus,select:focus{border-color:var(--acc);box-shadow:0 0 0 2px var(--aglow)}
select option{background:var(--deep)}
button{font-family:var(--body);cursor:pointer;border:none;outline:none;transition:all .15s}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
.fade{animation:fadeUp .2s ease}
`;

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const HUD = ({children,style={}}) => (
  <span style={{fontFamily:"var(--hud)",textTransform:"uppercase",letterSpacing:"2px",...style}}>{children}</span>
);

const Btn = ({children,onClick,variant="ghost",sm,disabled,style={}}) => {
  const base = {
    display:"inline-flex",alignItems:"center",gap:6,
    padding:sm?"5px 12px":"8px 18px",borderRadius:3,
    fontSize:sm?11:13,fontWeight:500,letterSpacing:".4px",
    fontFamily:"var(--body)",opacity:disabled?.4:1,
    cursor:disabled?"not-allowed":"pointer",
  };
  const V = {
    primary:{background:"var(--adim)",color:"#fff",border:"1px solid var(--acc)"},
    ghost:  {background:"transparent",color:"var(--ts)",border:"1px solid var(--b1)"},
    green:  {background:"rgba(0,230,118,.1)",color:"var(--grn)",border:"1px solid var(--gdrk)"},
    danger: {background:"rgba(255,51,68,.08)",color:"var(--red)",border:"1px solid var(--rdim)"},
    gold:   {background:"rgba(212,150,10,.12)",color:"var(--gold)",border:"1px solid var(--gdim)"},
  };
  return (
    <button disabled={disabled} style={{...base,...V[variant],...style}} onClick={onClick}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.filter="brightness(1.3)";e.currentTarget.style.boxShadow="0 0 10px rgba(0,180,255,.15)"}}}
      onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.boxShadow=""}}
    >{children}</button>
  );
};

const Card = ({children,style={},alert}) => (
  <div style={{
    background:"var(--card)",borderRadius:4,padding:18,
    border:alert?"1px solid var(--rdim)":"1px solid var(--b1)",
    position:"relative",overflow:"hidden",...style,
  }}>
    {alert && <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:"var(--red)"}}/>}
    {children}
  </div>
);

const Modal = ({title,onClose,children,width=520,accentColor="var(--acc)"}) => (
  <div style={{
    position:"fixed",inset:0,zIndex:999,background:"rgba(4,7,14,.92)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",
  }} onClick={onClose}>
    <div className="fade" style={{
      width,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",
      background:"var(--panel)",border:`1px solid ${accentColor}`,borderRadius:4,
      boxShadow:`0 0 60px ${accentColor}33`,
    }} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid var(--b1)"}}>
        <HUD style={{fontSize:11,color:accentColor}}>{title}</HUD>
        <button onClick={onClose} style={{background:"none",border:"1px solid var(--b1)",color:"var(--ts)",borderRadius:3,padding:"2px 9px",cursor:"pointer",fontSize:16,lineHeight:1.4}}>✕</button>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  </div>
);

const Field = ({label,children}) => (
  <div>
    <HUD style={{display:"block",fontSize:9,color:"var(--tm)",marginBottom:5}}>{label}</HUD>
    {children}
  </div>
);

const Toast = ({msg,color="var(--grn)"}) => (
  <div className="fade" style={{
    position:"fixed",top:20,right:20,zIndex:2000,
    background:"var(--panel)",border:`1px solid ${color}`,
    borderRadius:4,padding:"10px 18px",
    fontFamily:"var(--mono)",fontSize:12,color,
    boxShadow:`0 0 24px ${color}44`,maxWidth:400,
  }}>{msg}</div>
);

const StockBar = ({stock,alert}) => {
  if (!alert) return null;
  const pct = Math.min(100,(stock/(alert*2))*100);
  const col = stock<alert?"var(--red)":stock<alert*1.5?"var(--gold)":"var(--grn)";
  return (
    <div style={{marginTop:5,height:3,background:"var(--b1)",borderRadius:2}}>
      <div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:2,transition:"width .3s"}}/>
    </div>
  );
};

// ─── PARSE EVE PASTE ─────────────────────────────────────────────────────────
// Handles EVE's tab-separated copy format: "Item Name\tQuantity" per line.
// Numbers may contain commas (e.g. 1,234,567). Unrecognised lines are flagged.
function parseEvePaste(text) {
  const matched   = [];
  const skipped   = [];

  // Build a lookup: lowercase name → material id
  const nameMap = {};
  MATERIALS.forEach(m => { nameMap[m.name.toLowerCase()] = m.id; });

  text.trim().split("\n").forEach(line => {
    const parts = line.trim().split("\t");
    if (parts.length < 2) return; // blank or malformed line
    const rawName = parts[0].trim();
    const rawQty  = parts[1].trim().replace(/,/g, "");
    const qty     = parseInt(rawQty, 10);
    const id      = nameMap[rawName.toLowerCase()];

    if (!id)           { skipped.push({ name: rawName, reason: "not in tracked materials" }); return; }
    if (isNaN(qty) || qty <= 0) { skipped.push({ name: rawName, reason: "invalid quantity" }); return; }
    matched.push({ matId: id, qty });
  });

  return { matched, skipped };
}

// ─── COLLECT MODAL ────────────────────────────────────────────────────────────
function CollectModal({onClose,onSubmit,stock}) {
  const [tab,     setTab]     = useState("manual"); // "manual" | "paste"
  const [qtys,    setQtys]    = useState(Object.fromEntries(MATERIALS.map(m=>[m.id,""])));
  const [note,    setNote]    = useState("");
  // paste tab state
  const [pasted,   setPasted]   = useState("");
  const [parsed,   setParsed]   = useState(null); // { matched, skipped } | null

  // ── manual tab helpers ──
  const anyFilled   = Object.values(qtys).some(v => v !== "" && +v > 0);
  const filledCount = Object.values(qtys).filter(v => v !== "" && +v > 0).length;
  const clearAll    = () => setQtys(Object.fromEntries(MATERIALS.map(m=>[m.id,""])));

  // ── paste tab helpers ──
  function handlePasteChange(text) {
    setPasted(text);
    if (text.trim() === "") { setParsed(null); return; }
    setParsed(parseEvePaste(text));
  }

  function applyParsed() {
    if (!parsed?.matched?.length) return;
    // Merge parsed results into qtys so user can still review/edit before confirming
    const next = {...qtys};
    parsed.matched.forEach(e => { next[e.matId] = String(e.qty); });
    setQtys(next);
    setTab("manual");
    setPasted("");
    setParsed(null);
  }

  // ── shared submit ──
  function submit() {
    const entries = MATERIALS
      .filter(m => qtys[m.id] !== "" && +qtys[m.id] > 0)
      .map(m => ({ matId: m.id, qty: +qtys[m.id] }));
    if (!entries.length) return;
    onSubmit({ type:"collect", entries, note });
    onClose();
  }

  // ── tab button style ──
  const tabBtn = (id) => ({
    padding:"6px 16px", borderRadius:"3px 3px 0 0", fontSize:12, fontWeight:500,
    fontFamily:"var(--body)", cursor:"pointer", border:"none",
    background: tab===id ? "var(--card)" : "transparent",
    color:       tab===id ? "var(--grn)"  : "var(--tm)",
    borderBottom: tab===id ? "2px solid var(--grn)" : "2px solid transparent",
  });

  return (
    <Modal title="Log Collection Run" onClose={onClose} width={580} accentColor="var(--grn)">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* Tab switcher */}
        <div style={{display:"flex",gap:4,borderBottom:"1px solid var(--b1)",marginBottom:4}}>
          <button style={tabBtn("manual")} onClick={()=>setTab("manual")}>✎ Manual Entry</button>
          <button style={tabBtn("paste")}  onClick={()=>setTab("paste")}>⧉ Paste from EVE</button>
        </div>

        {/* ── MANUAL TAB ── */}
        {tab === "manual" && (
          <>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <HUD style={{fontSize:9,color:"var(--tm)"}}>Quantities collected — leave blank to skip</HUD>
                {anyFilled && (
                  <button onClick={clearAll} style={{background:"none",border:"none",color:"var(--tm)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>
                    clear all
                  </button>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {MATERIALS.map(m => {
                  const val      = qtys[m.id];
                  const hasVal   = val !== "" && +val > 0;
                  const cur      = stock[m.id] || 0;
                  const newStock = hasVal ? cur + +val : cur;
                  return (
                    <div key={m.id} style={{
                      display:"grid", gridTemplateColumns:"1fr 130px 110px",
                      alignItems:"center", gap:10,
                      padding:"7px 10px", borderRadius:3,
                      background: hasVal ? "rgba(0,230,118,.06)" : "var(--deep)",
                      border:`1px solid ${hasVal ? "var(--gdrk)" : "var(--b1)"}`,
                      transition:"all .15s",
                    }}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:hasVal?"var(--tp)":"var(--ts)"}}>{m.name}</div>
                        <div style={{fontSize:10,color:"var(--tm)",fontFamily:"var(--mono)"}}>current: {fmtQty(cur)}</div>
                      </div>
                      <input
                        type="number" min="0" placeholder="qty" value={val}
                        onChange={e=>setQtys(prev=>({...prev,[m.id]:e.target.value}))}
                        style={{
                          textAlign:"right", fontSize:14, fontFamily:"var(--mono)",
                          borderColor:hasVal?"var(--gdrk)":"var(--b1)",
                          color:hasVal?"var(--grn)":"var(--ts)",
                        }}
                      />
                      <div style={{textAlign:"right",fontSize:12,fontFamily:"var(--mono)",color:hasVal?"var(--grn)":"var(--tm)"}}>
                        {hasVal ? `→ ${fmtQty(newStock)}` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── PASTE TAB ── */}
        {tab === "paste" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:12,color:"var(--ts)",lineHeight:1.6}}>
              Copy items from your EVE inventory or assets window and paste below.
              Each line should be <span style={{fontFamily:"var(--mono)",color:"var(--acc)"}}>Name[tab]Quantity</span>.
              Unrecognised items (e.g. Wetware Mainframes) will be listed but ignored.
            </div>

            <textarea
              value={pasted}
              onChange={e=>handlePasteChange(e.target.value)}
              placeholder={"Bacteria\t593440\nBiofuels\t235432\nChiral Structures\t222381\n..."}
              rows={10}
              style={{fontFamily:"var(--mono)",fontSize:12,resize:"vertical",lineHeight:1.6}}
            />

            {/* Parse preview */}
            {parsed && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>

                {/* Matched */}
                {parsed.matched.length > 0 && (
                  <div>
                    <HUD style={{fontSize:9,color:"var(--grn)",display:"block",marginBottom:6}}>
                      ✓ {parsed.matched.length} material{parsed.matched.length>1?"s":""} recognised
                    </HUD>
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      {parsed.matched.map(e => {
                        const m   = MATERIALS.find(x=>x.id===e.matId);
                        const cur = stock[e.matId]||0;
                        return (
                          <div key={e.matId} style={{
                            display:"grid",gridTemplateColumns:"1fr 90px 90px",gap:8,
                            padding:"6px 10px",borderRadius:3,
                            background:"rgba(0,230,118,.06)",border:"1px solid var(--gdrk)",
                            fontSize:12,
                          }}>
                            <span style={{color:"var(--tp)",fontWeight:500}}>{m?.name}</span>
                            <span style={{fontFamily:"var(--mono)",color:"var(--grn)",textAlign:"right"}}>+{fmtQty(e.qty)}</span>
                            <span style={{fontFamily:"var(--mono)",color:"var(--tm)",textAlign:"right",fontSize:11}}>→ {fmtQty(cur+e.qty)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skipped */}
                {parsed.skipped.length > 0 && (
                  <div>
                    <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:6}}>
                      ⊘ {parsed.skipped.length} line{parsed.skipped.length>1?"s":""} ignored
                    </HUD>
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      {parsed.skipped.map((s,i) => (
                        <div key={i} style={{
                          display:"grid",gridTemplateColumns:"1fr auto",gap:8,
                          padding:"5px 10px",borderRadius:3,
                          background:"var(--deep)",border:"1px solid var(--b1)",
                          fontSize:11,
                        }}>
                          <span style={{fontFamily:"var(--mono)",color:"var(--tm)"}}>{s.name}</span>
                          <span style={{color:"var(--tm)",fontSize:10}}>{s.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsed.matched.length > 0 && (
                  <Btn variant="green" onClick={applyParsed} style={{alignSelf:"flex-end"}}>
                    ✓ Apply — review &amp; confirm →
                  </Btn>
                )}
              </div>
            )}
          </div>
        )}

        {/* Note — shown on both tabs */}
        <Field label="Note (optional — characters, session, etc.)">
          <input value={note} onChange={e=>setNote(e.target.value)}
            placeholder="e.g. Full collection run — all 14 chars" />
        </Field>

        {/* Footer — only show confirm on manual tab */}
        {tab === "manual" && (
          <div style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"10px 14px",background:"var(--deep)",borderRadius:3,border:"1px solid var(--b1)",
          }}>
            <div style={{fontSize:12,color:"var(--ts)"}}>
              {filledCount===0 ? "No quantities entered" : `${filledCount} material${filledCount>1?"s":""} to collect`}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
              <Btn variant="green" onClick={submit} disabled={!anyFilled}>Confirm Collection</Btn>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}

// ─── FACTORY RUN MODAL ────────────────────────────────────────────────────────
function FactoryModal({onClose,onSubmit,stock}) {
  const [recipeId, setRecipeId] = useState("wetware_mainframe");
  const [runs,     setRuns]     = useState(1);
  const [note,     setNote]     = useState("");

  const recipe = FACTORY_RECIPES[recipeId];
  const numRuns = Math.max(0, Math.floor(+runs) || 0);

  // Calculate totals and check stock
  const breakdown = MATERIALS.map(m => {
    const perRun = recipe.p1PerRun[m.id] || 0;
    const total  = perRun * numRuns;
    const cur    = stock[m.id] || 0;
    const after  = cur - total;
    const short  = total > 0 && after < 0;
    return { ...m, perRun, total, cur, after, short };
  }).filter(m => m.perRun > 0);  // Only show materials this recipe uses

  const anyShort   = breakdown.some(m => m.short);
  const maxRuns    = breakdown.length > 0
    ? Math.min(...breakdown.filter(m=>m.perRun>0).map(m => Math.floor((stock[m.id]||0) / m.perRun)))
    : 0;

  function submit() {
    if (!numRuns || numRuns < 1) return;
    const entries = breakdown.map(m => ({ matId: m.id, qty: -m.total }));
    onSubmit({ type:"factory", recipe: recipeId, runs: numRuns, entries, note });
    onClose();
  }

  return (
    <Modal title="Log Factory Run" onClose={onClose} width={580} accentColor="var(--red)">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* Recipe selector + run count */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Product">
            <select value={recipeId} onChange={e=>setRecipeId(e.target.value)}>
              {Object.entries(FACTORY_RECIPES).map(([k,v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Number of Factory Runs">
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input
                type="number" min="1" max="999" value={runs}
                onChange={e=>setRuns(e.target.value)}
                style={{fontFamily:"var(--mono)",fontSize:18,textAlign:"center",color:"var(--tp)"}}
              />
              {maxRuns > 0 && (
                <button onClick={()=>setRuns(maxRuns)} style={{
                  background:"rgba(0,180,255,.1)",border:"1px solid var(--b2)",
                  color:"var(--acc)",borderRadius:3,padding:"5px 10px",
                  fontSize:11,fontFamily:"var(--mono)",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
                }} title="Set to maximum runs you have stock for">
                  max ({maxRuns})
                </button>
              )}
            </div>
          </Field>
        </div>

        {/* Material breakdown table */}
        <div>
          <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:8}}>
            Material Deduction — {numRuns} run{numRuns!==1?"s":""} of {recipe.name}
          </HUD>

          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {/* Header */}
            <div style={{
              display:"grid",gridTemplateColumns:"1fr 90px 90px 100px 80px",
              gap:8,padding:"5px 10px",
            }}>
              {["Material","Per Run","Total","In Stock","After"].map(h=>(
                <HUD key={h} style={{fontSize:8,color:"var(--tm)",textAlign:h!=="Material"?"right":"left"}}>{h}</HUD>
              ))}
            </div>

            {breakdown.map(m => (
              <div key={m.id} style={{
                display:"grid",gridTemplateColumns:"1fr 90px 90px 100px 80px",
                gap:8,padding:"7px 10px",borderRadius:3,alignItems:"center",
                background: m.short ? "rgba(255,51,68,.08)" : "var(--deep)",
                border:`1px solid ${m.short ? "var(--rdim)" : "var(--b1)"}`,
              }}>
                <div style={{fontSize:13,color: m.short ? "var(--red)" : "var(--tp)",fontWeight:500}}>
                  {m.short && "⚠ "}{m.name}
                </div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--tm)",textAlign:"right"}}>
                  {fmtQty(m.perRun)}
                </div>
                <div style={{fontFamily:"var(--mono)",fontSize:13,color: m.short?"var(--red)":"var(--tp)",textAlign:"right",fontWeight:500}}>
                  {numRuns > 0 ? fmtQty(m.total) : "—"}
                </div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--ts)",textAlign:"right"}}>
                  {fmtQty(m.cur)}
                </div>
                <div style={{
                  fontFamily:"var(--mono)",fontSize:13,textAlign:"right",fontWeight:500,
                  color: m.short ? "var(--red)" : m.after < m.cur * 0.2 ? "var(--gold)" : "var(--grn)",
                }}>
                  {numRuns > 0 ? fmtQty(m.after) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {anyShort && (
          <div style={{
            padding:"10px 14px",background:"rgba(255,51,68,.08)",
            border:"1px solid var(--rdim)",borderRadius:3,
            fontSize:12,color:"var(--red)",fontFamily:"var(--mono)",
          }}>
            ⚠  Insufficient stock for {numRuns} run{numRuns>1?"s":""}. Max runs with current stock: {maxRuns}.
          </div>
        )}

        {/* Note */}
        <Field label="Note (optional)">
          <input value={note} onChange={e=>setNote(e.target.value)}
            placeholder="e.g. Factory run #15 — 10 factory planets" />
        </Field>

        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant={anyShort?"gold":"danger"} onClick={submit} disabled={numRuns<1}>
            {anyShort ? "Log Anyway (short)" : `Confirm — ${numRuns} Run${numRuns>1?"s":""}`}
          </Btn>
        </div>

      </div>
    </Modal>
  );
}

// ─── STOCK PAGE ───────────────────────────────────────────────────────────────
function StockPage({stock,alerts,prices,onCollect,onFactory,onEditAlert}) {
  const totalValue = MATERIALS.reduce((s,m) => {
    const p = prices[m.typeId];
    return s + (p ? p.adj*(stock[m.id]||0) : 0);
  },0);
  const lowCount = MATERIALS.filter(m => alerts[m.id]>0 && (stock[m.id]||0)<alerts[m.id]).length;

  return (
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        {[
          {label:"Total Stock Value", val:fmtISK(totalValue)+" ISK", col:"var(--gold)"},
          {label:"Materials Tracked", val:MATERIALS.length,           col:"var(--acc)"},
          {label:"Low Stock Alerts",  val:lowCount,                   col:lowCount>0?"var(--red)":"var(--grn)"},
        ].map(s=>(
          <Card key={s.label}>
            <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:8}}>{s.label}</HUD>
            <div style={{fontFamily:"var(--hud)",fontSize:24,color:s.col,lineHeight:1}}>{s.val}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {MATERIALS.map(m => {
          const qty   = stock[m.id]||0;
          const alert = alerts[m.id]||0;
          const price = prices[m.typeId];
          const val   = price ? price.adj*qty : null;
          const isLow = alert>0 && qty<alert;
          return (
            <Card key={m.id} alert={isLow} style={{padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:3}}>{m.name}</div>
                  <div style={{fontSize:11,color:"var(--tm)",fontFamily:"var(--mono)"}}>{m.planet}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {isLow && <span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--red)",background:"rgba(255,51,68,.1)",border:"1px solid var(--rdim)",padding:"2px 7px",borderRadius:2}}>LOW</span>}
                  <Btn sm variant="ghost" onClick={()=>onEditAlert(m)}>⚙</Btn>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div style={{background:"var(--deep)",padding:"8px 10px",borderRadius:3}}>
                  <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:3}}>STOCK</HUD>
                  <div style={{fontFamily:"var(--mono)",fontSize:16,color:isLow?"var(--red)":"var(--acc)"}}>{fmtQty(qty)}</div>
                  {alert>0 && <div style={{fontSize:10,color:"var(--tm)"}}>min {fmtQty(alert)}</div>}
                  <StockBar stock={qty} alert={alert}/>
                </div>
                <div style={{background:"var(--deep)",padding:"8px 10px",borderRadius:3}}>
                  <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:3}}>JITA SELL</HUD>
                  <div style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--gold)"}}>{price?fmtISK(price.adj):"—"}</div>
                  {price && <div style={{fontSize:10,color:"var(--tm)"}}>avg {fmtISK(price.avg)}</div>}
                </div>
                <div style={{background:"var(--deep)",padding:"8px 10px",borderRadius:3}}>
                  <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:3}}>VALUE</HUD>
                  <div style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--gold)"}}>{val!=null?fmtISK(val):"—"}</div>
                  <div style={{fontSize:10,color:"var(--tm)"}}>ISK</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,marginTop:10}}>
                <Btn sm variant="green"  onClick={onCollect} style={{flex:1,justifyContent:"center"}}>+ Collect</Btn>
                <Btn sm variant="danger" onClick={onFactory} style={{flex:1,justifyContent:"center"}}>→ Factory</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── LOG PAGE ─────────────────────────────────────────────────────────────────
function LogPage({log}) {
  const [filter, setFilter] = useState("all");
  const filtered = filter==="all" ? log : log.filter(l=>l.type===filter);

  const TYPE_STYLE = {
    collect:{color:"var(--grn)",label:"COLLECT", bg:"rgba(0,230,118,.08)",border:"rgba(0,153,68,.4)"},
    factory:{color:"var(--red)",label:"FACTORY", bg:"rgba(255,51,68,.08)",border:"rgba(136,17,34,.4)"},
    adjust: {color:"var(--acc)",label:"ADJUST",  bg:"rgba(0,180,255,.08)",border:"rgba(0,112,204,.4)"},
  };

  return (
    <div className="fade">
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {["all","collect","factory","adjust"].map(f=>(
          <Btn key={f} sm variant={filter===f?"primary":"ghost"} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </Btn>
        ))}
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"var(--deep)"}}>
              {["Date","Type","Materials","Note"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",borderBottom:"1px solid var(--b1)"}}>
                  <HUD style={{fontSize:9,color:"var(--tm)"}}>{h}</HUD>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={4} style={{padding:40,textAlign:"center",color:"var(--tm)"}}>No entries</td></tr>
              : filtered.map(entry=>{
                const ts = TYPE_STYLE[entry.type];
                // Summarise entries
                let summary;
                if (entry.type==="factory") {
                  const recipe = FACTORY_RECIPES[entry.recipe];
                  summary = `${entry.runs}× run${entry.runs>1?"s":""} → ${entry.runs} ${recipe?.name||entry.recipe}`;
                } else {
                  summary = (entry.entries||[]).map(e=>{
                    const m = matById(e.matId);
                    const sign = e.qty>0?"+":"";
                    return `${m?.name||e.matId}: ${sign}${fmtQty(e.qty)}`;
                  }).join(" · ");
                }
                return (
                  <tr key={entry.id} style={{borderBottom:"1px solid var(--b1)"}}>
                    <td style={{padding:"9px 14px",fontFamily:"var(--mono)",fontSize:11,color:"var(--tm)",whiteSpace:"nowrap"}}>{fmtDate(entry.date)}</td>
                    <td style={{padding:"9px 14px"}}>
                      <span style={{fontFamily:"var(--mono)",fontSize:11,padding:"2px 8px",borderRadius:2,color:ts.color,background:ts.bg,border:`1px solid ${ts.border}`}}>{ts.label}</span>
                    </td>
                    <td style={{padding:"9px 14px",fontSize:12,color:"var(--ts)",maxWidth:360}}>{summary}</td>
                    <td style={{padding:"9px 14px",fontSize:12,color:"var(--tm)"}}>{entry.note||"—"}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function AnalyticsPage({log,stock,prices}) {
  const [days,setDays] = useState(14);

  const collectTotals = MATERIALS.map(m => ({
    name: m.name.split(" ").slice(-1)[0],
    collected:   log.filter(l=>l.type==="collect").flatMap(l=>l.entries||[]).filter(e=>e.matId===m.id).reduce((s,e)=>s+e.qty,0),
    sentFactory: log.filter(l=>l.type==="factory").flatMap(l=>l.entries||[]).filter(e=>e.matId===m.id).reduce((s,e)=>s+Math.abs(e.qty),0),
  }));

  const valueData = MATERIALS.map(m => {
    const p = prices[m.typeId];
    return {name:m.name.split(" ").slice(-1)[0], value:p?Math.round(p.adj*(stock[m.id]||0)):0};
  }).sort((a,b)=>b.value-a.value);

  const ChartTip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{background:"var(--panel)",border:"1px solid var(--b2)",borderRadius:3,padding:"8px 12px",fontSize:12}}>
        <HUD style={{fontSize:9,color:"var(--acc)",display:"block",marginBottom:4}}>{label}</HUD>
        {payload.map(p=><div key={p.name} style={{fontFamily:"var(--mono)",color:p.color}}>{p.name}: {fmtQty(p.value)}</div>)}
      </div>
    );
  };

  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:20}}>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>
          <HUD style={{fontSize:10,color:"var(--acc)"}}>Daily Collection Volume</HUD>
          <div style={{display:"flex",gap:6}}>
            {[7,14].map(d=><Btn key={d} sm variant={days===d?"primary":"ghost"} onClick={()=>setDays(d)}>{d}D</Btn>)}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={CHART_DATA.slice(-days)} margin={{top:4,right:8,left:-10,bottom:0}}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0070cc" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0070cc" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)"/>
            <XAxis dataKey="day" tick={{fill:"var(--tm)",fontSize:10}}/>
            <YAxis tick={{fill:"var(--tm)",fontSize:10}} tickFormatter={fmtQty}/>
            <Tooltip content={<ChartTip/>}/>
            <Area type="monotone" dataKey="units" name="units" stroke="var(--acc)" strokeWidth={2} fill="url(#ag)" dot={{fill:"var(--acc)",r:3}} activeDot={{r:5}}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card>
          <HUD style={{fontSize:10,color:"var(--acc)",display:"block",marginBottom:14,paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>Collected vs Sent to Factory</HUD>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={collectTotals} margin={{top:4,right:4,left:-10,bottom:20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)"/>
              <XAxis dataKey="name" tick={{fill:"var(--tm)",fontSize:10}} angle={-35} textAnchor="end"/>
              <YAxis tick={{fill:"var(--tm)",fontSize:10}} tickFormatter={fmtQty}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="collected"   name="Collected"  fill="#006699" radius={[2,2,0,0]}/>
              <Bar dataKey="sentFactory" name="→ Factory"  fill="#882222" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <HUD style={{fontSize:10,color:"var(--gold)",display:"block",marginBottom:14,paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>Stock Value by Material</HUD>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={valueData} layout="vertical" margin={{top:4,right:20,left:60,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)" horizontal={false}/>
              <XAxis type="number" tick={{fill:"var(--tm)",fontSize:10}} tickFormatter={fmtISK}/>
              <YAxis type="category" dataKey="name" tick={{fill:"var(--ts)",fontSize:11}}/>
              <Tooltip content={({active,payload})=>active&&payload?.length?(<div style={{background:"var(--panel)",border:"1px solid var(--b2)",borderRadius:3,padding:"8px 12px",fontFamily:"var(--mono)",fontSize:12,color:"var(--gold)"}}>{fmtISK(payload[0].value)} ISK</div>):null}/>
              <Bar dataKey="value" fill="var(--gdim)" radius={[0,2,2,0]} activeBar={{fill:"var(--gold)"}}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── PRICES PAGE ──────────────────────────────────────────────────────────────
function PricesPage({prices,onRefresh,refreshing}) {
  return (
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:12,color:"var(--tm)",fontFamily:"var(--mono)"}}>Source: ESI Tranquility — auto-syncs hourly</div>
        <Btn variant="gold" sm onClick={onRefresh} disabled={refreshing}>{refreshing?"⟳ Syncing…":"⟳ Sync Now"}</Btn>
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"var(--deep)"}}>
              {["Material","Type ID","Jita Sell","Avg. Price","Spread"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",borderBottom:"1px solid var(--b1)"}}>
                  <HUD style={{fontSize:9,color:"var(--tm)"}}>{h}</HUD>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATERIALS.map(m=>{
              const p = prices[m.typeId];
              const spread = p?((p.avg-p.adj)/p.adj*100).toFixed(1):null;
              return (
                <tr key={m.id} style={{borderBottom:"1px solid var(--b1)"}}>
                  <td style={{padding:"10px 14px",fontWeight:500}}>{m.name}</td>
                  <td style={{padding:"10px 14px",fontFamily:"var(--mono)",color:"var(--tm)",fontSize:12}}>{m.typeId}</td>
                  <td style={{padding:"10px 14px",fontFamily:"var(--mono)",color:"var(--gold)",fontSize:15}}>{p?fmtISK(p.adj):"—"}</td>
                  <td style={{padding:"10px 14px",fontFamily:"var(--mono)",color:"var(--ts)"}}>{p?fmtISK(p.avg):"—"}</td>
                  <td style={{padding:"10px 14px",fontFamily:"var(--mono)",fontSize:12,color:spread>2?"var(--gold)":"var(--tm)"}}>{spread!=null?`${spread}%`:"—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {MATERIALS.some(m=>prices[m.typeId]) && (
        <div style={{marginTop:12,fontSize:11,color:"var(--tm)",fontFamily:"var(--mono)"}}>
          {Object.keys(prices).length} / {MATERIALS.length} items with prices · auto-syncs hourly
        </div>
      )}
    </div>
  );
}

// ─── ALERT MODAL ──────────────────────────────────────────────────────────────
function AlertModal({material,currentAlert,onClose,onSave}) {
  const [val,setVal] = useState(currentAlert||"");
  return (
    <Modal title="Set Stock Alert" onClose={onClose} width={360}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{fontSize:13,color:"var(--ts)"}}>{material.name}</div>
        <Field label="Minimum Stock Level">
          <input type="number" min="0" value={val} onChange={e=>setVal(e.target.value)} autoFocus/>
        </Field>
        <div style={{fontSize:11,color:"var(--tm)",fontFamily:"var(--mono)"}}>Set to 0 to disable.</div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={()=>{onSave(material.id,+val);onClose();}}>Save</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── PAGES CONFIG ─────────────────────────────────────────────────────────────
const PAGES = [
  {id:"stock",     icon:"◈", label:"Stock"},
  {id:"log",       icon:"≡", label:"Log"},
  {id:"analytics", icon:"◉", label:"Analytics"},
  {id:"prices",    icon:"◎", label:"Prices"},
];
const PAGE_SUB = {
  stock:     "P1 material inventory",
  log:       "Collection and factory run history",
  analytics: "Production volume and stock value trends",
  prices:    "ESI Tranquility market prices",
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page,        setPage]        = useState("stock");
  const [stock,       setStock]       = useState(INIT_STOCK);
  const [alerts,      setAlerts]      = useState(INIT_ALERTS);
  const [log,         setLog]         = useState([]);
  const [prices,      setPrices]      = useState(MOCK_PRICES);
  const [collectOpen, setCollectOpen] = useState(false);
  const [factoryOpen, setFactoryOpen] = useState(false);
  const [alertModal,  setAlertModal]  = useState(null);
  const [toast,       setToast]       = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loading,     setLoading]     = useState(true);

  const showToast = (msg, col="var(--grn)") => {
    setToast({msg,col});
    setTimeout(()=>setToast(null),3500);
  };

  // ── Load all data from API on mount ──
  useEffect(() => {
    async function loadAll() {
      try {
        const [stockRows, logRows, priceRows] = await Promise.all([
          api.getStock(),
          api.getLog(),
          api.getLatestPrices(),
        ]);
        // Stock: convert array to {mat_id: qty} and {mat_id: alert}
        const s = {}, a = {};
        stockRows.forEach(r => { s[r.mat_id] = r.quantity; a[r.mat_id] = r.min_alert; });
        setStock(s);
        setAlerts(a);
        // Log: normalise API format to internal format
        setLog(logRows.map(normaliseLogEntry));
        // Prices: convert array to {typeId: {adj, avg}}
        const p = {};
        priceRows.forEach(r => {
          if (r.adjusted_price != null) {
            p[r.eve_type_id] = { adj: r.adjusted_price, avg: r.average_price };
          }
        });
        if (Object.keys(p).length > 0) setPrices(p);
      } catch(e) {
        console.error("Failed to load data:", e);
        showToast("⚠ Could not reach backend — showing cached data", "var(--gold)");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Normalise a log entry from API shape → internal shape used by components
  function normaliseLogEntry(row) {
    return {
      id:     row.id,
      type:   row.entry_type,
      recipe: row.recipe,
      runs:   row.runs,
      note:   row.note,
      date:   row.entry_date,
      // map "lines" [{mat_id, quantity}] → "entries" [{matId, qty}]
      entries: (row.lines || []).map(l => ({ matId: l.mat_id, qty: l.quantity })),
    };
  }

  async function handleCollect({entries, note}) {
    try {
      const created = await api.createLog({
        entry_type: "collect",
        note,
        lines: entries.map(e => ({ mat_id: e.matId, quantity: e.qty })),
      });
      setLog(prev => [normaliseLogEntry(created), ...prev]);
      // Update local stock
      setStock(prev => {
        const next = {...prev};
        entries.forEach(e => { next[e.matId] = (next[e.matId]||0) + e.qty; });
        return next;
      });
      const total = entries.reduce((s,e)=>s+e.qty,0);
      showToast(`✓ Collected ${fmtQty(total)} units across ${entries.length} material${entries.length>1?"s":""}`, "var(--grn)");
    } catch(e) { showToast(`✗ ${e.message}`, "var(--red)"); }
  }

  async function handleFactory({recipe, runs, entries, note}) {
    try {
      const created = await api.createLog({
        entry_type: "factory",
        recipe,
        runs,
        note,
        lines: entries.map(e => ({ mat_id: e.matId, quantity: e.qty })),
      });
      setLog(prev => [normaliseLogEntry(created), ...prev]);
      setStock(prev => {
        const next = {...prev};
        entries.forEach(e => { next[e.matId] = (next[e.matId]||0) + e.qty; });
        return next;
      });
      const r = FACTORY_RECIPES[recipe];
      showToast(`✓ Factory run logged — ${runs}× ${r.name} · stock deducted`, "var(--red)");
    } catch(e) { showToast(`✗ ${e.message}`, "var(--red)"); }
  }

  async function handleRefreshPrices() {
    setRefreshing(true);
    try {
      await api.refreshPrices();
      const priceRows = await api.getLatestPrices();
      const p = {};
      priceRows.forEach(r => {
        if (r.adjusted_price != null) p[r.eve_type_id] = { adj: r.adjusted_price, avg: r.average_price };
      });
      if (Object.keys(p).length > 0) setPrices(p);
      showToast("✓ Prices synced from ESI Tranquility", "var(--gold)");
    } catch(e) { showToast(`✗ Price sync failed: ${e.message}`, "var(--red)"); }
    finally { setRefreshing(false); }
  }

  async function handleAlertSave(mat_id, min_alert) {
    try {
      await api.updateAlert(mat_id, min_alert);
      setAlerts(prev => ({...prev, [mat_id]: min_alert}));
      showToast("Alert threshold updated", "var(--acc)");
    } catch(e) { showToast(`✗ ${e.message}`, "var(--red)"); }
  }

  const lowCount = MATERIALS.filter(m=>alerts[m.id]>0&&(stock[m.id]||0)<alerts[m.id]).length;

  return (
    <>
      <style>{G}</style>
      {toast && <Toast msg={toast.msg} color={toast.col}/>}

      <div style={{display:"flex",minHeight:"100vh"}}>

        {/* SIDEBAR */}
        <nav style={{width:190,flexShrink:0,background:"var(--deep)",borderRight:"1px solid var(--b1)",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh"}}>
          <div style={{padding:"22px 18px 18px",borderBottom:"1px solid var(--b1)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--acc)",boxShadow:"0 0 8px var(--acc)",animation:"pulse 2.5s ease-in-out infinite"}}/>
              <HUD style={{fontSize:12,color:"var(--acc)"}}>PI Tracker</HUD>
            </div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--tm)",paddingLeft:18}}>WETWARE MAINFRAME</div>
          </div>

          <div style={{flex:1,padding:"10px 0"}}>
            {PAGES.map(p=>(
              <button key={p.id} onClick={()=>setPage(p.id)} style={{
                width:"100%",display:"flex",alignItems:"center",gap:12,
                padding:"11px 18px",
                color:page===p.id?"var(--acc)":"var(--ts)",
                background:page===p.id?"rgba(0,180,255,.08)":"transparent",
                borderLeft:`2px solid ${page===p.id?"var(--acc)":"transparent"}`,
                borderTop:"none",borderRight:"none",borderBottom:"none",
                textAlign:"left",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all .15s",
              }}
              onMouseEnter={e=>{if(page!==p.id){e.currentTarget.style.background="rgba(0,180,255,.04)";e.currentTarget.style.color="var(--tp)"}}}
              onMouseLeave={e=>{if(page!==p.id){e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--ts)"}}}
              >
                <span style={{fontSize:16,opacity:.7}}>{p.icon}</span>
                {p.label}
                {p.id==="stock"&&lowCount>0&&(
                  <span style={{marginLeft:"auto",background:"var(--red)",color:"#fff",borderRadius:10,fontSize:10,fontFamily:"var(--mono)",padding:"1px 6px",minWidth:18,textAlign:"center"}}>{lowCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Quick action buttons */}
          <div style={{padding:"14px 12px",borderTop:"1px solid var(--b1)",display:"flex",flexDirection:"column",gap:7}}>
            <Btn sm variant="green"  onClick={()=>setCollectOpen(true)} style={{width:"100%",justifyContent:"center"}}>
              ＋ Log Collection
            </Btn>
            <Btn sm variant="danger" onClick={()=>setFactoryOpen(true)} style={{width:"100%",justifyContent:"center"}}>
              → Factory Run
            </Btn>
          </div>
          <div style={{padding:"10px 18px",fontFamily:"var(--mono)",fontSize:9,color:"var(--tm)",borderTop:"1px solid var(--b1)"}}>
            EVE PI TRACKER · v1.0
          </div>
        </nav>

        {/* MAIN */}
        <main style={{flex:1,overflow:"auto",background:"var(--void)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"18px 28px",borderBottom:"1px solid var(--b1)",background:"var(--deep)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div>
              <HUD style={{fontSize:16,letterSpacing:3,color:"var(--tp)"}}>{PAGES.find(p=>p.id===page)?.label}</HUD>
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--tm)",marginTop:3}}>{PAGE_SUB[page]}</div>
            </div>
            {page==="prices"&&<Btn sm variant="gold" onClick={handleRefreshPrices} disabled={refreshing}>{refreshing?"⟳ Syncing…":"⟳ Sync ESI"}</Btn>}
          </div>

          <div style={{flex:1,padding:24,overflowY:"auto"}}>
            {page==="stock"     && <StockPage     stock={stock} alerts={alerts} prices={prices} onCollect={()=>setCollectOpen(true)} onFactory={()=>setFactoryOpen(true)} onEditAlert={m=>setAlertModal(m)}/>}
            {page==="log"       && <LogPage       log={log}/>}
            {page==="analytics" && <AnalyticsPage log={log} stock={stock} prices={prices}/>}
            {page==="prices"    && <PricesPage    prices={prices} onRefresh={handleRefreshPrices} refreshing={refreshing}/>}
          </div>
        </main>
      </div>

      {loading && (
        <div style={{position:"fixed",inset:0,zIndex:3000,background:"var(--void)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <HUD style={{fontSize:13,color:"var(--acc)",letterSpacing:4}}>Loading…</HUD>
        </div>
      )}
      {collectOpen && <CollectModal onClose={()=>setCollectOpen(false)} onSubmit={handleCollect} stock={stock}/>}
      {factoryOpen && <FactoryModal onClose={()=>setFactoryOpen(false)} onSubmit={handleFactory} stock={stock}/>}
      {alertModal  && <AlertModal  material={alertModal} currentAlert={alerts[alertModal.id]} onClose={()=>setAlertModal(null)} onSave={handleAlertSave}/>}
    </>
  );
}
