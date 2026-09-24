/**
 * Optora — Obsidian Atelier (premium pass).
 * Preloader kept as-is. Editorial serif accents, a sliding AI-generated
 * image gallery, and a full-bleed visual break elevate the Obsidian
 * Console system into something quieter and more confident.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
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
import BlurCycle from "../components/motion/BlurCycle";
import Reveal from "../components/motion/Reveal";
import Tilt from "../components/motion/Tilt";
import Magnetic from "../components/motion/Magnetic";
import OtpConsole from "../components/motion/OtpConsole";
import DrawCheck from "../components/motion/DrawCheck";
import Counter from "../components/motion/Counter";
import ImageMarquee from "../components/motion/ImageMarquee";
import FlowDiagram, { type FlowKind } from "../components/motion/FlowDiagram";
import EndpointAccordion, { type Endpoint } from "../components/motion/EndpointAccordion";
import CodeCard from "../components/motion/CodeCard";

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

const NAV = [
  { id: "flows", label: "Flows" },
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
        {/* ---------- Hero ---------- */}
        <section className="hero-section">
          <div className="hero-grid-bg" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />
          <div className="site-shell">
            <div className="hero-layout">
              <div>
                <Reveal>
                  <div className="eyebrow-row">
                    <span className="signal-dot" />
                    <span className="mono">EMAIL VERIFICATION API</span>
                    <span className="mono" style={{ color: "var(--line-strong)" }}>·</span>
                    <span className="mono">SELF-HOSTED</span>
                  </div>
                </Reveal>
                <Reveal delay={0.08}>
                  <h1 className="hero-title">
                    Email trust, reduced to one{" "}
                    <BlurCycle words={["reliable", "quiet", "exact"]} className="blur-word serif-accent" /> request.
                  </h1>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="hero-description">
                    A lightweight API for secure OTP codes and magic links — built for
                    backend teams who would rather ship product than rebuild
                    verification logic.
                  </p>
                </Reveal>
                <Reveal delay={0.24}>
                  <div className="hero-actions">
                    <Magnetic>
                      <button className="btn-primary" onClick={() => scrollTo("endpoints")}>
                        Inspect the API <ArrowDownRight size={17} />
                      </button>
                    </Magnetic>
                    <button className="btn-ghost" onClick={() => scrollTo("flows")}>
                      See both flows <ChevronRight size={16} />
                    </button>
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

              <Reveal delay={0.2} y={36}>
                <OtpConsole />
              </Reveal>
            </div>

            <div className="hero-strip">
              <span>BUILT ON NODE · EXPRESS · MONGODB</span>
              <span className="strip-status"><i /> SYSTEMS NOMINAL</span>
            </div>
          </div>
        </section>

        {/* ---------- Showcase: sliding gallery ---------- */}
        <section className="showcase-section" aria-label="The craft">
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">THE CRAFT</p>
                <h2 className="section-title">Built like an <span className="serif-accent">instrument</span>.</h2>
                <p className="section-sub">
                  Every verification is a small ceremony — issued, delivered,
                  confirmed, gone. Nothing decorative. Nothing left behind.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <ImageMarquee />
            <div className="marquee-note">
              <span className="mono">HOVER TO PAUSE</span>
            </div>
          </Reveal>
        </section>

        {/* ---------- Flows ---------- */}
        <section id="flows" className="section section-anchor">
          <div className="site-shell flows-layout">
            <div>
              <Reveal>
                <p className="kicker">TWO ROUTES TO VERIFIED</p>
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

        {/* ---------- Full-bleed visual break ---------- */}
        <section className="image-break" aria-label="The Obsidian standard">
          <img
            className="bg-img"
            src="/assets/showcase-monolith.webp"
            alt="Dark obsidian monolith with a thin blue edge of light"
            loading="lazy"
            decoding="async"
          />
          <div className="veil" aria-hidden="true" />
          <div className="site-shell image-break-inner">
            <Reveal>
              <p className="kicker" style={{ color: "var(--ivory-dim)" }}>THE OBSIDIAN STANDARD</p>
              <p className="serif-line">Security you never have to think about.</p>
              <p className="break-sub">
                Five endpoints. Two flows. One quiet layer between your product
                and everyone else&apos;s inbox.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- Endpoints ---------- */}
        <section id="endpoints" className="section section-anchor" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">THE API SURFACE</p>
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
            <CodeCard />
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

        {/* ---------- Security ---------- */}
        <section id="security" className="section section-anchor">
          <div className="site-shell">
            <Reveal>
              <div className="section-head">
                <p className="kicker">THE GUARDRAILS</p>
                <h2 className="section-title">Verification logic<br />that holds the line.</h2>
                <p className="section-sub">
                  Security should be a property of the route, not a collection of
                  afterthoughts. Optora ships the practical defenses inside the
                  verification lifecycle.
                </p>
              </div>
            </Reveal>
            <div className="guard-grid">
              {[
                { icon: <LockKeyhole size={20} />, title: "Cryptographically secure", text: "OTPs are generated with Node crypto — never a predictable random helper.", num: "01" },
                { icon: <TimerReset size={20} />, title: "Expiry by default", text: "MongoDB TTL indexes clean up expired records without scheduled maintenance.", num: "02" },
                { icon: <Webhook size={20} />, title: "Webhook confirmation", text: "Know the instant a magic link resolves, in the system you already run.", num: "03" },
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

        {/* ---------- Closing ---------- */}
        <section className="closing-section">
          <div className="site-shell">
            <Reveal>
              <div className="closing-mark"><BrandMark size={68} /></div>
              <p className="kicker" style={{ textAlign: "center" }}>A QUIETLY RELIABLE LAYER</p>
              <h2 className="closing-title">Let identity verification <span className="serif-accent">disappear</span> into the product.</h2>
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
