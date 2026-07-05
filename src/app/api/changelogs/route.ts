import { jsonError, jsonOk } from "@/lib/apiHelpers";
import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { localStore, type Changelog } from "@/lib/localStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const changelogs = hasConvexUrl()
      ? await callConvex<Changelog[]>("query", "products:listChangelogs", {})
      : localStore.listChangelogs();
    return jsonOk({ changelogs });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load changelogs.", 500);
  }
}
