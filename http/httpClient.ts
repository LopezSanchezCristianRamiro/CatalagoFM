import { getToken } from "../storage/secureStorage";

// Usa la URL del .env o fallback a localhost
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

async function parseErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    return json.message || json.error || fallback;
  } catch {
    return text || fallback;
  }
}

async function request<T>(
  path: string,
  options: RequestInit,
  authenticated: boolean,
  fallback: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authenticated) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, fallback);
    throw { status: res.status, message };
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const httpClient = {
  post: <T>(path: string, body: unknown, fallback = "Error en la petición") =>
    request<T>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      false,
      fallback,
    ),

  getAuth: <T>(path: string, fallback = "Error al cargar datos") =>
    request<T>(path, { method: "GET" }, true, fallback),

  postAuth: <T>(
    path: string,
    body: unknown,
    fallback = "Error al guardar datos",
  ) =>
    request<T>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      true,
      fallback,
    ),

  putAuth: <T>(
    path: string,
    body: unknown,
    fallback = "Error al guardar datos",
  ) =>
    request<T>(
      path,
      { method: "PUT", body: JSON.stringify(body) },
      true,
      fallback,
    ),
  deleteAuth: <T>(path: string, fallback = "Error al eliminar datos") =>
    request<T>(path, { method: "DELETE" }, true, fallback),
};
