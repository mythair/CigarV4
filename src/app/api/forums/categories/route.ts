import { getSessionTokenHash, jsonError, jsonOk, slugify } from "@/lib/apiHelpers";
import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { localStore, type ForumCategory } from "@/lib/localStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = hasConvexUrl()
      ? await callConvex<ForumCategory[]>("query", "forums:listCategories", {})
      : localStore.listCategories();
    return jsonOk({ categories });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load channels.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const tokenHash = getSessionTokenHash(request);
    if (!tokenHash) return jsonError("You must be logged in to create a channel.", 401);

    const body = (await request.json()) as { name?: string; description?: string; section?: string; slug?: string };
    const name = body.name?.trim() ?? "";
    if (name.length < 3) return jsonError("Channel name must be at least 3 characters.", 422);

    const args = {
      tokenHash,
      name,
      slug: slugify(body.slug || name),
      description: body.description?.trim() || "Community channel.",
      section: body.section?.trim() || "Community",
      now: Date.now(),
    };

    const category = hasConvexUrl()
      ? await callConvex("mutation", "forums:createCategory", args)
      : localStore.createCategory(args);
    return jsonOk({ category }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create channel.", 400);
  }
}
