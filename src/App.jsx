import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { setUser, setLoading, fetchUserData } from './store/slices/authSlice';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.settings.darkMode);

  useEffect(() => {
    // Apply dark mode class to HTML element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Set initial loading state
    dispatch(setLoading(true));

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await dispatch(fetchUserData(user.uid));
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch(setUser(null));
        }
      } else {
        dispatch(setUser(null));
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        } />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } />
        <Route path="*" element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;
