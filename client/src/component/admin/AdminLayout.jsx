import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/adminLayout.css';

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: "/admin", label: "Welcome Admin", icon: "/admin.svg" },
        { path: "/admin/categories", label: "Manage Categories", icon: "/category.svg" },
        { path: "/admin/products", label: "Manage Products", icon: "/product.svg" },
        { path: "/admin/orders", label: "Manage Orders", icon: "/order.svg" },
        { path: "/admin/banners", label: "Manage Banners", icon: "/banner.svg" },
        { path: "/admin/warehouses", label: "Manage Warehouses", icon: "/warehouse.svg" },
    ];

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={`admin-layout-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    {!collapsed && (
                        <div className="sidebar-brand">
                            <span className="brand-badge">ADMIN</span>
                            <span className="brand-title">Control Panel</span>
                        </div>
                    )}
                    <button
                        type="button"
                        className="sidebar-toggle-btn"
                        onClick={toggleSidebar}
                        title={collapsed ? "Expand Menu" : "Collapse Menu"}
                    >
                        {collapsed ? "☰" : "✕"}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = item.path === "/admin"
                            ? location.pathname === "/admin"
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                title={item.label}
                            >
                                <span className="nav-icon-container">
                                    <img src={item.icon} alt={item.label} className="nav-svg-icon" />
                                </span>
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="sidebar-nav-item logout-item"
                        onClick={() => {
                            ApiService.logout();
                            navigate('/login');
                        }}
                        title="Log out"
                    >
                        <span className="nav-icon-container">
                            <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>←</span>
                        </span>
                        {!collapsed && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="admin-main-content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
