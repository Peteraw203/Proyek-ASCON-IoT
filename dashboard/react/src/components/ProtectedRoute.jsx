import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    console.log("ProtectedRoute: currentUser", currentUser);
    console.log("ProtectedRoute: location", location);

    if (!currentUser) {
        console.log("ProtectedRoute: Redirecting to login");
        // Redirect to login page but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log("ProtectedRoute: Access granted");

    return children;
};

export default ProtectedRoute;
