import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/addProduct.css';
import ApiService from "../../service/ApiService";

const AddProductPage = () => {
    const [images, setImages] = useState([]); // List of { file: File, url: string }
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        ApiService.getAllCategory().then((res) => setCategories(res.categoryList || []));
    }, []);

    const handleImageFilesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const newItems = [];

        for (const file of selectedFiles) {
            if (file.size > 25 * 1024 * 1024) {
                alert(`File "${file.name}" exceeds 25MB limit.`);
                continue;
            }
            newItems.push({
                file,
                url: URL.createObjectURL(file)
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
            if (images.length === 0) {
                setMessage("Please select at least one product photo.");
                return;
            }

            const formData = new FormData();
            formData.append('categoryId', categoryId);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('stockQuantity', stockQuantity || 0);

            // Append images in their drag-reordered sequence
            images.forEach((item) => {
                formData.append('images', item.file);
            });

            const response = await ApiService.addProduct(formData);
            if (response.status === 200) {
                setMessage(response.message);
                setTimeout(() => {
                    setMessage('');
                    navigate('/admin/products');
                }, 2000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Unable to upload product');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="product-form">
                <h2>Add Product</h2>
                {message && <div className="message">{message}</div>}

                <div className="form-group">
                    <label>Product Photos (Select 1 or more — Drag to reorder)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFilesChange}
                    />
                </div>

                {images.length > 0 && (
                    <div className="admin-image-previews">
                        {images.map((item, idx) => (
                            <div
                                className={`admin-preview-item ${draggedIndex === idx ? 'dragging' : ''}`}
                                key={idx}
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
                                    <span className="photo-num-tag">#{idx + 1}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
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
                    required
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <input
                    type="number"
                    placeholder="Stock quantity"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                />

                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default AddProductPage;