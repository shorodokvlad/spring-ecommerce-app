import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { Plus, PackageCheck, X } from "lucide-react";
import Pagination from "../common/Pagination";
import { useDemoRestriction } from "./demoRestriction";
import "../../style/inventoryAdmin.css";

const AdminPurchaseOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { readOnly, permissionMessage, blockWrite } = useDemoRestriction();

    // Create PO Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [poItems, setPoItems] = useState([
        { categoryId: "", productId: "", variantId: "", orderedQuantity: 100, unitCostPrice: "" }
    ]);

    // Receive Stock Modal state
    const [receiveModalPo, setReceiveModalPo] = useState(null);
    const [receiveQuantities, setReceiveQuantities] = useState({});

    const fetchData = async (pageToFetch = currentPage) => {
        setLoading(true);
        try {
            const poRes = await ApiService.getAllPurchaseOrders(pageToFetch - 1, 20);
            setOrders(poRes.purchaseOrderList || []);
            setTotalPages(poRes.totalPage || 1);

            const supRes = await ApiService.getAllSuppliers();
            setSuppliers(supRes.supplierList || []);

            const whRes = await ApiService.getAllWarehouses();
            setWarehouses(whRes.warehouseList || []);

            const catRes = await ApiService.getAllCategory();
            setCategories(catRes.categoryList || []);

            const prodRes = await ApiService.getAllProducts();
            setProducts(prodRes.productList || []);
        } catch (error) {
            console.error("Failed to load Purchase Orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const handleAddPoItemRow = () => {
        setPoItems([...poItems, { categoryId: "", productId: "", variantId: "", orderedQuantity: 100, unitCostPrice: "" }]);
    };

    const handlePoItemChange = (index, field, value) => {
        const updated = [...poItems];
        updated[index][field] = value;

        if (field === "categoryId") {
            updated[index].productId = "";
            updated[index].variantId = "";
            updated[index].unitCostPrice = "";
        } else if (field === "productId") {
            const p = products.find(prod => prod.id === Number(value));
            updated[index].variantId = "";
            if (p) {
                updated[index].unitCostPrice = p.costPrice || p.price || "";
            }
        } else if (field === "variantId") {
            const p = products.find(prod => prod.id === Number(updated[index].productId));
            if (p && p.variants) {
                const v = p.variants.find(varnt => varnt.id === Number(value));
                if (v && v.price) {
                    updated[index].unitCostPrice = v.price;
                }
            }
        }
        setPoItems(updated);
    };

    const handleRemovePoItemRow = (index) => {
        if (poItems.length === 1) return;
        setPoItems(poItems.filter((_, i) => i !== index));
    };

    const handleCreatePoSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) {
            blockWrite();
            return;
        }
        if (!selectedSupplierId || !selectedWarehouseId) {
            alert("Please select a supplier and destination warehouse.");
            return;
        }

        const validItems = poItems
            .filter(item => item.productId && Number(item.orderedQuantity) > 0)
            .map(item => ({
                productId: Number(item.productId),
                variantId: item.variantId ? Number(item.variantId) : null,
                orderedQuantity: Number(item.orderedQuantity),
                unitCostPrice: item.unitCostPrice ? Number(item.unitCostPrice) : 0
            }));

        if (validItems.length === 0) {
            alert("Please add at least one valid product line.");
            return;
        }

        try {
            await ApiService.createPurchaseOrder({
                supplierId: Number(selectedSupplierId),
                warehouseId: Number(selectedWarehouseId),
                items: validItems
            });
            setIsCreateModalOpen(false);
            setPoItems([{ productId: "", variantId: "", orderedQuantity: 100, unitCostPrice: "" }]);
            fetchData();
        } catch (error) {
            alert("Failed to create Purchase Order: " + (error.response?.data?.message || error.message));
        }
    };

    const openReceiveModal = (po) => {
        setReceiveModalPo(po);
        const initialQty = {};
        if (po.items) {
            po.items.forEach(item => {
                const remaining = (item.orderedQuantity || 0) - (item.receivedQuantity || 0);
                initialQty[item.id] = Math.max(0, remaining);
            });
        }
        setReceiveQuantities(initialQty);
    };

    const handleReceiveSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) {
            blockWrite();
            return;
        }
        if (!receiveModalPo) return;

        try {
            await ApiService.receiveStock(receiveModalPo.id, receiveQuantities);
            setReceiveModalPo(null);
            fetchData();
        } catch (error) {
            alert("Failed to receive stock: " + (error.response?.data?.message || error.message));
        }
    };

    const formatPrice = (val) => {
        if (val == null) return "0.00";
        return Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="inventory-container">
                {permissionMessage && <p className="demo-permission-message">{permissionMessage}</p>}
                {/* HEADER */}
                <div className="inventory-header-row">
                    <div>
                        <h2>Purchase Orders</h2>
                        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Order bulk inventory from suppliers and receive shipments into warehouses
                        </span>
                    </div>
                    <button className="inventory-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} />
                        New Purchase Order
                    </button>
                </div>

                {/* PURCHASE ORDERS TABLE */}
                <div className="inventory-table-wrap">
                    <table className="inventory-data-table">
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Supplier</th>
                                <th>Destination Warehouse</th>
                                <th>Order Date</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i}>
                                        <td><div className="skeleton-shimmer" style={{ width: "90px", height: "16px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "120px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "130px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "80px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "70px", height: "14px", borderRadius: "4px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "90px", height: "20px", borderRadius: "10px" }} /></td>
                                        <td><div className="skeleton-shimmer" style={{ width: "110px", height: "28px", borderRadius: "6px" }} /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                                        No Purchase Orders created yet. Click "New Purchase Order" to buy inventory from a supplier.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((po) => (
                                    <tr key={po.id}>
                                        <td style={{ fontWeight: 700, color: "#4f46e5" }}>{po.poNumber}</td>
                                        <td>{po.supplierName || "—"}</td>
                                        <td>{po.warehouseName || "—"}</td>
                                        <td>{po.orderDate}</td>
                                        <td style={{ fontWeight: 600 }}>€{formatPrice(po.totalCostAmount)}</td>
                                        <td>
                                            <span
                                                className={`inv-status-badge ${
                                                    po.status === "RECEIVED"
                                                        ? "status-received"
                                                        : po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"
                                                        ? "status-ordered"
                                                        : "status-outstock"
                                                }`}
                                            >
                                                ● {po.status}
                                            </span>
                                        </td>
                                        <td>
                                            {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
                                                <button
                                                    className="inventory-btn-secondary"
                                                    style={{ padding: "4px 10px", fontSize: "0.8rem", color: "#047857", borderColor: "#a7f3d0" }}
                                                    onClick={() => openReceiveModal(po)}
                                                >
                                                    <PackageCheck size={15} />
                                                    Receive Delivery
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
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

                {/* CREATE PO MODAL */}
                {isCreateModalOpen && (
                    <div className="inv-modal-overlay">
                        <div className="inv-modal-card">
                            <div className="inv-modal-header">
                                <h3>Create Purchase Order</h3>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                    <X size={20} color="#6b7280" />
                                </button>
                            </div>
                            <form onSubmit={handleCreatePoSubmit}>
                                <div className="inv-modal-body">
                                    <div className="inv-form-group">
                                        <label>Supplier</label>
                                        <select
                                            value={selectedSupplierId}
                                            onChange={(e) => setSelectedSupplierId(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Supplier...</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="inv-form-group">
                                        <label>Destination Warehouse</label>
                                        <select
                                            value={selectedWarehouseId}
                                            onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Warehouse...</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginTop: "12px" }}>
                                        <label style={{ fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px" }}>
                                            Order Items
                                        </label>
                                        {poItems.map((item, idx) => {
                                            const filteredProducts = item.categoryId
                                                ? products.filter(p => (p.category?.id === Number(item.categoryId) || p.categoryId === Number(item.categoryId)))
                                                : products;

                                            const selectedProd = products.find(p => p.id === Number(item.productId));
                                            const hasVariants = selectedProd && selectedProd.variants && selectedProd.variants.length > 0;

                                            return (
                                                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px", background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                        <select
                                                            style={{ flex: 1.2 }}
                                                            value={item.categoryId || ""}
                                                            onChange={(e) => handlePoItemChange(idx, "categoryId", e.target.value)}
                                                        >
                                                            <option value="">All Categories...</option>
                                                            {categories.map(c => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>

                                                        <select
                                                            style={{ flex: 2 }}
                                                            value={item.productId}
                                                            onChange={(e) => handlePoItemChange(idx, "productId", e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select Product...</option>
                                                            {filteredProducts.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name} ({p.sku || "No SKU"})</option>
                                                            ))}
                                                        </select>

                                                        {hasVariants && (
                                                            <select
                                                                style={{ flex: 2.2, minWidth: "180px" }}
                                                                value={item.variantId || ""}
                                                                onChange={(e) => handlePoItemChange(idx, "variantId", e.target.value)}
                                                            >
                                                                <option value="">Select Configuration...</option>
                                                                {selectedProd.variants.map(v => (
                                                                    <option key={v.id} value={v.id}>
                                                                        {v.title || `Config #${v.id}`} (€{v.price})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}

                                                        <input
                                                            type="number"
                                                            placeholder="Qty"
                                                            style={{ width: "80px" }}
                                                            min="1"
                                                            value={item.orderedQuantity}
                                                            onChange={(e) => handlePoItemChange(idx, "orderedQuantity", e.target.value)}
                                                            required
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="Unit Cost €"
                                                            style={{ width: "100px" }}
                                                            value={item.unitCostPrice}
                                                            onChange={(e) => handlePoItemChange(idx, "unitCostPrice", e.target.value)}
                                                        />
                                                        {poItems.length > 1 && (
                                                            <button type="button" onClick={() => handleRemovePoItemRow(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                                                                <X size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            className="inventory-btn-secondary"
                                            style={{ marginTop: "6px", fontSize: "0.8rem" }}
                                            onClick={handleAddPoItemRow}
                                        >
                                            <Plus size={14} /> Add Product Line
                                        </button>
                                    </div>
                                </div>

                                <div className="inv-modal-footer">
                                    <button type="button" className="inventory-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={readOnly ? "demo-no-permission" : "inventory-btn-primary"}
                                        aria-disabled={readOnly}
                                    >
                                        Send Purchase Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* RECEIVE STOCK MODAL */}
                {receiveModalPo && (
                    <div className="inv-modal-overlay">
                        <div className="inv-modal-card">
                            <div className="inv-modal-header">
                                <h3>Receive Delivery ({receiveModalPo.poNumber})</h3>
                                <button type="button" onClick={() => setReceiveModalPo(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                    <X size={20} color="#6b7280" />
                                </button>
                            </div>
                            <form onSubmit={handleReceiveSubmit}>
                                <div className="inv-modal-body">
                                    <p style={{ fontSize: "0.875rem", color: "#4b5563", marginTop: 0 }}>
                                        Enter the quantity received today from supplier <strong>{receiveModalPo.supplierName}</strong> into <strong>{receiveModalPo.warehouseName}</strong>:
                                    </p>

                                    {receiveModalPo.items && receiveModalPo.items.map((item) => {
                                        const remaining = (item.orderedQuantity || 0) - (item.receivedQuantity || 0);
                                        return (
                                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: "#111827" }}>{item.productName}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                                        Ordered: {item.orderedQuantity} | Already Received: {item.receivedQuantity}
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <label style={{ fontSize: "0.8rem", color: "#374151" }}>Receive Now:</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={remaining > 0 ? remaining : item.orderedQuantity}
                                                        style={{ width: "80px" }}
                                                        value={receiveQuantities[item.id] != null ? receiveQuantities[item.id] : 0}
                                                        onChange={(e) => setReceiveQuantities({
                                                            ...receiveQuantities,
                                                            [item.id]: Number(e.target.value)
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="inv-modal-footer">
                                    <button type="button" className="inventory-btn-secondary" onClick={() => setReceiveModalPo(null)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={readOnly ? "demo-no-permission" : "inventory-btn-primary"}
                                        aria-disabled={readOnly}
                                        style={{ background: readOnly ? undefined : "#10b981" }}
                                    >
                                        Confirm Stock Receipt
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default AdminPurchaseOrdersPage;
