/* EndpointAccordion — transitions.dev "Accordion": height animates with a
   chevron morph; the open row inverts to a solid ink panel. Each endpoint gets
   a libraries.dev-style copy-curl action. */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import CopyButton from "./CopyButton";

export type Endpoint = {
  method: "POST" | "GET";
  path: string;
  label: string;
  summary: string;
  inputs: string[];
  response: string;
  curl: string;
};

export default function EndpointAccordion({ endpoints }: { endpoints: Endpoint[] }) {
  const [open, setOpen] = useState<string | null>(endpoints[0]?.path ?? null);

  return (
    <div className="endpoint-list">
      {endpoints.map((ep, i) => {
        const isOpen = open === ep.path;
        return (
          <div key={ep.path} className={`endpoint-item ${isOpen ? "open" : ""}`}>
            <button
              className="endpoint-row"
              onClick={() => setOpen(isOpen ? null : ep.path)}
              aria-expanded={isOpen}
            >
              <span className="endpoint-num">0{i + 1}</span>
              <span className={`method-pill ${ep.method.toLowerCase()}`}>{ep.method}</span>
              <code className="endpoint-path">{ep.path}</code>
              <span className="endpoint-label">{ep.label}</span>
              <span className="endpoint-chevron"><ChevronDown size={17} /></span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="endpoint-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="endpoint-panel-inner">
                    <div className="endpoint-block">
                      <span className="mono-label">REQUEST CONTRACT</span>
                      <p>{ep.summary}</p>
                      <div style={{ marginTop: 20 }}>
                        <span className="mono-label">INPUTS</span>
                        <ul className="endpoint-inputs">
                          {ep.inputs.map((input) => (
                            <li key={input}>{input}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="endpoint-block">
                      <span className="mono-label">200 RESPONSE</span>
                      <pre className="response-code">{ep.response}</pre>
                      <div className="curl-row">
                        <span className="curl-cmd">{ep.curl}</span>
                        <CopyButton text={ep.curl} label="Copy curl" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
