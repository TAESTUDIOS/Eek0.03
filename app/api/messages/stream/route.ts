// app/api/messages/stream/route.ts (psa-source)
// SSE endpoint emitting periodic ticks so clients can refresh messages efficiently.

import { NextResponse } from "next/server";

// Force dynamic execution; never pre-render this at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "edge";
export const preferredRegion = "auto";

export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // initial event
      send("hello", JSON.stringify({ ok: true, ts: Date.now() }));

      const interval = setInterval(() => {
        try { send("tick", JSON.stringify({ ts: Date.now() })); } catch {}
      }, 3000);

      const keepalive = setInterval(() => {
        try { controller.enqueue(encoder.encode(`:\n\n`)); } catch {}
      }, 15000);

      const close = () => {
        clearInterval(interval);
        clearInterval(keepalive);
        try { controller.close(); } catch {}
      };

      // @ts-ignore
      (controller as any)._onClose = close;
    },
    cancel() {},
  });

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
