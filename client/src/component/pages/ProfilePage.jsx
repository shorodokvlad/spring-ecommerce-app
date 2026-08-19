import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/profile.css';
import Pagination from "../common/Pagination";

const CACHE_KEY = 'profile_user_info_cache';
const CACHE_TTL_MS = 60 * 1000;

const ProfilePage = () => {

    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    const readUserInfoCache = () => {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const cached = JSON.parse(raw);
            if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
            if (cached.token !== localStorage.getItem('token')) return null;
            return cached.user;
        } catch {
            return null;
        }
    };

    useEffect(() => {

        fetchUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const fetchUserInfo = async () => {

        try {
            const cachedUser = readUserInfoCache();
            if (cachedUser) {
                setUserInfo(cachedUser);
                return;
            }
            const response = await ApiService.getLoggedInUserInfo();
            setUserInfo(response.user);
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    token: localStorage.getItem('token'),
                    user: response.user
                }));
            } catch {
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to fetch user info');
        }
    }

    if (error) {
        return <div className="profile-page"><p className="error-message">{error}</p></div>;
    }

    if (!userInfo) {
        return (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
                <span className="button-spinner" style={{ width: "32px", height: "32px", borderColor: "var(--line)", borderTopColor: "var(--ink)" }} />
                <p style={{ marginTop: "14px", fontSize: "0.95rem", fontWeight: 600 }}>Loading profile...</p>
            </div>
        );
    }

    const handleAddressClick = () => {
        navigate(userInfo.address ? '/edit-address' : '/add-address');
    }

    const orderItemList = userInfo.orderItemList || [];

    const totalPages = Math.ceil(orderItemList.length / itemsPerPage);

    const paginatedOrders = orderItemList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );




    const handleLogout = () => {
        if (window.confirm("Log out of your account?")) {
            sessionStorage.removeItem(CACHE_KEY);
            ApiService.logout();
            navigate('/login');
        }
    };

    return (
        <div className="profile-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>Welcome {userInfo.name}</h2>
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        background: "#ef4444", 
                        color: "#ffffff", 
                        padding: "8px 16px", 
                        borderRadius: "8px", 
                        fontWeight: "600",
                        cursor: "pointer",
                        border: "none"
                    }}
                >
                    Log Out
                </button>
            </div>

            <div>
                <p><strong>Name: </strong>{userInfo.name}</p>
                <p><strong>Email: </strong>{userInfo.email}</p>
                <p><strong>Phone Number: </strong>{userInfo.phoneNumber}</p>

                <div>
                    <h3>Address</h3>
                    {userInfo.address ? (
                        <div>
                            <p><strong>Street: </strong>{userInfo.address.street}</p>
                            <p><strong>City: </strong>{userInfo.address.city}</p>
                            <p><strong>State: </strong>{userInfo.address.state}</p>
                            <p><strong>Zip Code: </strong>{userInfo.address.zipCode}</p>
                            <p><strong>Country: </strong>{userInfo.address.country}</p>
                        </div>
                    ) : (
                        <p>No Address information available</p>
                    )}
                    <button className="profile-button" onClick={handleAddressClick}>
                        {userInfo.address ? "Edit Address" : "Add Address"}
                    </button>
                </div>
                <h3>Order History</h3>
                <ul>
                    {paginatedOrders.map(order => {
                        const product = order.product || order.productDto;
                        return (
                        <li key={order.id}>
                            <img src={order.variantImageUrl || product?.imageUrl} alt={product?.name || 'Product'} />
                            <div>
                                <p><strong>Name: </strong>{product?.name || 'Unknown Product'}</p>
                                {order.variantTitle && <p><strong>Configuration: </strong>{order.variantTitle}</p>}
                                {order.variantAttributes && Object.entries(order.variantAttributes).map(([key, value]) => (
                                    <p key={key}><strong>{key}: </strong>{value}</p>
                                ))}
                                <p><strong>Status: </strong>{order.status}</p>
                                <p><strong>Quantity: </strong>{order.quantity}</p>
                                <p><strong>Price: </strong>{(order.price || 0).toFixed(2)}</p>
                            </div>
                        </li>
                    )})}
                </ul>
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page)=> setCurrentPage(page)}/>
            </div>
        </div>
    )
}

export default ProfilePage;
