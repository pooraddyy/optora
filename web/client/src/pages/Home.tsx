/**
 * Optora — Obsidian Atelier, second edition.
 * A minimal, editorial single page: stacked hero with an interactive sandbox,
 * numbered sections, real integration code, and a quiet self-host path.
 * Preloader kept as-is; all motion stays restrained.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Gauge,
  Github,
  KeyRound,
  Link2,
  LockKeyhole,
  Menu,
  TimerReset,
  Webhook,
  X,
} from "lucide-react";
import Preloader from "../components/motion/Preloader";
import Reveal from "../components/motion/Reveal";
import Tilt from "../components/motion/Tilt";
import Magnetic from "../components/motion/Magnetic";
import OtpConsole from "../components/motion/OtpConsole";
import DrawCheck from "../components/motion/DrawCheck";
import Counter from "../components/motion/Counter";
import CopyButton from "../components/motion/CopyButton";
import ImageMarquee, { OTP_SLIDES, CRAFT_SLIDES } from "../components/motion/ImageMarquee";
import EndpointTicker from "../components/motion/EndpointTicker";
import ImageBreak from "../components/motion/ImageBreak";
import CodeTabs from "../components/motion/CodeTabs";
import FlowDiagram, { type FlowKind } from "../components/motion/FlowDiagram";
import EndpointAccordion, { type Endpoint } from "../components/motion/EndpointAccordion";

const REPO = "https://github.com/pooraddyy/optora";
const DOCS = "https://github.com/pooraddyy/optora/blob/main/docs/API.md";
const BASE = "https://your-optora.app";

const endpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/api/otp/generate",
    label: "Send a code",
    summary: "Issue and deliver a short-lived code to a verified email address.",
    inputs: ["email · required", "type · numeric | alphanumeric | alphabet", "organization · optional", "subject · optional"],
    response: '{\n  "requestId": "…",\n  "validityMinutes": 5\n}',
    curl: `curl -X POST ${BASE}/api/otp/generate -H "Content-Type: application/json" -d '{"email":"person@example.com"}'`,
  },
  {
    method: "POST",
    path: "/api/otp/send-link",
    label: "Send a magic link",
    summary: "Deliver a one-click verification link, optionally with a confirmation webhook.",
    inputs: ["email · required", "organization · optional", "subject · optional", "webhookUrl · optional HTTPS endpoint"],
    response: '{\n  "requestId": "…",\n  "webhookRegistered": true\n}',
    curl: `curl -X POST ${BASE}/api/otp/send-link -H "Content-Type: application/json" -d '{"email":"person@example.com"}'`,
  },
  {
    method: "POST",
    path: "/api/otp/verify",
    label: "Verify a code",
    summary: "Confirm the code supplied by the user before its verification window expires.",
    inputs: ["email · required", "otp · required"],
    response: '{\n  "verified": true,\n  "message": "Email verified successfully"\n}',
    curl: `curl -X POST ${BASE}/api/otp/verify -H "Content-Type: application/json" -d '{"email":"person@example.com","otp":"482913"}'`,
  },
  {
    method: "GET",
    path: "/api/otp/verify-link",
    label: "Resolve a magic link",
    summary: "Complete a signed-link verification in the browser and dispatch its webhook when configured.",
    inputs: ["token · required query parameter"],
    response: "Branded verification result page",
    curl: `curl "${BASE}/api/otp/verify-link?token=…"`,
  },
  {
    method: "GET",
    path: "/api/otp/status/:requestId",
    label: "Read verification status",
    summary: "Read the lifecycle status of an issued verification request from your backend.",
    inputs: ["requestId · required path parameter"],
    response: '{\n  "found": true,\n  "verified": false,\n  "expired": false\n}',
    curl: `curl ${BASE}/api/otp/status/req_9e12a`,
  },
];

const QUICKSTART = [
  {
    num: "01",
    title: "Clone and install",
    cmds: ["git clone https://github.com/pooraddyy/optora.git", "cd optora && npm ci"],
    note: "Node 18 or later.",
  },
  {
    num: "02",
    title: "Configure",
    cmds: ["cp sample.env .env"],
    note: "Add your MongoDB URI and a Gmail app password. Never commit it.",
  },
  {
    num: "03",
    title: "Run",
    cmds: ["npm run dev"],
    note: "The API serves on :5000; the frontend builds from the same repo.",
  },
];

const NAV = [
  { id: "flows", label: "Flows" },
  { id: "integrate", label: "Integrate" },
  { id: "endpoints", label: "Endpoints" },
  { id: "security", label: "Security" },
];

function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span className="brand-tile" style={{ width: size, height: size, borderRadius: size * 0.27 }}>
      <img src="/assets/optora-logo-mark.png" alt="Optora" style={{ width: size * 0.68, height: size * 0.68 }} />
    </span>
  );
}

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [flow, setFlow] = useState<FlowKind>("code");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("flows");
  const spyRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    spyRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id);
        });
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) spyRef.current?.observe(el);
    });
    return () => spyRef.current?.disconnect();
  }, [booted]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {!booted && <Preloader onDone={() => setBooted(true)} />}

      <header className="site-header">
        <div className="site-shell header-inner">
          <button className="brand" onClick={() => scrollTo("top")} aria-label="Back to top">
            <BrandMark />
            <span className="brand-word">optora</span>
            <span className="version-tag">v2.0</span>
          </button>

          <nav className="nav-pills" aria-label="Primary">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                className={activeNav === id ? "active" : ""}
                onClick={() => scrollTo(id)}
              >
                {activeNav === id && (
                  <motion.span
                    className="nav-pill-indicator"
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    style={{ left: 0, right: 0 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <a className="github-link" href={REPO} target="_blank" rel="noreferrer">
              <Github size={16} /> <span>GitHub</span>
            </a>
            <a className="docs-button" href={DOCS} target="_blank" rel="noreferrer">
              Read docs <ArrowUpRight size={15} />
            </a>
            <button
              className="menu-button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="site-shell">
                {NAV.map(({ id, label }) => (
                  <button key={id} onClick={() => scrollTo(id)}>
                    {label} <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        {/* ---------- Hero: stacked statement + interactive sandbox ---------- */}
        <section className="hero-section hero-stacked">
          <div className="hero-grid-bg" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />
          <div className="site-shell">
            <div className="hero-top">
              <Reveal>
                <div className="eyebrow-row">
                  <span className="signal-dot" />
                  <span className="mono">SELF-HOSTED</span>
                  <span className="mono" style={{ color: "var(--line-strong)" }}>·</span>
                  <span className="mono">EMAIL VERIFICATION API</span>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="hero-title">
                  Email verification,<br />done <span className="serif-accent">quietly</span>.
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="hero-description">
                  Optora is a self-hosted API for OTP codes and magic links —
                  five endpoints, two flows, and none of the verification
                  plumbing left for you to write.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="hero-actions">
                  <Magnetic>
                    <button className="btn-primary" onClick={() => scrollTo("sandbox")}>
                      Try the interactive sandbox <ArrowDownRight size={17} />
                    </button>
                  </Magnetic>
                  <a className="btn-ghost" href={DOCS} target="_blank" rel="noreferrer">
                    Read the API guide <ArrowUpRight size={16} />
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <div className="hero-evidence">
                  {["Rate limited", "TTL managed", "Webhook-ready"].map((t, i) => (
                    <span key={t}>
                      <DrawCheck delay={0.5 + i * 0.15} /> {t}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            <div id="sandbox" className="sandbox-wrap section-anchor">
              <Reveal>
                <div className="sandbox-steps">
                  {["Enter an email", "Receive the code", "Verify before the TTL"].map((s, i) => (
                    <div className="sandbox-step" key={s}>
                      <span className="mono">0{i + 1}</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.12} y={36}>
                <OtpConsole />
              </Reveal>
              <p className="sandbox-note mono">INTERACTIVE SANDBOX — SIMULATED API LIFECYCLE, NO REQUEST SENT</p>
            </div>

            <div className="hero-strip">
              <span>BUILT ON NODE · EXPRESS · MONGODB</span>
              <span className="strip-status"><i /> SYSTEMS NOMINAL</span>
            </div>
          </div>
        </section>

        {/* ---------- Endpoint ticker ---------- */}
        <EndpointTicker
          items={endpoints.map((e) => ({ method: e.method as "POST" | "GET", path: e.path }))}
          onSelect={() => scrollTo("endpoints")}
        />

        {/* ---------- 01 Flows ---------- */}
        <section id="flows" className="section section-anchor">
          <div className="site-shell flows-layout">
            <div>
              <Reveal>
                <p className="kicker">01 · TWO ROUTES TO VERIFIED</p>
                <h2 className="section-title">One intent.<br /><span className="serif-accent">Two clean exits.</span></h2>
                <p className="section-sub">
                  Choose the interaction your product needs. Optora takes care of
                  expiry, delivery, blocking, and the confirmation trail behind
                  each request.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="flow-tabs" role="tablist" aria-label="Verification flows">
                  <button
                    role="tab"
                    aria-selected={flow === "code"}
                    className={`flow-tab ${flow === "code" ? "active" : ""}`}
                    onClick={() => setFlow("code")}
                  >
                    <span className="tab-icon"><KeyRound size={17} /></span>
                    <span><b>Code flow</b><small>Six digits by email, confirmed against a TTL window.</small></span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={flow === "link"}
                    className={`flow-tab ${flow === "link" ? "active" : ""}`}
                    onClick={() => setFlow("link")}
                  >
                    <span className="tab-icon"><Link2 size={17} /></span>
                    <span><b>Magic link</b><small>One click, signed URL, webhook on resolution.</small></span>
                  </button>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.12} y={30}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={flow}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FlowDiagram flow={flow} />
                </motion.div>
              </AnimatePresence>
            </Reveal>
          </div>
        </section>

        {/* ---------- 02 The craft: sliding gallery ---------- */}
        <section className="showcase-section" aria-label="The craft">
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">02 · THE CRAFT</p>
                <h2 className="section-title">Built like an <span className="serif-accent">instrument</span>.</h2>
                <p className="section-sub">
                  Every verification is a small ceremony — issued, delivered,
                  confirmed, gone. Nothing decorative. Nothing left behind.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="marquee-rows">
              <ImageMarquee slides={OTP_SLIDES} label="Verification moments gallery" duration={52} />
              <ImageMarquee slides={CRAFT_SLIDES} label="Optora craft gallery" reverse duration={60} />
            </div>
            <div className="marquee-note">
              <span className="mono">HOVER TO PAUSE</span>
            </div>
          </Reveal>
        </section>

        {/* ---------- 03 Integrate ---------- */}
        <section id="integrate" className="section section-anchor">
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">03 · INTEGRATE</p>
                <h2 className="section-title">Two requests.<br />That&apos;s the <span className="serif-accent">integration</span>.</h2>
                <p className="section-sub">
                  Send a code, then verify it. The same contract in every
                  language — pick your tab and paste.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <CodeTabs />
              <p className="integrate-note">
                Server-to-server only. Never call these endpoints from an untrusted browser or client.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- 04 Endpoints ---------- */}
        <section id="endpoints" className="section section-anchor" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">04 · THE API SURFACE</p>
                <h2 className="section-title">Small surface.<br />Complete control.</h2>
                <p className="section-sub">
                  Five endpoints cover every critical moment — from sending a code
                  to reading verification status in your own backend.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <EndpointAccordion endpoints={endpoints} />
            </Reveal>
          </div>
        </section>

        {/* ---------- Stats ---------- */}
        <div className="stats-band">
          <div className="site-shell stats-grid">
            <Counter value={5} label="documented endpoints" />
            <Counter value={2} label="verification flows" delay={0.1} />
            <Counter value={5} unit="min" label="default code TTL" delay={0.2} />
          </div>
        </div>

        {/* ---------- 05 Self-host ---------- */}
        <section className="section">
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">05 · SELF-HOST</p>
                <h2 className="section-title">Yours in <span className="serif-accent">three steps</span>.</h2>
                <p className="section-sub">
                  No accounts, no dashboards, no per-email pricing. Clone it,
                  point it at your database and mailer, and run.
                </p>
              </div>
            </Reveal>
            <div className="quick-grid">
              {QUICKSTART.map((q, i) => (
                <Reveal key={q.num} delay={i * 0.09} y={30}>
                  <div className="quick-card">
                    <span className="mono">{q.num}</span>
                    <h3>{q.title}</h3>
                    <div className="quick-cmds">
                      {q.cmds.map((c) => (
                        <div className="quick-cmd" key={c}>
                          <code>{c}</code>
                          <CopyButton text={c} label="Copy" />
                        </div>
                      ))}
                    </div>
                    <p>{q.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- 06 Security ---------- */}
        <section id="security" className="section section-anchor" style={{ paddingTop: 0 }}>
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">06 · THE GUARDRAILS</p>
                <h2 className="section-title">Verification logic<br />that holds the line.</h2>
                <p className="section-sub">
                  Security should be a property of the route, not a collection of
                  afterthoughts. Optora ships the practical defenses inside the
                  verification lifecycle.
                </p>
              </div>
            </Reveal>
            <div className="guard-grid guard-grid-4">
              {[
                { icon: <LockKeyhole size={20} />, title: "Cryptographically secure", text: "OTPs are generated with Node crypto — never a predictable random helper.", num: "01" },
                { icon: <TimerReset size={20} />, title: "Expiry by default", text: "MongoDB TTL indexes clean up expired records without scheduled maintenance.", num: "02" },
                { icon: <Gauge size={20} />, title: "Rate limited", text: "Five requests per fifteen-minute window by default, with domain allowlists and keyword filters.", num: "03" },
                { icon: <Webhook size={20} />, title: "Webhook confirmation", text: "Know the instant a magic link resolves, in the system you already run.", num: "04" },
              ].map((g, i) => (
                <Reveal key={g.title} delay={i * 0.09} y={30}>
                  <Tilt className="guard-card" max={5} glareClass="guard-glare">
                    <span className="guard-num">{g.num}</span>
                    <div className="guard-icon">{g.icon}</div>
                    <h3>{g.title}</h3>
                    <p>{g.text}</p>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Full-bleed visual break ---------- */}
        <ImageBreak
          src="/assets/showcase-monolith.webp"
          alt="Dark obsidian monolith with a thin blue edge of light"
          kicker="THE OBSIDIAN STANDARD"
          line="Security you never have to think about."
          sub="Five endpoints. Two flows. One quiet layer between your product and everyone else's inbox."
        />

        {/* ---------- Closing ---------- */}
        <section className="closing-section">
          <div className="site-shell">
            <Reveal>
              <div className="closing-mark"><BrandMark size={68} /></div>
              <p className="kicker" style={{ textAlign: "center" }}>SELF-HOSTED · MIT LICENSED</p>
              <h2 className="closing-title">Let verification <span className="serif-accent">disappear</span> into the product.</h2>
              <p className="closing-sub">
                Self-host it in minutes. Five endpoints, two flows, zero
                verification logic left for you to write.
              </p>
              <div className="closing-actions">
                <Magnetic>
                  <a className="btn-primary" href={REPO} target="_blank" rel="noreferrer">
                    View the repository <Github size={17} />
                  </a>
                </Magnetic>
                <a className="btn-ghost" href={DOCS} target="_blank" rel="noreferrer">
                  Read the API guide <ArrowUpRight size={16} />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-shell">
          <div className="footer-word" aria-hidden="true"><span>optora</span></div>
          <div className="footer-grid">
            <div className="footer-brand">
              <button className="brand" onClick={() => scrollTo("top")} aria-label="Back to top">
                <BrandMark size={30} />
                <span className="brand-word" style={{ fontSize: 17 }}>optora</span>
              </button>
              <p>Lightweight OTP email verification API. Code-based and magic-link flows, self-hosted on your stack.</p>
            </div>
            <div className="footer-col">
              <h4>PRODUCT</h4>
              {NAV.map(({ id, label }) => (
                <button key={id} onClick={() => scrollTo(id)}>{label}</button>
              ))}
            </div>
            <div className="footer-col">
              <h4>RESOURCES</h4>
              <a href={DOCS} target="_blank" rel="noreferrer">API guide</a>
              <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>
              <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">Report an issue</a>
            </div>
            <div className="footer-col">
              <h4>PROJECT</h4>
              <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT License</a>
              <a href={`${REPO}#quick-start`} target="_blank" rel="noreferrer">Quick start</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>OPTORA © 2026</span>
            <span>LIGHTWEIGHT EMAIL VERIFICATION</span>
            <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
              MIT LICENSE <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
