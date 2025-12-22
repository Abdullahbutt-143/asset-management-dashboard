import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext";
import ProtectedRoute from "./ProtectedRoute";
import AssetManagementDashboard from "./AssetManagementDashboard";
import AllUsers from "./AllUsers";
import Login from "./Login";
import AssetsPage from "./assets/Assets";
import AssetRequestPage from "./assets/AssetRequestPage";
import GetAssets from "./assets/GetAssets";
import AddAssetPage from "./assets/AddAsset";
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
              <ProtectedRoute>
                <AddAssetPage />
              </ProtectedRoute>
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
              <ProtectedRoute>
                <GetAssets />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
