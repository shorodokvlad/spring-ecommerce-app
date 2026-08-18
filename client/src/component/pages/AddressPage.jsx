import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/address.css';

const EU_COUNTRIES = [
    "RO", "HU", "BG", "MD", "UA", "RS",
    "DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL", "CZ", "SK",
    "GR", "PT", "IE", "DK", "SE", "FI", "HR", "SI", "EE", "LV", "LT", "LU", "MT", "CY",
    "GB", "CH", "NO", "IS", "TR"
];

const AddressPage = () => {

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'RO'
    });

    const [counties, setCounties] = useState([]);
    const [localities, setLocalities] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();


    const loadLocalities = useCallback((county) => {
        setLocalities([]);
        if (!county) return;
        ApiService.getDeliveryLocalities(county)
            .then((res) => setLocalities(res.localityList || []))
            .catch((err) => console.error("Error fetching localities:", err));
    }, []);

    const fetchUserInfo = useCallback(async () => {
        try {
            const response = await ApiService.getLoggedInUserInfo();
            if (response.user.address) {
                setAddress(response.user.address);
                if (response.user.address.state) {
                    loadLocalities(response.user.address.state);
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "unable to fetch user information")
        }
    }, [loadLocalities]);

    useEffect(() => {
        ApiService.getDeliveryCounties()
            .then((res) => setCounties(res.countyList || []))
            .catch((err) => console.error("Error fetching counties:", err));

        if (location.pathname === '/edit-address') {
            fetchUserInfo();
        }
    }, [location.pathname, fetchUserInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value
        }))

        if (name === 'country' && value !== 'RO') {
            setAddress((prevAddress) => ({
                ...prevAddress,
                state: '',
                city: ''
            }));
            setLocalities([]);
        }

        if (name === 'state') {
            setAddress((prevAddress) => ({
                ...prevAddress,
                city: ''
            }));
            loadLocalities(value);
        }
    }

    const handSubmit = async (e) => {
        e.preventDefault();
        try {
            await ApiService.saveAddress(address);
            navigate("/profile")
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to save/update address")
        }
    }


    return (
        <div className="address-page">
            <h2>{location.pathname === '/edit-address' ? 'Edit Address' : "Add Address"}</h2>
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handSubmit}>
                <label>
                    Street:
                    <input type="text"
                        name="street"
                        value={address.street}
                        onChange={handleChange}
                        required />
                </label>
                <label>
                    Country:
                    <select
                        name="country"
                        value={address.country || 'RO'}
                        onChange={handleChange}
                        required
                    >
                        {EU_COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </label>
                <label>
                    State:
                    <select
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        required={address.country === 'RO'}
                        disabled={address.country !== 'RO'}
                    >
                        <option value="">Select county</option>
                        {counties.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </label>
                <label>
                    City:
                    <select
                        name="city"
                        value={address.city}
                        onChange={handleChange}
                        required={address.country === 'RO'}
                        disabled={!address.state || address.country !== 'RO'}
                    >
                        <option value="">Select locality</option>
                        {localities.map((l) => (
                            <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                    </select>
                </label>

                <label>
                    Zip Code:
                    <input type="text"
                        name="zipCode"
                        value={address.zipCode}
                        onChange={handleChange}
                        required />
                </label>
                <button type="submit">{location.pathname === '/edit-address' ? 'Edit Address' : "Save Address"}</button>

            </form>
        </div>
    )
}

export default AddressPage;