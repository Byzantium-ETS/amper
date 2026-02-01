/**
 * Minimal TypeScript content script stub for Amper
 *
 * Responsibilities:
 *  - Provide a small bridge between page context and extension background
 *  - Forward simple requests (parse challenge, store/get tokens) to the background
 *  - Offer a tiny helper to inject a script into the page if needed
 *
 * This file is intentionally minimal and message-driven. The background service
 * worker implements the authoritative L402 token logic; the content script
 * forwards requests and forwards responses back to the page when appropriate.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const chrome: any;

type BackgroundResponse<T = any> = { success: boolean; [k: string]: any } & T;

/**
 * Send a message to the background service worker and await the response.
 */
function sendToBackground<T = any>(message: Record<string, any>): Promise<BackgroundResponse<T>> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (resp: BackgroundResponse<T>) => {
        // In MV3, runtime.lastError may be set for certain failures
        // We normalize to a structured response
        if (!resp) {
          const lastErr = chrome.runtime?.lastError;
          resolve({ success: false, error: String(lastErr?.message ?? "no response") } as unknown as BackgroundResponse<T>);
          return;
        }
        resolve(resp);
      });
    } catch (err: any) {
      resolve({ success: false, error: String(err?.message ?? err) } as unknown as BackgroundResponse<T>);
    }
  });
}

/**
 * Convenience helpers that call the background handlers implemented in `background.ts`.
 */

export async function parseChallenge(header: string | null) {
  const resp = await sendToBackground({ type: "PARSE_L402_CHALLENGE", header });
  if (!resp.success) return null;
  return resp.challenge ?? null;
}

export async function createTokenFromHeader(header: string | null, metadata?: Record<string, unknown>) {
  const resp = await sendToBackground({ type: "CREATE_TOKEN_FROM_HEADER", header, metadata });
  if (!resp.success) return null;
  return resp.token ?? null;
}

export async function getTokens() {
  const resp = await sendToBackground({ type: "GET_TOKENS" });
  if (!resp.success) return [];
  return resp.tokens ?? [];
}

export async function payInvoice(invoice: string) {
  const resp = await sendToBackground({ type: "PAY_INVOICE", invoice });
  return resp;
}

/**
 * Inject a script into the page context.
 * Useful when you need an in-page bridge that has access to page JS globals.
 */
export function injectScript(file: string, node: "head" | "body" = "body") {
  try {
    const target = document.getElementsByTagName(node)[0] || document.documentElement;
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    // chrome.runtime.getURL is available in content scripts
    script.setAttribute("src", chrome.runtime.getURL(file));
    script.setAttribute("async", "false");
    target.appendChild(script);
    script.addEventListener("load", () => {
      script.remove();
    });
  } catch (err) {
    console.error("Amper: injectScript failed", err);
  }
}

/**
 * Simple window <-> extension messaging bridge.
 *
 * Page authors (or an injected script) can post messages to the page window:
 *   window.postMessage({ amper: true, type: 'GET_TOKENS' }, '*');
 *
 * This content script listens, forwards to the background, and posts a reply
 * back to the window:
 *   window.postMessage({ amper: true, type: 'GET_TOKENS_RESPONSE', success: true, tokens }, '*');
 *
 * This keeps communication asynchronous and avoids cross-extension leaks.
 */

const BRIDGE_FLAG = "amper";

/**
 * Valid request types we will accept from page context.
 * Extend as needed, but keep a whitelist for safety.
 */
const ALLOWED_PAGE_REQUESTS = new Set([
  "PARSE_CHALLENGE",
  "CREATE_TOKEN_FROM_HEADER",
  "GET_TOKENS",
  "PAY_INVOICE",
]);

window.addEventListener("message", (ev) => {
  // Only accept messages from the same origin for safety
  if (ev.source !== window) return;
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;
  if (msg.amper !== true) return; // simple flag to identify messages
  const { type, requestId } = msg;
  if (!type || !ALLOWED_PAGE_REQUESTS.has(type)) {
    // Respond with an error to the page so it's easier to debug
    window.postMessage({ amper: true, type: `${type}_RESPONSE`, requestId, success: false, error: "unsupported_request" }, "*");
    return;
  }

  (async () => {
    try {
      switch (type) {
        case "PARSE_CHALLENGE": {
          const header: string | null = msg.header ?? null;
          const challenge = await parseChallenge(header);
          window.postMessage({ amper: true, type: "PARSE_CHALLENGE_RESPONSE", requestId, success: true, challenge }, "*");
          break;
        }
        case "CREATE_TOKEN_FROM_HEADER": {
          const header: string | null = msg.header ?? null;
          const metadata = msg.metadata ?? {};
          const token = await createTokenFromHeader(header, metadata);
          window.postMessage({ amper: true, type: "CREATE_TOKEN_FROM_HEADER_RESPONSE", requestId, success: !!token, token }, "*");
          break;
        }
        case "GET_TOKENS": {
          const tokens = await getTokens();
          window.postMessage({ amper: true, type: "GET_TOKENS_RESPONSE", requestId, success: true, tokens }, "*");
          break;
        }
        case "PAY_INVOICE": {
          const invoice: string = msg.invoice;
          const resp = await payInvoice(invoice);
          window.postMessage({ amper: true, type: "PAY_INVOICE_RESPONSE", requestId, success: resp?.success === true, result: resp }, "*");
          break;
        }
        default: {
          window.postMessage({ amper: true, type: `${type}_RESPONSE`, requestId, success: false, error: "internal_error" }, "*");
        }
      }
    } catch (err: any) {
      window.postMessage({ amper: true, type: `${type}_RESPONSE`, requestId, success: false, error: String(err?.message ?? err) }, "*");
    }
  })();
});

/**
 * Basic initialization log so developers can see the content script is active.
 */
console.info("Amper content script loaded");
