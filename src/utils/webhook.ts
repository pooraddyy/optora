import logger from './logger';

export interface WebhookPayload {
  event: 'email.verified';
  email: string;
  requestId: string;
  verifiedAt: string;
}

export async function fireWebhook(url: string, payload: WebhookPayload): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'otp-mailer-webhook/1.0' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      logger.error(`Webhook delivery failed — url=${url} status=${res.status}`);
    } else {
      logger.info(`Webhook delivered — url=${url} email=${payload.email}`);
    }
  } catch (err: any) {
    logger.error(`Webhook error — url=${url} err=${err.message}`);
  } finally {
    clearTimeout(timeout);
  }
}
