import { T } from "../../styles/theme";

export function SkeletonCard() {
  return (
    <div style={{ 
      background: "#111", 
      borderRadius: 16, 
      padding: 20, 
      height: 180, 
      border: `1px solid ${T.border2}`,
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Shimmer Effect */}
      <div className="shimmer" />
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#222", marginBottom: 15 }} />
      <div style={{ width: "60%", height: 14, background: "#222", borderRadius: 4, marginBottom: 10 }} />
      <div style={{ width: "40%", height: 10, background: "#1a1a1a", borderRadius: 4 }} />
      
      <style>{`
        .shimmer {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          animation: loading 1.5s infinite;
        }
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}