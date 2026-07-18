import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css'


const ResetPasswordPage = () => {

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match");
            return;
        }
        try {
            const response = await ApiService.resetPassword(token, newPassword);
            setMessage(response.message);
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Unable to reset the password");
        }
    }

    if (!token) {
        return (
            <div className="register-page">
                <h2>Reset password</h2>
                <p className="message">
                    This page needs the link from your reset email.
                    {' '}<Link to="/forgot-password">Request a new one</Link>
                </p>
            </div>
        )
    }

    return (
        <div className="register-page">
            <h2>Choose a new password</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>New password: </label>
                <input
                    type="password"
                    value={newPassword}
                    minLength={6}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required />

                <label>Confirm password: </label>
                <input
                    type="password"
                    value={confirmPassword}
                    minLength={6}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required />

                <button type="submit">Save new password</button>
            </form>
        </div>
    )
}

export default ResetPasswordPage;
