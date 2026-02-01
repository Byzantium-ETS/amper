// Minimal L402 (LSAT-style) TypeScript skeleton for Amper
//
// Purpose:
//  - Provide a compact, dependency-free shape for the L402 helper module.
//  - Export types and minimal async stubs so other modules can import safely.
//  - Keep implementation intentionally small; flesh out storage, crypto,
//    and payment adapter logic later when needed.
//
// Notes:
//  - This file avoids using browser globals (e.g., `chrome`) directly so it
//    remains a pure TS module. Integrations with extension storage or RPC
//    should be done by the background/content layer or via adapters.

export type L402Challenge = {
  scheme?: string; // e.g. "LSAT" or "L402"
  macaroon?: string;
  invoice?: string;
  message?: string;
  params?: Record<string, string>;
};

export type StoredToken = {
  id: string;
  macaroon: string;
  createdAt: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
};

export type PayInvoiceResult = {
  success: boolean;
  preimage?: string;
  error?: string;
};
