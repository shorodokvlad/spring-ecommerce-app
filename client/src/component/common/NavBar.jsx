import React, { useState } from "react";
import '../../style/navbar.css';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const Navbar = () => {
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { cart } = useCart();
    const { favoritesCount } = useFavorites();

    React.useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchParam = queryParams.get("search");
        setSearchValue(searchParam || "");
    }, [location.search]);

    const isAdmin = ApiService.isAdmin();
    const isAuthenticated = ApiService.isAuthenticated();
    const cartCount = cart.reduce((n, item) => n + item.quantity, 0);

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        const trimmed = searchValue.trim();
        if (trimmed) {
            navigate(`/?search=${encodeURIComponent(trimmed)}`);
        } else {
            navigate("/");
        }
    };

    return (
        <header className="navbar-header">
            <nav className="navbar-container">
                <NavLink to="/" className="navbar-brand">
                    <span className="brand-mark">SHV</span>
                    <span className="brand-word">Store</span>
                </NavLink>

                {/* SEARCH FORM */}
                <form className="navbar-search" onSubmit={handleSearchSubmit} role="search">
                    <input type="text"
                        placeholder="Search products..."
                        aria-label="Search products"
                        value={searchValue}
                        onChange={handleSearchChange} />
                    <button type="submit">Search</button>
                </form>

                <div className="navbar-link">
                    <NavLink to="/categories" className="nav-item-link">
                        <img src="/category.svg" alt="" className="nav-icon" />
                        <span>Categories</span>
                    </NavLink>

                    {isAdmin && (
                        <NavLink to="/admin" className="nav-item-link">
                            <img src="/admin.svg" alt="" className="nav-icon" />
                            <span>Admin</span>
                        </NavLink>
                    )}

                    {/* Favorites */}
                    <NavLink to="/favorites" className="nav-item-link" title="Favorites">
                        <div className="nav-icon-wrapper">
                            <img src="/favorite.svg" alt="" className="nav-icon" />
                            {favoritesCount > 0 && <span className="cart-count fav-count">{favoritesCount}</span>}
                        </div>
                        <span>Favorites</span>
                    </NavLink>

                    {/* Cart */}
                    <NavLink to="/cart" className="nav-item-link" title="Cart">
                        <div className="nav-icon-wrapper">
                            <img src="/cart.svg" alt="" className="nav-icon" />
                            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                        </div>
                        <span>Cart</span>
                    </NavLink>

                    {/* Account */}
                    <NavLink to={isAuthenticated ? "/profile" : "/login"} className="nav-item-link" title={isAuthenticated ? "Profile" : "Sign in"}>
                        <img src="/account.svg" alt="" className="nav-icon" />
                        <span>My Account</span>
                    </NavLink>
                </div>
            </nav>
        </header>
    );
};
export default Navbar;
