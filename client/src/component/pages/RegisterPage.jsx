import React, { useState } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css'


const RegisterPage = () => {

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phoneNumber: '',
        password: ''
    });

    const [message, setMessage] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.registerUser(formData);
            if (response.status === 200) {
                setMessage(response.message || "Registration successful! Please check your email to verify your account.");
                setIsRegistered(true);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Unable to register user");
        }
    }

    return (
        <div className="register-page">
            <h2>Register</h2>
            {message && <p className="message">{message}</p>}

            {isRegistered ? (
                <div className="registration-success" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>We sent a verification link to <strong>{formData.email}</strong>.</p>
                    <p style={{ marginTop: '10px' }}>Please open your email inbox and click the verification link before logging in.</p>
                    <div style={{ marginTop: '20px' }}>
                        <Link to="/login" style={{ textDecoration: 'underline', color: '#0070f3' }}>Already verified? Go to Login</Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label>Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required />

                    <label>Name: </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required />


                    <label>Phone Number: </label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required />

                    <label>Password: </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required />

                    <button type="submit">Register</button>
                    <p className="register-link">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
            )}
        </div>
    )
}

export default RegisterPage;