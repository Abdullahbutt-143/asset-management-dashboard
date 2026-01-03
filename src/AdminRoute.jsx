import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";

const AdminRoute = ({ children }) => {
  const { user, authLoading, profile } = useContext(UserContext);
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    if (!authLoading && user && profile && !profile.is_staff && showToast) {
      toast.error("This page is only accessible to admin", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowToast(false);
    }
  }, [authLoading, user, profile, showToast]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
