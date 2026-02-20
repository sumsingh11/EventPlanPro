import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './ui/Loading';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector(state => state.auth);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading text="Loading..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
