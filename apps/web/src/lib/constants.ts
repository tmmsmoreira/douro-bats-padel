export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Delay helpers — see usage sites for rationale.
export const TIMINGS = {
  // Allow a mutation's cache/UI to settle before following up (e.g. before navigation).
  CACHE_SETTLE_MS: 150,
  // Short UI polish delay after optimistic updates (e.g. before invoking a callback).
  UI_SETTLE_MS: 100,
  // Minimum refresh-spinner visibility, so pull-to-refresh feels intentional.
  PULL_REFRESH_MIN_MS: 500,
  // Mock network latency for demo/contact forms (no real backend yet).
  MOCK_SUBMIT_MS: 1000,
  // How long a "back online" toast stays visible.
  ONLINE_TOAST_MS: 3000,
  // How long a form success confirmation remains before self-clearing.
  FORM_SUCCESS_MS: 5000,
} as const;
