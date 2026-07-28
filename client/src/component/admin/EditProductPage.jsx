import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../../style/addProduct.css';
import ApiService from "../../service/ApiService";

const EditProductPage = () => {
    const { productId } = useParams();
    // Unified list of images: { id, type: 'existing' | 'new', url, file?: File }
    const [images, setImages] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const navigate = useNavigate();

    const fetchProductData = useCallback(async () => {
        if (!productId) return;
        try {
            const response = await ApiService.getProductById(productId);
            const prod = response.product;
            setName(prod.name || '');
            setDescription(prod.description || '');
            setPrice(prod.price || '');
            setStockQuantity(prod.stockQuantity ?? '');
            setCategoryId(prod.category?.id || '');

            const urls = (prod.imageUrls && prod.imageUrls.length > 0)
                ? prod.imageUrls
                : (prod.imageUrl ? [prod.imageUrl] : []);

            setImages(urls.map((url, idx) => ({
                id: `existing-${idx}-${Date.now()}`,
                type: 'existing',
                url: url
            })));
        } catch (err) {
            console.error(err);
        }
    }, [productId]);

    useEffect(() => {
        ApiService.getAllCategory().then((res) => setCategories(res.categoryList || []));
        fetchProductData();
    }, [fetchProductData]);

    const handleNewImagesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const newItems = [];

        for (const file of selectedFiles) {
            if (file.size > 25 * 1024 * 1024) {
                alert(`File "${file.name}" exceeds 25MB limit.`);
                continue;
            }
            newItems.push({
                id: `new-${Date.now()}-${Math.random()}`,
                type: 'new',
                url: URL.createObjectURL(file),
                file: file
            });
        }

        setImages((prev) => [...prev, ...newItems]);
        e.target.value = null;
    };

    // Drag & Drop Handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        setImages((prev) => {
            const next = [...prev];
            const [movedItem] = next.splice(draggedIndex, 1);
            next.splice(dropIndex, 0, movedItem);
            return next;
        });
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const removeImage = (indexToRemove) => {
        setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('productId', productId);
            if (categoryId) formData.append('categoryId', categoryId);
            if (name) formData.append('name', name);
            if (description) formData.append('description', description);
            if (price) formData.append('price', price);
            if (stockQuantity !== '') formData.append('stockQuantity', stockQuantity);

            // Send images in their exact user drag-reordered sequence
            images.forEach((item) => {
                if (item.type === 'existing') {
                    formData.append('existingImageUrls', item.url);
                } else if (item.type === 'new' && item.file) {
                    formData.append('images', item.file);
                }
            });

            const response = await ApiService.updateProduct(formData);
            if (response.status === 200) {
                setMessage(response.message || "Product updated successfully!");
                await fetchProductData();
                setTimeout(() => {
                    setMessage('');
                }, 4000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Unable to update product');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h2 style={{ margin: 0 }}>Edit Product</h2>
                <button
                    type="button"
                    onClick={() => navigate('/admin/products')}
                    style={{
                        background: "transparent",
                        border: "1px solid #cbd5e1",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: "#475569"
                    }}
                >
                    ← Back to Products
                </button>
            </div>

            {message && <div className="message">{message}</div>}

            <div className="form-group">
                <label>Add New Photos (Drag to reorder)</label>
                <input type="file" multiple accept="image/*" onChange={handleNewImagesChange} />
            </div>

            {/* Gallery Previews Container with Drag & Drop Reordering */}
            {images.length > 0 && (
                <div className="admin-image-previews">
                    {images.map((item, idx) => (
                        <div
                            className={`admin-preview-item ${item.type === 'new' ? 'new-preview' : ''} ${draggedIndex === idx ? 'dragging' : ''}`}
                            key={item.id || idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            title="Drag to reorder"
                        >
                            <img src={item.url} alt={`Thumbnail ${idx + 1}`} />

                            <button
                                type="button"
                                className="remove-img-btn"
                                onClick={() => removeImage(idx)}
                                title="Remove photo"
                            >
                                ✕
                            </button>

                            {idx === 0 ? (
                                <span className="main-photo-tag">Main</span>
                            ) : (
                                <span className={item.type === 'new' ? 'new-photo-tag' : 'photo-num-tag'}>
                                    {item.type === 'new' ? 'New' : `#${idx + 1}`}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                    <option value={cat.id} key={cat.id}>{cat.name}</option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <input
                type="number"
                placeholder="Price"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />

            <input
                type="number"
                placeholder="Stock quantity"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
            />

            <button type="submit">Update Product</button>
        </form>
    );
};

export default EditProductPage;