import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { jsonError, jsonOk, setSessionCookie } from "@/lib/apiHelpers";
import { createSessionToken, hashPassword, hashSessionToken, validatePassword, validateUsername } from "@/lib/security";
import { localStore, type PublicUser } from "@/lib/localStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    const usernameError = validateUsername(username);
    if (usernameError) return jsonError(usernameError, 422);
    const passwordError = validatePassword(password);
    if (passwordError) return jsonError(passwordError, 422);

    const token = createSessionToken();
    const args = {
      username,
      passwordHash: hashPassword(password),
      sessionTokenHash: hashSessionToken(token),
      now: Date.now(),
    };

    const user = hasConvexUrl()
      ? await callConvex<PublicUser>("mutation", "auth:login", args)
      : localStore.login(args);

    const response = jsonOk({ user });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to log in.", 401);
  }
}
