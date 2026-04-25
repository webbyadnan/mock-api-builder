import type { HttpMethod } from "@/types";

export interface ResponseTemplate {
  id: string;
  name: string;
  description: string;
  category: "users" | "products" | "auth" | "errors" | "generic";
  method: HttpMethod;
  path: string;
  statusCode: number;
  body: unknown;
}

export const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  // ─── Users ────────────────────────────────────────────────────
  {
    id: "users-list",
    name: "Users List",
    description: "Array of 3 users with id, name, email, avatar",
    category: "users",
    method: "GET",
    path: "/users",
    statusCode: 200,
    body: [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", avatar: "https://i.pravatar.cc/150?img=1", role: "admin", createdAt: "2024-01-15T10:30:00Z" },
      { id: 2, name: "Bob Smith", email: "bob@example.com", avatar: "https://i.pravatar.cc/150?img=2", role: "user", createdAt: "2024-02-20T14:15:00Z" },
      { id: 3, name: "Carol White", email: "carol@example.com", avatar: "https://i.pravatar.cc/150?img=3", role: "user", createdAt: "2024-03-10T09:00:00Z" },
    ],
  },
  {
    id: "single-user",
    name: "Single User",
    description: "A single user object by ID",
    category: "users",
    method: "GET",
    path: "/users/:id",
    statusCode: 200,
    body: {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      avatar: "https://i.pravatar.cc/150?img=1",
      role: "admin",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-06-01T12:00:00Z",
    },
  },

  // ─── Products ────────────────────────────────────────────────
  {
    id: "product-catalog",
    name: "Product Catalog",
    description: "Array of 5 products with pricing and stock info",
    category: "products",
    method: "GET",
    path: "/products",
    statusCode: 200,
    body: [
      { id: 1, name: "MacBook Pro 16\"", price: 2499.99, currency: "USD", stock: 12, category: "laptops", inStock: true },
      { id: 2, name: "AirPods Pro", price: 249.99, currency: "USD", stock: 47, category: "audio", inStock: true },
      { id: 3, name: "iPhone 15 Pro", price: 999.99, currency: "USD", stock: 0, category: "phones", inStock: false },
      { id: 4, name: "iPad Air", price: 599.99, currency: "USD", stock: 23, category: "tablets", inStock: true },
      { id: 5, name: "Apple Watch Ultra", price: 799.99, currency: "USD", stock: 8, category: "wearables", inStock: true },
    ],
  },
  {
    id: "single-product",
    name: "Single Product",
    description: "A product detail with full attributes",
    category: "products",
    method: "GET",
    path: "/products/:id",
    statusCode: 200,
    body: {
      id: 1,
      name: "MacBook Pro 16\"",
      price: 2499.99,
      currency: "USD",
      description: "The most powerful MacBook Pro ever.",
      category: "laptops",
      stock: 12,
      inStock: true,
      images: ["https://example.com/img1.jpg"],
      tags: ["apple", "laptop", "m3"],
    },
  },

  // ─── Auth ─────────────────────────────────────────────────────
  {
    id: "auth-login-success",
    name: "Auth — Login Success",
    description: "JWT token + user object on successful login",
    category: "auth",
    method: "POST",
    path: "/auth/login",
    statusCode: 200,
    body: {
      success: true,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIEpvaG5zb24iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      expiresIn: 86400,
      user: {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "admin",
      },
    },
  },
  {
    id: "auth-login-error",
    name: "Auth — Unauthorized",
    description: "401 response for invalid credentials",
    category: "auth",
    method: "POST",
    path: "/auth/login",
    statusCode: 401,
    body: {
      success: false,
      error: "Unauthorized",
      message: "Invalid email or password.",
    },
  },

  // ─── Generic / Errors ─────────────────────────────────────────
  {
    id: "create-success",
    name: "Create Success",
    description: "201 Created with new resource",
    category: "generic",
    method: "POST",
    path: "/items",
    statusCode: 201,
    body: {
      success: true,
      data: {
        id: "clz8k2x9a0000abc1defghijk",
        name: "New Item",
        createdAt: "2024-06-01T12:00:00Z",
        updatedAt: "2024-06-01T12:00:00Z",
      },
      message: "Item created successfully.",
    },
  },
  {
    id: "not-found",
    name: "Not Found (404)",
    description: "Standard 404 error response",
    category: "errors",
    method: "GET",
    path: "/resource/:id",
    statusCode: 404,
    body: {
      success: false,
      error: "Not Found",
      message: "The requested resource could not be found.",
    },
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "users", label: "Users" },
  { id: "products", label: "Products" },
  { id: "auth", label: "Auth" },
  { id: "generic", label: "Generic" },
  { id: "errors", label: "Errors" },
] as const;
