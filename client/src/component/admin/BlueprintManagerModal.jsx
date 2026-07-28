import React, { useState, useEffect } from "react";

export const getStoredBlueprints = () => {
    try {
        const stored = localStorage.getItem("shv_product_blueprints");
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        // Normalize object structure if needed
        return parsed.map((bp, idx) => ({
            id: bp.id || `bp-${idx}-${Date.now()}`,
            name: bp.name || `Blueprint #${idx + 1}`,
            attributes: Array.isArray(bp.attributes) ? bp.attributes : []
        }));
    } catch {
        return [];
    }
};

export const saveStoredBlueprints = (blueprints) => {
    try {
        localStorage.setItem("shv_product_blueprints", JSON.stringify(blueprints));
    } catch (e) {
        console.error("Failed to save blueprints", e);
    }
};

const BlueprintManagerModal = ({ isOpen, onClose, onBlueprintsUpdated }) => {
    const [blueprints, setBlueprints] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editAttrs, setEditAttrs] = useState([]);

    const [newBpName, setNewBpName] = useState("");
    const [newBpAttrs, setNewBpAttrs] = useState(["Color", "Memory"]);

    useEffect(() => {
        if (isOpen) {
            setBlueprints(getStoredBlueprints());
            setEditingId(null);
        }
    }, [isOpen]);

    const handleReload = () => {
        const fresh = getStoredBlueprints();
        setBlueprints(fresh);
        if (onBlueprintsUpdated) onBlueprintsUpdated(fresh);
    };

    const handleStartEdit = (bp) => {
        setEditingId(bp.id);
        setEditName(bp.name);
        setEditAttrs([...bp.attributes]);
    };

    const handleSaveEdit = (id) => {
        if (!editName.trim()) {
            alert("Blueprint name cannot be empty.");
            return;
        }
        const cleanedAttrs = editAttrs.map(a => a.trim()).filter(Boolean);
        if (cleanedAttrs.length === 0) {
            alert("Please specify at least one attribute key.");
            return;
        }

        const updated = blueprints.map(bp => {
            if (bp.id === id) {
                return { ...bp, name: editName.trim(), attributes: cleanedAttrs };
            }
            return bp;
        });

        saveStoredBlueprints(updated);
        setEditingId(null);
        handleReload();
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete blueprint "${name}"?`)) {
            const updated = blueprints.filter(bp => bp.id !== id);
            saveStoredBlueprints(updated);
            handleReload();
        }
    };

    const handleCreateNew = (e) => {
        e.preventDefault();
        if (!newBpName.trim()) {
            alert("Please enter a name for the new blueprint.");
            return;
        }
        const cleanedAttrs = newBpAttrs.map(a => a.trim()).filter(Boolean);
        if (cleanedAttrs.length === 0) {
            alert("Please add at least one attribute.");
            return;
        }

        const newBp = {
            id: `bp-${Date.now()}-${Math.random()}`,
            name: newBpName.trim(),
            attributes: cleanedAttrs
        };

        const updated = [...blueprints, newBp];
        saveStoredBlueprints(updated);
        setNewBpName("");
        setNewBpAttrs(["Color", "Memory"]);
        handleReload();
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
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
        }}>
            <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "24px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                    <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1.2rem", fontWeight: 700 }}>
                        Manage Custom Blueprints
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: "transparent", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
                    >
                        ✕
                    </button>
                </div>

                {/* Create New Blueprint Form */}
                <form onSubmit={handleCreateNew} style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 10px", color: "#334155", fontSize: "0.92rem", fontWeight: 700 }}>+ Create New Blueprint</h4>
                    <input
                        type="text"
                        placeholder="Blueprint Name (e.g. Headphone Specs, Tablet Preset)"
                        value={newBpName}
                        onChange={(e) => setNewBpName(e.target.value)}
                        style={{ marginBottom: "10px", fontSize: "0.85rem" }}
                    />
                    <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        Attribute Keys
                    </label>
                    {newBpAttrs.map((attrKey, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                            <input
                                type="text"
                                placeholder={`Attribute #${idx + 1} Key`}
                                value={attrKey}
                                onChange={(e) => {
                                    const next = [...newBpAttrs];
                                    next[idx] = e.target.value;
                                    setNewBpAttrs(next);
                                }}
                                style={{ fontSize: "0.82rem" }}
                            />
                            {newBpAttrs.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setNewBpAttrs(prev => prev.filter((_, i) => i !== idx))}
                                    style={{ background: "#fee2e2", color: "#ef4444", border: "none", width: "32px", borderRadius: "6px" }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button
                            type="button"
                            onClick={() => setNewBpAttrs(prev => [...prev, ""])}
                            style={{ background: "#e2e8f0", color: "#334155", padding: "4px 10px", fontSize: "0.78rem" }}
                        >
                            + Add Key
                        </button>
                        <button
                            type="submit"
                            style={{ background: "var(--ink)", color: "#ffffff", padding: "6px 14px", fontSize: "0.82rem" }}
                        >
                            Create Blueprint
                        </button>
                    </div>
                </form>

                {/* Existing Blueprints List */}
                <h4 style={{ margin: "0 0 12px", color: "#334155", fontSize: "0.95rem", fontWeight: 700 }}>
                    Saved Blueprints ({blueprints.length})
                </h4>

                {blueprints.length === 0 ? (
                    <p style={{ color: "#64748b", fontSize: "0.85rem", fontStyle: "italic" }}>
                        No saved custom blueprints yet. Create one above or save from a configuration.
                    </p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {blueprints.map((bp) => {
                            const isEditing = editingId === bp.id;

                            if (isEditing) {
                                return (
                                    <div key={bp.id} style={{ background: "#f1f5f9", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{ marginBottom: "8px", fontWeight: "bold" }}
                                        />
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                                            {editAttrs.map((attrStr, idx) => (
                                                <div key={idx} style={{ display: "flex", gap: "6px" }}>
                                                    <input
                                                        type="text"
                                                        value={attrStr}
                                                        onChange={(e) => {
                                                            const next = [...editAttrs];
                                                            next[idx] = e.target.value;
                                                            setEditAttrs(next);
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditAttrs(prev => prev.filter((_, i) => i !== idx))}
                                                        style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "0 8px" }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                type="button"
                                                onClick={() => setEditAttrs(prev => [...prev, ""])}
                                                style={{ background: "#e2e8f0", color: "#334155", fontSize: "0.75rem", padding: "4px 8px" }}
                                            >
                                                + Key
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(bp.id)}
                                                style={{ background: "var(--ink)", color: "#ffffff", fontSize: "0.8rem", padding: "5px 12px" }}
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                style={{ background: "transparent", border: "1px solid #cbd5e1", color: "#475569", fontSize: "0.8rem", padding: "5px 12px" }}
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
                                            Attributes: <strong>{bp.attributes.join(", ")}</strong>
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            type="button"
                                            onClick={() => handleStartEdit(bp)}
                                            style={{ background: "#e2e8f0", color: "#334155", border: "none", padding: "4px 10px", fontSize: "0.78rem" }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(bp.id, bp.name)}
                                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 10px", fontSize: "0.78rem" }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: "20px", textAlign: "right" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: "var(--ink)", color: "#ffffff", padding: "8px 20px" }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlueprintManagerModal;
