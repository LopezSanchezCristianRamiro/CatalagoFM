// contexts/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { httpClient } from "../http/httpClient";
import { clearSession, saveToken } from "../storage/secureStorage";
import { useCartStore } from "../store/cartStore";

export type Usuario = {
  nombreUsuario: string;
  nombres: string;
  apellido: string;
  correo: string;
  rol: string;
  telefono: string; 
  foto: string | null;
};

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { telefono?: string }) => Promise<void>;
}
updateProfile: (data: { nombre?: string; telefono?: string }) => Promise<void>;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const updateProfile = async (data: { nombre?: string; telefono?: string }) => {
    const res = await httpClient.putAuth<{ telefono: string }>("/api/user/profile", data);
    setUser((prev) => prev ? { ...prev, telefono: res.telefono } : prev);
  };
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((state) => state.clearCart);

  // Intenta cargar el perfil desde el servidor si existe sesión previa
  useEffect(() => {
    (async () => {
      try {
        const userData = await httpClient.getAuth<Usuario>("/api/user");
        setUser(userData);
      } catch {
        await clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (token: string) => {
    // Guardar token de forma segura (en móvil; en web lo ignoramos)
    await saveToken(token);
    // Tras almacenar el token, obtenemos el perfil completo del usuario
    const userData = await httpClient.getAuth<Usuario>("/api/user");
    setUser(userData);
  };

  const logout = async () => {
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch (e) {
      // ignorar errores de red
    }
    await clearSession();
    clearCart();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.rol === "Administrador",
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
