import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin, X } from "lucide-react";
import { useDemoRestriction } from "./demoRestriction";
import "../../style/inventoryAdmin.css";

const AdminSuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { readOnly, permissionMessage, blockWrite } = useDemoRestriction();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        notes: ""
    });

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllSuppliers();
            setSuppliers(res.supplierList || []);
        } catch (error) {
            console.error("Failed to load suppliers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name || "",
                contactPerson: supplier.contactPerson || "",
                email: supplier.email || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
                notes: supplier.notes || ""
            });
        } else {
            setEditingSupplier(null);
            setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", notes: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) {
            blockWrite();
            return;
        }
        try {
            if (editingSupplier) {
                await ApiService.updateSupplier(editingSupplier.id, formData);
            } else {
                await ApiService.createSupplier(formData);
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            alert("Failed to save supplier: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (readOnly) {
            blockWrite();
            return;
        }
        if (!window.confirm("Are you sure you want to delete this supplier?")) return;
        try {
            await ApiService.deleteSupplier(id);
            fetchSuppliers();
        } catch (error) {
            alert("Failed to delete supplier: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="inventory-container">
                {permissionMessage && <p className="demo-permission-message">{permissionMessage}</p>}
                {/* HEADER */}
                <div className="inventory-header-row">
                    <div>
                        <h2>Supplier Directory</h2>
                        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Manage vendors and manufacturers you purchase wholesale stock from
                        </span>
                    </div>
                    <button className="inventory-btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        Add Supplier
                    </button>
                </div>

                {/* SUPPLIER CARDS GRID */}
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div className="skeleton-shimmer" style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                                    <div className="skeleton-shimmer" style={{ width: "60%", height: "18px", borderRadius: "4px" }} />
                                </div>
                                <div className="skeleton-shimmer" style={{ width: "40%", height: "14px", borderRadius: "4px" }} />
                                <div className="skeleton-shimmer" style={{ width: "80%", height: "14px", borderRadius: "4px" }} />
                                <div className="skeleton-shimmer" style={{ width: "70%", height: "14px", borderRadius: "4px" }} />
                            </div>
                        ))}
                    </div>
                ) : suppliers.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                        No suppliers registered yet. Click "Add Supplier" to create your first vendor.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {suppliers.map((s) => (
                            <div
                                key={s.id}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{ background: "#eef2ff", color: "#4f46e5", padding: "8px", borderRadius: "8px" }}>
                                                <Truck size={20} />
                                            </div>
                                            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 700 }}>{s.name}</h3>
                                        </div>
                                    </div>

                                    {s.contactPerson && (
                                        <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px" }}>
                                            Contact: <strong>{s.contactPerson}</strong>
                                        </div>
                                    )}

                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "#4b5563", marginTop: "12px" }}>
                                        {s.email && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <Mail size={14} color="#6b7280" /> {s.email}
                                            </div>
                                        )}
                                        {s.phone && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <Phone size={14} color="#6b7280" /> {s.phone}
                                            </div>
                                        )}
                                        {s.address && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <MapPin size={14} color="#6b7280" /> {s.address}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
                                    <button
                                        type="button"
                                        className="inventory-btn-secondary"
                                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                        onClick={() => handleOpenModal(s)}
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="inventory-btn-secondary"
                                        style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#ef4444", borderColor: "#fca5a5" }}
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ADD / EDIT SUPPLIER MODAL */}
                {isModalOpen && (
                    <div className="inv-modal-overlay">
                        <div className="inv-modal-card">
                            <div className="inv-modal-header">
                                <h3>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                    <X size={20} color="#6b7280" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="inv-modal-body">
                                    <div className="inv-form-group">
                                        <label>Company Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Samsung Electronics Wholesale"
                                            required
                                        />
                                    </div>

                                    <div className="inv-form-group">
                                        <label>Contact Person</label>
                                        <input
                                            type="text"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            placeholder="e.g. John Doe (Account Manager)"
                                        />
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                        <div className="inv-form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="orders@supplier.com"
                                            />
                                        </div>

                                        <div className="inv-form-group">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+40 700 000 000"
                                            />
                                        </div>
                                    </div>

                                    <div className="inv-form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Street, City, Country"
                                        />
                                    </div>

                                    <div className="inv-form-group">
                                        <label>Notes / Payment Terms</label>
                                        <textarea
                                            rows="3"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="e.g. Lead time 3 days. Payment terms Net 30."
                                        />
                                    </div>
                                </div>

                                <div className="inv-modal-footer">
                                    <button type="button" className="inventory-btn-secondary" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={readOnly ? "demo-no-permission" : "inventory-btn-primary"}
                                        aria-disabled={readOnly}
                                    >
                                        {editingSupplier ? "Update Supplier" : "Save Supplier"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default AdminSuppliersPage;
