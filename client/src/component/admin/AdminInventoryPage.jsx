import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { Search, Plus, Boxes, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";
import { useDemoRestriction } from "./demoRestriction";
import "../../style/inventoryAdmin.css";

const AdminInventoryPage = () => {
    const [summary, setSummary] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedProducts, setExpandedProducts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { permissionMessage } = useDemoRestriction();

    const fetchData = async (pageToFetch = currentPage) => {
        setLoading(true);
        try {
            const summaryRes = await ApiService.getInventorySummary();
            setSummary(summaryRes.inventorySummary || null);

            const itemsRes = await ApiService.getInventoryItems(search, statusFilter, pageToFetch - 1, 20);
            setItems(itemsRes.inventoryItemList || []);
            setTotalPages(itemsRes.totalPage || 1);
        } catch (error) {
            console.error("Failed to load inventory data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter, currentPage]);

    const handleSearchChange = (val) => {
        setSearch(val);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (val) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const toggleExpand = (productId) => {
        setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
    };

    const formatPrice = (val) => {
        if (val == null) return "0.00";
        return Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const totalProducts = summary?.totalProducts || items.length || 1;
    const inStockPct = Math.round(((summary?.inStockCount || 0) / totalProducts) * 100);
    const lowStockPct = Math.round(((summary?.lowStockCount || 0) / totalProducts) * 100);
    const outStockPct = Math.round(((summary?.outOfStockCount || 0) / totalProducts) * 100);

    return (
        <div className="inventory-container">
                {permissionMessage && <p className="demo-permission-message">{permissionMessage}</p>}
                {/* HEADER ROW */}
                <div className="inventory-header-row">
                    <div className="inventory-title-wrap">
                        <h2>Inventory Management</h2>
                        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Track available warehouse stock, incoming orders, and asset valuation
                        </span>
                    </div>
                    <div className="inventory-header-actions">
                        <button className="inventory-btn-secondary" onClick={fetchData} title="Refresh Inventory Data">
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <Link to="/admin/purchase-orders" className="inventory-btn-primary" style={{ textDecoration: "none" }}>
                            <Plus size={18} />
                            Create Purchase Order
                        </Link>
                    </div>
                </div>

                {/* TOP SUMMARY METRICS CARD */}
                <div className="inventory-summary-card">
                    <div className="inv-summary-metric">
                        <span className="label">Total Asset Value</span>
                        <span className="value-large">€{formatPrice(summary?.totalAssetValue)}</span>
                    </div>

                    <div className="inv-summary-divider" />

                    <div className="inv-summary-metric" style={{ minWidth: "120px" }}>
                        <span className="label">Total Products</span>
                        <span className="value-large">{summary?.totalProducts || 0}</span>
                    </div>

                    <div className="inv-summary-divider" />

                    <div className="inv-summary-breakdown">
                        <div className="inv-breakdown-bar">
                            <div className="inv-bar-segment inv-bar-instock" style={{ width: `${inStockPct}%` }} title={`In stock: ${summary?.inStockCount}`} />
                            <div className="inv-bar-segment inv-bar-lowstock" style={{ width: `${lowStockPct}%` }} title={`Low stock: ${summary?.lowStockCount}`} />
                            <div className="inv-bar-segment inv-bar-outstock" style={{ width: `${outStockPct}%` }} title={`Out of stock: ${summary?.outOfStockCount}`} />
                        </div>
                        <div className="inv-breakdown-labels">
                            <span>
                                <span className="inv-breakdown-dot" style={{ background: "#10b981" }} />
                                In stock: <strong>{summary?.inStockCount || 0}</strong>
                            </span>
                            <span>
                                <span className="inv-breakdown-dot" style={{ background: "#f59e0b" }} />
                                Low stock: <strong>{summary?.lowStockCount || 0}</strong>
                            </span>
                            <span>
                                <span className="inv-breakdown-dot" style={{ background: "#ef4444" }} />
                                Out of stock: <strong>{summary?.outOfStockCount || 0}</strong>
                            </span>
                            {summary?.totalIncomingUnits > 0 && (
                                <span style={{ marginLeft: "auto", color: "#3b82f6", fontWeight: 600 }}>
                                    Incoming units: {summary.totalIncomingUnits}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="inventory-filters-card">
                    <div className="inv-search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search product name, SKU, or category..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="inv-filter-group">
                        <select
                            className="inv-select-filter"
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="In stock">In stock</option>
                            <option value="Low stock">Low stock</option>
                            <option value="Out of stock">Out of stock</option>
                        </select>
                    </div>
                </div>

                {/* DATA TABLE */}
                <div className="inventory-table-wrap">
                    <table className="inventory-data-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>SKU</th>
                                <th>Incoming</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Cost Price</th>
                                <th>Selling Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5, 6].map((i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="inv-product-cell">
                                                <div className="skeleton-shimmer" style={{ width: "40px", height: "40px", borderRadius: "8px", flexShrink: 0 }} />
                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                                                    <div className="skeleton-shimmer" style={{ width: i % 2 === 0 ? "70%" : "55%", height: "14px", borderRadius: "4px" }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td><div className="skeleton-shimmer" style={{ width: "80px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "70px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "30px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "40px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "75px", height: "20px", borderRadius: "10px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "50px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "50px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "60px", height: "14px", borderRadius: "4px" }} /></td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                                        No inventory items found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => {
                                    const hasVariants = item.variants && item.variants.length > 0;
                                    const isExpanded = Boolean(expandedProducts[item.productId]);

                                    return (
                                        <React.Fragment key={item.productId}>
                                            <tr>
                                                <td>
                                                    <div className="inv-product-cell">
                                                        {item.imageUrl ? (
                                                            <img className="inv-thumb" src={item.imageUrl} alt={item.productName} />
                                                        ) : (
                                                            <div className="inv-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                <Boxes size={18} color="#9ca3af" />
                                                            </div>
                                                        )}
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <div style={{ fontWeight: 600, color: "#111827" }}>{item.productName}</div>
                                                            {hasVariants && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleExpand(item.productId)}
                                                                    title={isExpanded ? "Collapse Configurations" : "Expand Configurations"}
                                                                    style={{
                                                                        background: "#f1f5f9",
                                                                        border: "1px solid #cbd5e1",
                                                                        borderRadius: "6px",
                                                                        padding: "4px 6px",
                                                                        cursor: "pointer",
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        color: "#475569"
                                                                    }}
                                                                >
                                                                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.categoryName}</td>
                                                <td>
                                                    <span className="inv-sku-badge" style={{ background: item.sku ? "#e0e7ff" : "#f1f5f9", color: item.sku ? "#3730a3" : "#94a3b8" }}>
                                                        {item.sku || "No SKU"}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, color: item.incomingQuantity > 0 ? "#2563eb" : "#9ca3af" }}>
                                                    {item.incomingQuantity || 0}
                                                </td>
                                                <td style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                                                    {item.availableStock}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`inv-status-badge ${
                                                            item.status === "In stock"
                                                                ? "status-instock"
                                                                : item.status === "Low stock"
                                                                ? "status-lowstock"
                                                                : "status-outstock"
                                                        }`}
                                                    >
                                                        ● {item.status}
                                                    </span>
                                                </td>
                                                <td style={{ color: "#6b7280" }}>€{formatPrice(item.costPrice)}</td>
                                                <td style={{ fontWeight: 600 }}>€{formatPrice(item.price)}</td>
                                                <td>
                                                    <Link
                                                        to={`/admin/edit-product/${item.productId}`}
                                                        style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none", fontSize: "0.85rem" }}
                                                    >
                                                        Edit Product
                                                    </Link>
                                                </td>
                                            </tr>

                                            {/* VARIANT CONFIGURATIONS SUB-ROWS */}
                                            {hasVariants && isExpanded && item.variants.map((v) => (
                                                <tr key={v.id} style={{ background: "#f8fafc" }}>
                                                    <td style={{ paddingLeft: "48px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ color: "#94a3b8", fontWeight: 700 }}>└─</span>
                                                            {v.imageUrls && v.imageUrls[0] ? (
                                                                <img className="inv-thumb" src={v.imageUrls[0]} alt={v.title} style={{ width: "26px", height: "26px" }} />
                                                            ) : null}
                                                            <span style={{ fontWeight: 600, color: "#334155" }}>{v.title || `Configuration #${v.id}`}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Configuration</td>
                                                    <td>
                                                        <span className="inv-sku-badge" style={{ background: "#f1f5f9", color: "#64748b" }}>
                                                            {v.sku || "No SKU"}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: "#94a3b8" }}>—</td>
                                                    <td style={{ fontWeight: 600, color: (v.stockQuantity || 0) > 0 ? "#0f172a" : "#ef4444" }}>
                                                        {v.stockQuantity != null ? v.stockQuantity : 0}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`inv-status-badge ${
                                                                (v.stockQuantity || 0) > 0 ? "status-instock" : "status-outstock"
                                                            }`}
                                                        >
                                                            ● {(v.stockQuantity || 0) > 0 ? "In stock" : "Out of stock"}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: "#94a3b8" }}>—</td>
                                                    <td style={{ fontWeight: 600, color: "#334155" }}>€{formatPrice(v.price)}</td>
                                                    <td>—</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div style={{ padding: "16px", display: "flex", justifyContent: "center" }}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(p) => setCurrentPage(p)}
                            />
                        </div>
                    )}
                </div>
            </div>
    );
};

export default AdminInventoryPage;
