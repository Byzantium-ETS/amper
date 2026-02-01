/**
 * Amper - Background service worker (TypeScript)
 *
 * This is a lightweight skeleton for the background service worker.
 * It imports the L402 module (l402.ts) and exposes message handlers
 * that other parts of the extension (popup, content scripts) can call.
 *
 * NOTE:
 *  - This file is a stub and intentionally minimal. It demonstrates
 *    the shape of message handlers and how the l402 module is used.
 *  - Build the project (esbuild/tsc) to emit JS that the manifest references.
 */

import { L402Challenge, StoredToken } from "./l402";

/**
 * Final note:
 * - This file is intentionally framework-agnostic and simple so you can extend it.
 * - After adding TypeScript build scripts (esbuild), the compiled output should be referenced
 *   by the manifest (manifest.json currently references `dist/background.js`).
 */
