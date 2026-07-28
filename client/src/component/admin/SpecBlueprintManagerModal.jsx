import React, { useState, useEffect } from "react";

export const getStoredSpecBlueprints = () => {
    try {
        const stored = localStorage.getItem("shv_spec_blueprints");
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

export const saveStoredSpecBlueprints = (blueprints) => {
    try {
        localStorage.setItem("shv_spec_blueprints", JSON.stringify(blueprints));
    } catch (e) {
        console.error("Failed to save spec blueprints", e);
    }
};

const SpecBlueprintManagerModal = ({ isOpen, onClose, onBlueprintsUpdated }) => {
    const [blueprints, setBlueprints] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editSections, setEditSections] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setBlueprints(getStoredSpecBlueprints());
            setEditingId(null);
        }
    }, [isOpen]);

    const handleReload = () => {
        const fresh = getStoredSpecBlueprints();
        setBlueprints(fresh);
        if (onBlueprintsUpdated) onBlueprintsUpdated(fresh);
    };

    const handleStartEdit = (bp) => {
        setEditingId(bp.id);
        setEditName(bp.name);
        setEditSections(JSON.parse(JSON.stringify(bp.sections || [])));
    };

    const handleSaveEdit = (id) => {
        if (!editName.trim()) {
            alert("Blueprint name cannot be empty.");
            return;
        }

        const updated = blueprints.map(bp => {
            if (bp.id === id) {
                return { ...bp, name: editName.trim(), sections: editSections };
            }
            return bp;
        });

        saveStoredSpecBlueprints(updated);
        setEditingId(null);
        handleReload();
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete specification blueprint "${name}"?`)) {
            const updated = blueprints.filter(bp => bp.id !== id);
            saveStoredSpecBlueprints(updated);
            handleReload();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
        }}>
            <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "640px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "24px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                    <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1.15rem", fontWeight: 700 }}>
                        Manage Specification Blueprints
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: "transparent", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {blueprints.length === 0 ? (
                        <p style={{ color: "#64748b", fontSize: "0.88rem", fontStyle: "italic" }}>
                            No saved custom specification blueprints yet. You can save your current specification builder layout as a blueprint anytime.
                        </p>
                    ) : (
                        blueprints.map((bp) => {
                            const isEditing = editingId === bp.id;

                            if (isEditing) {
                                return (
                                    <div key={bp.id} style={{ background: "#f1f5f9", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{ marginBottom: "10px", fontWeight: "bold" }}
                                        />
                                        <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 10px" }}>
                                            Contains {bp.sections?.length || 0} section(s).
                                        </p>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(bp.id)}
                                                style={{ background: "var(--ink)", color: "#ffffff", fontSize: "0.8rem", padding: "6px 14px", borderRadius: "6px" }}
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                style={{ background: "transparent", border: "1px solid #cbd5e1", color: "#475569", fontSize: "0.8rem", padding: "6px 14px", borderRadius: "6px" }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={bp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <div>
                                        <h5 style={{ margin: "0 0 4px", fontSize: "0.92rem", color: "#0f172a" }}>{bp.name}</h5>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                                            Sections: <strong>{bp.sections?.map(s => s.title).join(", ") || "General"}</strong>
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            type="button"
                                            onClick={() => handleStartEdit(bp)}
                                            style={{ background: "#e2e8f0", color: "#334155", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "0.78rem" }}
                                        >
                                            Rename
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(bp.id, bp.name)}
                                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "0.78rem" }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ marginTop: "24px", textAlign: "right" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: "var(--ink)", color: "#ffffff", padding: "8px 20px", borderRadius: "8px" }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpecBlueprintManagerModal;
