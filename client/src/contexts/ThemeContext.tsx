import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    background: string;
    sidebar: string;
  };
  isRootTheme: boolean;
  isMunicipalTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isRoot } = useAuth();

  const colors = isRoot
    ? {
        primary: 'hsl(207, 90%, 54%)', // admin-blue
        primaryForeground: 'hsl(45, 93%, 47%)', // admin-gold
        secondary: 'hsl(218, 93%, 24%)', // darker blue
        accent: 'hsl(45, 93%, 47%)', // admin-gold
        background: 'hsl(210, 40%, 98%)',
        sidebar: 'hsl(218, 93%, 24%)', // admin-blue dark
      }
    : {
        primary: 'hsl(217, 91%, 60%)', // municipal-blue
        primaryForeground: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(158, 64%, 52%)', // municipal-green
        accent: 'hsl(158, 64%, 52%)', // municipal-green
        background: 'hsl(210, 40%, 98%)',
        sidebar: 'hsl(217, 91%, 60%)', // municipal-blue
      };

  const value = {
    colors,
    isRootTheme: isRoot,
    isMunicipalTheme: !isRoot,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
