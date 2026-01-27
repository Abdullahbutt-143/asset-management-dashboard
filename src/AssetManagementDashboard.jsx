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
import PageHeader from "./components/PageHeader";
import StatCard from "./components/StatCard";
import AssetTypeCard from "./components/AssetTypeCard";
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

  const [assetTypeCounts, setAssetTypeCounts] = useState({
    laptops: 0,
    mice: 0,
    keyboards: 0,
    monitors: 0,
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

    // Calculate asset type counts
    const laptopCount = assets.filter(asset => 
      asset.asset_type?.toLowerCase().includes('laptop') || 
      asset.name?.toLowerCase().includes('laptop')
    ).length;
    
    const mouseCount = assets.filter(asset => 
      asset.asset_type?.toLowerCase().includes('mouse') || 
      asset.name?.toLowerCase().includes('mouse')
    ).length;
    
    const keyboardCount = assets.filter(asset => 
      asset.asset_type?.toLowerCase().includes('keyboard') || 
      asset.name?.toLowerCase().includes('keyboard')
    ).length;
    
    const monitorCount = assets.filter(asset => 
      asset.asset_type?.toLowerCase().includes('monitor') || 
      asset.name?.toLowerCase().includes('monitor')
    ).length;

    setAssetTypeCounts({
      laptops: laptopCount,
      mice: mouseCount,
      keyboards: keyboardCount,
      monitors: monitorCount,
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
        <PageHeader 
          title="Dashboard" 
          subtitle="Overview of your asset management system"
        />

        {/* Dashboard Content */}
        <main className="p-8 bg-linear-to-br from-gray-50 via-white to-gray-50">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              subtitle="Active team members"
              icon={UserGroupIcon}
              colorClass="blue"
              isLoading={usersLoading}
            />

            {/* Total Assets */}
            <StatCard
              title="Total Assets"
              value={stats.totalAssets.toLocaleString()}
              subtitle="All inventory items"
              icon={ComputerDesktopIcon}
              colorClass="green"
              isLoading={assetsLoading}
              badges={
                <>
                  <span className="text-xs px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-semibold hover:bg-green-200 transition-colors duration-200">
                    {assetsLoading ? "..." : stats.assignedAssets} assigned
                  </span>
                  <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full font-semibold hover:bg-blue-200 transition-colors duration-200">
                    {assetsLoading ? "..." : stats.availableAssets} available
                  </span>
                </>
              }
            />

            {/* Active Requests */}
            <StatCard
              title="Active Requests"
              value={stats.activeRequests.toLocaleString()}
              subtitle="Pending approvals"
              icon={ClipboardDocumentCheckIcon}
              colorClass="orange"
              isLoading={requestsLoading}
            />

            {/* Available Assets */}
            <StatCard
              title="Available Assets"
              value={stats.availableAssets.toLocaleString()}
              subtitle="Ready for assignment"
              icon={CubeIcon}
              colorClass="purple"
              isLoading={assetsLoading}
            />
          </div>

          {/* Asset Type Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Asset Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AssetTypeCard
                title="Total Laptops"
                count={assetTypeCounts.laptops}
                icon={ComputerDesktopIcon}
                colorClass="red"
                isLoading={assetsLoading}
              />
              <AssetTypeCard
                title="Total Mice"
                count={assetTypeCounts.mice}
                icon={CubeIcon}
                colorClass="indigo"
                isLoading={assetsLoading}
              />
              <AssetTypeCard
                title="Total Keyboards"
                count={assetTypeCounts.keyboards}
                icon={CubeIcon}
                colorClass="pink"
                isLoading={assetsLoading}
              />
              <AssetTypeCard
                title="Total Monitors"
                count={assetTypeCounts.monitors}
                icon={ComputerDesktopIcon}
                colorClass="blue"
                isLoading={assetsLoading}
              />
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
