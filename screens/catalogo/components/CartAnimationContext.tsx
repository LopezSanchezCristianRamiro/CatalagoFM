import React, { createContext, useContext, useRef, useState } from "react";
import { View } from "react-native";

type FlyState = {
  visible: boolean;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  cardW: number;
  cardH: number;
  imageUrl?: string | null;
};

type CartAnimCtx = {
  cartRef: React.RefObject<View | null>;
  triggerFly: (
    fromX: number,
    fromY: number,
    cardW: number,
    cardH: number,
    imageUrl?: string,
  ) => void;
  flyState: FlyState;
  resetFly: () => void;
};

const CartAnimationContext = createContext<CartAnimCtx | null>(null);

export function CartAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartRef = useRef<View>(null);
  const [flyState, setFlyState] = useState<FlyState>({
    visible: false,
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
    cardW: 0,
    cardH: 0,
  });

  const triggerFly = (
    fromX: number,
    fromY: number,
    cardW: number,
    cardH: number,
    imageUrl?: string,
  ) => {
    cartRef.current?.measureInWindow((x, y, w, h) => {
      setFlyState({
        visible: true,
        fromX,
        fromY,
        cardW,
        cardH,
        imageUrl,
        toX: x + w / 2,
        toY: y + h / 2,
      });
    });
  };

  const resetFly = () => setFlyState((s) => ({ ...s, visible: false }));

  return (
    <CartAnimationContext.Provider
      value={{ cartRef, triggerFly, flyState, resetFly }}
    >
      {children}
    </CartAnimationContext.Provider>
  );
}

export const useCartAnimation = () => {
  const ctx = useContext(CartAnimationContext);
  if (!ctx) throw new Error("Wrap tu app con CartAnimationProvider");
  return ctx;
};
