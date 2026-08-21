function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function renderVerificationPage(options: { title: string; message: string; success: boolean }): string {
  const tone = options.success ? "success" : "error";
  const icon = options.success ? "✓" : "!";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#f3f0e8" />
  <title>${escapeHtml(options.title)} — Optora</title>
  <style>
    :root { --ink:#141412; --paper:#f3f0e8; --blue:#1457e5; --green:#168149; --red:#c94128; }
    * { box-sizing:border-box; }
    body { min-height:100vh; margin:0; display:grid; place-items:center; background:var(--paper); color:var(--ink); font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { width:min(92vw,560px); padding:24px; }
    .brand { display:flex; align-items:center; gap:9px; margin-bottom:32px; font-weight:800; font-size:20px; letter-spacing:-.07em; }
    .mark { display:grid; width:30px; height:30px; place-items:center; border:3px solid var(--blue); border-radius:50%; color:var(--blue); font-size:14px; line-height:1; }
    .card { padding:38px; border:1px solid rgba(20,20,18,.18); background:#fbfaf5; box-shadow:8px 8px 0 var(--ink); }
    .status { display:grid; width:54px; height:54px; place-items:center; margin-bottom:23px; border-radius:50%; color:#fff; background:${tone === "success" ? "var(--green)" : "var(--red)"}; font-size:28px; font-weight:800; }
    .eyebrow { margin:0 0 12px; color:var(--blue); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10px; font-weight:700; letter-spacing:.09em; }
    h1 { margin:0; font-size:clamp(34px,9vw,50px); line-height:.98; letter-spacing:-.07em; }
    p { margin:19px 0 0; color:#625f57; font-size:15px; line-height:1.7; }
    .rule { height:1px; margin-top:31px; background:rgba(20,20,18,.16); }
    .note { margin-top:14px; color:#78746a; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10px; letter-spacing:.02em; }
  </style>
</head>
<body>
  <main>
    <div class="brand"><span class="mark">✓</span><span>optora</span></div>
    <section class="card" aria-live="polite">
      <div class="status">${icon}</div>
      <p class="eyebrow">EMAIL VERIFICATION</p>
      <h1>${escapeHtml(options.title)}</h1>
      <p>${escapeHtml(options.message)}</p>
      <div class="rule"></div>
      <p class="note">YOU MAY NOW RETURN TO THE APPLICATION.</p>
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
