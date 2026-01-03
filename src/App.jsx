import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AssetManagementDashboard from "./AssetManagementDashboard";
import AllUsers from "./AllUsers";
import Login from "./Login";
import AssetsPage from "./assets/Assets";
import AssetRequestPage from "./assets/AssetRequestPage";
import GetAssets from "./assets/GetAssets";
import AddAssetPage from "./assets/AddAsset";
import MyRequests from "./assets/MyRequests";
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
                <AssetManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AllUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-asset"
            element={
              <AdminRoute>
                <AddAssetPage />
              </AdminRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AssetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets-request"
            element={
              <ProtectedRoute>
                <AssetRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/get-assets"
            element={
              <AdminRoute>
                <GetAssets />
              </AdminRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
