import { useState, useEffect, useContext } from "react";
import {
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  UserIcon,
  CheckBadgeIcon,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Asset Management"
          subtitle="Manage and track all company assets"
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Asset Management"
          subtitle="Manage and track all company assets"
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchAssets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Asset Management"
        subtitle="Manage and track all company assets"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />
                Total: <b>{totalAssets}</b>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                Active: <b>{assets.filter((a) => a.is_active).length}</b>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-purple-600" />
                Assigned: <b>{assets.filter((a) => a.assigned_to).length}</b>
              </div>
            </div>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border">
            <ComputerDesktopIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No assets found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-xl border shadow-sm"
              >
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg">{asset.name}</h3>
                  <p className="text-sm text-gray-500">{asset.tag}</p>
                </div>

                <div className="p-6 space-y-3">
                  <p className="text-sm font-mono">{asset.serial}</p>
                  <p className="text-sm">{asset.description}</p>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center text-xs">
                      {getUserInitials(asset.assigned_to)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {asset.assigned_to
                          ? `${asset.assigned_to.first_name} ${asset.assigned_to.last_name}`
                          : "Unassigned"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {asset.assigned_to?.email || ""}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Added {formatDate(asset.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsPage;
