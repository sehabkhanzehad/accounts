import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (token) {
                setIsAuthenticated(true);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
            setIsLoading(false);
        };

        checkAuth();

        // Listen for storage changes to update user state
        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                const newUser = e.newValue ? JSON.parse(e.newValue) : null;
                setUser(newUser);
            }
        };

        // Listen for custom user update event in same tab
        const handleUserUpdate = (e) => {
            setUser(e.detail);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, []);

    const login = (token, userData) => {
        // Always use localStorage to persist across tabs and sessions
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};