import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy. Everything is served from this origin: no third-party
 * scripts, fonts, frames or APIs are allowed to load, and nothing may be submitted.
 * - 'unsafe-inline' for scripts is what Next.js needs for static pages without
 *   per-request nonces; there is no user-supplied content on the site to inject.
 * - 'wasm-unsafe-eval' and blob: workers are for the 3D model decoder only.
 * - The one exception to same-origin is the embedded Google map of the venue (frame-src).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self'",
  `connect-src 'self' blob: data:${isDev ? " ws:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  // The only frame allowed anywhere on the site: the Google map of the venue.
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "base-uri 'self'",
  "manifest-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Force HTTPS for two years, including subdomains (browsers ignore this on plain http/localhost).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // No other site may embed these pages (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // The site uses none of these device features, so no script may request them.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), hid=(), midi=(), display-capture=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Don't advertise the framework.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
