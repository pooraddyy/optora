/* BlurCycle — transitions.dev "Text states swap": words swap with a soft
   cross-blur instead of a hard cut. Used for the hero's rotating adjective. */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BlurCycle({
  words,
  interval = 2600,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`blur-cycle ${className}`} aria-live="off">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(10px)" }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-block" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
