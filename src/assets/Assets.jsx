import { useState, useEffect, useContext } from "react";
import {
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  UserIcon,
  CheckBadgeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "../components/PageHeader";
import { UserContext } from "../UserContext";
import { supabase } from "../supabaseClient";

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAssets, setTotalAssets] = useState(0);

  const { authLoading } = useContext(UserContext);

  useEffect(() => {
    if (!authLoading) {
      fetchAssets();
    }
  }, [authLoading]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAssets(assets);
      return;
    }

    const term = searchTerm.toLowerCase();

    const filtered = assets.filter(
      (asset) =>
        asset.name?.toLowerCase().includes(term) ||
        asset.tag?.toLowerCase().includes(term) ||
        asset.serial?.toLowerCase().includes(term) ||
        asset.assigned_to?.first_name?.toLowerCase().includes(term) ||
        asset.assigned_to?.last_name?.toLowerCase().includes(term) ||
        asset.assigned_to?.email?.toLowerCase().includes(term)
    );

    setFilteredAssets(filtered);
  }, [searchTerm, assets]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("assets")
        .select(
          `
          id,
          name,
          tag,
          serial,
          description,
          is_active,
          created_at,
          assigned_to:profiles (
  id,
  first_name,
  last_name,
  email
)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAssets(data || []);
      setFilteredAssets(data || []);
      setTotalAssets(data?.length || 0);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError("Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getUserInitials = (user) => {
    if (!user) return "NA";
    return `${user.first_name?.[0] || ""}${
      user.last_name?.[0] || ""
    }`.toUpperCase();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PageHeader
          title="Asset Management"
          subtitle="Manage and track all company assets"
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-soft p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200/50 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200/50 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200/50 rounded"></div>
                  <div className="h-3 bg-gray-200/50 rounded w-5/6"></div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="h-8 w-8 bg-gray-200/50 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200/50 rounded w-20"></div>
                      <div className="h-2 bg-gray-200/50 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PageHeader
          title="Asset Management"
          subtitle="Manage and track all company assets"
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-50/50 to-pink-50/50 backdrop-blur-sm border border-red-100 rounded-2xl shadow-soft p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl mb-4">
              <XMarkIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Assets
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchAssets}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Asset Management"
        subtitle="Manage and track all company assets"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-soft p-6 mb-8 transition-all duration-300">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="relative max-w-md w-full">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-3 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assets by name, tag, serial, or assignee..."
                className="w-full pl-12 pr-10 py-3 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 p-1 hover:bg-gray-100/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 rounded-xl shadow-soft">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                  <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Assets</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalAssets}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm border border-emerald-100/50 rounded-xl shadow-soft">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {assets.filter((a) => a.is_active).length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-50/80 to-violet-50/80 backdrop-blur-sm border border-purple-100/50 rounded-xl shadow-soft">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                  <UserIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {assets.filter((a) => a.assigned_to).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm border border-white/40 rounded-2xl shadow-soft p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-6">
              <ComputerDesktopIcon className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No matching assets found" : "No assets yet"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm
                ? "Try adjusting your search terms to find what you're looking for"
                : "Start by adding your first asset to the inventory"}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="px-5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-soft hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6 border-b border-gray-100/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {asset.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                          {asset.tag}
                        </span>
                        {!asset.is_active && (
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Serial Number
                    </p>
                    <p className="font-mono text-sm text-gray-900 bg-gray-50/50 p-2 rounded-lg">
                      {asset.serial}
                    </p>
                  </div>

                  {asset.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {asset.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl">
                    <div className="relative">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white flex items-center justify-center font-medium text-sm">
                        {getUserInitials(asset.assigned_to)}
                      </div>
                      {asset.assigned_to && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {asset.assigned_to
                          ? `${asset.assigned_to.first_name} ${asset.assigned_to.last_name}`
                          : "Unassigned"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {asset.assigned_to?.email || "No email assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                    <span className="text-xs text-gray-500">
                      Added {formatDate(asset.created_at)}
                    </span>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAssets.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredAssets.length}</span> of{" "}
              <span className="font-medium">{totalAssets}</span> assets
              {searchTerm && " matching your search"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsPage;