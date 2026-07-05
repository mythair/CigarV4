import { clearSessionCookie, getSessionTokenHash, jsonError, jsonOk } from "@/lib/apiHelpers";
import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { localStore } from "@/lib/localStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const tokenHash = getSessionTokenHash(request);
    if (hasConvexUrl() && tokenHash) {
      await callConvex("mutation", "auth:logout", { tokenHash });
    } else {
      localStore.logout(tokenHash);
    }
    const response = jsonOk({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to log out.", 400);
  }
}
