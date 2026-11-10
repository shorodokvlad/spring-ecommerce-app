import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../style/adminDashboard.css";
import { 
    LayoutDashboard, Layers, Package, ShoppingBag, 
    Tag, Building2, Users, ArrowLeft, Menu, X,
    Boxes, FileText, Truck, ChevronDown, ChevronRight
} from "lucide-react";

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isInventorySectionActive = 
        location.pathname.startsWith("/admin/inventory") ||
        location.pathname.startsWith("/admin/purchase-orders") ||
        location.pathname.startsWith("/admin/suppliers") ||
        location.pathname.startsWith("/admin/warehouses") ||
        location.pathname.startsWith("/admin/add-warehouse") ||
        location.pathname.startsWith("/admin/edit-warehouse");

    const [inventoryOpen, setInventoryOpen] = useState(isInventorySectionActive);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const handleInventoryToggle = (e) => {
        e.preventDefault();
        setInventoryOpen(!inventoryOpen);
        if (!location.pathname.startsWith("/admin/inventory")) {
            navigate("/admin/inventory");
        }
    };

    return (
        <div className={`admin-full-wrapper ${collapsed ? "sidebar-collapsed" : ""}`}>
            {/* SINGLE UNIFIED ADMIN SIDEBAR */}
            <aside className={`admin-sidebar-box ${collapsed ? "collapsed" : ""}`}>
                <div>
                    {/* BRAND HEADER & HAMBURGER TOGGLE */}
                    <div className="admin-brand-header-row">
                        {!collapsed && (
                            <Link to="/" className="navbar-brand" title="SHV Store Home">
                                <span className="brand-mark">SHV</span>
                                <span className="brand-word">Store</span>
                            </Link>
                        )}
                        <button
                            type="button"
                            className="admin-sidebar-toggle-btn"
                            onClick={toggleSidebar}
                            title={collapsed ? "Expand Menu" : "Collapse Menu"}
                        >
                            {collapsed ? <Menu size={20} /> : <X size={20} />}
                        </button>
                    </div>

                    {/* NAVIGATION MENU ITEMS */}
                    <nav className="admin-nav-menu">
                        <Link
                            to="/admin"
                            className={`admin-nav-link ${location.pathname === "/admin" ? "active" : ""}`}
                            title="Dashboard"
                        >
                            <LayoutDashboard size={18} className="admin-nav-icon" />
                            {!collapsed && <span>Dashboard</span>}
                        </Link>

                        <Link
                            to="/admin/categories"
                            className={`admin-nav-link ${location.pathname.startsWith("/admin/categories") ? "active" : ""}`}
                            title="Manage Categories"
                        >
                            <Layers size={18} className="admin-nav-icon" />
                            {!collapsed && <span>Manage Categories</span>}
                        </Link>

                        <Link
                            to="/admin/products"
                            className={`admin-nav-link ${location.pathname.startsWith("/admin/products") ? "active" : ""}`}
                            title="Manage Products"
                        >
                            <Package size={18} className="admin-nav-icon" />
                            {!collapsed && <span>Manage Products</span>}
                        </Link>

                        <Link
                            to="/admin/orders"
                            className={`admin-nav-link ${location.pathname.startsWith("/admin/orders") ? "active" : ""}`}
                            title="Manage Orders"
                        >
                            <ShoppingBag size={18} className="admin-nav-icon" />
                            {!collapsed && <span>Manage Orders</span>}
                        </Link>

                        <Link
                            to="/admin/banners"
                            className={`admin-nav-link ${location.pathname.startsWith("/admin/banners") ? "active" : ""}`}
                            title="Manage Banners"
                        >
                            <Tag size={18} className="admin-nav-icon" />
                            {!collapsed && <span>Manage Banners</span>}
                        </Link>

                        {/* MANAGE INVENTORY ACCORDION */}
                        <div>
                            <button
                                type="button"
                                className={`admin-nav-link ${isInventorySectionActive ? "active" : ""}`}
                                onClick={handleInventoryToggle}
                                title="Manage Inventory"
                                style={{ justifyContent: "space-between", width: "100%" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Boxes size={18} className="admin-nav-icon" />
                                    {!collapsed && <span>Manage Inventory</span>}
                                </div>
                                {!collapsed && (
                                    inventoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                )}
                            </button>

                            {!collapsed && inventoryOpen && (
                                <div className="admin-sub-menu">
                                    <Link
                                        to="/admin/purchase-orders"
                                        className={`admin-sub-link ${location.pathname.startsWith("/admin/purchase-orders") ? "active" : ""}`}
                                    >
                                        <FileText size={15} />
                                        <span>Purchase Orders</span>
                                    </Link>
                                    <Link
                                        to="/admin/suppliers"
                                        className={`admin-sub-link ${location.pathname.startsWith("/admin/suppliers") ? "active" : ""}`}
                                    >
                                        <Truck size={15} />
                                        <span>Manage Suppliers</span>
                                    </Link>
                                    <Link
                                        to="/admin/warehouses"
                                        className={`admin-sub-link ${location.pathname.startsWith("/admin/warehouses") || location.pathname.startsWith("/admin/add-warehouse") || location.pathname.startsWith("/admin/edit-warehouse") ? "active" : ""}`}
                                    >
                                        <Building2 size={15} />
                                        <span>Manage Warehouses</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link
                            to="/admin/employees"
                            className={`admin-nav-link ${location.pathname.startsWith("/admin/employees") ? "active" : ""}`}
                            title="Manage Employees"
                        >
                            <Users size={18} className="admin-nav-icon" />
                            {!collapsed && <span>Manage Employees</span>}
                        </Link>
                    </nav>
                </div>

                {/* SIDEBAR FOOTER: BACK TO STORE */}
                <div className="admin-sidebar-footer">
                    <Link to="/" className="back-to-store-btn" title="Back to Store">
                        <ArrowLeft size={18} />
                        {!collapsed && <span>Back to Store</span>}
                    </Link>
                </div>
            </aside>

            {/* MAIN ADMIN CONTENT VIEW */}
            <main className="admin-main-view">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
