import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        try {
            const data = localStorage.getItem('user');
            if (data) {
                const {token, role} = JSON.parse(data); //{token, role}
                fetch('http://localhost:4000/users/verify-auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ token })
                }).then(res => res.json())
                .then(data => {
                    console.log(data); // { message: "Good token", data: { ... } }
                    setUser({ token, role }); // Only if your endpoint returns user data in a 'data' field
                    setIsLogin(true);

                }).catch(err => {
                    console.error("Auth verification failed:", err);
                    setIsLogin(false);
                })
                .finally(() => {
                    setIsAuthLoading(false);
                });
                   
            } else {
                setIsAuthLoading(false);
            }
        } catch (error) {
            console.error("Error verifying auth:", error);
            setIsLogin(false);
            setIsAuthLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLogin, setIsLogin, isAuthLoading }}>
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