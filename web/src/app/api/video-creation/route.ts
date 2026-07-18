import { NextRequest } from "next/server";

// The Cursor CLI agent is long-running; keep this handler on the Node runtime
// and never cache so we can stream Server-Sent Events straight through.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const BACKEND_BASE =
  process.env.API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:3000";

function sseError(message: string, status = 500): Response {
  const body =
    `event: error\ndata: ${JSON.stringify({ message })}\n\n` +
    `event: done\ndata: ${JSON.stringify({ exitCode: 1, error: message })}\n\n`;
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  const apiKey = process.env.VIDEO_CREATION_API_KEY?.trim();
  if (!apiKey) {
    return sseError(
      "VIDEO_CREATION_API_KEY is not configured on the web server",
      503,
    );
  }

  let payload: { prompt?: unknown; username?: unknown };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return sseError("Invalid JSON body", 400);
  }

  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (!prompt) {
    return sseError("A prompt is required", 400);
  }

  const rawUsername =
    typeof payload.username === "string" ? payload.username : "guest";
  const username =
    rawUsername.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64) || "guest";

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE}/api/v1/video-creation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ prompt, username }),
      // Disable Next's fetch cache for a streaming upstream.
      cache: "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return sseError(`Cannot reach video-creation backend: ${message}`, 502);
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return sseError(
      `Backend responded ${upstream.status}${text ? `: ${text}` : ""}`,
      upstream.status || 502,
    );
  }

  // Pass the upstream SSE stream straight through to the browser.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
