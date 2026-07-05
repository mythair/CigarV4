export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    database: process.env.NEXT_PUBLIC_CONVEX_URL ? "convex" : "local-preview-fallback",
  });
}
