export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiCallOptions {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: any;
}

export async function apiCall<T>(
  url: string,
  { method = "GET", headers = {}, body }: ApiCallOptions = {}
): Promise<T> {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error; 
  }
}

