type ConvexKind = "query" | "mutation" | "action";

type ConvexSuccess<T> = {
  status: "success";
  value: T;
};

type ConvexError = {
  status: "error";
  errorMessage?: string;
  errorData?: unknown;
};

export function hasConvexUrl(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

export async function callConvex<T>(kind: ConvexKind, path: string, args: Record<string, unknown> = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args, format: "json" }),
    cache: "no-store",
  });

  const json = (await response.json()) as ConvexSuccess<T> | ConvexError;
  if (!response.ok || json.status === "error") {
    throw new Error(json.status === "error" ? json.errorMessage ?? "Convex request failed." : "Convex request failed.");
  }

  return json.value;
}
