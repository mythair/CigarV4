import { getSessionTokenHash, jsonError, jsonOk } from "@/lib/apiHelpers";
import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { localStore, type ForumThread } from "@/lib/localStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const limitValue = searchParams.get("limit");
    const limit = limitValue ? Number(limitValue) : undefined;
    const args = { categorySlug, limit: Number.isFinite(limit) ? limit : undefined };
    const threads = hasConvexUrl()
      ? await callConvex<ForumThread[]>("query", "forums:listThreads", args)
      : localStore.listThreads(args);
    return jsonOk({ threads });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load threads.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const tokenHash = getSessionTokenHash(request);
    if (!tokenHash) return jsonError("You must be logged in to post a thread.", 401);
    const body = (await request.json()) as { categorySlug?: string; title?: string; content?: string };
    const categorySlug = body.categorySlug?.trim() ?? "";
    const title = body.title?.trim() ?? "";
    const content = body.content?.trim() ?? "";

    if (!categorySlug) return jsonError("Choose a channel first.", 422);
    if (title.length < 5) return jsonError("Thread title must be at least 5 characters.", 422);
    if (content.length < 10) return jsonError("Thread content must be at least 10 characters.", 422);

    const args = { tokenHash, categorySlug, title, content, now: Date.now() };
    const thread = hasConvexUrl()
      ? await callConvex<ForumThread>("mutation", "forums:createThread", args)
      : localStore.createThread(args);
    return jsonOk({ thread }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create thread.", 400);
  }
}
