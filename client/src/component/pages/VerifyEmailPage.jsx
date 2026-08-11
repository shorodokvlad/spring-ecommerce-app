import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email address...');
    const [resendEmail, setResendEmail] = useState('');
    const [resendMessage, setResendMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('no-token');
            setMessage('No verification token provided.');
            return;
        }

        const confirmEmail = async () => {
            try {
                const response = await ApiService.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                setTimeout(() => navigate('/login'), 2500);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || error.message || 'Unable to verify email address.');
            }
        };

        confirmEmail();
    }, [token, navigate]);

    const handleResend = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.resendVerification(resendEmail);
            setResendMessage(response.message || 'Verification link sent!');
        } catch (error) {
            setResendMessage(error.response?.data?.message || error.message || 'Failed to send verification link.');
        }
    };

    return (
        <div className="register-page">
            <h2>Email Verification</h2>
            <p className="message">{message}</p>

            {status === 'success' && (
                <p>Redirecting to the sign-in page...</p>
            )}

            {(status === 'error' || status === 'no-token') && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Need a new verification link?</h3>
                    {resendMessage && <p className="message">{resendMessage}</p>}
                    <form onSubmit={handleResend}>
                        <label>Enter your email address:</label>
                        <input
                            type="email"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                        />
                        <button type="submit">Resend Verification Email</button>
                    </form>
                </div>
            )}

            <div style={{ marginTop: '15px' }}>
                <Link to="/login">Back to Sign in</Link>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
