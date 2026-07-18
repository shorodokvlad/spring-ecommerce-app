import React, { useState } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css'


const ForgotPasswordPage = () => {

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const response = await ApiService.forgotPassword(email);
            setMessage(response.message);
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Unable to send the reset link");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="register-page">
            <h2>Reset password</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <p className="form-hint">
                    Enter your account email and we'll send you a link to choose a new password.
                </p>
                <label>Email: </label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required />

                <button type="submit" disabled={sending}>
                    {sending ? 'Sending…' : 'Send reset link'}
                </button>

                <p className="register-link">
                    Remembered it? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    )
}

export default ForgotPasswordPage;
