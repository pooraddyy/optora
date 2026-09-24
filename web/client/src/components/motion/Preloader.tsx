/* Preloader — transitions.dev "Matrix dot loader": a 4x4 dot matrix that pulses
   through four patterns, then resolves into a drawn check and lifts away.
   (details.so-style preloader: the first detail a visitor meets.) */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PATTERNS = [
  [0, 5, 10, 15],            // diagonal
  [3, 6, 9, 12],            // anti-diagonal
  [0, 1, 2, 3, 12, 13, 14, 15], // top + bottom rows
  [5, 6, 9, 10],             // center square
];

function dotDelay(i: number, pattern: number[]) {
  return pattern.includes(i) ? (i % 4) * 0.07 : 0.35;
}

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"loading" | "done" | "gone">("loading");
  const [pattern, setPattern] = useState(0);

  useEffect(() => {
    const cycle = window.setInterval(() => setPattern((p) => (p + 1) % PATTERNS.length), 420);
    const finish = window.setTimeout(() => {
      setPhase("done");
      window.setTimeout(() => {
        setPhase("gone");
        onDone();
      }, 620);
    }, 1680);
    return () => {
      window.clearInterval(cycle);
      window.clearTimeout(finish);
    };
  }, [onDone]);

  const active = PATTERNS[pattern];

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          className="preloader"
          exit={{ y: "-100%", transition: { duration: 0.55, ease: [0.77, 0, 0.175, 1] } }}
        >
          <div className="preloader-inner">
            <AnimatePresence mode="wait">
              {phase === "loading" ? (
                <motion.div
                  key="matrix"
                  className="dot-matrix"
                  exit={{ opacity: 0, scale: 0.86, filter: "blur(6px)", transition: { duration: 0.25 } }}
                >
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.i
                      key={`${pattern}-${i}`}
                      initial={{ opacity: 0.25, scale: 0.8 }}
                      animate={
                        active.includes(i)
                          ? { opacity: 1, scale: 1.25, backgroundColor: "#3d7bff" }
                          : { opacity: 0.25, scale: 0.8 }
                      }
                      transition={{ duration: 0.3, delay: dotDelay(i, active), ease: "easeOut" }}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.svg
                  key="check"
                  width="54"
                  height="54"
                  viewBox="0 0 54 54"
                  fill="none"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)", rotate: -18 }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.path
                    d="M11 28 L23 40 L43 16"
                    stroke="#41d97e"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
            <div>
              <div className="preloader-word">OPTORA</div>
              <div className="preloader-sub" style={{ marginTop: 10, textAlign: "center" }}>
                INITIALIZING VERIFICATION CONSOLE
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
