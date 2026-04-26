// components/ThemedText.tsx
import { Text, type TextProps } from "react-native";

/**
 * Envoltorio global para todos los textos de la app.
 *
 * - Aplica el color de texto principal definido en tailwind.config.js (`foreground`).
 * - Hereda todas las props nativas de Text.
 * - Permite extender estilos mediante `className`.
 *
 * Para añadir una tipografía personalizada en el futuro, basta con agregar
 * `font-sans` (o la clase que corresponda) al `className` de este componente.
 */
export function ThemedText({ className, children, ...props }: TextProps) {
  return (
    <Text {...props} className={`text-foreground ${className ?? ""}`}>
      {children}
    </Text>
  );
}
