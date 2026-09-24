import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0b",
        color: "#f5f4f0",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <div
          className="mono"
          style={{ fontSize: 10, letterSpacing: "0.24em", color: "#6f6c66", marginBottom: 18 }}
        >
          404 — ROUTE NOT FOUND
        </div>
        <h1
          className="font-display"
          style={{ margin: 0, fontSize: "clamp(52px, 8vw, 96px)", fontWeight: 700, letterSpacing: "-0.045em" }}
        >
          Lost in transit.
        </h1>
        <p style={{ color: "#a8a49b", margin: "18px 0 32px", fontSize: 15, lineHeight: 1.7 }}>
          This verification route doesn't exist. It may have expired — like a good OTP should.
        </p>
        <button className="btn-ghost" onClick={() => setLocation("/")}>
          <ArrowLeft size={16} /> Back to the console
        </button>
      </div>
    </div>
  );
}
