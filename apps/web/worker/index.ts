const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;

export const getContentSecurityPolicy = (): string => CONTENT_SECURITY_POLICY;

export interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

export interface WorkerVersionMetadata {
  id: string;
  tag?: string;
  timestamp?: string;
}

export interface Environment {
  ASSETS: AssetFetcher;
  CF_VERSION_METADATA?: WorkerVersionMetadata;
  SOURCE_COMMIT?: string;
  SOURCE_DIRTY?: string;
}

const DEPLOYMENT_METADATA_PATH = "/__deployment";

const deploymentMetadata = (environment: Environment) => ({
  sourceCommit: environment.SOURCE_COMMIT ?? null,
  sourceDirty:
    environment.SOURCE_DIRTY === undefined
      ? null
      : environment.SOURCE_DIRTY === "true",
  workerVersionId: environment.CF_VERSION_METADATA?.id ?? null,
  workerVersionTag: environment.CF_VERSION_METADATA?.tag ?? null,
  workerVersionCreatedAt:
    environment.CF_VERSION_METADATA?.timestamp ?? null,
});

const withResponseHeaders = (
  response: Response,
  environment: Environment,
): Response => {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  const metadata = deploymentMetadata(environment);
  if (metadata.workerVersionId) {
    headers.set("X-Abris-Worker-Version", metadata.workerVersionId);
  }
  if (metadata.sourceCommit) {
    headers.set("X-Abris-Source-Commit", metadata.sourceCommit);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export default {
  async fetch(request: Request, environment: Environment): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return withResponseHeaders(
        new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET, HEAD" },
        }),
        environment,
      );
    }

    if (new URL(request.url).pathname === DEPLOYMENT_METADATA_PATH) {
      return withResponseHeaders(
        new Response(
          request.method === "HEAD"
            ? null
            : JSON.stringify(deploymentMetadata(environment)),
          {
            headers: {
              "Cache-Control": "no-store",
              "Content-Type": "application/json;charset=UTF-8",
            },
          },
        ),
        environment,
      );
    }

    return withResponseHeaders(
      await environment.ASSETS.fetch(request),
      environment,
    );
  },
};
