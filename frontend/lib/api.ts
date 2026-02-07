import { retrieveRawInitData } from "@tma.js/sdk-react";

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach Telegram initData as authorization header
  try {
    const rawInitData = retrieveRawInitData();
    if (rawInitData) {
      headers["Authorization"] = `tma ${rawInitData}`;
    }
  } catch {
    // Not inside Telegram or SDK not initialized -- skip auth header
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
