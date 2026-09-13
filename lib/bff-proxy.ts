import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://ai.injazyemen.cloud";

function rewriteSetCookie(cookie: string): string {
  return cookie
    // Cookie will belong to localhost instead of Laravel domain
    .replace(/;\s*Domain=[^;]*/gi, "")
    // localhost is running over HTTP during development
    .replace(/;\s*Secure/gi, "")
    // Keep it same-site for the browser -> Next.js communication
    .replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
}

export async function proxyToLaravel(
  request: NextRequest,
  path: string
) {
  const targetUrl = `${BACKEND_URL}/${path}${request.nextUrl.search}`;

  const headers = new Headers();

  // Forward normal headers
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const authorization = request.headers.get("authorization");
  const xsrfToken = request.headers.get("x-xsrf-token");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (xsrfToken) {
    headers.set("x-xsrf-token", xsrfToken);
  }

  // VERY IMPORTANT:
  // Forward browser cookies to Laravel.
  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.set("cookie", cookie);
  }

  let body: BodyInit | undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();

  // Copy normal response headers
  response.headers.forEach((value, key) => {
    const headerName = key.toLowerCase();

    if (
      headerName !== "set-cookie" &&
      headerName !== "content-encoding" &&
      headerName !== "content-length" &&
      headerName !== "transfer-encoding"
    ) {
      responseHeaders.set(key, value);
    }
  });

  // Rewrite Laravel cookies so browser stores them for localhost.
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie") as string]
        : [];

  for (const cookie of setCookies) {
    responseHeaders.append(
      "set-cookie",
      rewriteSetCookie(cookie)
    );
  }

  const responseBody =
    response.status === 204 || response.status === 304 || request.method === "HEAD"
      ? undefined
      : await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: responseHeaders,
  });
}