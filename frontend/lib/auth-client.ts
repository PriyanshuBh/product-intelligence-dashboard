import { createAuthClient } from "better-auth/react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api";

export const authClient = createAuthClient({
  baseURL: `${apiUrl}/auth`,
  fetchOptions: {
    credentials: "include",
  },
});