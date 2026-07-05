import { getSessionTokenHash, jsonOk } from "@/lib/apiHelpers";
import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { localStore, type PublicUser } from "@/lib/localStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const tokenHash = getSessionTokenHash(request);
  if (!tokenHash) return jsonOk({ user: null });

  try {
    const user = hasConvexUrl()
      ? await callConvex<PublicUser | null>("query", "auth:me", { tokenHash, now: Date.now() })
      : localStore.me(tokenHash);
    return jsonOk({ user });
  } catch {
    return jsonOk({ user: null });
  }
}
