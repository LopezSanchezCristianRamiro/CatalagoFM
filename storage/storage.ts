import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const SISTEMAS_CACHE_KEY = "sistemas_catalogo_cache";

const storage = {
  getItem: (key: string) => {
    if (isWeb) {
      return Promise.resolve(localStorage.getItem(key));
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const saveToken = (token: string) => storage.setItem("token", token);

export const getToken = () => storage.getItem("token");

export const removeToken = () => storage.removeItem("token");

export const saveUsuarioId = (id: string) => storage.setItem("usuarioId", id);

export const getUsuarioId = () => storage.getItem("usuarioId");

export const saveEmail = (email: string) => storage.setItem("email", email);

export const getEmail = () => storage.getItem("email");

export const removeEmail = () => storage.removeItem("email");

export async function clearStorage(): Promise<void> {
  await Promise.all([
    storage.removeItem("token"),
    storage.removeItem("usuarioId"),
    storage.removeItem("email"),
    storage.removeItem("usuarioData"),
  ]);
}

export async function saveUsuarioData(data: {
  nombreUsuario: string;
  nombres: string;
  apellido: string;
  correo: string;
  rol: string;
}): Promise<void> {
  await storage.setItem("usuarioData", JSON.stringify(data));
}

export async function getUsuarioData(): Promise<{
  nombreUsuario: string;
  nombres: string;
  apellido: string;
  correo: string;
  rol: string;
} | null> {
  const raw = await storage.getItem("usuarioData");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const saveSistemasCache = (sistemas: any[]) =>
  storage.setItem(SISTEMAS_CACHE_KEY, JSON.stringify(sistemas));

export const getSistemasCache = async (): Promise<any[] | null> => {
  const raw = await storage.getItem(SISTEMAS_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
