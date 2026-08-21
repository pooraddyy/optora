/**
 * Design: The Verification Ledger — Swiss editorial clarity, warm paper, ink rules,
 * Optora Blue proof signals, asymmetric publishing-desk layout, and purposeful motion.
 */
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Copy,
  Github,
  KeyRound,
  Link2,
  LockKeyhole,
  Mail,
  Menu,
  ShieldCheck,
  TimerReset,
  Webhook,
  X,
} from "lucide-react";

type Flow = "code" | "link";
type TraceState = "ready" | "sent" | "verified";

type Endpoint = {
  method: "POST" | "GET";
  path: string;
  label: string;
  tone: "post" | "get";
  summary: string;
  inputs: string[];
  response: string;
};

const endpoints: Endpoint[] = [
  { method: "POST", path: "/api/otp/generate", label: "Send a code", tone: "post", summary: "Issue and deliver a short-lived code to a verified email address.", inputs: ["email · required", "type · numeric | alphanumeric | alphabet", "organization · optional", "subject · optional"], response: '{ "requestId": "…", "validityMinutes": 5 }' },
  { method: "POST", path: "/api/otp/send-link", label: "Send a magic link", tone: "post", summary: "Deliver a one-click verification link, optionally with a confirmation webhook.", inputs: ["email · required", "organization · optional", "subject · optional", "webhookUrl · optional HTTPS endpoint"], response: '{ "requestId": "…", "webhookRegistered": true }' },
  { method: "POST", path: "/api/otp/verify", label: "Verify a code", tone: "post", summary: "Confirm the code supplied by the user before its verification window expires.", inputs: ["email · required", "otp · required"], response: '{ "verified": true, "message": "Email verified successfully" }' },
  { method: "GET", path: "/api/otp/verify-link", label: "Resolve a magic link", tone: "get", summary: "Complete a signed-link verification in the browser and dispatch its webhook when configured.", inputs: ["token · required query parameter"], response: "Branded verification result page" },
  { method: "GET", path: "/api/otp/status/:requestId", label: "Read verification status", tone: "get", summary: "Read the lifecycle status of an issued verification request from your backend.", inputs: ["requestId · required path parameter"], response: '{ "found": true, "verified": false, "expired": false }' },
];

const codeSample = `const response = await fetch("https://your-optora.app/api/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "person@example.com",
    organization: "Your product",
  }),
});

const { requestId } = await response.json();`;

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/assets/optora-logo-mark.png"
      alt="Optora"
      className={className}
    />
  );
}

export default function Home() {
  const [flow, setFlow] = useState<Flow>("code");
  const [traceState, setTraceState] = useState<TraceState>("ready");
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>("/api/otp/generate");

  const copySample = async () => {
    try {
      await navigator.clipboard.writeText(codeSample);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const runTrace = () => {
    if (traceState === "ready") {
      setTraceState("sent");
      window.setTimeout(() => setTraceState("verified"), 800);
    } else {
      setTraceState("ready");
    }
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const primaryLabel = traceState === "ready" ? "Run a trace" : traceState === "sent" ? "Sending…" : "Trace verified";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f0e8] text-[#141412]">
      <header className="site-header">
        <div className="site-shell header-inner">
          <button className="brand" onClick={() => scrollTo("top")} aria-label="Back to top">
            <BrandMark className="brand-mark" />
            <span className="brand-word">optora</span>
            <span className="version-tag">v2.0</span>
          </button>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <button onClick={() => scrollTo("flows")}>Flows</button>
            <button onClick={() => scrollTo("endpoints")}>Endpoints</button>
            <button onClick={() => scrollTo("security")}>Security</button>
          </nav>

          <div className="header-actions">
            <a href="https://github.com/pooraddyy/optora" target="_blank" rel="noreferrer" className="github-link">
              <Github size={16} strokeWidth={2.25} />
              <span>GitHub</span>
            </a>
            <a
              className="docs-button"
              href="https://github.com/pooraddyy/optora/blob/main/docs/API.md"
              target="_blank"
              rel="noreferrer"
            >
              Read docs <ArrowUpRight size={15} strokeWidth={2.4} />
            </a>
            <button className="menu-button" onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle menu" aria-expanded={menuOpen}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu site-shell">
            <button onClick={() => scrollTo("flows")}>Flows <ArrowDownRight size={16} /></button>
            <button onClick={() => scrollTo("endpoints")}>Endpoints <ArrowDownRight size={16} /></button>
            <button onClick={() => scrollTo("security")}>Security <ArrowDownRight size={16} /></button>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-noise" aria-hidden="true" />
          <div className="site-shell hero-grid">
            <div className="proof-rail hero-rail" aria-hidden="true"><span>01</span></div>
            <div className="hero-copy">
              <div className="eyebrow-row reveal delay-1">
                <span className="signal-dot" />
                <span>EMAIL VERIFICATION API</span>
                <span className="eyebrow-rule" />
                <span>SELF-HOSTABLE</span>
              </div>
              <h1 className="hero-title reveal delay-2">Email trust, reduced to <em>one reliable request.</em></h1>
              <p className="hero-description reveal delay-3">
                A lightweight API for secure OTP codes and magic links—built for backend teams who would rather ship product than rebuild verification logic.
              </p>
              <div className="hero-actions reveal delay-4">
                <button className="primary-cta" onClick={() => scrollTo("endpoints")}>
                  Inspect the API surface <ArrowDownRight size={18} strokeWidth={2.5} />
                </button>
                <button className="text-cta" onClick={() => scrollTo("flows")}>
                  See both flows <ChevronRight size={17} strokeWidth={2.5} />
                </button>
              </div>
              <div className="hero-evidence reveal delay-5">
                <span><CircleCheck size={15} /> Rate limited</span>
                <span><CircleCheck size={15} /> TTL managed</span>
                <span><CircleCheck size={15} /> Webhook-ready</span>
              </div>
            </div>

            <div className="hero-art reveal delay-3">
              <div className="art-index">VERIFICATION<br />CONSTELLATION</div>
              <div className="signal-sweep" aria-hidden="true" />
              <img src="/assets/optora-verification-hero.png" alt="Abstract code cells routing to a verified state" />
              <div className="art-stamp"><span className="stamp-dot" /> ROUTE ACTIVE <b>01</b></div>
            </div>
          </div>

          <div className="site-shell hero-footer">
            <div className="hero-footer-line" />
            <span>BUILT ON NODE · EXPRESS · MONGODB</span>
            <span className="footer-status"><i /> SYSTEMS NOMINAL</span>
          </div>
        </section>

        <section id="flows" className="flow-section section-anchor">
          <div className="site-shell flow-grid-layout">
            <div className="proof-rail" aria-hidden="true"><span>02</span></div>
            <div className="section-intro-block">
              <p className="section-kicker">TWO ROUTES TO VERIFIED</p>
              <h2>One intent.<br /><em>Two clean exits.</em></h2>
              <p>Choose the interaction your product needs. Optora takes care of the expiry, delivery, blocking, and confirmation trail behind the request.</p>
              <div className="flow-selector" aria-label="Choose verification flow">
                <button className={flow === "code" ? "active" : ""} onClick={() => setFlow("code")}>
                  <KeyRound size={16} /> Code flow
                </button>
                <button className={flow === "link" ? "active" : ""} onClick={() => setFlow("link")}>
                  <Link2 size={16} /> Magic link
                </button>
              </div>
            </div>

            <div className="flow-board" data-flow={flow}>
              <div className="board-topline">
                <span>{flow === "code" ? "CODE_FLOW.V1" : "MAGIC_LINK.V1"}</span>
                <span className="board-live"><i /> READY</span>
              </div>
              {flow === "code" ? (
                <div className="flow-path code-path" key="code-flow">
                  <div className="path-node node-mail"><Mail size={20} /><span>email</span></div>
                  <div className="path-connector"><span>01</span><i /></div>
                  <div className="path-node node-otp"><div className="mini-otp"><b>4</b><b>8</b><b>2</b></div><span>6-digit OTP</span></div>
                  <div className="path-connector"><span>02</span><i /></div>
                  <div className="path-node node-verified"><Check size={25} strokeWidth={3} /><span>verified</span></div>
                  <div className="path-meta meta-a">POST /generate</div>
                  <div className="path-meta meta-b">POST /verify</div>
                </div>
              ) : (
                <div className="flow-path link-path" key="link-flow">
                  <div className="path-node node-mail"><Mail size={20} /><span>email</span></div>
                  <div className="path-connector"><span>01</span><i /></div>
                  <div className="path-node node-link"><Link2 size={24} /><span>signed link</span></div>
                  <div className="path-connector"><span>02</span><i /></div>
                  <div className="path-node node-verified"><Check size={25} strokeWidth={3} /><span>webhook</span></div>
                  <div className="path-meta meta-a">POST /send-link</div>
                  <div className="path-meta meta-b">GET /verify-link</div>
                </div>
              )}
              <div className="board-caption">
                <span>EXPIRES AUTOMATICALLY</span>
                <span>•</span>
                <span>SECURELY GENERATED</span>
                <span>•</span>
                <span>FULLY CONFIGURABLE</span>
              </div>
              <div className="flow-progress" aria-hidden="true"><span /></div>
            </div>
          </div>
        </section>

        <section id="endpoints" className="endpoint-section section-anchor">
          <div className="site-shell endpoint-layout">
            <div className="endpoint-head">
              <div>
                <p className="section-kicker">THE API SURFACE</p>
                <h2>Small surface.<br /><em>Complete control.</em></h2>
              </div>
              <p>Five endpoints cover every critical moment—from sending a code to receiving verification status in your own backend.</p>
            </div>

            <div className="endpoint-stack">
              {endpoints.map((endpoint, index) => {
                const isActive = activeEndpoint === endpoint.path;
                return (
                  <div key={endpoint.path} className={`endpoint-entry ${isActive ? "is-active" : ""}`}>
                    <button
                      className="endpoint-row"
                      onClick={() => {
                        setTraceState("ready");
                        setActiveEndpoint(isActive ? null : endpoint.path);
                      }}
                      aria-expanded={isActive}
                      aria-controls={`endpoint-${index}`}
                    >
                      <span className="endpoint-number">0{index + 1}</span>
                      <span className={`method-pill ${endpoint.tone}`}>{endpoint.method}</span>
                      <code>{endpoint.path}</code>
                      <span className="endpoint-label">{endpoint.label}</span>
                      <span className="endpoint-action">{isActive ? "Close" : "Inspect"}<ChevronDown size={16} /></span>
                    </button>
                    {isActive && (
                      <div className="endpoint-details" id={`endpoint-${index}`}>
                        <div className="endpoint-detail-copy">
                          <span className="detail-label">REQUEST CONTRACT</span>
                          <p>{endpoint.summary}</p>
                        </div>
                        <div className="endpoint-detail-inputs">
                          <span className="detail-label">INPUTS</span>
                          <ul>{endpoint.inputs.map((input) => <li key={input}>{input}</li>)}</ul>
                        </div>
                        <div className="endpoint-detail-response">
                          <span className="detail-label">200 RESPONSE</span>
                          <code>{endpoint.response}</code>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="trace-grid">
              <div className="code-card">
                <div className="code-card-bar">
                  <div className="window-dots"><i /><i /><i /></div>
                  <span>example.ts</span>
                  <button onClick={copySample} aria-label="Copy code sample">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button>
                </div>
                <pre><code>{codeSample}</code></pre>
              </div>

              <div className={`trace-card state-${traceState}`}>
                <div className="trace-head">
                  <span><span className="trace-dot" /> LIVE REQUEST TRACE</span>
                  <span className="trace-id">REQ_9E12A</span>
                </div>
                <div className="trace-body">
                  <div className="trace-step complete"><span>01</span><Mail size={16} /><p><b>Request accepted</b><small>email: person@example.com</small></p><Check size={16} /></div>
                  <div className={traceState === "ready" ? "trace-step" : "trace-step complete"}><span>02</span><TimerReset size={16} /><p><b>OTP issued</b><small>TTL 05:00 · numeric</small></p>{traceState !== "ready" && <Check size={16} />}</div>
                  <div className={traceState === "verified" ? "trace-step complete" : "trace-step"}><span>03</span><ShieldCheck size={16} /><p><b>Verification status</b><small>{traceState === "verified" ? "confirmed · webhook sent" : "awaiting user action"}</small></p>{traceState === "verified" && <Check size={16} />}</div>
                </div>
                <button className="trace-button" onClick={runTrace} disabled={traceState === "sent"}>
                  <span>{primaryLabel}</span>
                  {traceState === "verified" ? <Check size={16} /> : <ArrowUpRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="security-section section-anchor">
          <div className="site-shell security-layout">
            <div className="security-visual">
              <div className="security-image-wrap">
                <img src="/assets/optora-route-detail.png" alt="Email verification route with a confirmed destination" />
                <span className="visual-coordinate coord-one">T-05:00</span>
                <span className="visual-coordinate coord-two">VALID</span>
              </div>
            </div>
            <div className="security-copy">
              <p className="section-kicker">THE GUARDRAILS</p>
              <h2>Verification logic <em>that holds the line.</em></h2>
              <p>Security should be a property of the route, not a collection of afterthoughts. Optora ships the practical defenses straight into the verification lifecycle.</p>
              <div className="guardrail-list">
                <article><span><LockKeyhole size={18} /></span><div><h3>Cryptographically secure</h3><p>OTPs are generated with Node crypto, never a predictable random helper.</p></div></article>
                <article><span><TimerReset size={18} /></span><div><h3>Expiry by default</h3><p>MongoDB TTL indexes clean up expired records without scheduled maintenance.</p></div></article>
                <article><span><Webhook size={18} /></span><div><h3>Webhook confirmation</h3><p>Know the instant a magic link resolves, in the system you already run.</p></div></article>
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="site-shell closing-layout">
            <div className="closing-mark"><BrandMark /></div>
            <p className="section-kicker">A QUIETLY RELIABLE LAYER</p>
            <h2>Let identity verification <em>disappear into the product.</em></h2>
            <div className="closing-actions">
              <a className="closing-primary" href="https://github.com/pooraddyy/optora" target="_blank" rel="noreferrer">View the repository <Github size={18} /></a>
              <button className="closing-secondary" onClick={() => scrollTo("top")}>Back to the beginning <ArrowUpRight size={17} /></button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-shell footer-inner">
          <span>OPTORA © 2026</span>
          <span>LIGHTWEIGHT EMAIL VERIFICATION</span>
          <a href="https://github.com/pooraddyy/optora" target="_blank" rel="noreferrer">MIT LICENSE <ArrowUpRight size={13} /></a>
        </div>
      </footer>
    </div>
  );
}
