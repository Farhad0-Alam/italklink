import { createContext, useContext, useState, ReactNode } from 'react';

interface ShopMenuContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const ShopMenuContext = createContext<ShopMenuContextType | undefined>(undefined);

export function ShopMenuProvider({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ShopMenuContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen }}>
      {children}
    </ShopMenuContext.Provider>
  );
}

export function useShopMenu() {
  const context = useContext(ShopMenuContext);
  if (!context) {
    throw new Error('useShopMenu must be used within ShopMenuProvider');
  }
  return context;
}
