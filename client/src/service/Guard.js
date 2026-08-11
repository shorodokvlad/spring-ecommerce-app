import React from "react";
import {Navigate, useLocation} from "react-router-dom";
import ApiService from "./ApiService";
import AdminLayout from "../component/admin/AdminLayout";

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
        return <AdminLayout>{element}</AdminLayout>;
    }
    // Signed in but not an admin: send home; otherwise send to sign in.
    return ApiService.isAuthenticated() ? (
        <Navigate to="/" replace />
    ) : (
        <Navigate to="/login" replace state={{ from: location }} />
    );
}
