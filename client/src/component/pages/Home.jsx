import React, {useEffect, useState} from "react";
import { useLocation, Link } from "react-router-dom";
import ProductList from "../common/ProductList"
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
    const itemsPerPage = 12;

    const searchItem = new URLSearchParams(location.search).get('search');

    // A new search should always start from the first page
    useEffect(() => {
        setCurrentPage(1);
    }, [location.search]);

    useEffect(()=> {
        const fetchProducts = async () => {
            try{
                setError(null);
                let response;
                const pageIndex = currentPage - 1;

                if (searchItem) {
                    response = await ApiService.searchProducts(searchItem, pageIndex, itemsPerPage);
                }else{
                    response = await ApiService.getAllProducts(pageIndex, itemsPerPage);
                }

                setProducts(response.productList || []);
                setTotalPages(response.totalPage || 1);

            }catch(error){
                setError(error.response?.data?.message || error.message || 'Unable to fetch products')
            }
        }

        fetchProducts();

    },[searchItem, currentPage])


    return(
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

            {error ? (
                <p className="error-message">{error}</p>
            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
                    <p style={{ fontSize: "1.1rem" }}>No products found matching "{searchItem}".</p>
                    <Link to="/" className="btn-primary" style={{ marginTop: "12px", display: "inline-block" }}>
                        View All Products
                    </Link>
                </div>
            ) : (
                <div>
                    <ProductList products={products}/>
                    {totalPages > 1 && (
                        <Pagination  currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page)=> setCurrentPage(page)}/>
                    )}
                </div>
            )}
        </div>
    )


}

export default Home;
