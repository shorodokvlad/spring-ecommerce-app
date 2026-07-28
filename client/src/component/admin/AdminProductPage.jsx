import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/adminProduct.css';
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";

const AdminProductPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getAllProducts();
            const productList = response.productList || [];
            setTotalPages(Math.ceil(productList.length / itemsPerPage));
            setProducts(productList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'unable to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const handleEdit = async (id) => {
        navigate(`/admin/edit-product/${id}`);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this product?");
        if (confirmed) {
            try {
                await ApiService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                setError(error.response?.data?.message || error.message || 'unable to delete product');
            }
        }
    };

    return (
        <div className="admin-product-list">
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div>
                    <h2>Products</h2>
                    <button className="product-btn" onClick={() => { navigate('/admin/add-product'); }}>Add product</button>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
                            <span className="button-spinner" style={{ width: "26px", height: "26px", borderColor: "var(--line)", borderTopColor: "var(--ink)" }} />
                            <p style={{ marginTop: "12px", fontSize: "0.9rem" }}>Loading products...</p>
                        </div>
                    ) : (
                        <>
                            <ul>
                                {products.map((product) => (
                                    <li key={product.id}>
                                        <div className="admin-product-info">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="admin-product-thumb" />
                                            ) : (
                                                <div className="admin-product-thumb-placeholder">PROD</div>
                                            )}
                                            <span className="admin-product-name">{product.name}</span>
                                        </div>
                                        <div className="admin-product-actions">
                                            <button className="product-btn" onClick={() => handleEdit(product.id)}>Edit</button>
                                            <button className="product-btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminProductPage;