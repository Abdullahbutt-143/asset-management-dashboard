import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useNavigate, useLocation } from "react-router-dom";
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
import { isAdmin } from "./utils/adminUtils";

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
  const location = useLocation();

  // Sync activeTab with current route
  useEffect(() => {
    const pathToTabMap = {
      "/": "dashboard",
      "/assets": "assets",
      "/my-requests": "my-requests",
      "/users": "users",
      "/assets-request": "requests",
      "/get-assets": "requested-assets",
      "/add-asset": "add-asset",
    };
    const currentTab = pathToTabMap[location.pathname] || "dashboard";
    setActiveTab(currentTab);
  }, [location.pathname]);

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, is_staff")
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
    // Only update stats when all data is loaded
    if (usersLoading || assetsLoading || requestsLoading) {
      return;
    }

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
  }, [assets, totalAssets, users, activeRequests, usersLoading, assetsLoading, requestsLoading]);

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
        userProfile={currentUserProfile}
      />
      <div className="flex-1 overflow-auto">
        <header className="bg-linear-to-r from-white via-blue-50 to-white shadow-md border-b border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h2>
            <div className="flex items-center space-x-4">
              {(() => {
                const handleLogout = async () => {
                  await logout();
                  navigate("/login");
                };

                if (user) {
                  return (
                    <div className="flex items-center space-x-3 animate-fadeIn">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        {getUserInitials()}
                      </div>
                      <span className="text-gray-700 font-medium hidden sm:inline">
                        {getUserDisplayName()}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="ml-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
                      >
                        Logout
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <button
                      onClick={() => navigate("/login")}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      <div className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9A3.75 3.75 0 1 1 12 5.25 3.75 3.75 0 0 1 15.75 9Zm0 0a6.75 6.75 0 0 1-6.75 6.75h-.75a6.75 6.75 0 0 1-6.75-6.75A6.75 6.75 0 0 1 8.25 2.25h.75a6.75 6.75 0 0 1 6.75 6.75Z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-sm">
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
        <main className="p-8 bg-linear-to-br from-gray-50 via-white to-gray-50">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Users</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {usersLoading ? (
                      <div className="h-8 w-20 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                    ) : (
                      <span className="bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent animate-fadeIn">
                        {stats.totalUsers.toLocaleString()}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    {usersLoading ? "Loading..." : "Active team members"}
                  </p>
                </div>
                <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <UserGroupIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Assets */}
            <div className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Assets</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {assetsLoading ? (
                      <div className="h-8 w-20 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                    ) : (
                      <span className="bg-linear-to-r from-green-600 to-green-700 bg-clip-text text-transparent animate-fadeIn">
                        {stats.totalAssets.toLocaleString()}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-semibold hover:bg-green-200 transition-colors duration-200">
                      {assetsLoading ? "..." : stats.assignedAssets} assigned
                    </span>
                    <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full font-semibold hover:bg-blue-200 transition-colors duration-200">
                      {assetsLoading ? "..." : stats.availableAssets} available
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-linear-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <ComputerDesktopIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Active Requests */}
            <div className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Requests</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {requestsLoading ? (
                      <div className="h-8 w-20 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                    ) : (
                      <span className="bg-linear-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent animate-fadeIn">
                        {stats.activeRequests.toLocaleString()}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    {requestsLoading ? "Loading..." : "Pending approvals"}
                  </p>
                </div>
                <div className="w-16 h-16 bg-linear-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <ClipboardDocumentCheckIcon className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Available Assets */}
            <div className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Available Assets</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {assetsLoading ? (
                      <div className="h-8 w-20 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                    ) : (
                      <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent animate-fadeIn">
                        {stats.availableAssets.toLocaleString()}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    {assetsLoading ? "Loading..." : "Ready for assignment"}
                  </p>
                </div>
                <div className="w-16 h-16 bg-linear-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <CubeIcon className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Assets + Quick Actions */}
          <div
            className={`grid gap-6 ${
              isAdmin(currentUserProfile) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            } animate-fadeIn`}
          >
            {/* Recent Assets (ADMIN ONLY) */}
            {isAdmin(currentUserProfile) && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Recent Assets
                  </h3>
                  <button
                    onClick={() => navigate("/assets")}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1 group"
                  >
                    View All
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
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

                <div className="space-y-3">
                  {assetsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-3 font-medium">Loading assets...</p>
                    </div>
                  ) : recentAssets.length > 0 ? (
                    recentAssets.map((asset, index) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group cursor-pointer transform hover:scale-102 animate-slideUp"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                            <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {asset.name}
                            </h4>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700">
                              {asset.user}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                              asset.status === "Assigned"
                                ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 group-hover:bg-gray-200"
                            }`}
                          >
                            {asset.status}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {asset.date}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ComputerDesktopIcon className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No assets found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions (ADMIN ONLY) */}
            {isAdmin(currentUserProfile) && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/add-asset")}
                  className="group p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-blue-200 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                    <PlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                    Add Asset
                  </span>
                </button>

                <button
                  onClick={() => navigate("/assets-request")}
                  className="group p-4 bg-linear-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-green-200 to-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                    Request Asset
                  </span>
                </button>

                <button
                  onClick={() => navigate("/users")}
                  className="group p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-purple-200 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                    <UserGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                    Manage Users
                  </span>
                </button>

                <button
                  onClick={() => navigate("/get-assets")}
                  className="group p-4 bg-linear-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-orange-200 to-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                    <ComputerDesktopIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-orange-700 transition-colors">
                    View Requests
                  </span>
                </button>
              </div>
            </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssetManagementDashboard;
