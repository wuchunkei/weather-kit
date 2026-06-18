/**
 * Hono route context type.
 * @typedef {import("hono").Context} HonoContext
 */

/**
 * Hono request type.
 * @typedef {HonoContext["req"]} HonoRequest
 */

/**
 * Worker normalized header dictionary.
 * @typedef {Record<string, string | string[] | undefined>} WorkerHeaders
 */

/**
 * Worker normalized internal request payload.
 * @typedef {{
 * 	method: string,
 * 	url: string,
 * 	headers: WorkerHeaders,
 * 	body?: ArrayBuffer,
 * 	bodyBytes?: ArrayBuffer,
 * }} WorkerRequest
 */

/**
 * Worker normalized internal response payload.
 * @typedef {{
 * 	status?: number,
 * 	statusCode?: number,
 * 	headers?: WorkerHeaders,
 * 	body?: string | ArrayBuffer | Uint8Array | null,
 * 	bodyBytes?: ArrayBuffer | Uint8Array | null,
 * }} WorkerResponse
 */

/**
 * Hono worker runtime adapter.
 */
export default class HonoWorkerAdapter {
    /**
     * Rewrite upstream target URL based on the worker host and fallback path.
     * @param {URL} url Current request URL.
     * @param {string} restPath Fallback route path.
     * @returns {URL} Routed URL.
     */
    static routeRewrite(url, restPath = "") {
        switch (true) {
            case url.hostname.startsWith("weatherkit."): {
                url.hostname = "weatherkit.apple.com";
                break;
            }
            default:
            case url.hostname.endsWith(".workers.dev"): {
                const [host, ...path] = `${restPath}`.split("/");
                if (!host) break;
                url.protocol = "https:";
                url.hostname = host;
                url.port = "443";
                url.pathname = `/${path.join("/")}`;
                break;
            }
        }
        return url;
    }

    /**
     * Normalize headers before forwarding upstream.
     * @param {WorkerHeaders} headers Raw request headers.
     * @returns {WorkerHeaders} Normalized request headers.
     */
    static normalizeRequestHeaders(headers = {}) {
        const requestHeaderBlacklist = new Set(["connection", "content-length", "host", "x-forwarded-proto", "x-real-ip"]);
        return Object.entries(headers).reduce((normalizedHeaders, [key, value]) => {
            if (value === undefined) return normalizedHeaders;
            const normalizedKey = key.toLowerCase();
            if (normalizedKey.startsWith("cf-") || requestHeaderBlacklist.has(normalizedKey)) return normalizedHeaders;
            normalizedHeaders[key] = value;
            return normalizedHeaders;
        }, {});
    }

    /**
     * Build the normalized internal request payload from Hono request.
     * @param {HonoRequest} req Hono request.
     * @returns {Promise<WorkerRequest>} Normalized request object.
     */
    static async buildRequest(req) {
        const url = HonoWorkerAdapter.routeRewrite(new URL(req.url), req.param("rest"));
        console.log(url.toString());
        const method = req.method;
        let bodyBytes;
        switch (method) {
            case "GET":
            case "HEAD":
            case "OPTIONS":
                break;
            default:
                bodyBytes = await req.arrayBuffer().catch(error => {
                    console.info(error);
                    return undefined;
                });
                if (!bodyBytes?.byteLength) bodyBytes = undefined;
                break;
        }
        return {
            method,
            url: url.toString(),
            headers: HonoWorkerAdapter.normalizeRequestHeaders(req.header()),
            body: bodyBytes,
            bodyBytes,
        };
    }

    /**
     * Clean response headers to avoid conflicts with Cloudflare Workers.
     * @param {WorkerHeaders} headers Raw response headers.
     * @returns {WorkerHeaders} Cleaned response headers.
     */
    static cleanupResponseHeaders(headers = {}) {
        const normalizedHeaders = { ...headers };
        if (normalizedHeaders["Content-Encoding"]) normalizedHeaders["Content-Encoding"] = "identity";
        if (normalizedHeaders["content-encoding"]) normalizedHeaders["content-encoding"] = "identity";
        delete normalizedHeaders["Content-Length"];
        delete normalizedHeaders["content-length"];
        delete normalizedHeaders["Transfer-Encoding"];
        delete normalizedHeaders["transfer-encoding"];
        return normalizedHeaders;
    }

    /**
     * Write the normalized internal response payload back to Hono.
     * @param {HonoContext} c Hono context.
     * @param {WorkerResponse} $response Internal response object.
     * @returns {Response} Hono response.
     */
    static writeResponse(c, $response = {}) {
        const headers = HonoWorkerAdapter.cleanupResponseHeaders($response.headers ?? {});
        for (const [key, value] of Object.entries(headers)) {
            if (Array.isArray(value)) {
                for (const entry of value) c.header(key, entry.toString(), { append: true });
                continue;
            }
            if (value !== undefined) c.header(key, value.toString());
        }
        c.status($response.status ?? $response.statusCode ?? 200);
        return c.body($response.body ?? $response.bodyBytes ?? null);
    }
}
