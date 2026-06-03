'use client';
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { request } from "@/app/api/services/base.service";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsLogin(false);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const verifyAuth = async () => {
            try {
                const data = localStorage.getItem('user');

                if (!data) {
                    if (isMounted) {
                        setIsAuthLoading(false);
                    }
                    return;
                }

                const { token, role } = JSON.parse(data); //{token, role}
                const result = await request('/auth/me');

                if (!isMounted) {
                    return;
                }

                if (result.error) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsLogin(false);
                } else {
                    setUser({ token, role, ...result.data });
                    setIsLogin(true);
                }
            } catch (error) {
                console.error("Error verifying auth:", error);
                if (isMounted) {
                    setUser(null);
                    setIsLogin(false);
                }
            } finally {
                if (isMounted) {
                    setIsAuthLoading(false);
                }
            }
        };

        void verifyAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLogin, setIsLogin, isAuthLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}