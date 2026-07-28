import React from "react";
import { Link } from "react-router-dom";
import '../../style/adminPage.css';

const AdminPage = () => {
    const adminCards = [
        {
            title: "Manage Categories",
            desc: "Add, edit, or remove product categories.",
            code: "CAT",
            link: "/admin/categories",
            color: "#2E9C90"
        },
        {
            title: "Manage Products",
            desc: "Create products with custom configurations & photos.",
            code: "PROD",
            link: "/admin/products",
            color: "#1F4E63"
        },
        {
            title: "Manage Orders",
            desc: "Track customer orders and update shipment statuses.",
            code: "ORD",
            link: "/admin/orders",
            color: "#8D7BEA"
        },
        {
            title: "Manage Banners",
            desc: "Customize homepage promotional hero banners.",
            code: "BAN",
            link: "/admin/banners",
            color: "#C08A16"
        }
    ];

    return (
        <div className="admin-dashboard-page">
            <header className="admin-dashboard-header">
                <h2>Welcome Admin</h2>
                <p>Select a section below or use the sidebar menu to manage your store.</p>
            </header>

            <div className="admin-grid-cards">
                {adminCards.map((card) => (
                    <Link to={card.link} key={card.title} className="admin-card-item">
                        <div className="admin-card-code" style={{ borderColor: card.color, color: card.color }}>
                            {card.code}
                        </div>
                        <div className="admin-card-content">
                            <h3>{card.title}</h3>
                            <p>{card.desc}</p>
                        </div>
                        <span className="admin-card-arrow">→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;