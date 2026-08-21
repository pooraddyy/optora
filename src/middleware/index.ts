import { type Request, type Response, type NextFunction } from "express";
import { isValidEmail } from "../utils/validator";
import Blocklist from "../models/blockListModel";
import logger from "../utils/logger";

const spamWords = new Set(
  process.env["BLOCK_KEYWORDS_RULES"]
    ? process.env["BLOCK_KEYWORDS_RULES"].split(",").map((word) => word.toLowerCase().trim())
    : [],
);

const blockCache = new Map<string, number>();
const CACHE_EXPIRY_MS = 60 * 1000;

export const validateSpamMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, ...rest } = req.body || {};

    const bodyText = Object.values(rest || {})
      .map((v) => String(v ?? ""))
      .join(" ")
      .toLowerCase();

    const ip = (
      (req.headers["x-forwarded-for"] as string) ||
      req.ip ||
      "127.0.0.1"
    )
      .split(",")[0]!
      .trim();

    const now = Date.now();
    const cacheKey = email || ip;

    if (
      blockCache.has(cacheKey) &&
      now - (blockCache.get(cacheKey) as number) < CACHE_EXPIRY_MS
    ) {
      logger.warn("Spam detected: Blocked by cache");
      res.status(400).json({ error: "Spam detected" });
      return;
    }

    const blocklist = await Blocklist.findOne(
      { $or: [{ email }, { ip }] },
      { email: 1, ip: 1 },
    ).lean();

    if (blocklist) {
      blockCache.set(cacheKey, now);
      logger.warn("Spam detected: Blocked IP or email");
      res.status(400).json({ error: "Spam detected" });
      return;
    }

    for (const word of spamWords) {
      if (word && bodyText.includes(word)) {
        await Blocklist.create({ ip, email });
        blockCache.set(cacheKey, now);
        logger.warn("Spam detected: Contains blocked keywords");
        res.status(400).json({ error: "Spam detected" });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error("Error in spam validation middleware", (error as Error).message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const validateEmail = (req: Request, res: Response, next: NextFunction): void => {
  const raw = req.body?.email;
  const email = typeof raw === "string" ? raw.toLowerCase().trim() : raw;

  if (!isValidEmail(email)) {
    logger.warn("Invalid email in request");
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  req.body.email = email;
  next();
};
