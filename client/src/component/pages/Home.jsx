import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import BannerCarousel from "../common/BannerCarousel";
import '../../style/home.css';

const Home = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 12;

    const searchItem = new URLSearchParams(location.search).get('search');

    // A new search should always start from the first page
    useEffect(() => {
        setCurrentPage(1);
    }, [location.search]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                let response;
                const pageIndex = currentPage - 1;

                if (searchItem) {
                    response = await ApiService.searchProducts(searchItem, pageIndex, itemsPerPage);
                } else {
                    response = await ApiService.getAllProducts(pageIndex, itemsPerPage);
                }

                setProducts(response.productList || []);
                setTotalPages(response.totalPage || 1);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Unable to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchItem, currentPage]);

    return (
        <div className="home">
            {searchItem ? (
                <header className="shop-band">
                    <p className="shop-eyebrow">Search results</p>
                    <h1>“{searchItem}”</h1>
                    <Link to="/" className="shop-band-clear">Clear search</Link>
                </header>
            ) : (
                <BannerCarousel />
            )}

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p className="loading-product-details">Loading products...</p>
            ) : products.length === 0 ? (
                <div className="search-empty-state">
                    <h3>No products found matching "{searchItem || ''}".</h3>
                    <Link to="/" className="shop-band-clear">View All Products</Link>
                </div>
            ) : (
                <div>
                    <ProductList products={products} />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
};

export default Home;
