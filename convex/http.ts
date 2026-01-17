import { httpRouter } from "convex/server";

const http = httpRouter();

// Note: Clerk handles authentication externally, so no auth routes are needed here.
// Add any other HTTP routes (webhooks, etc.) as needed.

export default http;
