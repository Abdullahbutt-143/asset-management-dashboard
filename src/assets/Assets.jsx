import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { UserContext } from "../UserContext";
import { isAdmin } from "../utils/adminUtils";
import { useSupabase } from "../supabase/hooks/useSupabase";
import {
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Package,
  Tag,
  Hash,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
  UserPlus,
  Trash2
} from "lucide-react";

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("assets");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ active: 0, inactive: 0, assigned: 0 });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [assetToRemove, setAssetToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useContext(UserContext);

  /* ---------------- GET USER ID FROM URL ---------------- */
  const params = new URLSearchParams(location.search);
  const userId = params.get("userId");

  /* ---------------- FETCH ASSETS SERVICE ---------------- */
  const fetchAssetsService = async () => {
    let query = supabase
      .from("assets")
      .select(`
        id,
        name,
        tag,
        serial,
        description,
        is_active,
        created_at,
        assigned_to,
        assigned_user:profiles (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("assigned_to", userId);
    } else if (!isAdmin(profile)) {
      query = query.eq("assigned_to", profile?.id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  };

  const { isLoading: loading, error, onRequest: fetchAssets } = useSupabase({
    onRequestService: fetchAssetsService,
    onSuccess: (data) => {
      setAssets(data);
      setFilteredAssets(data);
      
      const activeCount = data.filter(a => a.is_active).length || 0;
      const inactiveCount = data.length - activeCount;
      const assignedCount = data.filter(a => a.assigned_to).length || 0;
      
      setStats({
        active: activeCount,
        inactive: inactiveCount,
        assigned: assignedCount
      });
    },
    onError: (error) => {
      console.error("Error fetching assets:", error);
    }
  });

  useEffect(() => {
    fetchAssets();
  }, [userId]);

  /* ---------------- FETCH ALL USERS FOR ASSIGNMENT (ADMIN ONLY) ---------------- */
  const fetchUsersForAssignment = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, is_active")
      .order("first_name", { ascending: true });

    if (!error) {
      setAssignedUsers(data || []);
    }
  };

  /* ---------------- OPEN ASSIGN MODAL AND FETCH USERS ---------------- */
  const openAssignModal = async (asset) => {
    setSelectedAsset(asset);
    setSelectedUser(asset.assigned_to || null);
    setAssignError(null);
    setShowAssignModal(true);
    await fetchUsersForAssignment();
  };

  /* ---------------- ASSIGN/REASSIGN ASSET TO USER ---------------- */
  const handleAssignAsset = async () => {
    if (!selectedAsset || !selectedUser) {
      setAssignError("Please select a user to assign the asset");
      return;
    }

    setAssignLoading(true);
    setAssignError(null);

    try {
      const { error } = await supabase
        .from("assets")
        .update({ assigned_to: selectedUser })
        .eq("id", selectedAsset.id);

      if (error) throw error;

      // Update local state
      const updatedAssets = assets.map((asset) =>
        asset.id === selectedAsset.id
          ? {
              ...asset,
              assigned_to: selectedUser,
              assigned_user: assignedUsers.find((u) => u.id === selectedUser),
            }
          : asset
      );

      setAssets(updatedAssets);
      setFilteredAssets(updatedAssets);

      // Update stats
      const assignedCount = updatedAssets.filter((a) => a.assigned_to).length || 0;
      setStats((prevStats) => ({
        ...prevStats,
        assigned: assignedCount,
      }));

      setShowAssignModal(false);
      setSelectedAsset(null);
      setSelectedUser(null);
    } catch (err) {
      setAssignError(err.message || "Failed to assign asset");
    } finally {
      setAssignLoading(false);
    }
  };

  /* ---------------- REMOVE/UNASSIGN ASSET FROM USER ---------------- */
  const handleRemoveAssignment = async () => {
    if (!assetToRemove) return;

    setRemoveLoading(true);

    try {
      const { error } = await supabase
        .from("assets")
        .update({ assigned_to: null })
        .eq("id", assetToRemove.id);

      if (error) throw error;

      // Update local state
      const updatedAssets = assets.map((asset) =>
        asset.id === assetToRemove.id
          ? {
              ...asset,
              assigned_to: null,
              assigned_user: null,
            }
          : asset
      );

      setAssets(updatedAssets);
      setFilteredAssets(updatedAssets);

      // Update stats
      const assignedCount = updatedAssets.filter((a) => a.assigned_to).length || 0;
      setStats((prevStats) => ({
        ...prevStats,
        assigned: assignedCount,
      }));

      setShowRemoveConfirm(false);
      setAssetToRemove(null);
    } catch (err) {
      console.error("Error removing assignment:", err);
    } finally {
      setRemoveLoading(false);
    }
  };

  /* ---------------- DELETE ASSET (ADMIN ONLY) ---------------- */
  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;

    setDeleteLoading(true);

    try {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", assetToDelete.id);

      if (error) throw error;

      // Update local state
      const updatedAssets = assets.filter((asset) => asset.id !== assetToDelete.id);

      setAssets(updatedAssets);
      setFilteredAssets(updatedAssets);

      // Update stats
      const activeCount = updatedAssets.filter((a) => a.is_active).length || 0;
      const inactiveCount = updatedAssets.length - activeCount;
      const assignedCount = updatedAssets.filter((a) => a.assigned_to).length || 0;

      setStats({
        active: activeCount,
        inactive: inactiveCount,
        assigned: assignedCount,
      });

      setShowDeleteConfirm(false);
      setAssetToDelete(null);
    } catch (err) {
      console.error("Error deleting asset:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------------- SEARCH FILTER (UI ONLY) ---------------- */
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const filtered = assets.filter(
      (a) =>
        a.name?.toLowerCase().includes(term) ||
        a.tag?.toLowerCase().includes(term) ||
        a.serial?.toLowerCase().includes(term)
    );

    setFilteredAssets(filtered);
  }, [searchTerm, assets]);

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          navigate={navigate}
          userProfile={profile}
        />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Package className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading assets...</p>
            <p className="text-sm text-gray-400 mt-2">Fetching your inventory</p>
          </div>
        </main>
      </div>
    );
  }

  /* ---------------- ERROR STATE ---------------- */
  if (error) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          navigate={navigate}
          userProfile={profile}
        />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-linear-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100 p-8 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Unable to load assets</h3>
                  <p className="text-gray-600 mt-1">{error}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={fetchAssets}
                  className="px-5 py-2.5 bg-linear-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navigate={navigate}
        userProfile={profile}
      />

      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          {userId && (
            <button
              onClick={() => navigate("/users")}
              className="mb-6 group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Users</span>
            </button>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {userId ? "User Assets" : "Asset Inventory"}
              </h1>
              <p className="text-gray-500 mt-2 max-w-2xl">
                {userId
                  ? "Assets assigned to the selected user"
                  : "Manage and track all company assets in one place"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchAssets}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets by name, tag, or serial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl w-full lg:w-96 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
                <p className="text-sm text-blue-500 mt-1">Ready for use</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Assigned Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assigned}</p>
                <p className="text-sm text-amber-500 mt-1">In use by employees</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <User className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{filteredAssets.length}</p>
                <p className="text-sm text-gray-500 mt-1">All inventory items</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Asset List</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Showing</span>
                <span className="font-semibold text-gray-900">{filteredAssets.length}</span>
                <span>assets</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <Package className="w-4 h-4" />
                      Asset
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <Tag className="w-4 h-4" />
                      Tag
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <Hash className="w-4 h-4" />
                      Serial
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <User className="w-4 h-4" />
                      Assigned To
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-gray-100 rounded-2xl mb-4">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">No assets found</h3>
                        <p className="text-gray-500 mt-2 max-w-md">
                          {searchTerm
                            ? "Try adjusting your search or filter to find what you're looking for."
                            : "No assets have been added yet. Start by adding your first asset."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      // onClick={() => navigate(`/assets/${asset.id}`)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {asset.name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {asset.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                          <Tag className="w-3 h-3 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {asset.tag || "No tag"}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="font-mono text-sm text-gray-600">
                          {asset.serial || "-"}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                          asset.is_active 
                            ? "bg-green-50 text-green-700" 
                            : "bg-red-50 text-red-700"
                        }`}>
                          {asset.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        {asset.assigned_user ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {asset.assigned_user.first_name?.[0]}{asset.assigned_user.last_name?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {asset.assigned_user.first_name} {asset.assigned_user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {asset.assigned_user.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <User className="w-5 h-5" />
                            <span className="text-sm">Unassigned</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {isAdmin(profile) && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAssignModal(asset);
                                }}
                                className="px-3 py-1.5 text-sm font-medium bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                              >
                                <UserPlus className="w-4 h-4" />
                                {asset.assigned_to ? "Reassign" : "Assign"}
                              </button>
                              {asset.assigned_to && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssetToRemove(asset);
                                    setShowRemoveConfirm(true);
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssetToDelete(asset);
                                  setShowDeleteConfirm(true);
                                }}
                                className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                                title="Delete asset permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredAssets.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold text-gray-900">{filteredAssets.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{assets.length}</span> assets
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                  <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Sort by: Date added</option>
                    <option>Sort by: Name</option>
                    <option>Sort by: Status</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assign Asset Modal - Admin Only */}
        {showAssignModal && isAdmin(profile) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAsset?.assigned_to ? "Reassign Asset" : "Assign Asset"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedAsset?.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAsset(null);
                    setSelectedUser(null);
                    setAssignError(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4">
                {assignError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{assignError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {assignedUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user.id)}
                        className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                          selectedUser === user.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${!user.is_active ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          {!user.is_active && (
                            <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              Inactive
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedAsset?.assigned_to && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Current Assignment:</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedAsset.assigned_user?.first_name} {selectedAsset.assigned_user?.last_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAsset(null);
                    setSelectedUser(null);
                    setAssignError(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignAsset}
                  disabled={assignLoading || !selectedUser}
                  className="flex-1 px-4 py-2 text-white font-medium bg-linear-to-r from-blue-500 to-blue-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assignLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Assign Asset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove Assignment Confirmation Modal */}
        {showRemoveConfirm && isAdmin(profile) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Remove Assignment
                </h3>
                <p className="text-sm text-gray-500 mt-1">{assetToRemove?.name}</p>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">
                      Remove{" "}
                      <span className="text-red-600">
                        {assetToRemove?.assigned_user?.first_name}{" "}
                        {assetToRemove?.assigned_user?.last_name}
                      </span>
                      ?
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      This asset will be marked as unassigned and will no longer be
                      associated with the current user. This action can be undone by
                      reassigning it to another user.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    setShowRemoveConfirm(false);
                    setAssetToRemove(null);
                  }}
                  disabled={removeLoading}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveAssignment}
                  disabled={removeLoading}
                  className="flex-1 px-4 py-2 text-white font-medium bg-linear-to-r from-red-500 to-red-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {removeLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Remove Assignment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Asset Confirmation Modal */}
        {showDeleteConfirm && isAdmin(profile) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-red-600">
                  Delete Asset
                </h3>
                <p className="text-sm text-gray-500 mt-1">{assetToDelete?.name}</p>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">
                      Permanently delete <span className="text-red-600">{assetToDelete?.name}</span>?
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      This action cannot be undone. The asset and all associated data will be permanently deleted from the system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setAssetToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAsset}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 text-white font-medium bg-linear-to-r from-red-600 to-red-700 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Asset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssetsPage;