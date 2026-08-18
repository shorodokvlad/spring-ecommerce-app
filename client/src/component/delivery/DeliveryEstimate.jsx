import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import "../../style/deliveryEstimate.css";

const GEO_TIMEOUT_MS = 8000;

const formatDate = (iso) =>
    new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(
        new Date(`${iso}T00:00:00`)
    );

const formatEta = (option) => {
    const from = formatDate(option.etaFrom);
    if (option.etaTo && option.etaTo !== option.etaFrom) {
        return `${from} – ${formatDate(option.etaTo)}`;
    }
    return from;
};

const formatPrice = (value) => {
    const num = Number(value);
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(num);
};

const DeliveryEstimate = ({ defaultSubtotal = 0 }) => {
    const { cart } = useCart();

    const cartTotal = useMemo(
        () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0),
        [cart]
    );
    const subtotal = cartTotal > 0 ? cartTotal : Number(defaultSubtotal) || 0;

    const [mode, setMode] = useState("detecting"); // detecting | manual | done
    const [activeLocation, setActiveLocation] = useState(null); // { locality, source } from account/geo
    const [counties, setCounties] = useState([]);
    const [localities, setLocalities] = useState([]);
    const [selectedCounty, setSelectedCounty] = useState("");
    const [selectedLocality, setSelectedLocality] = useState("");
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadEstimate = useCallback(
        async (params, isDetected) => {
            setLoading(true);
            try {
                const response = await ApiService.getDeliveryEstimate({ ...params, subtotal });
                const est = response.deliveryEstimate;
                if (est && est.options?.length) {
                    if (isDetected && !est.localityResolved) {
                        return false;
                    }
                    setEstimate(est);
                    setMode("done");
                    return true;
                }
                return false;
            } catch (error) {
                console.error("Error fetching delivery estimate:", error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [subtotal]
    );

    useEffect(() => {
        let active = true;
        const detect = async () => {
            if (ApiService.isAuthenticated()) {
                try {
                    const response = await ApiService.getLoggedInUserInfo();
                    const addr = response.user?.address;
                    if (active && addr && addr.state && addr.city) {
                        const ok = await loadEstimate({
                            country: addr.country || "RO",
                            county: addr.state,
                            locality: addr.city,
                            source: "account"
                        }, false);
                        if (active && ok) {
                            setActiveLocation({ locality: addr.city, source: "account" });
                            return;
                        }
                    }
                } catch (error) {
                    // Fall through to geolocation
                }
            }
            try {
                const geo = await axios.get("https://api.bigdatacloud.net/data/client-ip-geo?localityLanguage=en", {
                    timeout: GEO_TIMEOUT_MS
                });
                const countryCode = geo.data?.country?.code;
                const city = geo.data?.city || geo.data?.locality;
                if (active && countryCode === "RO" && city) {
                    const ok = await loadEstimate({ country: "RO", locality: city, source: "detected" }, true);
                    if (active && ok) {
                        setActiveLocation({ locality: city, source: "detected" });
                        return;
                    }
                }
            } catch (error) {
                // Geolocation unavailable -> fall through to manual mode
            }
            if (active) setMode("manual");
        };
        detect();
        return () => { active = false; };
    }, [loadEstimate]);

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
        loadEstimate({ country: "RO", county: selectedCounty, locality, source: "manual" });
    };

    const switchToManual = () => {
        const prevCounty = estimate?.county;
        const prevLocality = estimate?.locality;
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
        <div className="delivery-estimate">
            <div className="delivery-estimate-header">
                <img src="/truck.svg" alt="Delivery" style={{ width: "20px", height: "20px" }} />
                <span className="delivery-estimate-title">
                    Estimated delivery to:{" "}
                    {destinationLabel() ? <strong>{destinationLabel()}</strong> : null}
                </span>
                {mode === "done" && (
                    <button type="button" className="delivery-estimate-change" onClick={switchToManual}>
                        Change
                    </button>
                )}
            </div>

            {mode === "detecting" && (
                <div className="delivery-estimate-hint">Detecting your location…</div>
            )}

            {mode === "manual" && (
                <div className="delivery-estimate-selectors">
                    <div className="delivery-estimate-subtitle">View delivery options for:</div>
                    <div className="delivery-estimate-selects">
                        <select
                            value={selectedCounty}
                            onChange={(e) => handleCountyChange(e.target.value)}
                            className="delivery-estimate-select"
                            disabled={loading}
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
                            disabled={!selectedCounty || loading}
                        >
                            <option value="">Locality</option>
                            {localities.map((l) => (
                                <option key={l.id} value={l.name}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {loading && <div className="delivery-estimate-hint">Calculating delivery…</div>}

            {estimate && (
                <div className="delivery-estimate-card">
                    {estimate.options.map((option) => (
                        <div className="delivery-option-row" key={option.service}>
                            <img src="/truck.svg" alt="Courier" className="delivery-option-icon" />
                            <div className="delivery-option-body">
                                <div className="delivery-option-name">
                                    <strong>{option.label}</strong>
                                    <span className="delivery-option-eta">{formatEta(option)}</span>
                                </div>
                                <div className={`delivery-option-price ${option.free ? "is-free" : ""}`}>
                                    {option.free ? "Free" : formatPrice(option.price)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {estimate.subtotal > 0 && estimate.freeThreshold > 0 && (
                        <div className="delivery-estimate-note">
                            Free standard delivery on orders over {formatPrice(estimate.freeThreshold)}.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeliveryEstimate;