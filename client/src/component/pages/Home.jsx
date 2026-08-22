import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import BannerCarousel from "../common/BannerCarousel";
import ProductSkeleton from "../common/ProductSkeleton";
import '../../style/home.css';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache validity

const Home = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 18;

    const searchItem = new URLSearchParams(location.search).get('search');

    // A new search should always start from the first page
    useEffect(() => {
        setCurrentPage(1);
    }, [location.search]);

    useEffect(() => {
        const fetchProducts = async () => {
            const pageIndex = currentPage - 1;
            const cacheKey = `shv_home_products_p${currentPage}`;
            const cacheTimeKey = `shv_home_products_time_p${currentPage}`;

            // Check sessionStorage cache for non-search pages
            if (!searchItem) {
                const cachedData = sessionStorage.getItem(cacheKey);
                const cachedTime = sessionStorage.getItem(cacheTimeKey);
                const now = Date.now();

                if (cachedData && cachedTime && (now - parseInt(cachedTime, 10)) < CACHE_TTL) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        setProducts(parsed.productList || []);
                        setTotalPages(parsed.totalPage || 1);
                        setLoading(false);
                    } catch (e) {
                        // Ignore cache parse errors
                    }
                } else {
                    setLoading(true);
                }
            } else {
                setLoading(true);
            }

            try {
                setError(null);
                let response;

                if (searchItem) {
                    response = await ApiService.searchProducts(searchItem, pageIndex, itemsPerPage);
                } else {
                    response = await ApiService.getAllProducts(pageIndex, itemsPerPage);
                }

                const fetchedProducts = response.productList || [];
                const fetchedPages = response.totalPage || 1;

                setProducts(fetchedProducts);
                setTotalPages(fetchedPages);

                // Save to sessionStorage cache for non-search calls
                if (!searchItem) {
                    sessionStorage.setItem(cacheKey, JSON.stringify(response));
                    sessionStorage.setItem(cacheTimeKey, Date.now().toString());
                }
            } catch (err) {
                // If we already loaded cached data, don't display blocking error
                if (!sessionStorage.getItem(cacheKey)) {
                    setError(err.response?.data?.message || err.message || 'Unable to fetch products');
                }
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

            {loading && products.length === 0 ? (
                <section className="best-sellers-section">
                    {!searchItem && <h2 className="section-title emag-section-title">Products chosen for you</h2>}
                    <ProductSkeleton count={18} />
                </section>
            ) : products.length === 0 ? (
                <div className="search-empty-state">
                    <h3>No products found matching "{searchItem || ''}".</h3>
                    <Link to="/" className="shop-band-clear">View All Products</Link>
                </div>
            ) : (
                <section className="best-sellers-section">
                    {!searchItem && <h2 className="section-title emag-section-title">Products chosen for you</h2>}
                    <ProductList products={products} />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </section>
            )}
        </div>
    );
};

export default Home;
