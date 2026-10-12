import { NextResponse, type NextRequest } from "next/server";

/**
 * The site is read-only: there are no forms, no API and no accounts.
 * Anything that is not a plain read is refused before it reaches a page.
 */
const READ_ONLY = new Set(["GET", "HEAD", "OPTIONS"]);

export function proxy(request: NextRequest) {
  if (READ_ONLY.has(request.method)) return NextResponse.next();
  return new NextResponse("Method Not Allowed", {
    status: 405,
    headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" },
  });
}
