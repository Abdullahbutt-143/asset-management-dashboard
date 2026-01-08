import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { supabase } from "../supabaseClient";
import { UserContext } from "../UserContext";
import { isAdmin } from "../utils/adminUtils";

const GetAssets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("requested-assets");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState("");

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
    const currentTab = pathToTabMap[location.pathname] || "requested-assets";
    setActiveTab(currentTab);
  }, [location.pathname]);
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data: requestsData, error: reqError } = await supabase
        .from("asset_requests")
        .select(
          `
          id,
          reason,
          quantity,
          status,
          created_at,
          user_id,
          assets (
            id,
            name,
            tag,
            serial
          )
        `
        )
        .order("created_at", { ascending: false });
      console.log(requestsData, reqError);
      if (reqError) throw reqError;

      const userIds = [...new Set(requestsData.map((r) => r.user_id))];

      // 3️⃣ Fetch profiles
      let profilesData = [];
      if (userIds.length > 0) {
        const { data: pData, error: profError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (profError) throw profError;
        profilesData = pData || [];
      }

      // 4️⃣ Map profiles
      const profileMap = {};
      profilesData.forEach((p) => {
        profileMap[p.id] = p;
      });

      // 5️⃣ Merge data
      const formatted = requestsData.map((req) => {
        const profile = profileMap[req.user_id];

        return {
          ...req,
          user_full_name: profile
            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
            : "Unknown User",
          user_email: profile?.email || "",
          asset: req.assets
            ? `${req.assets.name}${
                req.assets.tag ? ` (${req.assets.tag})` : ""
              }`
            : "No asset assigned",
          asset_serial: req.assets?.serial || "—",
        };
      });

      setRequests(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to load asset requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // In your handleStatusUpdate, use the supabase client with headers
  const handleStatusUpdate = async () => {
    try {
      console.log("Selected request:", selectedRequest);
      console.log("ID type:", typeof selectedRequest.id);
      console.log("ID value:", selectedRequest.id);

      // Convert to integer if needed
      const requestId = parseInt(selectedRequest.id, 10);
      console.log("Converted ID:", requestId);

      const { error } = await supabase.rpc("staff_update_request", {
        request_id: requestId, // Use the integer
        new_status: actionType,
        note: adminNote,
      });

      if (error) throw error;

      setShowModal(false);
      setAdminNote("");
      setSelectedRequest(null);
      fetchRequests();

      alert(`Request ${actionType} successfully!`);
    } catch (err) {
      console.error("Update error:", err);
      alert(`Failed to update request: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      requested: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20",
      approved: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
      denied: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    };
    return `${styles[status]} inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium`;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
        <PageHeader title="Asset Requests" subtitle="Manage asset requests" />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
        <PageHeader title="Asset Requests" subtitle="Manage asset requests" />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navigate={navigate}
        userProfile={profile}
      />
      <main className="flex-1">
        <PageHeader
          title="Asset Requests"
          subtitle="Manage and track asset requests"
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Request History
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {requests.length} request{requests.length !== 1 ? "s" : ""}{" "}
                    found
                  </p>
                </div>
                <button
                  onClick={fetchRequests}
                  className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Request Details
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Asset
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    {isAdmin(profile) && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs">
                          <p
                            className="text-sm font-medium text-gray-900 truncate"
                            title={request.reason}
                          >
                            {request.reason}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {request.user_full_name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.user_full_name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[150px]">
                              {request.user_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.asset}
                          </div>
                          <div className="text-sm text-gray-500">
                            Serial: {request.asset_serial}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {request.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(request.status)}>
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                      </td>
                      {isAdmin(profile) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === "requested" ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType("approved");
                                  setShowModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType("denied");
                                  setShowModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  ></path>
                                </svg>
                                Deny
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Completed
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {requests.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c1.125 0 2-.875 2-1.5V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No requests
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new asset request.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  Showing <span className="font-medium">{requests.length}</span>{" "}
                  requests
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span>
                    Requested
                  </span>
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                    Approved
                  </span>
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span>
                    Denied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {actionType === "approved" ? "Approve Request" : "Deny Request"}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Add a note for this action (optional but recommended).
              </p>

              <textarea
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter note..."
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setAdminNote("");
                  }}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleStatusUpdate}
                  className={`px-4 py-2 rounded-lg text-white ${
                    actionType === "approved"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GetAssets;
