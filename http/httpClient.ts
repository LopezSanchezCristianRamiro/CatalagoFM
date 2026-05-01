// http/httpClient.ts
import Toast from "react-native-toast-message";
import { getToken } from "../storage/secureStorage";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

async function parseErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    if (json.message) return json.message;
    if (json.error) return json.error;
    if (json.errors) {
      return "Algunos datos ya se encuentran registrados o son inválidos.";
    }
    return fallback;
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
    "Accept": "application/json",  
  };

  if (authenticated) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
  } catch (networkError: any) {
        if (networkError?.name === "AbortError") throw networkError;

    Toast.show({
      type: "error",
      text1: "Sin conexión",
      text2: "No se pudo conectar al servidor. Revisa tu conexión.",
      visibilityTime: 4000,
    });
    throw {
      status: 0,
      message: "No se pudo conectar al servidor. Revisa tu conexión.",
    };
  }

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

  getAuth: <T>(path: string, fallback = "Error al cargar datos", signal?: AbortSignal) =>
    request<T>(path, { method: "GET", signal }, true, fallback),

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
