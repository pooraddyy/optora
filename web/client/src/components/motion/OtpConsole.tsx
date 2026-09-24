/* OtpConsole — the hero's interactive verification console.
   Motion vocabulary (transitions.dev): number pop-in with digit flip + blur +
   stagger, thinking-state shimmer, spinner-to-check morph, success check with
   blur + rotate, toast rise with fade + blur + scale, error-state shake.
   Component shape (rareui): a single owned file, no fake backend — the trace
   is a local simulation of the documented API lifecycle. */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Mail, RotateCcw, ShieldCheck } from "lucide-react";
import Tilt from "./Tilt";

type Phase = "idle" | "sending" | "code" | "verifying" | "verified";

const CODE_TTL = 5 * 60;

function randomCode() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
}

function formatTtl(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function OtpConsole() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [email, setEmail] = useState("person@example.com");
  const [digits, setDigits] = useState<number[]>([]);
  const [ttl, setTtl] = useState(CODE_TTL);
  const [shakeKey, setShakeKey] = useState(0);
  const [toast, setToast] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (phase !== "code") return;
    const id = window.setInterval(() => setTtl((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(false), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const generate = () => {
    if (!email.includes("@")) {
      setShakeKey((k) => k + 1);
      return;
    }
    setPhase("sending");
    later(1100, () => {
      setDigits(randomCode());
      setTtl(CODE_TTL);
      setPhase("code");
    });
  };

  const verify = () => {
    if (phase !== "code") return;
    setPhase("verifying");
    later(950, () => {
      setPhase("verified");
      setToast(true);
    });
  };

  const reset = () => {
    setPhase("idle");
    setDigits([]);
    setToast(false);
  };

  return (
    <div className="console-wrap">
      <Tilt className="console-card" max={6}>
        <div className="console-bar">
          <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span className="mono">OPTORA — API TRACE</span>
          <span className="console-live"><i /> SIMULATED</span>
        </div>

        <div className="console-body" key={shakeKey} data-phase={phase}>
          <div>
            <div className="console-label">RECIPIENT</div>
            <div className="console-input-row" style={{ marginTop: 10 }}>
              <input
                className={`console-input ${shakeKey > 0 && phase === "idle" ? "shake" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && phase === "idle" && generate()}
                placeholder="person@example.com"
                spellCheck={false}
                aria-label="Email address"
              />
              {phase === "idle" && (
                <button className="console-btn" onClick={generate}>
                  Generate code <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {phase === "sending" && (
              <motion.div
                key="sending"
                className="shimmer-line"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Mail size={15} />
                <span className="shimmer-text shimmer-anim">Issuing code — delivering via SMTP…</span>
              </motion.div>
            )}

            {(phase === "idle" || phase === "code" || phase === "verifying" || phase === "verified") && (
              <motion.div
                key="cells"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="console-label" style={{ textAlign: "center", marginBottom: 12 }}>
                  {phase === "verified" ? "CODE ACCEPTED" : phase === "idle" ? "AWAITING CODE" : "ENTER THE 6-DIGIT CODE"}
                </div>
                <div className="otp-cells" aria-label={digits.length ? `One-time code ${digits.join("")}` : "One-time code placeholder"}>
                  {Array.from({ length: 6 }, (_, i) => {
                    const d = digits[i];
                    const filled = d !== undefined && phase !== "idle";
                    return (
                      <div
                        key={i}
                        className={`otp-cell ${filled ? "filled" : ""} ${phase === "verified" ? "verified" : ""}`}
                        style={phase === "idle" ? { opacity: 0.45 } : undefined}
                      >
                        {filled && (
                          <AnimatePresence mode="popLayout">
                            <motion.span
                              key={`${i}-${d}-${phase}`}
                              initial={{ opacity: 0, rotateX: -90, filter: "blur(6px)", y: 10 }}
                              animate={{ opacity: 1, rotateX: 0, filter: "blur(0px)", y: 0 }}
                              exit={{ opacity: 0, rotateX: 90, filter: "blur(6px)", y: -10 }}
                              transition={{
                                duration: 0.38,
                                delay: phase === "code" ? 0.08 + i * 0.07 : 0,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              style={{ display: "inline-block", transformStyle: "preserve-3d" }}
                            >
                              {d}
                            </motion.span>
                          </AnimatePresence>
                        )}
                      </div>
                    );
                  })}
                </div>

                {phase !== "idle" && (
                  <>
                    <div className="console-status" style={{ marginTop: 16 }}>
                      <span className="mono">
                        {phase === "verified" ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#41d97e" }}>
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5, filter: "blur(6px)", rotate: -30 }}
                              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }}
                              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                              style={{ display: "inline-flex" }}
                            >
                              <Check size={14} strokeWidth={3} />
                            </motion.span>
                            VERIFIED · WEBHOOK DISPATCHED
                          </span>
                        ) : phase === "verifying" ? (
                          <span className="shimmer-text shimmer-anim">CHECKING CODE…</span>
                        ) : (
                          "AWAITING USER ACTION"
                        )}
                      </span>
                      {phase !== "verified" && <span className="console-timer">{formatTtl(ttl)}</span>}
                    </div>

                    <div className="console-actions" style={{ marginTop: 18 }}>
                      {phase === "code" && (
                        <>
                          <button className="console-btn" onClick={verify}>
                            <ShieldCheck size={15} /> Verify code
                          </button>
                          <button className="console-btn ghost" onClick={generate} aria-label="Regenerate code">
                            <RotateCcw size={15} />
                          </button>
                        </>
                      )}
                      {phase === "verifying" && (
                        <button className="console-btn" disabled>
                          Verifying…
                        </button>
                      )}
                      {phase === "verified" && (
                        <button className="console-btn ghost" onClick={reset}>
                          <RotateCcw size={15} /> Run it again
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="console-foot">
          <span>POST /api/otp/generate → /verify</span>
          <span>TTL {formatTtl(CODE_TTL)}</span>
        </div>
      </Tilt>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            style={{ position: "absolute", right: 18, bottom: 18, zIndex: 5 }}
            initial={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            role="status"
          >
            <span className="toast-icon"><Check size={16} strokeWidth={3} /></span>
            <div>
              <b>email.verified</b>
              <small>webhook → your backend · 200 OK</small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
