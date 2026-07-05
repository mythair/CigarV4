import { getSessionTokenHash, jsonError, jsonOk } from "@/lib/apiHelpers";
import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { localStore, type ForumPost, type ForumThread } from "@/lib/localStore";

export const dynamic = "force-dynamic";

type ThreadPayload = { thread: ForumThread; posts: ForumPost[] } | null;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = hasConvexUrl()
      ? await callConvex<ThreadPayload>("mutation", "forums:getThread", { threadId: id })
      : localStore.getThread(id);
    if (!payload) return jsonError("Thread not found.", 404);
    return jsonOk(payload);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load thread.", 500);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenHash = getSessionTokenHash(request);
    if (!tokenHash) return jsonError("You must be logged in to reply.", 401);
    const body = (await request.json()) as { content?: string };
    const content = body.content?.trim() ?? "";
    if (content.length < 2) return jsonError("Reply cannot be empty.", 422);

    const args = { tokenHash, threadId: id, content, now: Date.now() };
    const post = hasConvexUrl()
      ? await callConvex<ForumPost>("mutation", "forums:createPost", args)
      : localStore.createPost(args);
    return jsonOk({ post }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to post reply.", 400);
  }
}
