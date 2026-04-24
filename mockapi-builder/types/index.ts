import type { Prisma } from "@prisma/client";

// ─── Database Types ──────────────────────────────────────────

export type ProjectWithEndpoints = Prisma.ProjectGetPayload<{
  include: { endpoints: true };
}>;

export type ProjectWithCount = Prisma.ProjectGetPayload<{
  include: { _count: { select: { endpoints: true } } };
}>;

// ─── Form Types ──────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface EndpointFormData {
  method: HttpMethod;
  path: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string; // JSON string
  delay: number;
  isActive: boolean;
}

export interface ProjectFormData {
  name: string;
}

// ─── API Response Types ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── UI Types ────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

// ─── Method Badge Colors ─────────────────────────────────────

export const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  POST: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  DELETE: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  PATCH: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export const STATUS_CODES = [
  { value: 200, label: "200 OK" },
  { value: 201, label: "201 Created" },
  { value: 204, label: "204 No Content" },
  { value: 400, label: "400 Bad Request" },
  { value: 401, label: "401 Unauthorized" },
  { value: 403, label: "403 Forbidden" },
  { value: 404, label: "404 Not Found" },
  { value: 500, label: "500 Server Error" },
];
