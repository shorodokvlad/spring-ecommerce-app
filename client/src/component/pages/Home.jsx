import React, {useEffect, useState} from "react";
import { useLocation, Link } from "react-router-dom";
import ProductList from "../common/ProductList"
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import '../../style/home.css';

const Home = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;

    const searchItem = new URLSearchParams(location.search).get('search');

    // A new search should always start from the first page
    useEffect(() => {
        setCurrentPage(1);
    }, [location.search]);

    useEffect(() => {
        ApiService.getAllCategory()
            .then((res) => setCategories(res.categoryList || []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(()=> {

        const fetchProducts = async () => {
            try{
                let allProducts = [];

                if (searchItem) {
                    const response = await ApiService.searchProducts(searchItem);
                    allProducts = response.productList || [];
                }else{
                    const response = await ApiService.getAllProducts();
                    allProducts = response.productList || [];

                }

                setTotalPages(Math.ceil(allProducts.length/itemsPerPage));
                setProducts(allProducts.slice((currentPage -1) * itemsPerPage, currentPage * itemsPerPage));

            }catch(error){
                setError(error.response?.data?.message || error.message || 'Unable to fetch products')
            }
        }

        fetchProducts();

    },[searchItem, currentPage])


    return(
        <div className="home">
            <header className="shop-band">
                {searchItem ? (
                    <>
                        <p className="shop-eyebrow">Search results</p>
                        <h1>“{searchItem}”</h1>
                        <Link to="/" className="shop-band-clear">Clear search</Link>
                    </>
                ) : (
                    <>
                        <p className="shop-eyebrow">SHV Store</p>
                        <h1>Shop the catalogue.</h1>
                        <p className="shop-sub">Every item ships from our own shelf — stock counts are live.</p>
                        {categories.length > 0 && (
                            <div className="category-chips">
                                {categories.map((cat) => (
                                    <Link key={cat.id} to={`/category/${cat.id}`} className="category-chip">
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </header>

            {error ? (
                <p className="error-message">{error}</p>
            ):(
                <div>
                    <ProductList products={products}/>
                    <Pagination  currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page)=> setCurrentPage(page)}/>
                </div>
            )}
        </div>
    )


}

export default Home;
