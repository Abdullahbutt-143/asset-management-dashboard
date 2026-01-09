import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { UserProvider } from "./UserContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Login from "./Login";

// Lazy load components for code splitting
const AssetManagementDashboard = lazy(() => import("./AssetManagementDashboard"));
const AllUsers = lazy(() => import("./AllUsers"));
const AssetsPage = lazy(() => import("./assets/Assets"));
const AssetRequestPage = lazy(() => import("./assets/AssetRequestPage"));
const GetAssets = lazy(() => import("./assets/GetAssets"));
const AddAssetPage = lazy(() => import("./assets/AddAsset"));
const MyRequests = lazy(() => import("./assets/MyRequests"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AssetManagementDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AllUsers />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-asset"
            element={
              <AdminRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AddAssetPage />
                </Suspense>
              </AdminRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AssetsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets-request"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AssetRequestPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/get-assets"
            element={
              <AdminRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GetAssets />
                </Suspense>
              </AdminRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <MyRequests />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
