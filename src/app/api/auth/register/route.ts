import { callConvex, hasConvexUrl } from "@/lib/convexHttp";
import { jsonError, jsonOk, setSessionCookie } from "@/lib/apiHelpers";
import { createSessionToken, getClientIp, hashIp, hashPassword, hashSessionToken, normalizeEmail, validatePassword, validateUsername } from "@/lib/security";
import { localStore, type PublicUser } from "@/lib/localStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; email?: string; password?: string };
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    const email = normalizeEmail(body.email);

    const usernameError = validateUsername(username);
    if (usernameError) return jsonError(usernameError, 422);
    const passwordError = validatePassword(password);
    if (passwordError) return jsonError(passwordError, 422);

    const token = createSessionToken();
    const args = {
      username,
      email,
      passwordHash: hashPassword(password),
      ipHash: hashIp(getClientIp(request)),
      sessionTokenHash: hashSessionToken(token),
      now: Date.now(),
    };

    const user = hasConvexUrl()
      ? await callConvex<PublicUser>("mutation", "auth:register", args)
      : localStore.register(args);

    const response = jsonOk({ user });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create account.", 400);
  }
}
