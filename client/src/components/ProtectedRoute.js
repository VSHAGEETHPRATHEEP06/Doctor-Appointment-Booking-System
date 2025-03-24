import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import axios from "../config/axiosConfig";
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser, updateLastFetchTimestamp } from "../redux/features/userSlice";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const dispatch = useDispatch();
  const { user, lastFetchTimestamp } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  // Get user data with proper error handling - wrapped in useCallback to avoid recreating on every render
  const getUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Check if we should make an API call based on Redux timestamp
    if (!shouldFetchUserData()) {
      setLoading(false);
      return;
    }
    
    try {
      dispatch(showLoading());
      
      // Update timestamp immediately to prevent parallel calls
      dispatch(updateLastFetchTimestamp());
      
      const res = await axios.post(
        "/api/v1/user/getUserData",
        { token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.data.success) {
        dispatch(setUser(res.data.data));
      } else {
        // Handle invalid token
        localStorage.clear();
        window.location.reload();
      }
      
      setLoading(false);
      dispatch(hideLoading());
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.clear();
      setLoading(false);
      dispatch(hideLoading());
      window.location.reload();
    }
  }, [dispatch]);

  // Determine if we should fetch user data (only every 5 minutes)
  const shouldFetchUserData = () => {
    // If user data exists in Redux already and we're not checking roles, avoid fetching
    if (user && allowedRoles.length === 0) {
      return false;
    }

    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return currentTime - lastFetchTimestamp > fiveMinutesInMs;
  };

  // Fetch user data only once when component mounts or token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUser();
    } else {
      setLoading(false);
    }
  }, [getUser]);

  // Check if token exists
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  // Show loading until user data is available
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles.length > 0 && user) {
    const userRole = user.isAdmin ? 'admin' : (user.isDoctor ? 'doctor' : 'user');
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" />;
    }
  }

  return children;
}
