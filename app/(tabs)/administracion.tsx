import AdministracionScreen from "@/screens/administracion/AdministracionScreen";
import { Redirect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function ProductosTab() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect href="/(tabs)/catalogo" />;
  return <AdministracionScreen />;
}
