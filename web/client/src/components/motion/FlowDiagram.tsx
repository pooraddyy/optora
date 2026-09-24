/* FlowDiagram — the animated route map for a verification flow.
   Nodes ride on an SVG wire whose dashes flow continuously (designspells-style
   detail); switching flows re-runs the entrance with an offset stagger. */
import { motion } from "framer-motion";
import { Check, KeyRound, Link2, Mail, Webhook } from "lucide-react";
import type { ReactNode } from "react";

export type FlowKind = "code" | "link";

const FLOWS: Record<
  FlowKind,
  {
    tag: string;
    nodes: { icon: ReactNode; label: string; tone: "" | "accent" | "ok" }[];
    meta: [string, string];
    caption: string;
  }
> = {
  code: {
    tag: "CODE_FLOW.V1",
    nodes: [
      { icon: <Mail size={26} strokeWidth={1.8} />, label: "EMAIL\nREQUEST", tone: "" },
      { icon: <KeyRound size={26} strokeWidth={1.8} />, label: "6-DIGIT\nOTP", tone: "accent" },
      { icon: <Check size={28} strokeWidth={2.4} />, label: "VERIFIED\nSTATE", tone: "ok" },
    ],
    meta: ["POST /api/otp/generate — issue + deliver", "POST /api/otp/verify — confirm before TTL"],
    caption: "EXPIRES AUTOMATICALLY · SECURELY GENERATED · FULLY CONFIGURABLE",
  },
  link: {
    tag: "MAGIC_LINK.V1",
    nodes: [
      { icon: <Mail size={26} strokeWidth={1.8} />, label: "EMAIL\nREQUEST", tone: "" },
      { icon: <Link2 size={26} strokeWidth={1.8} />, label: "SIGNED\nLINK", tone: "accent" },
      { icon: <Webhook size={26} strokeWidth={1.8} />, label: "WEBHOOK\nEVENT", tone: "ok" },
    ],
    meta: ["POST /api/otp/send-link — deliver signed URL", "GET /api/otp/verify-link — resolve + dispatch"],
    caption: "ONE CLICK · NO CODE TYPING · SERVER-SIDE RESOLUTION",
  },
};

export default function FlowDiagram({ flow }: { flow: FlowKind }) {
  const data = FLOWS[flow];
  return (
    <div className="flow-diagram-card" key={flow}>
      <div className="diagram-topline">
        <span className="mono">{data.tag}</span>
        <span className="console-live"><i /> READY</span>
      </div>

      <div className="diagram-stage">
        <div className="diagram-wire" aria-hidden="true">
          <svg preserveAspectRatio="none">
            <line x1="0" y1="1" x2="100%" y2="1" stroke="rgba(245,244,240,0.14)" strokeWidth="2" />
            <line x1="0" y1="1" x2="100%" y2="1" stroke="#3d7bff" strokeWidth="2" className="wire-flow" />
          </svg>
        </div>
        <div className="diagram-nodes">
          {data.nodes.map((node, i) => (
            <motion.div
              key={node.label}
              className="diagram-node"
              initial={{ opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.08 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className={`node-chip ${node.tone}`}
                animate={i === 1 ? { y: [0, -7, 0] } : {}}
                transition={i === 1 ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : {}}
              >
                {node.icon}
              </motion.div>
              <span className="mono" style={{ whiteSpace: "pre-line" }}>{node.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="diagram-meta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <span className="mono"><b>01</b> {data.meta[0]}</span>
        <span className="mono"><b>02</b> {data.meta[1]}</span>
      </motion.div>

      <div className="diagram-topline" style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
        <span className="mono" style={{ letterSpacing: "0.14em" }}>{data.caption}</span>
      </div>
    </div>
  );
}
