import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAssets } from "./hooks/useAssets";
import { useRequests } from "./hooks/useRequests";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";

const AssetManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    users,
    loading: usersLoading,
    user,
    logout,
    authLoading,
  } = useContext(UserContext);
  const { totalAssets, loading: assetsLoading, assets } = useAssets();
  const { activeRequests, loading: requestsLoading } = useRequests();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssets: 0,
    activeRequests: 0,
    availableAssets: 0,
    assignedAssets: 0,
  });

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setCurrentUserProfile(data);
        }
      }
    };

    fetchCurrentUserProfile();
  }, [user]);

  useEffect(() => {
    if (!assetsLoading && !usersLoading && !requestsLoading) {
      const assignedAssets = assets.filter(
        (asset) => asset.assigned_to !== null
      ).length;
      const availableAssets = totalAssets - assignedAssets;

      setStats({
        totalUsers: users.length,
        totalAssets: totalAssets,
        activeRequests: activeRequests,
        availableAssets: availableAssets,
        assignedAssets: assignedAssets,
      });
    }
  }, [
    assetsLoading,
    usersLoading,
    requestsLoading,
    assets,
    totalAssets,
    users,
    activeRequests,
  ]);

  const recentAssets = assets.slice(0, 4).map((asset) => ({
    id: asset.id,
    name: asset.name,
    user: asset.assigned_to
      ? `${asset.assigned_to.first_name} ${asset.assigned_to.last_name}`.trim()
      : "Available",
    status: asset.assigned_to ? "Assigned" : "Available",
    date: new Date(asset.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));

  const getUserDisplayName = () => {
    if (currentUserProfile?.first_name) {
      return `${currentUserProfile.first_name} ${
        currentUserProfile.last_name || ""
      }`.trim();
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getUserInitials = () => {
    if (currentUserProfile?.first_name) {
      return currentUserProfile.first_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navigate={navigate}
      />
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center space-x-4">
              {(() => {
                const handleLogout = async () => {
                  await logout();
                  navigate("/login");
                };

                if (user) {
                  return (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getUserInitials()}
                      </div>
                      <span className="text-gray-700">
                        {getUserDisplayName()}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <button
                      onClick={() => navigate("/login")}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 text-gray-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9A3.75 3.75 0 1 1 12 5.25 3.75 3.75 0 0 1 15.75 9Zm0 0a6.75 6.75 0 0 1-6.75 6.75h-.75a6.75 6.75 0 0 1-6.75-6.75A6.75 6.75 0 0 1 8.25 2.25h.75a6.75 6.75 0 0 1 6.75 6.75Z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium text-sm">
                        Login
                      </span>
                    </button>
                  );
                }
              })()}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {usersLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      stats.totalUsers.toLocaleString()
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {usersLoading ? "Loading..." : "Active team members"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Assets */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Assets</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {assetsLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      stats.totalAssets.toLocaleString()
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                      {assetsLoading ? "..." : stats.assignedAssets} assigned
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      {assetsLoading ? "..." : stats.availableAssets} available
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ComputerDesktopIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Active Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Requests</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {requestsLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      stats.activeRequests.toLocaleString()
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {requestsLoading ? "Loading..." : "Pending approvals"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Available Assets */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available Assets</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {assetsLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      stats.availableAssets.toLocaleString()
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {assetsLoading ? "Loading..." : "Ready for assignment"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CubeIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Assets + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Assets
                </h3>
                <button
                  onClick={() => navigate("/assets")}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                >
                  View All
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {assetsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading assets...</p>
                  </div>
                ) : recentAssets.length > 0 ? (
                  recentAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {asset.name}
                          </h4>
                          <p className="text-sm text-gray-600">{asset.user}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            asset.status === "Assigned"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {asset.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {asset.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <ComputerDesktopIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No assets found
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/add-asset")}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-center"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <PlusIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Add Asset
                  </span>
                </button>

                <button
                  onClick={() => navigate("/assets-request")}
                  className="p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors text-center"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Request Asset
                  </span>
                </button>

                <button
                  onClick={() => navigate("/users")}
                  className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors text-center"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <UserGroupIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Manage Users
                  </span>
                </button>

                <button
                  onClick={() => navigate("/get-assets")}
                  className="p-4 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors text-center"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <ComputerDesktopIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    View Requests
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssetManagementDashboard;
