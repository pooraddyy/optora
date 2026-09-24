/* CopyButton — transitions.dev "Icon swap": the icon swaps with a scale + blur
   pop when the copy lands, instead of a text flip. */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";

export default function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button className="copy-btn" onClick={copy} aria-label={copied ? "Copied" : label}>
      <span style={{ position: "relative", width: 14, height: 14, display: "inline-block" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            transition={{ duration: 0.18 }}
            style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}
          >
            {copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {copied ? "Copied" : label}
    </button>
  );
}
