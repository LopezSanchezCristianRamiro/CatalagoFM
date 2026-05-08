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
  isMaster: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { nombre?: string; telefono?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((state) => state.clearCart);

  const updateProfile = async (data: { nombre?: string; telefono?: string }) => {
    const res = await httpClient.putAuth<{ telefono: string }>(
      "/api/user/profile",
      data
    );

    setUser((prev) => (prev ? { ...prev, telefono: res.telefono } : prev));
  };

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
    await saveToken(token);

    const userData = await httpClient.getAuth<Usuario>("/api/user");
    setUser(userData);
  };

  const logout = async () => {
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch {
      // ignorar errores de red
    }

    await clearSession();
    clearCart();
    setUser(null);
  };

  const isAdmin = user?.rol === "Administrador";
  const isMaster = user?.rol === "Master";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isMaster,
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