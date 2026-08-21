function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
    return entities[character] ?? character;
  });
}

function renderVerificationPage(options: { title: string; message: string; success: boolean }): string {
  const tone = options.success ? "#168149" : "#c94128";
  const icon = options.success ? "✓" : "!";
  const statusLabel = options.success ? "VERIFICATION COMPLETE" : "VERIFICATION INTERRUPTED";
  const footer = options.success ? "YOU MAY NOW RETURN TO THE APPLICATION." : "REQUEST A NEW LINK FROM THE APPLICATION.";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#f3f0e8" />
  <title>${escapeHtml(options.title)} — Optora</title>
  <style>
    :root{--ink:#151513;--paper:#f3f0e8;--blue:#1457e5;--muted:#68645c;--line:#c9c5b9}
    *{box-sizing:border-box}
    body{min-height:100vh;margin:0;background:var(--paper);color:var(--ink);font-family:Arial,Helvetica,sans-serif}
    body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.22;background-image:linear-gradient(rgba(20,20,18,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,20,18,.05) 1px,transparent 1px);background-size:34px 34px}
    main{width:min(92vw,620px);margin:0 auto;padding:32px 0 48px;position:relative}
    .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:54px}
    .brand{display:flex;align-items:center;gap:10px;font-size:21px;font-weight:800;letter-spacing:-.08em}
    .mark{display:grid;width:32px;height:32px;place-items:center;border:3px solid var(--blue);border-radius:50%;color:var(--blue);font-size:15px;line-height:1}
    .meta{color:var(--blue);font:700 10px/1.3 'Courier New',monospace;letter-spacing:.13em;text-align:right}
    .card{background:#fbfaf5;border:1px solid var(--line);box-shadow:9px 9px 0 var(--ink)}
    .card-head{display:flex;align-items:flex-start;justify-content:space-between;padding:31px 34px 24px;border-bottom:1px solid #d9d5ca}
    .eyebrow{margin:0;color:var(--blue);font:700 10px/1.3 'Courier New',monospace;letter-spacing:.13em}
    .stamp{display:grid;width:48px;height:48px;place-items:center;border-radius:50%;background:${tone};color:#fff;font:700 25px/1 Arial,sans-serif}
    .body{padding:31px 34px 34px}
    h1{margin:0;max-width:480px;font-size:clamp(36px,8vw,58px);line-height:.94;letter-spacing:-.085em}
    .message{margin:21px 0 0;color:var(--muted);font-size:15px;line-height:1.72}
    .trace{display:grid;grid-template-columns:1fr auto;gap:16px;margin-top:30px;padding-top:18px;border-top:1px solid #d9d5ca;color:var(--muted);font:11px/1.5 'Courier New',monospace}
    .trace strong{color:${tone};font-weight:700}
    .footer{padding:18px 34px;background:var(--ink);color:#bcb9b0;font:10px/1.6 'Courier New',monospace;letter-spacing:.04em}
    .footer strong{color:#fff;font-weight:400}
    @media(max-width:560px){main{padding-top:22px}.topbar{margin-bottom:38px}.card-head,.body{padding-left:24px;padding-right:24px}.footer{padding-left:24px;padding-right:24px}.meta{font-size:9px}.trace{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:no-preference){.card{animation:rise .5s cubic-bezier(.23,1,.32,1) both}.stamp{animation:stamp .55s .15s cubic-bezier(.23,1,.32,1) both}@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes stamp{from{opacity:0;transform:scale(.82) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(0)}}}
  </style>
</head>
<body>
  <main>
    <header class="topbar"><div class="brand"><span class="mark">✓</span><span>optora</span></div><div class="meta">EMAIL<br />VERIFICATION</div></header>
    <section class="card" aria-live="polite">
      <div class="card-head"><p class="eyebrow">${statusLabel}</p><div class="stamp" aria-hidden="true">${icon}</div></div>
      <div class="body"><h1>${escapeHtml(options.title)}</h1><p class="message">${escapeHtml(options.message)}</p><div class="trace"><span>REQUEST STATE</span><strong>${options.success ? "SIGNED / RESOLVED" : "EXPIRED / UNRESOLVED"}</strong></div></div>
      <div class="footer"><strong>${footer}</strong><br />OPTORA / ONE REQUEST. ONE CLEAR OUTCOME.</div>
    </section>
  </main>
</body>
</html>`;
}

export function renderVerifySuccess(email: string): string {
  return renderVerificationPage({
    title: "Email verified.",
    message: `${email} is confirmed. Your application has been notified if a webhook was registered.`,
    success: true,
  });
}

export function renderVerifyError(message: string): string {
  return renderVerificationPage({
    title: "Verification unavailable.",
    message: message || "This verification link is invalid or has expired.",
    success: false,
  });
}
