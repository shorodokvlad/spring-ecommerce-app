import React, { useState } from "react";
import '../../style/navbar.css';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";


const Navbar = () => {

    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();
    // Subscribing to location keeps auth-dependent links fresh after login/logout
    useLocation();
    const { cart } = useCart();

    const isAdmin = ApiService.isAdmin();
    const isAuthenticated = ApiService.isAuthenticated();
    const cartCount = cart.reduce((n, item) => n + item.quantity, 0);

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        navigate(`/?search=${searchValue}`)
    }

    const handleLogout = () => {
        const confirm = window.confirm("Log out of your account?");
        if (confirm) {
            ApiService.logout();
            navigate('/login');
        }
    }

    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-brand">
                <span className="brand-mark">SHV</span>
                <span className="brand-word">Store</span>
            </NavLink>

            {/* SEARCH FORM */}
            <form className="navbar-search" onSubmit={handleSearchSubmit} role="search">
                <input type="text"
                    placeholder="Search products"
                    aria-label="Search products"
                    value={searchValue}
                    onChange={handleSearchChange} />
                <button type="submit">Search</button>
            </form>

            <div className="navbar-link">
                <NavLink to="/" end>Home</NavLink>
                <NavLink to="/categories" >Categories</NavLink>
                {isAuthenticated && <NavLink to="/profile" >My account</NavLink>}
                {isAdmin && <NavLink to="/admin" >Admin</NavLink>}
                {!isAuthenticated && <NavLink to="/login" >Log in</NavLink>}
                {isAuthenticated && <button className="navbar-logout" onClick={handleLogout}>Log out</button>}
                <NavLink to="/cart" className="navbar-cart">
                    Cart
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </NavLink>
            </div>
        </nav>
    );

};
export default Navbar;
