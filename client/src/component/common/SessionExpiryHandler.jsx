import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SESSION_EXPIRED_EVENT } from "../../service/ApiService";

const SessionExpiryHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleSessionExpired = () => {
            const from = location.pathname === '/login'
                ? undefined
                : { pathname: location.pathname, search: location.search };

            navigate('/login', {
                replace: true,
                state: {
                    from,
                    message: 'Your session expired. Please sign in again.'
                }
            });
        };

        window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    }, [location.pathname, location.search, navigate]);

    return null;
};

export default SessionExpiryHandler;
