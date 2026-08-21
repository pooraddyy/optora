import { type Request, type Response, type NextFunction } from "express";
import logger from "../utils/logger";

const MAX_REQUESTS = parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "5") || 5;
const WINDOW_MS = (parseInt(process.env["RATE_LIMIT_WINDOW_MINUTES"] || "15") || 15) * 60 * 1000;

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

function purgeExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

let purgeTimer: NodeJS.Timeout | null = null;
function schedulePurge(): void {
  if (purgeTimer) return;
  purgeTimer = setInterval(purgeExpired, WINDOW_MS);
  if (purgeTimer.unref) purgeTimer.unref();
}
schedulePurge();

function hit(key: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSecs };
  }

  return { allowed: true, retryAfterSecs: 0 };
}

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = ((req.headers["x-forwarded-for"] as string) || req.ip || "127.0.0.1")
    .split(",")[0]!
    .trim();

  const email = (req.body?.email as string | undefined)?.toLowerCase().trim() || "";

  const ipResult = hit(`ip:${ip}`);
  const emailResult = email ? hit(`email:${email}`) : { allowed: true, retryAfterSecs: 0 };

  if (!ipResult.allowed || !emailResult.allowed) {
    const retryAfterSecs = Math.max(ipResult.retryAfterSecs, emailResult.retryAfterSecs);
    const retryMins = Math.ceil(retryAfterSecs / 60);
    logger.warn(`Rate limit exceeded — ip=${ip} email=${email}`);
    res
      .status(429)
      .set("Retry-After", String(retryAfterSecs))
      .json({
        error: `Too many requests. Try again in ${retryMins} minute${retryMins === 1 ? "" : "s"}.`,
        retryAfterSeconds: retryAfterSecs,
      });
    return;
  }

  next();
};
