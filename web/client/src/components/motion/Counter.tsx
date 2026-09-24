/* Counter — transitions.dev "Spinning counter": digits spin like a reel to
   their final value when the stat scrolls into view. */
import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

function Reel({ target, delay }: { target: number; delay: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.4,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, delay]);

  return (
    <span className="digit-reel" ref={ref} aria-hidden="true">
      <motion.span
        animate={{ y: `-${display * 1.15}em` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ lineHeight: "1.15em", display: "block" }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{ display: "block", height: "1.15em" }}>
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export default function Counter({
  value,
  pad = 2,
  unit = "",
  label,
  delay = 0,
}: {
  value: number;
  pad?: number;
  unit?: string;
  label: string;
  delay?: number;
}) {
  const str = String(value).padStart(pad, "0");
  return (
    <div className="stat">
      <div className="stat-value" role="text" aria-label={`${value} ${label}`}>
        <span className="digits">
          {str.split("").map((ch, i) =>
            ch === ":" ? (
              <span key={i} style={{ height: "1.15em", lineHeight: "1.15em" }}>:</span>
            ) : (
              <Reel key={i} target={Number(ch)} delay={delay + i * 0.08} />
            )
          )}
        </span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
