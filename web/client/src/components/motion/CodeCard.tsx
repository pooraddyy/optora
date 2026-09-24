/* CodeCard — rareui "Code Block" spirit: a themable, quiet code surface with a
   copy action. Tokens are hand-colored; no highlighter dependency. */
import CopyButton from "./CopyButton";
import Reveal from "./Reveal";

const SAMPLE = `const response = await fetch("https://your-optora.app/api/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "person@example.com",
    organization: "Your product",
  }),
});

const { requestId } = await response.json();`;

function highlight(line: string, key: number) {
  // Minimal tokenizer: strings, keywords, function calls, comments, punctuation.
  const parts: React.ReactNode[] = [];
  const re = /("[^"]*"|'[^']*')|\b(const|await|async|new|return)\b|([A-Za-z_$][\w$]*)(?=\s*\()/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(<span key={k++} className="tok-p">{line.slice(last, m.index)}</span>);
    const cls = m[1] ? "tok-s" : m[2] ? "tok-k" : "tok-f";
    parts.push(<span key={k++} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(<span key={k++} className="tok-p">{line.slice(last)}</span>);
  return <div key={key}>{parts.length ? parts : "\u00a0"}</div>;
}

export default function CodeCard() {
  return (
    <Reveal>
      <div className="code-card">
        <div className="code-card-bar">
          <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span className="mono">example.ts</span>
          <CopyButton text={SAMPLE} label="Copy" />
        </div>
        <pre aria-label="Code sample">
          <code>{SAMPLE.split("\n").map((line, i) => highlight(line, i))}</code>
        </pre>
      </div>
    </Reveal>
  );
}
