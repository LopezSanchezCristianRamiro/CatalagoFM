import { Redirect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import ProductosScreen from "../../screens/productos/ProductosScreen";

export default function ProductosTab() {
  const { isAdmin, isMaster } = useAuth();

  if (!isAdmin && !isMaster) {
    return <Redirect href="/(tabs)/catalogo" />;
  }

  return <ProductosScreen />;
}