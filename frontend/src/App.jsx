import { useState, useEffect, useCallback } from "react";
import { api } from "./api/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── COMPLETE PI MATERIAL LIST P1-P4 ─────────────────────────────────────────
const ALL_MATERIALS = [
  // P1
  { id:"bacteria",                    name:"Bacteria",                    typeId:2393,  tier:1 },
  { id:"biofuels",                    name:"Biofuels",                    typeId:2396,  tier:1 },
  { id:"biomass",                     name:"Biomass",                     typeId:3779,  tier:1 },
  { id:"chiral_structures",           name:"Chiral Structures",           typeId:2401,  tier:1 },
  { id:"electrolytes",                name:"Electrolytes",                typeId:2390,  tier:1 },
  { id:"industrial_fibers",           name:"Industrial Fibers",           typeId:2397,  tier:1 },
  { id:"oxidizing_compound",          name:"Oxidizing Compound",          typeId:2392,  tier:1 },
  { id:"oxygen",                      name:"Oxygen",                      typeId:3683,  tier:1 },
  { id:"plasmoids",                   name:"Plasmoids",                   typeId:2389,  tier:1 },
  { id:"precious_metals",             name:"Precious Metals",             typeId:2399,  tier:1 },
  { id:"proteins",                    name:"Proteins",                    typeId:2395,  tier:1 },
  { id:"reactive_metals",             name:"Reactive Metals",             typeId:2398,  tier:1 },
  { id:"silicon",                     name:"Silicon",                     typeId:9828,  tier:1 },
  { id:"toxic_metals",                name:"Toxic Metals",                typeId:2400,  tier:1 },
  { id:"water",                       name:"Water",                       typeId:3645,  tier:1 },
  // P2
  { id:"biocells",                    name:"Biocells",                    typeId:2329,  tier:2 },
  { id:"construction_blocks",         name:"Construction Blocks",         typeId:3828,  tier:2 },
  { id:"consumer_electronics",        name:"Consumer Electronics",        typeId:9836,  tier:2 },
  { id:"coolant",                     name:"Coolant",                     typeId:9832,  tier:2 },
  { id:"enriched_uranium",            name:"Enriched Uranium",            typeId:44,    tier:2 },
  { id:"fertilizer",                  name:"Fertilizer",                  typeId:3693,  tier:2 },
  { id:"gen_enhanced_livestock",      name:"Genetically Enhanced Livestock",typeId:15317,tier:2},
  { id:"livestock",                   name:"Livestock",                   typeId:3725,  tier:2 },
  { id:"mechanical_parts",            name:"Mechanical Parts",            typeId:3689,  tier:2 },
  { id:"microfiber_shielding",        name:"Microfiber Shielding",        typeId:2327,  tier:2 },
  { id:"miniature_electronics",       name:"Miniature Electronics",       typeId:9842,  tier:2 },
  { id:"nanites",                     name:"Nanites",                     typeId:2463,  tier:2 },
  { id:"oxides",                      name:"Oxides",                      typeId:2317,  tier:2 },
  { id:"polyaramids",                 name:"Polyaramids",                 typeId:2321,  tier:2 },
  { id:"polytextiles",                name:"Polytextiles",                typeId:3695,  tier:2 },
  { id:"rocket_fuel",                 name:"Rocket Fuel",                 typeId:9830,  tier:2 },
  { id:"silicate_glass",              name:"Silicate Glass",              typeId:3697,  tier:2 },
  { id:"superconductors",             name:"Superconductors",             typeId:9838,  tier:2 },
  { id:"supertensile_plastics",       name:"Supertensile Plastics",       typeId:2312,  tier:2 },
  { id:"synthetic_oil",               name:"Synthetic Oil",               typeId:3691,  tier:2 },
  { id:"test_cultures",               name:"Test Cultures",               typeId:2319,  tier:2 },
  { id:"transmitter",                 name:"Transmitter",                 typeId:9840,  tier:2 },
  { id:"viral_agent",                 name:"Viral Agent",                 typeId:3775,  tier:2 },
  { id:"water_cooled_cpu",            name:"Water-Cooled CPU",            typeId:2328,  tier:2 },
  // P3
  { id:"biotech_research_reports",    name:"Biotech Research Reports",    typeId:2358,  tier:3 },
  { id:"camera_drones",               name:"Camera Drones",               typeId:2345,  tier:3 },
  { id:"condensates",                 name:"Condensates",                 typeId:2344,  tier:3 },
  { id:"cryoprotectant_solution",     name:"Cryoprotectant Solution",     typeId:2367,  tier:3 },
  { id:"data_chips",                  name:"Data Chips",                  typeId:17392, tier:3 },
  { id:"gel_matrix_biopaste",         name:"Gel-Matrix Biopaste",         typeId:2348,  tier:3 },
  { id:"guidance_systems",            name:"Guidance Systems",            typeId:9834,  tier:3 },
  { id:"hazmat_detection_systems",    name:"Hazmat Detection Systems",    typeId:2366,  tier:3 },
  { id:"hermetic_membranes",          name:"Hermetic Membranes",          typeId:2361,  tier:3 },
  { id:"high_tech_transmitters",      name:"High-Tech Transmitters",      typeId:17898, tier:3 },
  { id:"industrial_explosives",       name:"Industrial Explosives",       typeId:2360,  tier:3 },
  { id:"neocoms",                     name:"Neocoms",                     typeId:2354,  tier:3 },
  { id:"nuclear_reactors",            name:"Nuclear Reactors",            typeId:2352,  tier:3 },
  { id:"planetary_vehicles",          name:"Planetary Vehicles",          typeId:9846,  tier:3 },
  { id:"robotics",                    name:"Robotics",                    typeId:9848,  tier:3 },
  { id:"smartfab_units",              name:"Smartfab Units",              typeId:2351,  tier:3 },
  { id:"supercomputers",              name:"Supercomputers",              typeId:2349,  tier:3 },
  { id:"synthetic_synapses",          name:"Synthetic Synapses",          typeId:2346,  tier:3 },
  { id:"transcranial_microcontrollers",name:"Transcranial Microcontrollers",typeId:12836,tier:3},
  { id:"ukomi_superconductors",       name:"Ukomi Super-Conductors",      typeId:17136, tier:3 },
  { id:"vaccines",                    name:"Vaccines",                    typeId:28974, tier:3 },
  // P4
  { id:"broadcast_node",              name:"Broadcast Node",              typeId:2867,  tier:4 },
  { id:"integrity_response_drones",   name:"Integrity Response Drones",   typeId:2868,  tier:4 },
  { id:"nano_factory",                name:"Nano-Factory",                typeId:2869,  tier:4 },
  { id:"organic_mortar_applicators",  name:"Organic Mortar Applicators",  typeId:2870,  tier:4 },
  { id:"recursive_computing_module",  name:"Recursive Computing Module",  typeId:2871,  tier:4 },
  { id:"self_harmonizing_power_core", name:"Self-Harmonizing Power Core", typeId:2872,  tier:4 },
  { id:"sterile_conduits",            name:"Sterile Conduits",            typeId:2875,  tier:4 },
  { id:"wetware_mainframe",           name:"Wetware Mainframe",           typeId:2876,  tier:4 },
];

// Lookup by name (case-insensitive) for paste import
const NAME_MAP = {};
ALL_MATERIALS.forEach(m => { NAME_MAP[m.name.toLowerCase()] = m.id; });

// Factory recipe — per run P1 costs for Wetware Mainframe
const FACTORY_RECIPES = {
  wetware_mainframe: {
    name: "Wetware Mainframe",
    typeId: 2876,
    p1PerRun: {
      reactive_metals: 23040, water: 23040, bacteria: 23040,
      toxic_metals: 15360, proteins: 15360, electrolytes: 15360,
      biofuels: 7680, chiral_structures: 7680, oxygen: 7680,
    },
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtISK = v => {
  if (v == null) return "—";
  const n = +v;
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return n.toFixed(0);
};

// Smart quantity formatter — scales to data, doesn't over-abbreviate
const fmtQty = v => {
  if (v == null || v === 0) return "0";
  const n = +v;
  if (n >= 1_000_000) return (n/1_000_000).toFixed(2)+"M";
  if (n >= 100_000)   return (n/1_000).toFixed(0)+"K";
  if (n >= 10_000)    return (n/1_000).toFixed(1)+"K";
  if (n >= 1_000)     return (n/1_000).toFixed(2)+"K";
  return n.toLocaleString();
};

// Y-axis tick formatter — rounds to sensible values
const fmtAxis = v => {
  if (v === 0) return "0";
  if (v >= 1_000_000) return (v/1_000_000).toFixed(1)+"M";
  if (v >= 1_000)     return (v/1_000).toFixed(0)+"K";
  return v.toString();
};

const fmtDate = iso => new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const matById = id => ALL_MATERIALS.find(m => m.id === id);

// ─── THEME DEFINITIONS ────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    void:"#050810", deep:"#070c18", panel:"#0b1220", card:"#0e1828",
    b1:"#1a3554", b2:"#1e4a7a", b3:"#2a6aaa",
    acc:"#00b4ff", adim:"#0070cc", aglow:"rgba(0,180,255,.12)",
    gold:"#d4960a", gdim:"#8a6208",
    grn:"#00e676", gdrk:"#009944",
    red:"#ff3344", rdim:"#881122",
    tp:"#ddeeff", ts:"#6699bb", tm:"#2a4a6a",
  },
  light: {
    void:"#f0f4f8", deep:"#e2eaf2", panel:"#d8e4ef", card:"#ffffff",
    b1:"#b0c8e0", b2:"#7aaac8", b3:"#4a88b8",
    acc:"#0070cc", adim:"#005099", aglow:"rgba(0,112,204,.12)",
    gold:"#9a6a00", gdim:"#c88a00",
    grn:"#007a3a", gdrk:"#005a28",
    red:"#cc1122", rdim:"#ee4455",
    tp:"#0a1a2a", ts:"#2a4a6a", tm:"#6a8aaa",
  },
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function GlobalStyles({ theme }) {
  const T = THEMES[theme] || THEMES.dark;
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --void:${T.void};--deep:${T.deep};--panel:${T.panel};--card:${T.card};
  --b1:${T.b1};--b2:${T.b2};--b3:${T.b3};
  --acc:${T.acc};--adim:${T.adim};--aglow:${T.aglow};
  --gold:${T.gold};--gdim:${T.gdim};
  --grn:${T.grn};--gdrk:${T.gdrk};
  --red:${T.red};--rdim:${T.rdim};
  --tp:${T.tp};--ts:${T.ts};--tm:${T.tm};
  --hud:'Orbitron',sans-serif;--mono:'Share Tech Mono',monospace;--body:'Exo 2',sans-serif;
}
html,body{background:var(--void);color:var(--tp);font-family:var(--body);min-height:100vh;transition:background .2s,color .2s}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--deep)}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
input,select,textarea{
  font-family:var(--body);background:var(--deep);border:1px solid var(--b1);
  color:var(--tp);padding:7px 10px;border-radius:3px;outline:none;
  transition:border-color .15s,background .2s;width:100%;font-size:13px;
}
input:focus,select:focus,textarea:focus{border-color:var(--acc);box-shadow:0 0 0 2px var(--aglow)}
select option{background:var(--deep)}
button{font-family:var(--body);cursor:pointer;border:none;outline:none;transition:all .15s}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
.fade{animation:fadeUp .2s ease}
    `}</style>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const HUD = ({children,style={}}) => (
  <span style={{fontFamily:"var(--hud)",textTransform:"uppercase",letterSpacing:"2px",...style}}>{children}</span>
);

const Btn = ({children,onClick,variant="ghost",sm,disabled,style={}}) => {
  const base={display:"inline-flex",alignItems:"center",gap:6,padding:sm?"5px 12px":"8px 18px",
    borderRadius:3,fontSize:sm?11:13,fontWeight:500,letterSpacing:".4px",
    fontFamily:"var(--body)",opacity:disabled?.4:1,cursor:disabled?"not-allowed":"pointer"};
  const V={
    primary:{background:"var(--adim)",color:"var(--tp)",border:"1px solid var(--acc)"},
    ghost:  {background:"transparent",color:"var(--ts)",border:"1px solid var(--b1)"},
    green:  {background:"rgba(0,230,118,.1)",color:"var(--grn)",border:"1px solid var(--gdrk)"},
    danger: {background:"rgba(255,51,68,.08)",color:"var(--red)",border:"1px solid var(--rdim)"},
    gold:   {background:"rgba(212,150,10,.12)",color:"var(--gold)",border:"1px solid var(--gdim)"},
  };
  return (
    <button disabled={disabled} style={{...base,...V[variant],...style}} onClick={onClick}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.filter="brightness(1.25)";e.currentTarget.style.boxShadow="0 0 10px rgba(0,180,255,.15)"}}}
      onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.boxShadow=""}}
    >{children}</button>
  );
};

const Card = ({children,style={},alert}) => (
  <div style={{background:"var(--card)",borderRadius:4,padding:18,
    border:alert?"1px solid var(--rdim)":"1px solid var(--b1)",
    position:"relative",overflow:"hidden",...style}}>
    {alert && <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:"var(--red)"}}/>}
    {children}
  </div>
);

const Modal = ({title,onClose,children,width=520,accentColor="var(--acc)"}) => (
  <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(5,8,16,.92)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
    onClick={onClose}>
    <div className="fade" style={{width,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",
      background:"var(--panel)",border:`1px solid ${accentColor}`,borderRadius:4,
      boxShadow:`0 0 60px ${accentColor}33`}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"14px 18px",borderBottom:"1px solid var(--b1)"}}>
        <HUD style={{fontSize:11,color:accentColor}}>{title}</HUD>
        <button onClick={onClose} style={{background:"none",border:"1px solid var(--b1)",
          color:"var(--ts)",borderRadius:3,padding:"2px 9px",cursor:"pointer",fontSize:16,lineHeight:1.4}}>✕</button>
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
  <div className="fade" style={{position:"fixed",top:20,right:20,zIndex:2000,
    background:"var(--panel)",border:`1px solid ${color}`,
    borderRadius:4,padding:"10px 18px",fontFamily:"var(--mono)",fontSize:12,color,
    boxShadow:`0 0 24px ${color}44`,maxWidth:420}}>{msg}</div>
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

const TierBadge = ({tier}) => {
  const colors = {1:"#00e676",2:"#00b4ff",3:"#d4960a",4:"#ff3344"};
  const col = colors[tier] || "#888";
  return (
    <span style={{fontSize:10,fontFamily:"var(--mono)",padding:"1px 7px",borderRadius:2,
      background:`${col}22`,border:`1px solid ${col}55`,color:col}}>P{tier}</span>
  );
};

// ─── PARSE EVE PASTE ─────────────────────────────────────────────────────────
function parseEvePaste(text) {
  const matched = [], skipped = [];
  text.trim().split("\n").forEach(line => {
    const parts = line.trim().split("\t");
    if (parts.length < 2) return;
    const rawName = parts[0].trim();
    const rawQty  = parts[1].trim().replace(/,/g,"");
    const qty     = parseInt(rawQty, 10);
    const id      = NAME_MAP[rawName.toLowerCase()];
    if (!id)              { skipped.push({name:rawName, reason:"not a tracked PI material"}); return; }
    if (isNaN(qty)||qty<0){ skipped.push({name:rawName, reason:"invalid quantity"}); return; }
    matched.push({matId:id, qty});
  });
  return {matched, skipped};
}

// ─── FIRST LAUNCH WELCOME ─────────────────────────────────────────────────────
function WelcomeScreen({onSetup}) {
  const [pasted, setPasted] = useState("");
  const [parsed, setParsed] = useState(null);
  const [note,   setNote]   = useState("Initial stock setup");

  function handlePaste(text) {
    setPasted(text);
    setParsed(text.trim() ? parseEvePaste(text) : null);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"var(--void)",padding:24}}>
      <div className="fade" style={{maxWidth:600,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"var(--hud)",fontSize:24,color:"var(--acc)",
            letterSpacing:4,marginBottom:8}}>EVE-KRAB</div>
          <div style={{fontFamily:"var(--hud)",fontSize:11,color:"var(--tm)",
            letterSpacing:3,marginBottom:20}}>PI TRACKER</div>
          <div style={{fontSize:14,color:"var(--ts)",lineHeight:1.7}}>
            Welcome. To get started, copy your PI materials from your EVE inventory
            and paste them below to set your initial stock levels.
          </div>
        </div>

        <Card>
          <Field label="Paste from EVE inventory (Name [tab] Quantity per line)">
            <textarea value={pasted} onChange={e=>handlePaste(e.target.value)} rows={10}
              placeholder={"Bacteria\t593440\nBiofuels\t235432\nReactive Metals\t381100\n..."}
              style={{fontFamily:"var(--mono)",fontSize:12,resize:"vertical",lineHeight:1.6}}
            />
          </Field>

          {parsed && parsed.matched.length > 0 && (
            <div style={{marginTop:14}}>
              <HUD style={{fontSize:9,color:"var(--grn)",display:"block",marginBottom:8}}>
                ✓ {parsed.matched.length} materials recognised
              </HUD>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:4,marginBottom:12}}>
                {parsed.matched.map(e => {
                  const m = matById(e.matId);
                  return (
                    <div key={e.matId} style={{padding:"5px 8px",borderRadius:3,fontSize:12,
                      background:"rgba(0,230,118,.06)",border:"1px solid var(--gdrk)",
                      display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:"var(--tp)"}}>{m?.name}</span>
                      <span style={{fontFamily:"var(--mono)",color:"var(--grn)"}}>{fmtQty(e.qty)}</span>
                    </div>
                  );
                })}
              </div>
              {parsed.skipped.length > 0 && (
                <div style={{fontSize:11,color:"var(--tm)",marginBottom:12}}>
                  ⊘ {parsed.skipped.length} line{parsed.skipped.length>1?"s":""} skipped
                  ({parsed.skipped.map(s=>s.name).join(", ")})
                </div>
              )}
            </div>
          )}

          <Field label="Note">
            <input value={note} onChange={e=>setNote(e.target.value)} />
          </Field>

          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={()=>onSetup([],"Skip — start with empty stock")} style={{
              background:"none",border:"none",color:"var(--tm)",fontSize:12,
              cursor:"pointer",fontFamily:"var(--mono)"}}>
              Skip — start with empty stock →
            </button>
            <Btn variant="primary" onClick={()=>parsed?.matched?.length && onSetup(parsed.matched, note)}
              disabled={!parsed?.matched?.length}>
              Set Initial Stock
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── COLLECT MODAL ────────────────────────────────────────────────────────────
function CollectModal({onClose, onSubmit, stock}) {
  const [tab,      setTab]      = useState("paste");
  const [pasted,   setPasted]   = useState("");
  const [parsed,   setParsed]   = useState(null);
  const [setTotal, setSetTotal] = useState(false);
  const [note,     setNote]     = useState("");
  // Manual tab
  const [qtys, setQtys] = useState({});

  const stockedMats = ALL_MATERIALS.filter(m => (stock[m.id]||0) > 0);
  const allMats = ALL_MATERIALS;

  function handlePasteChange(text) {
    setPasted(text);
    setParsed(text.trim() ? parseEvePaste(text) : null);
  }

  function applyParsed() {
    if (!parsed?.matched?.length) return;
    const next = {...qtys};
    parsed.matched.forEach(e => { next[e.matId] = String(e.qty); });
    setQtys(next);
    setTab("manual");
    setPasted(""); setParsed(null);
  }

  function submit() {
    const entries = ALL_MATERIALS
      .filter(m => qtys[m.id] && +qtys[m.id] > 0)
      .map(m => ({matId:m.id, qty:+qtys[m.id]}));
    if (!entries.length) return;
    onSubmit({type:"collect", entries, note, setAsTotal:setTotal});
    onClose();
  }

  const anyFilled = Object.values(qtys).some(v => v && +v > 0);
  const filledCount = Object.values(qtys).filter(v => v && +v > 0).length;

  const tabBtn = id => ({
    padding:"6px 16px",borderRadius:"3px 3px 0 0",fontSize:12,fontWeight:500,
    fontFamily:"var(--body)",cursor:"pointer",border:"none",
    background:tab===id?"var(--card)":"transparent",
    color:tab===id?"var(--grn)":"var(--tm)",
    borderBottom:tab===id?"2px solid var(--grn)":"2px solid transparent",
  });

  return (
    <Modal title="Log Collection Run" onClose={onClose} width={600} accentColor="var(--grn)">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:4,borderBottom:"1px solid var(--b1)",marginBottom:4}}>
          <button style={tabBtn("paste")}  onClick={()=>setTab("paste")}>⧉ Paste from EVE</button>
          <button style={tabBtn("manual")} onClick={()=>setTab("manual")}>✎ Manual Entry</button>
        </div>

        {/* PASTE TAB */}
        {tab==="paste" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:12,color:"var(--ts)",lineHeight:1.6}}>
              Copy items from your EVE inventory and paste below.
              Format: <span style={{fontFamily:"var(--mono)",color:"var(--acc)"}}>Name[tab]Quantity</span> per line.
            </div>
            <textarea value={pasted} onChange={e=>handlePasteChange(e.target.value)}
              placeholder={"Bacteria\t593440\nReactive Metals\t381100\nWetware Mainframe\t450\n..."}
              rows={9} style={{fontFamily:"var(--mono)",fontSize:12,resize:"vertical",lineHeight:1.6}}
            />
            {parsed && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {parsed.matched.length > 0 && (
                  <div>
                    <HUD style={{fontSize:9,color:"var(--grn)",display:"block",marginBottom:6}}>
                      ✓ {parsed.matched.length} PI material{parsed.matched.length>1?"s":""} recognised
                    </HUD>
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      {parsed.matched.map(e=>{
                        const m = matById(e.matId);
                        const cur = stock[e.matId]||0;
                        return (
                          <div key={e.matId} style={{display:"grid",gridTemplateColumns:"1fr 80px 90px",
                            gap:8,padding:"6px 10px",borderRadius:3,fontSize:12,
                            background:"rgba(0,230,118,.06)",border:"1px solid var(--gdrk)"}}>
                            <div>
                              <span style={{color:"var(--tp)",fontWeight:500}}>{m?.name}</span>
                              <span style={{marginLeft:6}}><TierBadge tier={m?.tier}/></span>
                            </div>
                            <span style={{fontFamily:"var(--mono)",color:"var(--grn)",textAlign:"right"}}>
                              {setTotal ? fmtQty(e.qty) : `+${fmtQty(e.qty)}`}
                            </span>
                            <span style={{fontFamily:"var(--mono)",color:"var(--tm)",textAlign:"right",fontSize:11}}>
                              → {fmtQty(setTotal ? e.qty : cur+e.qty)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {parsed.skipped.length > 0 && (
                  <div>
                    <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:4}}>
                      ⊘ {parsed.skipped.length} line{parsed.skipped.length>1?"s":""} ignored
                    </HUD>
                    {parsed.skipped.map((s,i)=>(
                      <div key={i} style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--tm)",
                        padding:"3px 8px"}}>{s.name} — {s.reason}</div>
                    ))}
                  </div>
                )}
                {parsed.matched.length > 0 && (
                  <Btn variant="green" onClick={applyParsed} style={{alignSelf:"flex-end"}}>
                    Review &amp; confirm in manual →
                  </Btn>
                )}
              </div>
            )}
          </div>
        )}

        {/* MANUAL TAB */}
        {tab==="manual" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <HUD style={{fontSize:9,color:"var(--tm)"}}>Enter quantities — leave blank to skip</HUD>
              {anyFilled && (
                <button onClick={()=>setQtys({})} style={{background:"none",border:"none",
                  color:"var(--tm)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>
                  clear all
                </button>
              )}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:400,overflowY:"auto"}}>
              {ALL_MATERIALS.map(m => {
                const val    = qtys[m.id] || "";
                const hasVal = val !== "" && +val > 0;
                const cur    = stock[m.id] || 0;
                return (
                  <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 100px",
                    alignItems:"center",gap:8,padding:"6px 10px",borderRadius:3,
                    background:hasVal?"rgba(0,230,118,.06)":"var(--deep)",
                    border:`1px solid ${hasVal?"var(--gdrk)":"var(--b1)"}`,transition:"all .15s"}}>
                    <div>
                      <span style={{fontSize:12,fontWeight:500,color:hasVal?"var(--tp)":"var(--ts)",marginRight:6}}>
                        {m.name}
                      </span>
                      <TierBadge tier={m.tier}/>
                      <div style={{fontSize:10,color:"var(--tm)",fontFamily:"var(--mono)"}}>
                        current: {fmtQty(cur)}
                      </div>
                    </div>
                    <input type="number" min="0" placeholder="qty" value={val}
                      onChange={e=>setQtys(p=>({...p,[m.id]:e.target.value}))}
                      style={{textAlign:"right",fontSize:13,fontFamily:"var(--mono)",
                        borderColor:hasVal?"var(--gdrk)":"var(--b1)",
                        color:hasVal?"var(--grn)":"var(--ts)"}}
                    />
                    <div style={{textAlign:"right",fontSize:11,fontFamily:"var(--mono)",
                      color:hasVal?"var(--grn)":"var(--tm)"}}>
                      {hasVal ? `→ ${fmtQty(setTotal ? +val : cur+(+val))}` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Set as total toggle */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
          background:"var(--deep)",borderRadius:3,border:"1px solid var(--b1)"}}>
          <button onClick={()=>setSetTotal(t=>!t)} style={{
            width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",
            background:setTotal?"var(--acc)":"var(--b1)",position:"relative",
            transition:"background .2s",flexShrink:0,
          }}>
            <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",
              position:"absolute",top:3,transition:"left .2s",
              left:setTotal?18:3}}/>
          </button>
          <div>
            <div style={{fontSize:12,color:setTotal?"var(--acc)":"var(--ts)",fontWeight:500}}>
              {setTotal ? "Set as new total" : "Add to existing stock"}
            </div>
            <div style={{fontSize:11,color:"var(--tm)"}}>
              {setTotal
                ? "Replaces current stock — use when pasting a full inventory count"
                : "Adds to current stock — use when logging a collection run"}
            </div>
          </div>
        </div>

        <Field label="Note">
          <input value={note} onChange={e=>setNote(e.target.value)}
            placeholder="e.g. Full collection — all 14 chars" />
        </Field>

        {tab==="manual" && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"10px 14px",background:"var(--deep)",borderRadius:3,border:"1px solid var(--b1)"}}>
            <div style={{fontSize:12,color:"var(--ts)"}}>
              {filledCount===0?"No quantities entered":`${filledCount} material${filledCount>1?"s":""} to log`}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
              <Btn variant="green" onClick={submit} disabled={!anyFilled}>Confirm</Btn>
            </div>
          </div>
        )}

        {tab==="paste" && parsed?.matched?.length > 0 && (
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="green" onClick={()=>{
              onSubmit({type:"collect", entries:parsed.matched.map(e=>({matId:e.matId,qty:e.qty})),
                note, setAsTotal:setTotal});
              onClose();
            }}>Confirm {parsed.matched.length} Items</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── FACTORY MODAL ────────────────────────────────────────────────────────────
function FactoryModal({onClose, onSubmit, stock}) {
  const [recipeId, setRecipeId] = useState("wetware_mainframe");
  const [runs,     setRuns]     = useState(1);
  const [note,     setNote]     = useState("");

  const recipe  = FACTORY_RECIPES[recipeId];
  const numRuns = Math.max(0, Math.floor(+runs)||0);

  const breakdown = Object.entries(recipe.p1PerRun)
    .filter(([,perRun]) => perRun > 0)
    .map(([id, perRun]) => {
      const total = perRun * numRuns;
      const cur   = stock[id] || 0;
      const after = cur - total;
      return { mat:matById(id), id, perRun, total, cur, after, short: total>0 && after<0 };
    });

  const anyShort = breakdown.some(b => b.short);
  const maxRuns  = breakdown.length > 0
    ? Math.min(...breakdown.filter(b=>b.perRun>0).map(b=>Math.floor((stock[b.id]||0)/b.perRun)))
    : 0;

  function submit() {
    if (!numRuns) return;
    const entries = breakdown.map(b => ({matId:b.id, qty:-b.total}));
    onSubmit({type:"factory", recipe:recipeId, runs:numRuns, entries, note});
    onClose();
  }

  return (
    <Modal title="Log Factory Run" onClose={onClose} width={580} accentColor="var(--red)">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Product">
            <select value={recipeId} onChange={e=>setRecipeId(e.target.value)}>
              {Object.entries(FACTORY_RECIPES).map(([k,v])=>(
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Number of Factory Runs">
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="number" min="1" value={runs} onChange={e=>setRuns(e.target.value)}
                style={{fontFamily:"var(--mono)",fontSize:18,textAlign:"center"}} />
              {maxRuns>0 && (
                <button onClick={()=>setRuns(maxRuns)} style={{
                  background:"rgba(0,180,255,.1)",border:"1px solid var(--b2)",color:"var(--acc)",
                  borderRadius:3,padding:"5px 10px",fontSize:11,fontFamily:"var(--mono)",
                  cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                  max ({maxRuns})
                </button>
              )}
            </div>
          </Field>
        </div>

        <div>
          <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:8}}>
            Material Deduction — {numRuns} run{numRuns!==1?"s":""} of {recipe.name}
          </HUD>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 90px 80px",
              gap:8,padding:"4px 10px"}}>
              {["Material","Per Run","Total","In Stock","After"].map(h=>(
                <HUD key={h} style={{fontSize:8,color:"var(--tm)",
                  textAlign:h!=="Material"?"right":"left"}}>{h}</HUD>
              ))}
            </div>
            {breakdown.map(b=>(
              <div key={b.id} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 90px 80px",
                gap:8,padding:"7px 10px",borderRadius:3,alignItems:"center",
                background:b.short?"rgba(255,51,68,.08)":"var(--deep)",
                border:`1px solid ${b.short?"var(--rdim)":"var(--b1)"}`}}>
                <div style={{fontSize:13,color:b.short?"var(--red)":"var(--tp)",fontWeight:500}}>
                  {b.short&&"⚠ "}{b.mat?.name}
                </div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--tm)",textAlign:"right"}}>
                  {fmtQty(b.perRun)}
                </div>
                <div style={{fontFamily:"var(--mono)",fontSize:13,
                  color:b.short?"var(--red)":"var(--tp)",textAlign:"right",fontWeight:500}}>
                  {numRuns>0?fmtQty(b.total):"—"}
                </div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--ts)",textAlign:"right"}}>
                  {fmtQty(b.cur)}
                </div>
                <div style={{fontFamily:"var(--mono)",fontSize:13,textAlign:"right",fontWeight:500,
                  color:b.short?"var(--red)":b.after<b.cur*.2?"var(--gold)":"var(--grn)"}}>
                  {numRuns>0?fmtQty(b.after):"—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {anyShort && (
          <div style={{padding:"10px 14px",background:"rgba(255,51,68,.08)",
            border:"1px solid var(--rdim)",borderRadius:3,
            fontSize:12,color:"var(--red)",fontFamily:"var(--mono)"}}>
            ⚠ Insufficient stock for {numRuns} run{numRuns>1?"s":""}. Max with current stock: {maxRuns}.
          </div>
        )}

        <Field label="Note">
          <input value={note} onChange={e=>setNote(e.target.value)}
            placeholder="e.g. Factory run #15" />
        </Field>

        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant={anyShort?"gold":"danger"} onClick={submit} disabled={numRuns<1}>
            {anyShort?`Log Anyway (${maxRuns} max)`:`Confirm — ${numRuns} Run${numRuns>1?"s":""}`}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── ALERT MODAL ──────────────────────────────────────────────────────────────
function AlertModal({material, currentAlert, onClose, onSave}) {
  const [val, setVal] = useState(currentAlert||"");
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

// ─── STOCK PAGE ───────────────────────────────────────────────────────────────
function StockPage({stock, alerts, prices, priceLabel, onCollect, onFactory, onEditAlert}) {
  const stocked = ALL_MATERIALS.filter(m => (stock[m.id]||0) > 0);
  const byTier  = [1,2,3,4].map(t => ({tier:t, items:stocked.filter(m=>m.tier===t)}))
                            .filter(g => g.items.length > 0);

  const totalValue = stocked.reduce((s,m) => {
    const p = prices[m.typeId];
    return s + (p ? p.adj*(stock[m.id]||0) : 0);
  },0);
  const lowCount = stocked.filter(m => (alerts[m.id]||0)>0 && (stock[m.id]||0)<(alerts[m.id]||0)).length;

  if (stocked.length === 0) {
    return (
      <div className="fade" style={{display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",minHeight:400,gap:16}}>
        <div style={{fontFamily:"var(--hud)",fontSize:12,color:"var(--tm)",letterSpacing:3}}>
          NO STOCK TRACKED
        </div>
        <div style={{fontSize:13,color:"var(--ts)",textAlign:"center",maxWidth:360}}>
          Use the Log Collection button to add your first items, or paste your inventory from EVE.
        </div>
        <Btn variant="green" onClick={onCollect}>＋ Log Collection</Btn>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        {[
          {label:"Total Stock Value", val:fmtISK(totalValue)+" ISK", col:"var(--gold)"},
          {label:"Materials Tracked", val:stocked.length,             col:"var(--acc)"},
          {label:"Low Stock Alerts",  val:lowCount,                   col:lowCount>0?"var(--red)":"var(--grn)"},
        ].map(s=>(
          <Card key={s.label}>
            <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:8}}>{s.label}</HUD>
            <div style={{fontFamily:"var(--hud)",fontSize:24,color:s.col,lineHeight:1}}>{s.val}</div>
          </Card>
        ))}
      </div>

      {byTier.map(({tier, items}) => (
        <div key={tier} style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <TierBadge tier={tier}/>
            <HUD style={{fontSize:9,color:"var(--tm)"}}>
              {["","Processed Materials","Refined Commodities","Specialized Commodities","Advanced Commodities"][tier]}
              {" — "}{items.length} item{items.length>1?"s":""}
            </HUD>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
            {items.map(m => {
              const qty   = stock[m.id]||0;
              const alert = alerts[m.id]||0;
              const price = prices[m.typeId];
              const val   = price ? price.adj*qty : null;
              const isLow = alert>0 && qty<alert;
              return (
                <Card key={m.id} alert={isLow} style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{fontSize:14,fontWeight:500}}>{m.name}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      {isLow && <span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--red)",
                        background:"rgba(255,51,68,.1)",border:"1px solid var(--rdim)",
                        padding:"2px 7px",borderRadius:2}}>LOW</span>}
                      <Btn sm variant="ghost" onClick={()=>onEditAlert(m)}>⚙</Btn>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    <div style={{background:"var(--deep)",padding:"8px 10px",borderRadius:3}}>
                      <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:3}}>STOCK</HUD>
                      <div style={{fontFamily:"var(--mono)",fontSize:16,
                        color:isLow?"var(--red)":"var(--acc)"}}>{fmtQty(qty)}</div>
                      {alert>0 && <div style={{fontSize:10,color:"var(--tm)"}}>min {fmtQty(alert)}</div>}
                      <StockBar stock={qty} alert={alert}/>
                    </div>
                    <div style={{background:"var(--deep)",padding:"8px 10px",borderRadius:3}}>
                      <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:3}}>
                        {priceLabel}
                      </HUD>
                      <div style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--gold)"}}>
                        {price?fmtISK(price.adj):"—"}
                      </div>
                    </div>
                    <div style={{background:"var(--deep)",padding:"8px 10px",borderRadius:3}}>
                      <HUD style={{fontSize:9,color:"var(--tm)",display:"block",marginBottom:3}}>VALUE</HUD>
                      <div style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--gold)"}}>
                        {val!=null?fmtISK(val):"—"}
                      </div>
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
      ))}
    </div>
  );
}

// ─── LOG PAGE ─────────────────────────────────────────────────────────────────
function LogPage({log}) {
  const [filter, setFilter] = useState("all");
  const filtered = filter==="all" ? log : log.filter(l=>l.type===filter);

  const TS = {
    collect:   {color:"var(--grn)",label:"COLLECT",  bg:"rgba(0,230,118,.08)",  border:"rgba(0,153,68,.4)"},
    factory:   {color:"var(--red)",label:"FACTORY",  bg:"rgba(255,51,68,.08)",  border:"rgba(136,17,34,.4)"},
    adjust:    {color:"var(--acc)",label:"ADJUST",   bg:"rgba(0,180,255,.08)",  border:"rgba(0,112,204,.4)"},
    set_total: {color:"var(--gold)",label:"SET TOTAL",bg:"rgba(212,150,10,.08)",border:"rgba(138,98,8,.4)"},
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
            {filtered.length===0 ? (
              <tr><td colSpan={4} style={{padding:40,textAlign:"center",color:"var(--tm)"}}>No entries</td></tr>
            ) : filtered.map(entry => {
              const ts = TS[entry.type] || TS.adjust;
              let summary;
              if (entry.type==="factory") {
                const r = FACTORY_RECIPES[entry.recipe];
                summary = `${entry.runs}× run${entry.runs>1?"s":""} → ${r?.name||entry.recipe}`;
              } else {
                summary = (entry.entries||[]).slice(0,4).map(e=>{
                  const m = matById(e.matId);
                  return `${m?.name||e.matId}: ${e.qty>0?"+":""}${fmtQty(e.qty)}`;
                }).join(" · ");
                if ((entry.entries||[]).length > 4)
                  summary += ` + ${(entry.entries||[]).length-4} more`;
              }
              return (
                <tr key={entry.id} style={{borderBottom:"1px solid var(--b1)"}}>
                  <td style={{padding:"9px 14px",fontFamily:"var(--mono)",fontSize:11,
                    color:"var(--tm)",whiteSpace:"nowrap"}}>{fmtDate(entry.date)}</td>
                  <td style={{padding:"9px 14px"}}>
                    <span style={{fontFamily:"var(--mono)",fontSize:11,padding:"2px 8px",
                      borderRadius:2,color:ts.color,background:ts.bg,
                      border:`1px solid ${ts.border}`}}>{ts.label}</span>
                  </td>
                  <td style={{padding:"9px 14px",fontSize:12,color:"var(--ts)",maxWidth:380}}>{summary}</td>
                  <td style={{padding:"9px 14px",fontSize:12,color:"var(--tm)"}}>{entry.note||"—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function AnalyticsPage({log, stock, prices}) {
  const [days,      setDays]      = useState(14);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    api.getDaily(days).then(setChartData).catch(()=>setChartData([]));
  }, [days]);

  const stocked = ALL_MATERIALS.filter(m => (stock[m.id]||0) > 0);

  const collectTotals = stocked.map(m => ({
    name: m.name.length > 12 ? m.name.split(" ").slice(-1)[0] : m.name,
    collected:   log.filter(l=>l.type==="collect").flatMap(l=>l.entries||[])
                   .filter(e=>e.matId===m.id).reduce((s,e)=>s+Math.max(0,e.qty),0),
    sentFactory: log.filter(l=>l.type==="factory").flatMap(l=>l.entries||[])
                   .filter(e=>e.matId===m.id).reduce((s,e)=>s+Math.abs(e.qty),0),
  })).filter(m => m.collected>0 || m.sentFactory>0);

  const valueData = stocked.map(m => {
    const p = prices[m.typeId];
    return {name:m.name.split(" ").slice(-1)[0], value:p?Math.round(p.adj*(stock[m.id]||0)):0};
  }).filter(m=>m.value>0).sort((a,b)=>b.value-a.value);

  // Smart domain for chart Y axis
  const maxUnits = chartData.length ? Math.max(...chartData.map(d=>d.units)) : 0;
  const yDomain  = [0, Math.ceil(maxUnits * 1.15 / 1000) * 1000 || 10000];

  const ChartTip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{background:"var(--panel)",border:"1px solid var(--b2)",borderRadius:3,
        padding:"8px 12px",fontSize:12}}>
        <HUD style={{fontSize:9,color:"var(--acc)",display:"block",marginBottom:4}}>{label}</HUD>
        {payload.map(p=>(
          <div key={p.name} style={{fontFamily:"var(--mono)",color:p.color||"var(--tp)"}}>
            {p.name}: {fmtQty(p.value)}
          </div>
        ))}
      </div>
    );
  };

  const Empty = ({h=210}) => (
    <div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",
      color:"var(--tm)",fontFamily:"var(--mono)",fontSize:12}}>
      No data yet — log your first collection run
    </div>
  );

  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:20}}>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          marginBottom:14,paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>
          <HUD style={{fontSize:10,color:"var(--acc)"}}>Daily Collection Volume</HUD>
          <div style={{display:"flex",gap:6}}>
            {[7,14].map(d=>(
              <Btn key={d} sm variant={days===d?"primary":"ghost"} onClick={()=>setDays(d)}>{d}D</Btn>
            ))}
          </div>
        </div>
        {chartData.length===0 ? <Empty/> : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{top:4,right:8,left:-10,bottom:0}}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0070cc" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0070cc" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)"/>
              <XAxis dataKey="day" tick={{fill:"var(--tm)",fontSize:10}}/>
              <YAxis domain={yDomain} tick={{fill:"var(--tm)",fontSize:10}} tickFormatter={fmtAxis}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="units" name="units" stroke="var(--acc)"
                strokeWidth={2} fill="url(#ag)" dot={{fill:"var(--acc)",r:3}} activeDot={{r:5}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card>
          <HUD style={{fontSize:10,color:"var(--acc)",display:"block",marginBottom:14,
            paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>Collected vs Factory</HUD>
          {collectTotals.length===0 ? <Empty h={220}/> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={collectTotals} margin={{top:4,right:4,left:-10,bottom:20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)"/>
                <XAxis dataKey="name" tick={{fill:"var(--tm)",fontSize:10}} angle={-35} textAnchor="end"/>
                <YAxis tick={{fill:"var(--tm)",fontSize:10}} tickFormatter={fmtAxis}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="collected"   name="Collected"  fill="#006699" radius={[2,2,0,0]}/>
                <Bar dataKey="sentFactory" name="→ Factory"  fill="#882222" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card>
          <HUD style={{fontSize:10,color:"var(--gold)",display:"block",marginBottom:14,
            paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>Stock Value by Material</HUD>
          {valueData.length===0 ? <Empty h={220}/> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={valueData} layout="vertical" margin={{top:4,right:20,left:60,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)" horizontal={false}/>
                <XAxis type="number" tick={{fill:"var(--tm)",fontSize:10}} tickFormatter={fmtISK}/>
                <YAxis type="category" dataKey="name" tick={{fill:"var(--ts)",fontSize:11}}/>
                <Tooltip content={({active,payload})=>active&&payload?.length?(
                  <div style={{background:"var(--panel)",border:"1px solid var(--b2)",
                    borderRadius:3,padding:"8px 12px",fontFamily:"var(--mono)",
                    fontSize:12,color:"var(--gold)"}}>{fmtISK(payload[0].value)} ISK</div>
                ):null}/>
                <Bar dataKey="value" fill="var(--gdim)" radius={[0,2,2,0]} activeBar={{fill:"var(--gold)"}}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── PRICES PAGE ──────────────────────────────────────────────────────────────
function PricesPage({prices, priceLabel, onRefresh, refreshing}) {
  const stocked = ALL_MATERIALS.filter(m => prices[m.typeId]);

  return (
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:12,color:"var(--tm)",fontFamily:"var(--mono)"}}>
          {priceLabel} · auto-syncs hourly · {stocked.length} items priced
        </div>
        <Btn variant="gold" sm onClick={onRefresh} disabled={refreshing}>
          {refreshing?"⟳ Syncing…":"⟳ Sync Now"}
        </Btn>
      </div>
      {stocked.length===0 ? (
        <Card>
          <div style={{textAlign:"center",padding:40,color:"var(--tm)",fontFamily:"var(--mono)",fontSize:12}}>
            No prices yet — add stock first, then sync prices.
          </div>
        </Card>
      ) : (
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"var(--deep)"}}>
                {["Material","Tier","Type ID",priceLabel,"Spread"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"10px 14px",borderBottom:"1px solid var(--b1)"}}>
                    <HUD style={{fontSize:9,color:"var(--tm)"}}>{h}</HUD>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocked.map(m=>{
                const p = prices[m.typeId];
                const spread = p&&p.avg&&p.adj ? ((p.avg-p.adj)/p.adj*100).toFixed(1) : null;
                return (
                  <tr key={m.id} style={{borderBottom:"1px solid var(--b1)"}}>
                    <td style={{padding:"10px 14px",fontWeight:500}}>{m.name}</td>
                    <td style={{padding:"10px 14px"}}><TierBadge tier={m.tier}/></td>
                    <td style={{padding:"10px 14px",fontFamily:"var(--mono)",color:"var(--tm)",fontSize:12}}>
                      {m.typeId}
                    </td>
                    <td style={{padding:"10px 14px",fontFamily:"var(--mono)",color:"var(--gold)",fontSize:15}}>
                      {p?fmtISK(p.adj):"—"}
                    </td>
                    <td style={{padding:"10px 14px",fontFamily:"var(--mono)",fontSize:12,
                      color:spread&&Math.abs(+spread)>2?"var(--gold)":"var(--tm)"}}>
                      {spread!=null?`${spread}%`:"—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({priceSettings, onSaveSettings, theme, onToggleTheme}) {
  const [hub,   setHub]   = useState(priceSettings.hub);
  const [ptype, setPtype] = useState(priceSettings.type);
  const [saved, setSaved] = useState(false);

  async function save() {
    await onSaveSettings(hub, ptype);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  }

  const HUBS = [
    {id:"jita",    label:"Jita 4-4",          sub:"The Forge — primary market"},
    {id:"amarr",   label:"Amarr VIII",         sub:"Domain — Amarr trade hub"},
    {id:"dodixie", label:"Dodixie IX",         sub:"Sinq Laison — Gallente hub"},
    {id:"hek",     label:"Hek VIII",           sub:"Metropolis — Minmatar hub"},
  ];
  const TYPES = [
    {id:"lowest_sell", label:"Lowest Sell",   sub:"Cheapest sell order — what you pay to buy"},
    {id:"highest_buy", label:"Highest Buy",   sub:"Best buy order — what you get selling immediately"},
    {id:"split",       label:"Jita Split",    sub:"Midpoint between sell and buy — fair market value"},
  ];

  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:20,maxWidth:640}}>

      {/* Price hub */}
      <Card>
        <HUD style={{fontSize:10,color:"var(--acc)",display:"block",marginBottom:16,
          paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>Trade Hub</HUD>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {HUBS.map(h=>(
            <div key={h.id} onClick={()=>setHub(h.id)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
              borderRadius:3,cursor:"pointer",
              background:hub===h.id?"rgba(0,180,255,.08)":"var(--deep)",
              border:`1px solid ${hub===h.id?"var(--acc)":"var(--b1)"}`,
              transition:"all .15s",
            }}>
              <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,
                border:`2px solid ${hub===h.id?"var(--acc)":"var(--b2)"}`,
                background:hub===h.id?"var(--acc)":"transparent",
                transition:"all .15s"}}/>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:hub===h.id?"var(--tp)":"var(--ts)"}}>{h.label}</div>
                <div style={{fontSize:11,color:"var(--tm)"}}>{h.sub}</div>
              </div>
              {h.id==="jita" && hub!==h.id && (
                <span style={{marginLeft:"auto",fontSize:10,fontFamily:"var(--mono)",
                  color:"var(--tm)",background:"var(--b1)",padding:"1px 6px",borderRadius:2}}>default</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Price type */}
      <Card>
        <HUD style={{fontSize:10,color:"var(--acc)",display:"block",marginBottom:16,
          paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>Price Type</HUD>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {TYPES.map(t=>(
            <div key={t.id} onClick={()=>setPtype(t.id)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
              borderRadius:3,cursor:"pointer",
              background:ptype===t.id?"rgba(0,180,255,.08)":"var(--deep)",
              border:`1px solid ${ptype===t.id?"var(--acc)":"var(--b1)"}`,
              transition:"all .15s",
            }}>
              <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,
                border:`2px solid ${ptype===t.id?"var(--acc)":"var(--b2)"}`,
                background:ptype===t.id?"var(--acc)":"transparent",transition:"all .15s"}}/>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:ptype===t.id?"var(--tp)":"var(--ts)"}}>{t.label}</div>
                <div style={{fontSize:11,color:"var(--tm)"}}>{t.sub}</div>
              </div>
              {t.id==="lowest_sell" && ptype!==t.id && (
                <span style={{marginLeft:"auto",fontSize:10,fontFamily:"var(--mono)",
                  color:"var(--tm)",background:"var(--b1)",padding:"1px 6px",borderRadius:2}}>default</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <HUD style={{fontSize:10,color:"var(--acc)",display:"block",marginBottom:16,
          paddingBottom:10,borderBottom:"1px solid var(--b1)"}}>Display Theme</HUD>
        <div style={{display:"flex",gap:10}}>
          {["dark","light"].map(t=>(
            <div key={t} onClick={onToggleTheme} style={{
              flex:1,padding:"14px 16px",borderRadius:3,cursor:"pointer",textAlign:"center",
              background:theme===t?"rgba(0,180,255,.08)":"var(--deep)",
              border:`1px solid ${theme===t?"var(--acc)":"var(--b1)"}`,transition:"all .15s",
            }}>
              <div style={{fontSize:20,marginBottom:6}}>{t==="dark"?"🌙":"☀️"}</div>
              <div style={{fontSize:13,fontWeight:500,color:theme===t?"var(--tp)":"var(--ts)"}}>
                {t.charAt(0).toUpperCase()+t.slice(1)} Mode
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <Btn variant="primary" onClick={save}>
          {saved?"✓ Saved":"Save Settings"}
        </Btn>
        {saved && (
          <div style={{fontSize:12,color:"var(--grn)",fontFamily:"var(--mono)"}}>
            Settings saved — prices will update on next sync
          </div>
        )}
      </div>

      {/* About */}
      <Card>
        <HUD style={{fontSize:10,color:"var(--acc)",display:"block",marginBottom:12,
          paddingBottom:8,borderBottom:"1px solid var(--b1)"}}>About</HUD>
        <div style={{fontSize:12,color:"var(--ts)",lineHeight:1.9,fontFamily:"var(--mono)"}}>
          <div>Eve-Krab PI Tracker v2.0</div>
          <div style={{color:"var(--tm)"}}>Self-hosted · FastAPI + PostgreSQL + React</div>
          <div style={{color:"var(--tm)"}}>ESI: esi.evetech.net · Prices: {hub} {ptype}</div>
        </div>
      </Card>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const PAGES = [
  {id:"stock",     icon:"◈", label:"Stock"},
  {id:"log",       icon:"≡", label:"Log"},
  {id:"analytics", icon:"◉", label:"Analytics"},
  {id:"prices",    icon:"◎", label:"Prices"},
  {id:"settings",  icon:"⚙", label:"Settings"},
];

const PAGE_SUB = {
  stock:     "PI material inventory",
  log:       "Collection and factory run history",
  analytics: "Production volume and stock value trends",
  prices:    "Market prices by trade hub",
  settings:  "Price settings, theme, display options",
};

const HUB_LABELS = {jita:"Jita 4-4", amarr:"Amarr", dodixie:"Dodixie", hek:"Hek"};
const TYPE_LABELS = {lowest_sell:"Lowest Sell", highest_buy:"Highest Buy", split:"Split"};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page,          setPage]          = useState("stock");
  const [stock,         setStock]         = useState({});
  const [alerts,        setAlerts]        = useState({});
  const [log,           setLog]           = useState([]);
  const [prices,        setPrices]        = useState({});
  const [priceSettings, setPriceSettings] = useState({hub:"jita", type:"lowest_sell"});
  const [theme,         setTheme]         = useState("dark");
  const [collectOpen,   setCollectOpen]   = useState(false);
  const [factoryOpen,   setFactoryOpen]   = useState(false);
  const [alertModal,    setAlertModal]    = useState(null);
  const [toast,         setToast]         = useState(null);
  const [refreshing,    setRefreshing]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [firstLaunch,   setFirstLaunch]   = useState(false);

  const showToast = (msg, col="var(--grn)") => {
    setToast({msg,col});
    setTimeout(()=>setToast(null),3500);
  };

  const priceLabel = `${HUB_LABELS[priceSettings.hub]||"Jita"} ${TYPE_LABELS[priceSettings.type]||"Lowest Sell"}`;

  function normaliseLogEntry(row) {
    return {
      id:     row.id,
      type:   row.entry_type,
      recipe: row.recipe,
      runs:   row.runs,
      note:   row.note,
      date:   row.entry_date,
      entries:(row.lines||[]).map(l=>({matId:l.mat_id, qty:l.quantity})),
    };
  }

  useEffect(() => {
    async function loadAll() {
      try {
        const [stockRows, logRows, priceRows, settings] = await Promise.all([
          api.getStock(),
          api.getLog(),
          api.getLatestPrices(),
          api.getPriceSettings(),
        ]);

        const s={}, a={};
        stockRows.forEach(r=>{ s[r.mat_id]=r.quantity; a[r.mat_id]=r.min_alert; });
        setStock(s);
        setAlerts(a);
        setLog(logRows.map(normaliseLogEntry));

        const p={};
        priceRows.forEach(r=>{ if(r.adjusted_price!=null) p[r.eve_type_id]={adj:r.adjusted_price,avg:r.average_price}; });
        setPrices(p);

        setPriceSettings({hub:settings.price_hub||"jita", type:settings.price_type||"lowest_sell"});
        setTheme(settings.theme||"dark");

        // First launch: no stock rows at all
        const hasAnyStock = stockRows.some(r=>r.quantity>0);
        if (!hasAnyStock && logRows.length===0) {
          setFirstLaunch(true);
        }
      } catch(e) {
        console.error("Load failed:", e);
        showToast("⚠ Could not reach backend", "var(--gold)");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  async function handleCollect({entries, note, setAsTotal}) {
    try {
      const lines = entries.map(e=>({mat_id:e.matId, quantity:e.qty}));
      const created = await api.createLog({
        entry_type: setAsTotal ? "set_total" : "collect",
        note,
        lines,
        set_as_total: setAsTotal||false,
      });
      setLog(prev=>[normaliseLogEntry(created),...prev]);
      if (setAsTotal) {
        setStock(prev=>{
          const next={...prev};
          entries.forEach(e=>{ next[e.matId]=e.qty; });
          return next;
        });
        const total = entries.reduce((s,e)=>s+e.qty,0);
        showToast(`✓ Stock set — ${entries.length} material${entries.length>1?"s":""}, ${fmtQty(total)} total units`,"var(--gold)");
      } else {
        setStock(prev=>{
          const next={...prev};
          entries.forEach(e=>{ next[e.matId]=(next[e.matId]||0)+e.qty; });
          return next;
        });
        const total = entries.reduce((s,e)=>s+e.qty,0);
        showToast(`✓ Collected ${fmtQty(total)} units across ${entries.length} material${entries.length>1?"s":""}`, "var(--grn)");
      }
    } catch(e) { showToast(`✗ ${e.message}`, "var(--red)"); }
  }

  async function handleFactory({recipe, runs, entries, note}) {
    try {
      const created = await api.createLog({
        entry_type:"factory", recipe, runs, note,
        lines:entries.map(e=>({mat_id:e.matId, quantity:e.qty})),
      });
      setLog(prev=>[normaliseLogEntry(created),...prev]);
      setStock(prev=>{
        const next={...prev};
        entries.forEach(e=>{ next[e.matId]=(next[e.matId]||0)+e.qty; });
        return next;
      });
      const r = FACTORY_RECIPES[recipe];
      showToast(`✓ Factory run logged — ${runs}× ${r.name}`, "var(--red)");
    } catch(e) { showToast(`✗ ${e.message}`, "var(--red)"); }
  }

  async function handleRefreshPrices() {
    setRefreshing(true);
    try {
      await api.refreshPrices();
      const priceRows = await api.getLatestPrices();
      const p={};
      priceRows.forEach(r=>{ if(r.adjusted_price!=null) p[r.eve_type_id]={adj:r.adjusted_price,avg:r.average_price}; });
      setPrices(p);
      showToast(`✓ Prices synced — ${Object.keys(p).length} items (${priceLabel})`, "var(--gold)");
    } catch(e) { showToast(`✗ Price sync failed: ${e.message}`, "var(--red)"); }
    finally { setRefreshing(false); }
  }

  async function handleSaveSettings(hub, type) {
    await api.savePriceSettings(hub, type, theme);
    setPriceSettings({hub, type});
  }

  function handleToggleTheme() {
    const next = theme==="dark"?"light":"dark";
    setTheme(next);
    api.savePriceSettings(priceSettings.hub, priceSettings.type, next).catch(()=>{});
  }

  async function handleAlertSave(mat_id, min_alert) {
    try {
      await api.updateAlert(mat_id, min_alert);
      setAlerts(prev=>({...prev,[mat_id]:min_alert}));
      showToast("Alert threshold updated","var(--acc)");
    } catch(e) { showToast(`✗ ${e.message}`,"var(--red)"); }
  }

  async function handleFirstLaunchSetup(entries, note) {
    setFirstLaunch(false);
    if (entries.length > 0) {
      await handleCollect({entries, note, setAsTotal:true});
    }
  }

  const lowCount = ALL_MATERIALS.filter(m=>
    (alerts[m.id]||0)>0 && (stock[m.id]||0)<(alerts[m.id]||0)
  ).length;

  if (loading) return (
    <>
      <GlobalStyles theme={theme}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",
        minHeight:"100vh",background:"var(--void)"}}>
        <HUD style={{fontSize:13,color:"var(--acc)",letterSpacing:4}}>Loading…</HUD>
      </div>
    </>
  );

  if (firstLaunch) return (
    <>
      <GlobalStyles theme={theme}/>
      <WelcomeScreen onSetup={handleFirstLaunchSetup}/>
    </>
  );

  return (
    <>
      <GlobalStyles theme={theme}/>
      {toast && <Toast msg={toast.msg} color={toast.col}/>}

      <div style={{display:"flex",minHeight:"100vh"}}>
        {/* SIDEBAR */}
        <nav style={{width:190,flexShrink:0,background:"var(--deep)",
          borderRight:"1px solid var(--b1)",display:"flex",flexDirection:"column",
          position:"sticky",top:0,height:"100vh"}}>
          <div style={{padding:"22px 18px 18px",borderBottom:"1px solid var(--b1)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--acc)",
                boxShadow:"0 0 8px var(--acc)",animation:"pulse 2.5s ease-in-out infinite"}}/>
              <HUD style={{fontSize:12,color:"var(--acc)"}}>Eve-Krab</HUD>
            </div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--tm)",paddingLeft:18}}>
              PI TRACKER
            </div>
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
                  <span style={{marginLeft:"auto",background:"var(--red)",color:"#fff",
                    borderRadius:10,fontSize:10,fontFamily:"var(--mono)",
                    padding:"1px 6px",minWidth:18,textAlign:"center"}}>{lowCount}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{padding:"14px 12px",borderTop:"1px solid var(--b1)",display:"flex",flexDirection:"column",gap:7}}>
            <Btn sm variant="green" onClick={()=>setCollectOpen(true)} style={{width:"100%",justifyContent:"center"}}>
              ＋ Log Collection
            </Btn>
            <Btn sm variant="danger" onClick={()=>setFactoryOpen(true)} style={{width:"100%",justifyContent:"center"}}>
              → Factory Run
            </Btn>
          </div>

          <div style={{padding:"10px 18px",fontFamily:"var(--mono)",fontSize:9,
            color:"var(--tm)",borderTop:"1px solid var(--b1)"}}>
            Eve-Krab · v2.0
          </div>
        </nav>

        {/* MAIN */}
        <main style={{flex:1,overflow:"auto",background:"var(--void)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"18px 28px",borderBottom:"1px solid var(--b1)",
            background:"var(--deep)",display:"flex",alignItems:"center",
            justifyContent:"space-between",flexShrink:0}}>
            <div>
              <HUD style={{fontSize:16,letterSpacing:3,color:"var(--tp)"}}>
                {PAGES.find(p=>p.id===page)?.label}
              </HUD>
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--tm)",marginTop:3}}>
                {PAGE_SUB[page]}
              </div>
            </div>
            {page==="prices" && (
              <Btn sm variant="gold" onClick={handleRefreshPrices} disabled={refreshing}>
                {refreshing?"⟳ Syncing…":"⟳ Sync ESI"}
              </Btn>
            )}
          </div>

          <div style={{flex:1,padding:24,overflowY:"auto"}}>
            {page==="stock"     && <StockPage stock={stock} alerts={alerts} prices={prices}
              priceLabel={priceLabel} onCollect={()=>setCollectOpen(true)}
              onFactory={()=>setFactoryOpen(true)} onEditAlert={m=>setAlertModal(m)}/>}
            {page==="log"       && <LogPage log={log}/>}
            {page==="analytics" && <AnalyticsPage log={log} stock={stock} prices={prices}/>}
            {page==="prices"    && <PricesPage prices={prices} priceLabel={priceLabel}
              onRefresh={handleRefreshPrices} refreshing={refreshing}/>}
            {page==="settings"  && <SettingsPage priceSettings={priceSettings}
              onSaveSettings={handleSaveSettings} theme={theme} onToggleTheme={handleToggleTheme}/>}
          </div>
        </main>
      </div>

      {collectOpen && <CollectModal onClose={()=>setCollectOpen(false)} onSubmit={handleCollect} stock={stock}/>}
      {factoryOpen && <FactoryModal onClose={()=>setFactoryOpen(false)} onSubmit={handleFactory} stock={stock}/>}
      {alertModal  && <AlertModal material={alertModal} currentAlert={alerts[alertModal.id]}
        onClose={()=>setAlertModal(null)} onSave={handleAlertSave}/>}
    </>
  );
}
