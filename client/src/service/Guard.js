import React from "react";
import {Navigate, useLocation} from "react-router-dom";
import ApiService from "./ApiService";

export const ProtectedRoute = ({ element }) => {
    const location = useLocation();

    return ApiService.isAuthenticated() ? (
        element
    ) : (
        <Navigate to="/login" replace state={{ from: location }} />
    );
}

export const AdminRoute = ({ element }) => {
    const location = useLocation();

    if (ApiService.isAdmin()) {
        return element;
    }
    // Logged in but not an admin: send home; not logged in: send to login
    return ApiService.isAuthenticated() ? (
        <Navigate to="/" replace />
    ) : (
        <Navigate to="/login" replace state={{ from: location }} />
    );
}
