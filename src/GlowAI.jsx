import { useState, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const SKIN_PRODUCTS = [
  { name: "CeraVe Hydrating Cleanser", concern: "Dryness", price: "$14", match: 97, img: "🧴", tag: "Cleanser" },
  { name: "Neutrogena Retinol Serum", concern: "Fine Lines", price: "$22", match: 94, img: "💧", tag: "Serum" },
  { name: "La Roche-Posay SPF 50", concern: "Sun Damage", price: "$36", match: 91, img: "☀️", tag: "SPF" },
  { name: "Paula's Choice BHA Exfoliant", concern: "Texture", price: "$34", match: 88, img: "✨", tag: "Exfoliant" },
  { name: "The Ordinary Niacinamide", concern: "Pores", price: "$6", match: 85, img: "🔬", tag: "Treatment" },
];

const HAIR_PRODUCTS = [
  { name: "Olaplex No.3 Hair Perfector", concern: "Damage", price: "$30", match: 96, img: "💆", tag: "Treatment" },
  { name: "Briogeo Don't Despair Mask", concern: "Dryness", price: "$38", match: 92, img: "🪄", tag: "Mask" },
  { name: "Moroccanoil Treatment", concern: "Frizz", price: "$45", match: 89, img: "✨", tag: "Oil" },
  { name: "Redken All Soft Shampoo", concern: "Breakage", price: "$28", match: 86, img: "🚿", tag: "Shampoo" },
];

const skinTrends = [
  { date: "Mar 1", hydration: 52, clarity: 60, texture: 55 },
  { date: "Mar 4", hydration: 58, clarity: 63, texture: 59 },
  { date: "Mar 7", hydration: 64, clarity: 67, texture: 63 },
  { date: "Mar 10", hydration: 61, clarity: 71, texture: 68 },
  { date: "Mar 13", hydration: 69, clarity: 74, texture: 72 },
  { date: "Mar 16", hydration: 75, clarity: 78, texture: 76 },
];

const hairTrends = [
  { date: "Mar 1", strength: 48, moisture: 55, shine: 50 },
  { date: "Mar 4", strength: 53, moisture: 58, shine: 54 },
  { date: "Mar 7", strength: 57, moisture: 63, shine: 60 },
  { date: "Mar 10", strength: 62, moisture: 67, shine: 64 },
  { date: "Mar 13", strength: 67, moisture: 72, shine: 69 },
  { date: "Mar 16", strength: 71, moisture: 76, shine: 74 },
];

function ScoreRing({ score, label, color }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#f1e8f7" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="45" y="50" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3d1f5c">{score}</text>
      </svg>
      <span style={{ fontSize: 12, color: "#7c5c9e", fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function UploadZone({ onAnalyze, type }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? "#b06ecf" : "#d4a8e8"}`,
          borderRadius: 20,
          width: "100%",
          minHeight: 200,
          background: dragging ? "#f9f0ff" : "#fdf7ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 18 }} />
        ) : (
          <>
            <span style={{ fontSize: 48 }}>{type === "skin" ? "🤳" : "💇"}</span>
            <p style={{ color: "#9b6dbf", fontWeight: 600, marginTop: 8 }}>Drop photo or tap to upload</p>
            <p style={{ color: "#c4a0db", fontSize: 13 }}>{type === "skin" ? "Selfie works best" : "Well-lit hair photo"}</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
      </div>
      <button
        onClick={onAnalyze}
        style={{
          background: "linear-gradient(135deg, #c06dd6, #7c5c9e)",
          color: "white",
          border: "none",
          borderRadius: 14,
          padding: "13px 40px",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(180,100,220,0.35)",
          width: "100%",
          letterSpacing: 0.5,
        }}
      >
        ✨ Analyze with AI
      </button>
    </div>
  );
}

function SkinResult() {
  const radarData = [
    { subject: "Hydration", score: 75 },
    { subject: "Clarity", score: 78 },
    { subject: "Texture", score: 76 },
    { subject: "Radiance", score: 70 },
    { subject: "Firmness", score: 65 },
  ];

  return (
    <div style={{ background: "#fdf7ff", borderRadius: 20, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <ScoreRing score={75} label="Hydration" color="#c06dd6" />
        <ScoreRing score={78} label="Clarity" color="#e884b0" />
        <ScoreRing score={76} label="Texture" color="#7c9edf" />
        <ScoreRing score={70} label="Radiance" color="#f4a261" />
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <p style={{ fontWeight: 700, color: "#3d1f5c", marginBottom: 8 }}>🔍 AI Insights</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {["Mild dehydration detected — boost water intake & add a hyaluronic acid serum", "T-zone shows slight oiliness — consider a gentle BHA exfoliant", "Skin tone is uneven in the cheek area — Vitamin C could help", "Overall skin health is improving! +12 pts since last week"].map((tip, i) => (
            <li key={i} style={{ color: "#5a3d7a", fontSize: 14, display: "flex", gap: 6 }}>
              <span>{["💧", "🌿", "✨", "📈"][i]}</span> {tip}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 16 }}>
        <p style={{ fontWeight: 700, color: "#3d1f5c", marginBottom: 4 }}>Overall Skin Score</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, background: "#f1e8f7", borderRadius: 8, height: 14 }}>
            <div style={{ width: "74%", height: "100%", background: "linear-gradient(90deg, #c06dd6, #e884b0)", borderRadius: 8, transition: "width 1s ease" }} />
          </div>
          <span style={{ fontWeight: 800, color: "#c06dd6", fontSize: 18 }}>74</span>
        </div>
        <p style={{ color: "#9b7cb4", fontSize: 13, marginTop: 6 }}>Good · Keep up your routine!</p>
      </div>
    </div>
  );
}

function HairResult() {
  return (
    <div style={{ background: "#fdf7ff", borderRadius: 20, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <ScoreRing score={71} label="Strength" color="#c06dd6" />
        <ScoreRing score={76} label="Moisture" color="#e884b0" />
        <ScoreRing score={74} label="Shine" color="#7c9edf" />
        <ScoreRing score={62} label="Porosity" color="#f4a261" />
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <p style={{ fontWeight: 700, color: "#3d1f5c", marginBottom: 8 }}>🔍 AI Insights</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {["Hair shows signs of heat damage — reduce heat styling or use a protectant", "High porosity detected — use protein treatments to seal cuticles", "Split ends visible at the tips — a trim would boost shine scores", "Scalp hydration is good — your current shampoo is working!"].map((tip, i) => (
            <li key={i} style={{ color: "#5a3d7a", fontSize: 14, display: "flex", gap: 6 }}>
              <span>{["🔥", "🧬", "✂️", "💚"][i]}</span> {tip}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 16 }}>
        <p style={{ fontWeight: 700, color: "#3d1f5c", marginBottom: 4 }}>Overall Hair Score</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, background: "#f1e8f7", borderRadius: 8, height: 14 }}>
            <div style={{ width: "70%", height: "100%", background: "linear-gradient(90deg, #c06dd6, #7c9edf)", borderRadius: 8, transition: "width 1s ease" }} />
          </div>
          <span style={{ fontWeight: 800, color: "#c06dd6", fontSize: 18 }}>70</span>
        </div>
        <p style={{ color: "#9b7cb4", fontSize: 13, marginTop: 6 }}>Fair · Some improvement needed</p>
      </div>
    </div>
  );
}

function AnalysisTab({ type }) {
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <UploadZone onAnalyze={handleAnalyze} type={type} />
      {loading && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 36 }}>🔬</div>
          <p style={{ color: "#9b6dbf", fontWeight: 600, marginTop: 8 }}>Analyzing with AI...</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%", background: "#c06dd6",
                animation: `bounce 1s ease ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
        </div>
      )}
      {analyzed && !loading && (type === "skin" ? <SkinResult /> : <HairResult />)}
    </div>
  );
}

function TrackingTab() {
  const [view, setView] = useState("skin");

  const data = view === "skin" ? skinTrends : hairTrends;
  const lines = view === "skin"
    ? [{ key: "hydration", color: "#c06dd6", label: "Hydration" }, { key: "clarity", color: "#e884b0", label: "Clarity" }, { key: "texture", color: "#7c9edf", label: "Texture" }]
    : [{ key: "strength", color: "#c06dd6", label: "Strength" }, { key: "moisture", color: "#e884b0", label: "Moisture" }, { key: "shine", color: "#7c9edf", label: "Shine" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", background: "#f1e8f7", borderRadius: 14, padding: 4, gap: 4 }}>
        {["skin", "hair"].map(t => (
          <button key={t} onClick={() => setView(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 11, border: "none",
            background: view === t ? "linear-gradient(135deg, #c06dd6, #7c5c9e)" : "transparent",
            color: view === t ? "white" : "#7c5c9e", fontWeight: 700, cursor: "pointer",
            fontSize: 14, transition: "all 0.2s",
          }}>
            {t === "skin" ? "🤳 Skin" : "💇 Hair"}
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 20, padding: 16 }}>
        <p style={{ fontWeight: 700, color: "#3d1f5c", marginBottom: 4 }}>Progress (Last 2 Weeks)</p>
        <p style={{ color: "#9b7cb4", fontSize: 13, marginBottom: 16 }}>All scores trending up ↑</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1e8f7" />
            <XAxis dataKey="date" tick={{ fill: "#9b7cb4", fontSize: 11 }} />
            <YAxis domain={[40, 100]} tick={{ fill: "#9b7cb4", fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            {lines.map(l => (
              <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={{ r: 4, fill: l.color }} name={l.label} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {lines.map(l => {
          const latest = data[data.length - 1][l.key];
          const first = data[0][l.key];
          const diff = latest - first;
          return (
            <div key={l.key} style={{ background: "white", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: l.color }}>{latest}</p>
              <p style={{ fontSize: 12, color: "#9b7cb4", fontWeight: 600 }}>{l.label}</p>
              <p style={{ fontSize: 11, color: "#4caf50", fontWeight: 600 }}>+{diff} ↑</p>
            </div>
          );
        })}
      </div>

      <div style={{ background: "white", borderRadius: 20, padding: 16 }}>
        <p style={{ fontWeight: 700, color: "#3d1f5c", marginBottom: 12 }}>📅 Log Today's Check-in</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[{ label: "💧 Water intake", placeholder: "e.g. 8 glasses" }, { label: "😴 Sleep hours", placeholder: "e.g. 7 hours" }, { label: "🌿 Products used", placeholder: "e.g. CeraVe cleanser, SPF..." }].map((f, i) => (
            <div key={i}>
              <label style={{ fontSize: 13, color: "#7c5c9e", fontWeight: 600 }}>{f.label}</label>
              <input placeholder={f.placeholder} style={{
                width: "100%", marginTop: 4, padding: "10px 14px",
                border: "1.5px solid #e8d5f5", borderRadius: 10, fontSize: 14,
                color: "#3d1f5c", outline: "none", boxSizing: "border-box",
              }} />
            </div>
          ))}
          <button style={{
            background: "linear-gradient(135deg, #c06dd6, #7c5c9e)", color: "white",
            border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700,
            cursor: "pointer", marginTop: 4, fontSize: 15,
          }}>Save Check-in ✓</button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p }) {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{
      background: "white", borderRadius: 18, padding: 16,
      boxShadow: "0 2px 12px rgba(180,100,220,0.1)",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 32 }}>{p.img}</span>
        <span style={{ background: "#f1e8f7", color: "#9b6dbf", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{p.tag}</span>
      </div>
      <p style={{ fontWeight: 700, color: "#3d1f5c", fontSize: 15, margin: 0 }}>{p.name}</p>
      <p style={{ color: "#9b7cb4", fontSize: 13, margin: 0 }}>Best for: {p.concern}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, background: "#f1e8f7", borderRadius: 6, height: 6 }}>
          <div style={{ width: `${p.match}%`, height: "100%", background: "linear-gradient(90deg, #c06dd6, #e884b0)", borderRadius: 6 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#c06dd6" }}>{p.match}% match</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{ fontWeight: 800, color: "#3d1f5c", fontSize: 17 }}>{p.price}</span>
        <button onClick={() => setSaved(!saved)} style={{
          background: saved ? "linear-gradient(135deg, #c06dd6, #7c5c9e)" : "transparent",
          color: saved ? "white" : "#c06dd6",
          border: "1.5px solid #c06dd6", borderRadius: 10,
          padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13,
        }}>
          {saved ? "✓ Saved" : "+ Save"}
        </button>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [view, setView] = useState("skin");
  const products = view === "skin" ? SKIN_PRODUCTS : HAIR_PRODUCTS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#f9f0ff", borderRadius: 16, padding: 14 }}>
        <p style={{ fontWeight: 700, color: "#3d1f5c", margin: 0 }}>✨ Personalized for you</p>
        <p style={{ color: "#9b7cb4", fontSize: 13, margin: "4px 0 0" }}>Based on your latest analysis</p>
      </div>
      <div style={{ display: "flex", background: "#f1e8f7", borderRadius: 14, padding: 4, gap: 4 }}>
        {["skin", "hair"].map(t => (
          <button key={t} onClick={() => setView(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 11, border: "none",
            background: view === t ? "linear-gradient(135deg, #c06dd6, #7c5c9e)" : "transparent",
            color: view === t ? "white" : "#7c5c9e", fontWeight: 700, cursor: "pointer",
            fontSize: 14, transition: "all 0.2s",
          }}>
            {t === "skin" ? "🤳 Skin" : "💇 Hair"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {products.map((p, i) => <ProductCard key={i} p={p} />)}
      </div>
    </div>
  );
}

export default function GlowAI() {
  const [tab, setTab] = useState("skin");

  const tabs = [
    { id: "skin", icon: "🤳", label: "Skin" },
    { id: "hair", icon: "💇", label: "Hair" },
    { id: "track", icon: "📈", label: "Track" },
    { id: "products", icon: "🛍️", label: "Products" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: "#faf5ff", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #9b45c8 0%, #c06dd6 50%, #e884b0 100%)",
        padding: "28px 20px 20px",
        borderRadius: "0 0 28px 28px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ color: "white", fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>✨ GlowAI</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "2px 0 0" }}>Your AI Beauty Coach</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 50, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            👤
          </div>
        </div>
        {/* Quick stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          {[{ label: "Skin Score", value: "74", icon: "🤳", delta: "+12" }, { label: "Hair Score", value: "70", icon: "💇", delta: "+8" }, { label: "Streak", value: "7d", icon: "🔥", delta: "Keep it up!" }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.18)", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
              <p style={{ fontSize: 18, margin: 0 }}>{s.icon}</p>
              <p style={{ color: "white", fontWeight: 800, fontSize: 18, margin: "2px 0" }}>{s.value}</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, margin: 0 }}>{s.delta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 16px 90px", overflowY: "auto" }}>
        {tab === "skin" && <AnalysisTab type="skin" />}
        {tab === "hair" && <AnalysisTab type="hair" />}
        {tab === "track" && <TrackingTab />}
        {tab === "products" && <ProductsTab />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420,
        background: "white", borderTop: "1px solid #f1e8f7",
        display: "flex", padding: "8px 0 12px",
        boxShadow: "0 -4px 20px rgba(180,100,220,0.1)",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, border: "none", background: "transparent", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 0",
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: tab === t.id ? "#c06dd6" : "#b0a0c0" }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c06dd6" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
