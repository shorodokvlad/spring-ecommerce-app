import React, { createContext, useState, useContext, useEffect } from "react";

const FavoritesContext = createContext();
const favoriteIdentity = (item) => item.favoriteKey || item.cartKey || String(item.id);

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

    const isFavorite = (favoriteKey) => {
        return favorites.some((item) => favoriteIdentity(item) === String(favoriteKey));
    };

    const toggleFavorite = (product) => {
        setFavorites((prev) => {
            const productKey = favoriteIdentity(product);
            const exists = prev.some((item) => favoriteIdentity(item) === productKey);
            if (exists) {
                return prev.filter((item) => favoriteIdentity(item) !== productKey);
            } else {
                return [...prev, product];
            }
        });
    };

    const removeFromFavorites = (favoriteKey) => {
        setFavorites((prev) => prev.filter((item) => favoriteIdentity(item) !== String(favoriteKey)));
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
