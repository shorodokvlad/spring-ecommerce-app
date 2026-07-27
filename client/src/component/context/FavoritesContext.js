import React, { createContext, useState, useContext, useEffect } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem("favorites");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const isFavorite = (productId) => {
        return favorites.some((item) => item.id === productId);
    };

    const toggleFavorite = (product) => {
        setFavorites((prev) => {
            const exists = prev.some((item) => item.id === product.id);
            if (exists) {
                return prev.filter((item) => item.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const removeFromFavorites = (productId) => {
        setFavorites((prev) => prev.filter((item) => item.id !== productId));
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                isFavorite,
                toggleFavorite,
                removeFromFavorites,
                favoritesCount: favorites.length
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
