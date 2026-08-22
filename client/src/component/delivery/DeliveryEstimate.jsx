import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import "../../style/deliveryEstimate.css";

const getCachedLocation = () => {
    if (!ApiService.isAuthenticated()) return null;
    try {
        const cached = sessionStorage.getItem("shv_user_info");
        if (cached) {
            const user = JSON.parse(cached);
            if (user?.address?.city) {
                return {
                    locality: user.address.city.trim(),
                    county: user.address.state?.trim() || null,
                    source: "account"
                };
            }
        }
    } catch (e) {
        // Ignore cache parse errors
    }
    return null;
};

const DeliveryEstimate = ({ defaultSubtotal = 0 }) => {
    const { cart } = useCart();

    const cartTotal = useMemo(
        () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0),
        [cart]
    );
    const subtotal = cartTotal > 0 ? cartTotal : Number(defaultSubtotal) || 0;
    const subtotalRef = useRef(subtotal);
    useEffect(() => { subtotalRef.current = subtotal; }, [subtotal]);

    const initialLocation = useMemo(() => getCachedLocation(), []);
    const [mode, setMode] = useState(initialLocation ? "done" : "manual"); // "manual" | "done"
    const [activeLocation, setActiveLocation] = useState(initialLocation);
    const [counties, setCounties] = useState([]);
    const [localities, setLocalities] = useState([]);
    const [selectedCounty, setSelectedCounty] = useState("");
    const [selectedLocality, setSelectedLocality] = useState("");
    const [estimate, setEstimate] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const loadEstimate = useCallback(
        async (params) => {
            try {
                const response = await ApiService.getDeliveryEstimate({ ...params, subtotal: subtotalRef.current });
                const est = response.deliveryEstimate;
                if (est && est.options?.length) {
                    setEstimate(est);
                    setMode("done");
                    return est;
                }
                return null;
            } catch (error) {
                console.error("Error fetching delivery estimate:", error);
                return null;
            }
        },
        []
    );

    // Initial resolution: fetch fresh user account address if logged in
    useEffect(() => {
        let active = true;
        const resolveUserAddress = async () => {
            if (ApiService.isAuthenticated()) {
                try {
                    const response = await ApiService.getLoggedInUserInfo();
                    const addr = response.user?.address;
                    const city = addr?.city?.trim();
                    const state = addr?.state?.trim();
                    const country = (addr?.country || "RO").trim() || "RO";
                    if (city) {
                        const params = state
                            ? { country, county: state, locality: city, source: "account" }
                            : { country, locality: city, source: "account" };
                        const est = await loadEstimate(params);
                        if (active) {
                            setActiveLocation({
                                locality: est?.locality || city,
                                county: est?.county || state || null,
                                source: "account"
                            });
                            setMode("done");
                            return;
                        }
                    }
                } catch (error) {
                    // Fall back to manual/Select location if user info fetch fails
                }
            }
            if (active && !initialLocation) {
                setMode("manual");
            }
        };
        resolveUserAddress();
        return () => { active = false; };
    }, [loadEstimate, initialLocation]);

    // Keep estimate in sync when subtotal changes (e.g. variant switch)
    const prevSubtotalRef = useRef(subtotal);
    useEffect(() => {
        if (prevSubtotalRef.current === subtotal) return;
        prevSubtotalRef.current = subtotal;
        if (mode === "done") {
            const loc = estimate?.locality || activeLocation?.locality;
            const county = estimate?.county || activeLocation?.county;
            const country = estimate?.country || "RO";
            if (loc) {
                const params = county
                    ? { country, county, locality: loc, source: "account" }
                    : { country, locality: loc, source: "account" };
                loadEstimate(params);
            }
        }
    }, [subtotal, mode, estimate, activeLocation, loadEstimate]);

    useEffect(() => {
        if (mode === "manual" && counties.length === 0) {
            ApiService.getDeliveryCounties()
                .then((res) => setCounties(res.countyList || []))
                .catch((error) => console.error("Error fetching counties:", error));
        }
    }, [mode, counties.length]);

    const handleCountyChange = (county) => {
        setSelectedCounty(county);
        setSelectedLocality("");
        setLocalities([]);
        setEstimate(null);
        if (!county) return;
        ApiService.getDeliveryLocalities(county)
            .then((res) => setLocalities(res.localityList || []))
            .catch((error) => console.error("Error fetching localities:", error));
    };

    const handleLocalityChange = (locality) => {
        setSelectedLocality(locality);
        setEstimate(null);
        if (!locality || !selectedCounty) return;
        loadEstimate({ country: "RO", county: selectedCounty, locality, source: "manual" }).then((est) => {
            if (est) setActiveLocation({ locality: est.locality || locality, county: est.county || selectedCounty, source: "manual" });
        });
    };

    const switchToManual = () => {
        const prevCounty = estimate?.county || activeLocation?.county || "";
        const prevLocality = estimate?.locality || activeLocation?.locality || "";
        setMode("manual");
        setEstimate(null);
        if (prevCounty) {
            setSelectedCounty(prevCounty);
            setSelectedLocality(prevLocality || "");
            ApiService.getDeliveryLocalities(prevCounty)
                .then((res) => setLocalities(res.localityList || []))
                .catch((error) => console.error("Error fetching localities:", error));
        }
    };

    const destinationLabel = () => {
        if (estimate?.locality) return estimate.locality;
        if (activeLocation?.locality) return activeLocation.locality;
        if (selectedLocality) return selectedLocality;
        return null;
    };

    return (
        <div className="emag-delivery-estimate-card">
            {/* Header: Estimated delivery to */}
            <div className="emag-delivery-header">
                <span className="emag-delivery-label">
                    Estimated delivery to:{" "}
                    <button type="button" className="emag-locality-btn" onClick={switchToManual}>
                        <u>{destinationLabel() || "Select location"}</u>
                    </button>
                </span>
            </div>

            {mode === "manual" && (
                <div className="delivery-estimate-selectors">
                    <div className="delivery-estimate-subtitle">Select delivery location:</div>
                    <div className="delivery-estimate-selects">
                        <select
                            value={selectedCounty}
                            onChange={(e) => handleCountyChange(e.target.value)}
                            className="delivery-estimate-select"
                        >
                            <option value="">County</option>
                            {counties.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <select
                            value={selectedLocality}
                            onChange={(e) => handleLocalityChange(e.target.value)}
                            className="delivery-estimate-select"
                            disabled={!selectedCounty}
                        >
                            <option value="">Locality</option>
                            {localities.map((l) => (
                                <option key={l.id} value={l.name}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Courier Delivery Section */}
            <div className="emag-courier-delivery-box">
                <div className="emag-courier-row">
                    {/* Blue circular truck badge icon */}
                    <div className="emag-courier-badge">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" rx="2" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>

                    <div className="emag-courier-info">
                        <h4 className="emag-courier-title">Courier delivery:</h4>

                        {isExpanded && (
                            <div className="emag-courier-details">
                                <div className="emag-sub-option-dot">
                                    <span className="blue-dot"></span>
                                    <div className="emag-sub-option-content">
                                        <div className="emag-sub-title">Standard delivery</div>
                                        <div className="emag-sub-date">Monday, 24 Aug.</div>
                                        <div className="emag-sub-price">
                                            {subtotal > 100 ? "Free" : "€3.99"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button 
                            type="button" 
                            className="emag-toggle-link"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "▲ hide" : "▼ show details"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryEstimate;
