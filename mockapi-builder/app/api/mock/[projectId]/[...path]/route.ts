import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ projectId: string; path: string[] }>;
}

/**
 * Match an incoming request path against stored endpoint path patterns.
 */
function matchPath(
  storedPath: string,
  incomingPath: string,
): boolean {
  const storedParts = storedPath.split("/").filter(Boolean);
  const incomingParts = incomingPath.split("/").filter(Boolean);

  if (storedParts.length !== incomingParts.length) return false;

  return storedParts.every((part, i) => {
    if (part.startsWith(":")) return true;
    return part === incomingParts[i];
  });
}

/**
 * Build CORS headers for mock API responses
 */
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process Dynamic Data with Faker.js
 */
function processDynamicData(data: any): any {
  if (typeof data === "string") {
    // Check if the entire string is exactly one faker template (to preserve types like numbers/booleans)
    const exactMatch = data.match(/^\{\{faker\.([a-zA-Z0-9_.]+)(?:\(\))?\}\}$/);
    if (exactMatch) {
      try {
        const path = exactMatch[1];
        const parts = path.split(".");
        let current: any = faker;
        for (const part of parts) {
          current = current[part];
        }
        if (typeof current === "function") {
          return current();
        }
        return current;
      } catch (err) {
        return data;
      }
    }

    // Otherwise do string replacement for embedded templates
    return data.replace(/\{\{faker\.([a-zA-Z0-9_.]+)(?:\(\))?\}\}/g, (match, path) => {
      try {
        const parts = path.split(".");
        let current: any = faker;
        for (const part of parts) {
          current = current[part];
        }
        if (typeof current === "function") {
          const result = current();
          return typeof result === "object" ? JSON.stringify(result) : String(result);
        }
        return typeof current === "object" ? JSON.stringify(current) : String(current);
      } catch (err) {
        return match;
      }
    });
  } else if (Array.isArray(data)) {
    return data.map(processDynamicData);
  } else if (data !== null && typeof data === "object") {
    const result: any = {};
    for (const key in data) {
      result[key] = processDynamicData(data[key]);
    }
    return result;
  }
  return data;
}

/**
 * Handler for all HTTP methods on mock endpoints
 */
async function handleMockRequest(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { projectId: slug, path: pathSegments } = await params;
    const incomingPath = "/" + pathSegments.join("/");
    const method = req.method.toUpperCase();

    // Look up the project by slug
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        endpoints: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found",
          message: `No project with slug "${slug}" exists.`,
          hint: "Check your project slug in the MockAPI dashboard.",
        },
        { status: 404, headers: corsHeaders() },
      );
    }

    // Find matching endpoint
    const matchedEndpoint =
      project.endpoints.find(
        (ep) => ep.method === method && ep.path === incomingPath,
      ) ||
      project.endpoints.find(
        (ep) => ep.method === method && matchPath(ep.path, incomingPath),
      );

    if (!matchedEndpoint) {
      return NextResponse.json(
        {
          error: "Endpoint not found",
          message: `No ${method} endpoint matches path "${incomingPath}" in project "${project.name}".`,
          availableEndpoints: project.endpoints
            .filter((ep) => ep.isActive)
            .map((ep) => `${ep.method} ${ep.path}`),
        },
        { status: 404, headers: corsHeaders() },
      );
    }

    // Check if endpoint is active
    if (!matchedEndpoint.isActive) {
      return NextResponse.json(
        {
          error: "Endpoint disabled",
          message: `The endpoint ${method} ${matchedEndpoint.path} is currently disabled.`,
        },
        { status: 503, headers: corsHeaders() },
      );
    }

    // Check API key protection
    if (matchedEndpoint.apiKeyRequired && matchedEndpoint.apiKeyHash) {
      const provided =
        req.headers.get("x-api-key") ||
        new URL(req.url).searchParams.get("api_key");

      const isValid =
        provided ? await bcrypt.compare(provided, matchedEndpoint.apiKeyHash) : false;

      if (!isValid) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message: "This endpoint requires a valid API key. Pass it via the X-API-Key header or ?api_key= query param.",
          },
          { status: 401, headers: corsHeaders() },
        );
      }
    }

    // Apply delay if configured
    if (matchedEndpoint.delay > 0) {
      await delay(matchedEndpoint.delay);
    }

    // Build response headers
    const responseHeaders: Record<string, string> = {
      ...corsHeaders(),
      "Content-Type": "application/json",
      "X-MockAPI-Project": project.name,
      "X-MockAPI-Endpoint": `${matchedEndpoint.method} ${matchedEndpoint.path}`,
      "X-MockAPI-Delay": `${matchedEndpoint.delay}ms`,
    };

    // Merge custom headers from endpoint config
    const customHeaders = matchedEndpoint.headers as Record<string, string> | null;
    if (customHeaders && typeof customHeaders === "object") {
      Object.entries(customHeaders).forEach(([key, value]) => {
        if (typeof value === "string") {
          responseHeaders[key] = value;
        }
      });
    }

    // Process Dynamic Data (Faker)
    const finalBody = processDynamicData(matchedEndpoint.body);

    // Asynchronously log the request
    try {
      let reqBody = null;
      if (req.body) {
        try {
          const clone = req.clone();
          reqBody = await clone.json();
        } catch {
          reqBody = null;
        }
      }

      const { searchParams } = new URL(req.url);
      const reqQuery = Object.fromEntries(searchParams.entries());

      const reqHeaders: Record<string, string> = {};
      req.headers.forEach((v, k) => { reqHeaders[k] = v; });

      const ip = reqHeaders["x-forwarded-for"] || reqHeaders["x-real-ip"] || "Unknown";

      prisma.requestLog.create({
        data: {
          projectId: project.id,
          endpointId: matchedEndpoint.id,
          method,
          path: incomingPath,
          status: matchedEndpoint.statusCode,
          headers: reqHeaders,
          body: reqBody || {},
          query: reqQuery,
          ip,
        }
      }).catch((e) => console.error("Failed to save request log:", e));
    } catch (logErr) {
      console.error("Error setting up request log:", logErr);
    }

    return NextResponse.json(finalBody, {
      status: matchedEndpoint.statusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Mock server error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Something went wrong with the mock server." },
      { status: 500, headers: corsHeaders() },
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// Export handlers for all HTTP methods
export const GET = handleMockRequest;
export const POST = handleMockRequest;
export const PUT = handleMockRequest;
export const DELETE = handleMockRequest;
export const PATCH = handleMockRequest;
