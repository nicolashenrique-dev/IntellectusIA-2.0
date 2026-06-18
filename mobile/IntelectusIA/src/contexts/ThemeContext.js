import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem('intelectus_mobile_theme').then(t => {
            if (t === 'light') setIsDarkMode(false);
        });
    }, []);

    const toggleDarkMode = () => {
        const newVal = !isDarkMode;
        setIsDarkMode(newVal);
        AsyncStorage.setItem('intelectus_mobile_theme', newVal ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
