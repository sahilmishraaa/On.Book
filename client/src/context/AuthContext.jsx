import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { api } from "../services/api";

const C = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return (
                JSON.parse(
                    localStorage.getItem("onbook_user")
                ) || null
            );
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (localStorage.getItem("onbook_token")) {
            api("/auth/me")
                .then((d) => {
                    setUser(d.user);

                    localStorage.setItem(
                        "onbook_user",
                        JSON.stringify(d.user)
                    );
                })
                .catch(() => {
                    localStorage.removeItem("onbook_token");
                    localStorage.removeItem("onbook_user");
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (d) => {
        localStorage.setItem(
            "onbook_token",
            d.token
        );

        localStorage.setItem(
            "onbook_user",
            JSON.stringify(d.user)
        );

        setUser(d.user);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);

        localStorage.setItem(
            "onbook_user",
            JSON.stringify(updatedUser)
        );
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <C.Provider
            value={{
                user,
                login,
                logout,
                updateUser,
                loading,
            }}
        >
            {children}
        </C.Provider>
    );
}

export const useAuth = () => useContext(C);