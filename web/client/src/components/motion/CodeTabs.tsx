/* CodeTabs — integration snippets in cURL, Node.js and Python.
   Every snippet is a real request against the documented API surface.
   Comments render faint; copy button copies the active tab verbatim. */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CopyButton from "./CopyButton";

const BASE = "https://your-optora.app";

const TABS: { id: string; label: string; code: string }[] = [
  {
    id: "curl",
    label: "cURL",
    code: `# 1 — Send a code
curl -X POST ${BASE}/api/otp/generate \\
  -H "Content-Type: application/json" \\
  -d '{"email":"person@example.com"}'

# 2 — Verify it
curl -X POST ${BASE}/api/otp/verify \\
  -H "Content-Type: application/json" \\
  -d '{"email":"person@example.com","otp":"482913"}'`,
  },
  {
    id: "node",
    label: "Node.js",
    code: `// 1 — Send a code
const gen = await fetch("${BASE}/api/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "person@example.com" }),
});
const { requestId, validityMinutes } = await gen.json();

// 2 — Verify it
const check = await fetch("${BASE}/api/otp/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "person@example.com", otp: "482913" }),
});
const { verified } = await check.json(); // true`,
  },
  {
    id: "python",
    label: "Python",
    code: `import requests

BASE = "${BASE}"

# 1 — Send a code
gen = requests.post(
    f"{BASE}/api/otp/generate",
    json={"email": "person@example.com"},
)
request_id = gen.json()["requestId"]

# 2 — Verify it
check = requests.post(
    f"{BASE}/api/otp/verify",
    json={"email": "person@example.com", "otp": "482913"},
)
assert check.json()["verified"] is True`,
  },
];

function renderLine(line: string, i: number) {
  const trimmed = line.trimStart();
  const isComment = trimmed.startsWith("#") || trimmed.startsWith("//");
  return (
    <div key={i} className={isComment ? "tok-faint" : undefined}>
      {line === "" ? " " : line}
    </div>
  );
}

export default function CodeTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div className="code-tabs">
      <div className="code-tabs-bar">
        <div className="code-tabs-list" role="tablist" aria-label="Integration language">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              className={active === t.id ? "active" : ""}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton text={tab.code} label="Copy" />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.pre
          key={tab.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <code>{tab.code.split("\n").map(renderLine)}</code>
        </motion.pre>
      </AnimatePresence>
    </div>
  );
}
