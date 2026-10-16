import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => { AsyncStorage.getItem('intelectus_mobile_theme').then(t => setIsDarkMode(t === 'dark')).catch(() => {}); }, []);
  const toggleDarkMode = () => setIsDarkMode(current => {
    AsyncStorage.setItem('intelectus_mobile_theme', current ? 'light' : 'dark').catch(() => {});
    return !current;
  });
  return <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);
